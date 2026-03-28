# Polymarket Positions Watcher

Watches your Polymarket positions and sends Telegram alerts when prices move significantly.

## Features

- Monitors your Polymarket positions in real-time
- Sends Telegram notifications when prices move by a configurable threshold
- Persists price history across restarts
- Runs continuously with configurable polling interval

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your settings:
   ```
   POLYMARKET_USER=0xYourWalletAddress
   TELEGRAM_TOKEN=your_bot_token
   TELEGRAM_CHAT_ID=your_chat_id
   POLL_INTERVAL_MS=30000
   ALERT_THRESHOLD=0.01
   ```

   - `POLYMARKET_USER`: Your Ethereum wallet address connected to Polymarket
   - `TELEGRAM_TOKEN`: Create a bot via [@BotFather](https://t.me/botfather)
   - `TELEGRAM_CHAT_ID`: Get your chat ID via [@userinfobot](https://t.me/userinfobot)
   - `POLL_INTERVAL_MS`: How often to check prices (default: 30000ms = 30s)
   - `ALERT_THRESHOLD`: Price change threshold to trigger alerts (default: 0.01 = 1%)

## Usage

Run the watcher:

```bash
node index.js
```

The script will:
- Load previously saved prices (if any)
- Check your positions immediately
- Send alerts for any significant price moves
- Continue polling at the configured interval

Press `Ctrl+C` to stop gracefully.

## Data Files

- `prices.json` - Persists last known prices between runs
- `.env` - Configuration (not committed to git)

## License

MIT
