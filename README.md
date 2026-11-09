<div align="center">

# tgcloud-kit

**Describe a Telegram bot in one sentence. Your AI agent builds, tests and deploys it on [Telegram Serverless](https://core.telegram.org/bots/serverless).**

[![GitHub stars](https://img.shields.io/github/stars/IsAmirMmd/nim-byte-telegram-serverless?style=for-the-badge&logo=github&color=f5c518)](https://github.com/IsAmirMmd/nim-byte-telegram-serverless/stargazers)
[![License: MIT](https://img.shields.io/github/license/IsAmirMmd/nim-byte-telegram-serverless?style=for-the-badge&color=blue)](LICENSE)

[Guide](https://isamirmmd.github.io/nim-byte-telegram-serverless/) · [Live demo](https://t.me/tgCloudKit_bot) · [فارسی](README.fa.md)

</div>

Skills and a tested scaffold that let AI agents (Claude Code, Codex, Cursor, Gemini CLI, Copilot) build Telegram bots with no server and no separate database. The code runs on Telegram's servers, SQLite is built in, and the Mini App is hosted next to the bot.

Every bot comes with a `/start` menu with a back button on every screen, English and Persian, feedback to the admin, offline tests and auto-deploy. You can add a React Mini App, HTML widgets and admin tools when you ask for them.

## You need

- Node.js 22.12+
- Telegram Serverless access. In the [@BotFather](https://t.me/BotFather) Mini App, open your bot → **Serverless** and request it.
- The bot's CLI token (**Serverless → CLI Access**) and your numeric Telegram id ([@userinfobot](https://t.me/userinfobot))

## Create a bot

**Claude Code:**

```
/plugin marketplace add IsAmirMmd/nim-byte-telegram-serverless
/plugin install tgcloud-kit@nim-byte
```

Then, in an empty folder:

```
/tgcloud-kit:tgcloud-bot 123456789 a barbershop booking bot with a Mini App
```

**Any other agent:** clone this repo, open your agent in it, and say *"Read AGENTS.md and build me a Telegram bot that … My numeric id is 123456789."*

**Without AI:**

```bash
npx github:IsAmirMmd/nim-byte-telegram-serverless my-bot --admin 123456789 --mini-app
```

## Put it live

In the bot's folder:

```bash
npx tgcloud login
```

```bash
npm run deploy
```

```bash
npx tgcloud migrate
```

Send `/start` to your bot. It sets its own command list and Mini App button, so there's nothing to set in BotFather.

To deploy on every push, put the bot in its own GitHub repo and add the `TGCLOUD_TOKEN` secret.

Never paste the token into a chat with an agent: run `npx tgcloud login` yourself.

## Skills

| Skill | For |
|---|---|
| `tgcloud-bot` | Start here: scaffold, architecture, patterns, admin tools on request |
| `tgcloud-endpoints` | Mini App endpoints (`POST /api/<name>`) |
| `tgcloud-mini-app` | The React Mini App |
| `tgcloud-widgets` | HTML widgets inside messages (Bot API 10.4) |

Everything else (commands, admin tools, security, the bot's structure) is in the [guide](https://isamirmmd.github.io/nim-byte-telegram-serverless/) and in each bot's `docs/`.

## License

[MIT](LICENSE)
