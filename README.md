# Discord Roll Dice Bot

A Discord bot for running group dice-rolling sessions. A session is started with a slash command, participants join via a button, then each participant rolls 1d5 in turn — the bot tallies the sum and average at the end.

## Features

- `/roll-session` slash command to start a new session in a channel
- Join button so participants can opt in before rolling starts
- Sequential 1d5 rolls per participant
- Automatic summary: total sum and average across all rolls
- In-memory session state (no database required)

## Tech Stack

- [Node.js](https://nodejs.org/)
- [discord.js](https://discord.js.org/) v14
- Hosted on an Oracle Cloud Always Free VM
- Kept alive with `pm2` or `systemd`

## Project Structure

```
.
├── index.js               # Bot entry point — client setup, event listeners, command/component routing
├── deploy-commands.js      # Registers slash commands with Discord's API
├── commands/                # Slash command definitions
│   ├── index.js             # Command loader/aggregator
│   └── roll-session/        # Subfolder for the roll-session command and its logic
│       ├── index.js
│       └── ...
├── .env                    # Environment variables (bot token, client ID, guild ID)
├── .gitignore
├── package.json
└── README.md
```

## Setup

1. **Clone and install dependencies**

   ```bash
   git clone <repo-url>
   cd dice-roll-bot
   npm install
   ```

2. **Create a `.env` file** in the project root:

   ```env
   DISCORD_TOKEN=your-bot-token
   CLIENT_ID=your-application-client-id
   GUILD_ID=your-test-guild-id
   ```

3. **Register slash commands**

   ```bash
   node deploy-commands.js
   ```

4. **Start the bot**
   ```bash
   node index.js
   ```

## Running in Production

On the Oracle Cloud VM, keep the process alive with either:

**pm2**

```bash
npm install -g pm2
pm2 start index.js --name dice-bot
pm2 save
pm2 startup
```

**systemd**

```ini
[Unit]
Description=Discord Dice Roll Bot
After=network.target

[Service]
ExecStart=/usr/bin/node /path/to/index.js
Restart=always
User=youruser
WorkingDirectory=/path/to/dice-roll-bot
EnvironmentFile=/path/to/.env

[Install]
WantedBy=multi-user.target
```

## How It Works

1. A user runs `/roll-session` to start a new session.
2. The bot posts a message with a **Join** button.
3. Participants click Join to be added to the session roster.
4. The session host starts the rolls; the bot rolls 1d5 for each participant in turn.
5. Once all rolls are in, the bot posts a summary with the sum and average.

## Notes

- Session state is kept in memory per bot process — restarting the bot clears any in-progress sessions.
- No database is used; this keeps the bot lightweight for a small free-tier VM.

## License

MIT
