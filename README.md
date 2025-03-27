# GenSX AI Weather Agent for Telegram and CLI

A smart AI-powered weather assistant that processes natural language queries and provides weather information via Telegram bot or CLI interface. Built with [GenSX](https://gensx.com), a powerful React-like framework for creating AI agents.

## 🌤️ Overview

This project demonstrates how to create an intelligent weather agent that:

- Extracts location information from natural language queries
- Fetches real-time weather data without requiring API keys
- Generates human-like responses with context awareness
- Offers multiple interfaces (Telegram bot and CLI)

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- NPM or Yarn
- OpenAI API key
- Telegram Bot Token (optional, for Telegram mode)

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/sersavan/weather-ai-agent-gensx.git
   cd weather-ai-agent-gensx
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root:
   ```
   OPENAI_API_KEY=your_openai_api_key
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   MODE=console  # or 'telegram' for Telegram mode
   ```

### Usage

#### Console Mode

Run the agent in console mode:
```bash
npm run dev
```

Ask questions about the weather in natural language:
```
Your question: What's the weather like in Tokyo?
```

#### Telegram Mode

1. Set `MODE=telegram` in your `.env` file
2. Start the agent:
   ```bash
   npm run dev
   ```
3. Find your bot on Telegram and start chatting!

## 🧩 Why GenSX?

GenSX provides an exceptional framework for building AI agents because:

1. **React-like Component System**: If you know React, you already know how to structure GenSX agents with components, props, and state
   
2. **JSX Syntax For AI Workflows**: Visually map complex AI workflows using familiar JSX syntax, making agent design intuitive

3. **Seamless LLM Integration**: Simple integration with OpenAI and other LLM providers with built-in components

4. **Type Safety**: Full TypeScript support means fewer bugs and better development experience

5. **Composability**: Build complex agents from reusable components, making your code DRY and maintainable

6. **Debugging Tools**: Trace execution flows and inspect inputs/outputs of each component

7. **Production-Ready**: Deploy agents with confidence using a framework designed for reliability

## 🔍 How It Works

The agent follows this workflow:

1. Receives a natural language query about weather
2. Extracts the location name using an LLM
3. Fetches real-time weather data from wttr.in API
4. Generates a natural language response using the weather data and original query
5. Returns the response to the user via the chosen interface

## 📝 Project Structure

- `src/index.tsx` - Main agent implementation with all components and workflows
- `.env` - Configuration for API keys and mode settings

## 📚 Learn More

- [GenSX Documentation](https://gensx.com/docs)
- [OpenAI API](https://platform.openai.com/docs/introduction)
- [wttr.in API](https://github.com/chubin/wttr.in)

## 🔄 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [GenSX](https://gensx.com) for the amazing AI agent development framework
- [wttr.in](https://wttr.in) for the free weather API

---

Made with ❤️ using [GenSX](https://gensx.com)
