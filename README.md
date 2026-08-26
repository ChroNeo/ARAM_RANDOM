# ARAM Random Bot 🎲

A Thai-language Discord bot for ARAM (All Random All Mid) game sessions. Players join a lobby, and the bot randomly determines how many wins each player must achieve by rolling a 1d5 dice. Features Zeus/Poseidon rules for rounding, animated roll reveals, and participant tracking.

## Features

- **`/aram`** slash command to start a new ARAM randomizer session
- Interactive join button for up to 5 players
- Sequential 1d5 dice rolls with suspenseful delays and Thai flavor text
- Random Zeus/Poseidon rule for final win calculation
  - **Zeus**: Rounds average UP → fewer total wins needed
  - **Poseidon**: Rounds average DOWN → more total wins needed
- Animated roll reveals with emojis (🔥 for 1, 💀 for 5)
- Summary statistics: total wins, average, required wins, and unluckiest player(s)
- **`/ping`** utility command for bot health check
- In-memory session state (no database required)

## Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Discord Library**: [discord.js](https://discord.js.org/) v14.27.0
- **Environment Config**: dotenv v17.4.2
- **Code Quality**: ESLint v10.8.1 with custom config

## Project Structure

```
ARAMRANDOM/
├── index.js                # Bot entry point — client setup, event listeners, command loader
├── deploy-commands.js      # Registers slash commands with Discord's API
├── commands/               # Slash command modules
│   ├── aram/
│   │   └── aram.js         # Main ARAM randomizer command
│   └── utility/
│       └── ping.js         # Ping command for health check
├── .env                    # Environment variables (bot token, client ID, guild ID)
├── .eslint.config.js       # ESLint configuration
├── .gitignore              # Git ignore rules
├── package.json            # Project dependencies and scripts
└── README.md               # This file
```

## Setup

### 1. Prerequisites

- Node.js v16.9.0 or higher
- A Discord Bot Token ([Create one here](https://discord.com/developers/applications))
- Your Discord Application Client ID
- Your Discord Server (Guild) ID for testing

### 2. Clone and Install

```bash
git clone <your-repo-url>
cd ARAMRANDOM
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
DISCORD_TOKEN=your-bot-token-here
CLIENT_ID=your-application-client-id
GUILD_ID=your-test-guild-id
```

**Getting these values:**

- **DISCORD_TOKEN**: From Discord Developer Portal → Your App → Bot → Reset Token
- **CLIENT_ID**: From Discord Developer Portal → Your App → Application ID
- **GUILD_ID**: Enable Developer Mode in Discord, right-click your server, Copy ID

### 4. Deploy Commands

Register the slash commands with Discord:

```bash
npm run deploy
```

You should see: `Successfully reloaded X application (/) commands.`

### 5. Start the Bot

```bash
npm start
```

The bot will log: `Ready! Logged in as YourBot#1234`

## Usage

### `/aram` Command

1. Run `/aram` in any text channel
2. Players click the **Join** button (max 5 players)
3. Once ready, anyone clicks **เริ่มสุ่ม** (Start Random)
4. Bot rolls 1d5 for each player with dramatic pauses
5. Final summary shows:
   - Each player's roll
   - Total and average
   - Zeus/Poseidon rule and required wins
   - Unluckiest player(s) with highest roll

**Example Output:**

```
ARAM สุ่มซ่อนมาร
ผู้เข้าร่วม (3/5)
1. Player1         🎲 4
2. Player2         🎲 2
3. Player3         🎲 5

📊 สรุปผลลัพธ์
รวมทั้งหมด: 11
ค่าเฉลี่ย: 3.67
กติกา: Zeus ⚡ (ปัดขึ้น)
ชนะกี่แมทช์: 4 แมทช์

💀 ผู้โชคร้ายที่สุด: Player3 (ทอยได้ 5)
```

### `/ping` Command

Simple health check:

```
/ping → Pong!
```

## Running in Production

### Option 1: PM2 (Recommended)

Install PM2 globally and run:

```bash
npm install -g pm2
pm2 start index.js --name aram-bot
pm2 save
pm2 startup
```

**PM2 Commands:**

- `pm2 logs aram-bot` - View logs
- `pm2 restart aram-bot` - Restart bot
- `pm2 stop aram-bot` - Stop bot
- `pm2 delete aram-bot` - Remove from PM2

### Option 2: systemd (Linux)

Create `/etc/systemd/system/aram-bot.service`:

```ini
[Unit]
Description=ARAM Discord Bot
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/path/to/ARAMRANDOM
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

**Note**: Place your `.env` file in the WorkingDirectory or use `EnvironmentFile=/path/to/.env`

Enable and start:

```bash
sudo systemctl enable aram-bot
sudo systemctl start aram-bot
sudo systemctl status aram-bot
```

## Development

### Available Scripts

```bash
npm start          # Start the bot
npm run deploy     # Deploy slash commands to Discord
npm test           # Run tests (not configured yet)
```

### Code Style

The project uses ESLint with custom rules:

- Tab indentation
- Single quotes
- Semicolons required
- Stroustrup brace style
- No console warnings (allowed for logging)

Run linting:

```bash
npx eslint .
```

### Adding New Commands

1. Create a new folder in `commands/` (e.g., `commands/game/`)
2. Add your command file (e.g., `newcommand.js`)
3. Export a module with `data` (SlashCommandBuilder) and `execute` function
4. Run `npm run deploy` to register the command

**Example:**

```javascript
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("example")
    .setDescription("Example command"),
  async execute(interaction) {
    await interaction.reply("Hello!");
  },
};
```

## How It Works

1. User runs `/aram` → Bot creates an embed with Join/Start buttons
2. Players click **Join** → Added to participant list (max 5)
3. Any player clicks **เริ่มสุ่ม** → Buttons disabled, rolling begins
4. Bot rolls 1d5 for each player sequentially with 1.5s delays
5. Each roll is announced with Thai flavor text and emoji
6. Zeus/Poseidon rule is randomly chosen (50/50)
7. Final embed shows stats, required wins, and unluckiest player
8. Session ends (5-minute timeout if Start never clicked)

## Configuration

Edit constants in `commands/aram/aram.js`:

```javascript
const MAX_PLAYERS = 5; // Max lobby size
const DICE_SIDES = 5; // Dice faces (1d5)
const ROLL_DELAY_MS = 1500; // Delay between rolls (ms)
const IMAGE_URL = "..."; // Main embed image
```

## Notes & Limitations

- **In-Memory State**: Restarting the bot clears all active sessions
- **Guild Commands**: Commands are registered per-guild (faster updates). For global commands, modify `deploy-commands.js` to use `Routes.applicationCommands()`
- **Thai Language**: All UI text is in Thai for the target audience
- **No Database**: Keeps the bot lightweight and stateless

## Troubleshooting

**Bot doesn't respond to commands:**

- Ensure you ran `npm run deploy` after adding commands
- Check bot has proper permissions in Discord server
- Verify `GUILD_ID` matches your test server

**"Missing Access" error:**

- Bot needs these permissions: Send Messages, Embed Links, Use Slash Commands

**Commands not showing:**

- Wait a few minutes for Discord to sync
- Try kicking and re-inviting the bot
- Check bot has `applications.commands` scope

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ISC License - See `package.json` for details

## Author

Created for Thai ARAM gaming communities 🎮

---

**พัฒนาด้วยความรักจากคอมมูนิตี้ ARAM ไทย** 🇹🇭
