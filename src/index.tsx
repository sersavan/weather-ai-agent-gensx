import * as gensx from "@gensx/core";
import { ChatCompletion, OpenAIProvider } from "@gensx/openai";
import axios from "axios";
import * as readline from 'readline';
import TelegramBot from 'node-telegram-bot-api';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Get bot token and API keys from environment variables
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Define operating mode (console or telegram)
const MODE = process.env.MODE || 'console';

// Validate API keys
if (!OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY not found in environment variables!");
  console.error("Please add OPENAI_API_KEY to your .env file");
  process.exit(1);
}

// Interface for weather API
interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity?: number;
  windSpeed?: number;
  feelsLike?: number;
  lastUpdated?: string;
}

// Component for extracting location from user query
interface ExtractLocationProps {
  userInput: string;
}
type ExtractLocationOutput = string;

const ExtractLocation = gensx.Component<ExtractLocationProps, ExtractLocationOutput>(
  "ExtractLocation",
  ({ userInput }) => (
    <ChatCompletion
      model="gpt-4o-mini"
      messages={[
        {
          role: "system",
          content: "Extract the city or location name from the user's weather query. Return only the city/location name, nothing else. If the query doesn't contain a city/location, return an empty string.",
        },
        { role: "user", content: userInput },
      ]}
    />
  ),
);

// Component for fetching weather data
interface FetchWeatherProps {
  location: string;
}
type FetchWeatherOutput = WeatherData;

const FetchWeather = gensx.Component<FetchWeatherProps, FetchWeatherOutput>(
  "FetchWeather",
  async ({ location }) => {
    try {
      // Use public API for demonstration
      const response = await axios.get(
        `https://wttr.in/${encodeURIComponent(location)}?format=j1`
      );
      
      const data = response.data;
      
      return {
        location: data.nearest_area[0].areaName[0].value,
        temperature: parseFloat(data.current_condition[0].temp_C),
        description: data.current_condition[0].weatherDesc[0].value,
        humidity: parseFloat(data.current_condition[0].humidity),
        windSpeed: parseFloat(data.current_condition[0].windspeedKmph),
        feelsLike: parseFloat(data.current_condition[0].FeelsLikeC),
        lastUpdated: data.current_condition[0].observation_time
      };
    } catch (error) {
      console.error("Error fetching weather data:", error);
      return {
        location,
        temperature: 0,
        description: "Information unavailable",
      };
    }
  }
);

// Component for generating response
interface GenerateResponseProps {
  weatherData: WeatherData;
  userInput: string;
}
type GenerateResponseOutput = string;

const GenerateResponse = gensx.Component<GenerateResponseProps, GenerateResponseOutput>(
  "GenerateResponse",
  ({ weatherData, userInput }) => (
    <ChatCompletion
      model="gpt-4o-mini"
      messages={[
        {
          role: "system",
          content: "You are a weather assistant. Use the provided weather data to answer the user's question. Do not answer or ask anything else. Be friendly and informative.",
        },
        { role: "user", content: userInput },
        { 
          role: "system", 
          content: `Weather data: ${JSON.stringify(weatherData, null, 2)}` 
        },
      ]}
    />
  ),
);

// Main workflow component
const WeatherAgent = gensx.Component<{ userInput: string }, string>(
  "WeatherAgent",
  async ({ userInput }) => {
    // Extract location from user query
    const location = String(await ExtractLocation({ userInput }));
    if (!location) {
      console.log(`Query doesn't contain city/location: ${userInput}`);
      return "Please specify a city or location in your request.";
    }
    console.log(`Detected location: ${location}`);
    
    // Get weather data
    const weatherData = await FetchWeather({ location }) as WeatherData;
    console.log(`Received weather data: ${JSON.stringify(weatherData, null, 2)}`);
    
    // Check if weatherData is defined
    if (!weatherData) {
      throw new Error("Failed to fetch weather data.");
    }

    // Generate response
    return <GenerateResponse weatherData={weatherData} userInput={userInput} />;
  }
);

// Create workflow
const WeatherAgentComponent = gensx.Component<{ userInput: string }, string>(
  "WeatherAgentComponent",
  ({ userInput }) => (
    <OpenAIProvider apiKey={OPENAI_API_KEY}>
      <WeatherAgent userInput={userInput} />
    </OpenAIProvider>
  )
);

const workflow = gensx.Workflow("WeatherAgentWorkflow", WeatherAgentComponent);

// Function for processing queries and getting responses
async function processWeatherQuery(query: string): Promise<string> {
  try {
    const result = await workflow.run({ userInput: query }, { printUrl: false });
    return result;
  } catch (error) {
    console.error("An error occurred while processing your request:", error);
    return "Sorry, an error occurred while processing your request. Please try again.";
  }
}

// Launch in Telegram bot mode
async function startTelegramBot() {
  if (!TELEGRAM_TOKEN) {
    console.error("❌ TELEGRAM_BOT_TOKEN not found in environment variables!");
    console.error("Please add TELEGRAM_BOT_TOKEN to your .env file to use Telegram mode.");
    process.exit(1);
  }

  // Create bot with polling option to receive updates
  const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

  console.log('🤖 Telegram bot started and ready to answer queries!');

  // Handle /start command
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
      chatId,
      "👋 Weather assistant welcomes you!\n\nAsk about the weather in any city, for example: \"What's the weather in London?\""
    );
  });

  // Handle text messages
  bot.on('message', async (msg) => {
    // If it's not a command
    if (!msg.text?.startsWith('/')) {
      const chatId = msg.chat.id;
      const userQuery = msg.text || '';

      // Send "typing..." status
      bot.sendChatAction(chatId, 'typing');
      
      // Process query
      const response = await processWeatherQuery(userQuery);
      
      // Send response
      bot.sendMessage(chatId, `🌤️ ${response}`);
    }
  });
}

// Launch in console mode
function startConsoleMode() {
  // Create interface for reading from command line
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Initial greeting
  console.log("👋 Weather assistant welcomes you!");
  console.log("Ask about the weather in any city, for example: \"What's the weather in London?\"");
  console.log("To exit type 'exit'");

  // Function for processing queries
  async function processQuery(query: string) {
    if (query.toLowerCase() === 'exit') {
      console.log("Goodbye! Have a great day!");
      rl.close();
      process.exit(0);
    }

    console.log("⌛ Getting weather information...");
    
    const result = await processWeatherQuery(query);
    console.log("\n🌤️ " + result + "\n");
    
    // Request next question
    rl.question("Your question: ", processQuery);
  }

  // Launch main conversation loop
  rl.question("Your question: ", processQuery);
}

// Choose operation mode
if (MODE === 'telegram') {
  if (!TELEGRAM_TOKEN) {
    console.error("❌ 'telegram' mode selected, but TELEGRAM_BOT_TOKEN not found in environment variables!");
    console.error("Please add TELEGRAM_BOT_TOKEN to your .env file or use 'console' mode.");
    process.exit(1);
  }
  startTelegramBot();
} else {
  console.log("🖥️ Starting in console mode...");
  startConsoleMode();
}
