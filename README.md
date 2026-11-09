<div align="center">

# tgcloud-kit: Telegram serverless bots with AI agents

[![GitHub stars](https://img.shields.io/github/stars/IsAmirMmd/nim-byte-telegram-serverless?style=for-the-badge&logo=github&color=f5c518)](https://github.com/IsAmirMmd/nim-byte-telegram-serverless/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/IsAmirMmd/nim-byte-telegram-serverless?style=for-the-badge&logo=github)](https://github.com/IsAmirMmd/nim-byte-telegram-serverless/network/members)
[![License: MIT](https://img.shields.io/github/license/IsAmirMmd/nim-byte-telegram-serverless?style=for-the-badge&color=blue)](LICENSE)
[![Last commit](https://img.shields.io/github/last-commit/IsAmirMmd/nim-byte-telegram-serverless?style=for-the-badge)](https://github.com/IsAmirMmd/nim-byte-telegram-serverless/commits/main)

**English** · [فارسی](README.fa.md)

</div>

**Describe your Telegram bot in one sentence. Your AI agent builds it, tests it and puts it live.**

This repository is a set of **skills**, a **tested scaffold** and a **complete guide**. Together they teach AI coding agents such as Claude Code, Codex, Cursor, Gemini CLI and GitHub Copilot to build, test and deploy a bot on [Telegram Serverless](https://core.telegram.org/bots/serverless) from scratch. You need no server and no separate database: the code runs on Telegram's own servers, the SQLite database is built in, and the Mini App is hosted next to the bot.

📖 **Guide site:** https://isamirmmd.github.io/nim-byte-telegram-serverless/

🤖 **Live preview:** [@tgCloudKit_bot](https://t.me/tgCloudKit_bot) is the bot the kit builds right now, Mini App included. It is rebuilt and redeployed whenever the kit changes.

## What's inside

| Skill | What it does |
|---|---|
| **tgcloud-bot** (start here) | Turns an empty folder into a complete bot. It sets up the `tgcloud/` layout (schema, one lib per feature, thin handlers and endpoints). It comes with user tracking, `/stop` and block detection, and a `/start` menu where every screen has a «🔙 Back» button, inline and reply keyboards alike. It also has deep links, multi-step input, feedback to the admin, offline tests on a mock SDK, and auto-deploy with GitHub Actions. Bots speak **English by default and Persian too**: users switch with a 🌐 Language button. The bot sets its own command list and Mini App button, so there is nothing to set by hand in BotFather |
| **tgcloud-endpoints** | A complete reference for Mini App endpoints (`POST /api/<name>`): auth from `ctx.initData`, errors, pagination, search, throttling and tests |
| **tgcloud-mini-app** | A React + Vite Mini App, with `tgcloud.jsonc` and deploy. It is bilingual like the bot and right-to-left in Persian. During setup, the agent asks which design system to use: **Default** (Telegram's own theme colors) or **your own** (a website or Figma link, a CSS file, a design-system skill, a library such as Tailwind, or a plain description). The choice is saved in the bot's `docs/DESIGN.md` |
| **tgcloud-widgets** | HTML widgets inside messages (Bot API 10.4): small interactive blocks such as a counter, a live poll, a price ticker or a small game. It covers `sendWidget`, the `widget_query` handler, the widget's state and TON wallet payments, with a tested example |

`scripts/create-bot.mjs` does every setup step in one command, even without AI.

## Requirements

1. **Node.js 22.12** or newer.
2. **Access to Serverless.** It isn't open to everyone yet, so request it first. Open the [@BotFather](https://t.me/BotFather) Mini App, create a new bot, go to its **Serverless** section and request access there. Once BotFather messages you that your whitelist is open, you can use it.
3. Once you have access, in BotFather go to the bot → **Serverless** → **CLI Access → Access token** and copy the token. It looks like `app<id>:<secret>`, which is different from a normal bot token.
4. Your **numeric Telegram id**, from [@userinfobot](https://t.me/userinfobot).

## Using it with AI agents

### Claude Code, as a plugin (once, for every project)

```
/plugin marketplace add IsAmirMmd/nim-byte-telegram-serverless
/plugin install tgcloud-kit@nim-byte
```

Or from the terminal:

```bash
claude plugin marketplace add IsAmirMmd/nim-byte-telegram-serverless
```

```bash
claude plugin install tgcloud-kit@nim-byte --scope user
```

Then open Claude Code in an empty folder and type:

```
/tgcloud-kit:tgcloud-bot 123456789 a café ordering bot with a Mini App
```

To update: `claude plugin update tgcloud-kit@nim-byte`.

### Claude Code, by cloning this repository

The skills are in `.claude/skills/`, and Claude Code finds them when you open the repository:

```bash
git clone https://github.com/IsAmirMmd/nim-byte-telegram-serverless
cd nim-byte-telegram-serverless
claude
```

```
/tgcloud-bot 123456789 a barbershop booking bot with a Mini App
```

The bot is created in its own folder next to this repository (for example `../barber-bot`), because it becomes its own git repository.

### Codex, Cursor, Gemini CLI, GitHub Copilot and others

Any agent that can read files and run commands works. Clone the repository, open your agent in it and say:

```
Read AGENTS.md and, following it, build me a Telegram serverless bot that takes food orders and has a Mini App panel. My numeric id is 123456789.
```

`AGENTS.md` tells the agent which skill to read, where to create the bot, and what it may do only with your permission. Codex, Cursor and Copilot read the file on their own. For Gemini CLI, the sentence above is enough.

### Without AI

One command, no clone needed. It runs `tgcloud init`, the scaffold, the install and the tests:

```bash
npx github:IsAmirMmd/nim-byte-telegram-serverless my-bot --admin 123456789 --mini-app
```

Or from the cloned repository:

```bash
node scripts/create-bot.mjs ../my-bot --admin 123456789 --mini-app
```

Without `--mini-app` you get only the bot. `--help` lists every option.

## Setting up the bot once the project exists

Run every command in the **bot's folder**.

1. **Link it to your bot.** Enter the CLI token here, and never send it to an agent in a chat. In Claude Code you can type `! npx tgcloud login`.

   ```bash
   npx tgcloud login
   ```

2. **Deploy and create the tables.** A deploy never touches the database: schema changes are applied with `migrate`.

   ```bash
   npm run deploy
   ```

   ```bash
   npx tgcloud migrate
   ```

3. **Try it in Telegram.** Send `/start` to the bot. The bot sets up its command list (in English and Persian) and the Mini App button next to the input field by itself, so there is nothing to set in BotFather. With a Mini App, put the URL that `push` printed (`https://app<id>.tgcloud.ai/`) in `MINI_APP_URL` in `tgcloud/lib/config.js` and deploy again.

4. **Auto-deploy.** Put the bot's folder in its own GitHub repository and add the **`TGCLOUD_TOKEN`** secret (Settings → Secrets and variables → Actions). From then on, every push to `main` runs build, push, `migrate --safe` and `webhook sync`, in that order.

5. **Keep building.** Open the bot's folder in your agent and ask for features. The folder's `AGENTS.md` and `docs/ARCHITECTURE.md` tell any agent where code goes and how it's tested.

## Bot commands

| Command | What it does |
|---|---|
| `npm install` | Install the dependencies (once) |
| `npm test` | Offline tests on the mock SDK: no network, no deploy |
| `npx tgcloud login` | Link the project to the bot with the CLI token (once) |
| `npm run deploy` | Build the Mini App (if there is one) and upload the code |
| `npx tgcloud migrate` | Apply the changes in `tgcloud/schema.js` to the database |
| `npx tgcloud status` | What changed locally and isn't in the cloud yet |
| `npx tgcloud run <module> '<input>'` | Run a handler or an endpoint in the cloud against the real database and Bot API, without deploying |
| `npx tgcloud webhook` | The webhook's state. `npx tgcloud webhook sync` fixes it |
| `npx tgcloud pull` | Bring the local project in line with what's in the cloud |
| `npm run dev` | Run the Mini App in a browser (endpoint calls only work inside Telegram) |
| `npm run build` | Build the Mini App into `dist/` |

`tgcloud run` examples:

```bash
npx tgcloud run handlers/message '{ text: "/start", from: { id: 123456789 }, chat: { id: 123456789, type: "private" } }'
```

```bash
npx tgcloud run endpoints/me '{}' --ctx '{ initData: { user: { id: 123456789 } } }'
```

## Languages

Bots made with the kit speak **English by default and Persian too**. Every user-facing text lives in the bot's `tgcloud/lib/i18n.js`, in both languages, and the Mini App has the same dictionaries in `src/lib/i18n.js`. A user's language is decided in this order:
1. the language they chose with the bot's 🌐 Language button;
2. otherwise, their Telegram app's language (Persian for `fa`);
3. otherwise, English.

The Mini App follows the same choice and switches to right-to-left in Persian. The command list and the Mini App button are set in each language too. For a third language, ask your agent to add a dictionary.

The guide site is bilingual too: English by default, Persian one click away.

## Admin tools, only when you ask

The bot template has **no admin routes or commands**: no `/api/sql`, no `/stats` or `/backup`, no admin panel and no scheduled job. These tools are powerful, so each bot gets only the ones its owner asks for. Just tell your agent. How to build each one safely is in every bot's `docs/ADMIN-TOOLS.md` (and in [`admin-tools.md`](tgcloud-kit/skills/tgcloud-bot/references/admin-tools.md)): a `requireAdmin` check on the first line, a test for a refused caller, and failures reported to the admin.

| Tell your agent | What gets added |
|---|---|
| "Add `npm run sql`" | An admin-only endpoint and a terminal script to query the database directly |
| "Add `/stats` and `/backup` for the admin" | User stats and a CSV backup in the admin's chat, with error reports |
| "Build an admin panel in the Mini App with the user list" | Admin endpoints with `requireAdmin` and a paginated table |
| "Send me a report every day at 9 a.m." | An admin command and a scheduled job on GitHub Actions |
| "Store the API key for this service" | A `/setkey` command that keeps the key in the `settings` table |

Once `npm run sql` is added:

```bash
npm run sql -- "SELECT * FROM users ORDER BY first_seen_at DESC LIMIT 5"
```

```bash
npm run sql -- "SELECT name FROM sqlite_master WHERE type = 'table'"
```

Put double quotes around the query and single quotes around values. Writes (UPDATE and DELETE) are real and can't be undone, so run a SELECT with the same WHERE first.

## Security

- **No admin routes by default.** A fresh bot exposes only `me` (and, with the Mini App, `feedback`, which is throttled).
- **The CLI token** stays only in `.tgcloud/` (gitignored) and in the `TGCLOUD_TOKEN` GitHub secret. It never goes in the code, the docs, or a chat with an agent.
- **Identity comes only from Telegram.** Endpoints know the user only from `ctx.initData.user`, which the platform verifies. Any Mini App user can call any endpoint, so inputs are validated and requests are throttled.
- **Secrets** (API keys) stay in the `settings` table and never go into a backup or an export.

## Repository layout

```
nim-byte-telegram-serverless/
├─ tgcloud-kit/                     ← the Claude Code plugin
│  ├─ .claude-plugin/plugin.json
│  └─ skills/
│     ├─ tgcloud-bot/               ← SKILL.md, references/ (architecture, patterns, admin-tools, bot-api),
│     │                               scripts/scaffold.mjs, assets/template/
│     ├─ tgcloud-endpoints/         ← SKILL.md
│     ├─ tgcloud-mini-app/          ← SKILL.md, references/recipes.md, assets/app/ (React starter)
│     └─ tgcloud-widgets/           ← SKILL.md, references/widget-runtime.md, scripts/widgets.mjs, assets/example/
├─ .claude-plugin/marketplace.json  ← makes this repo a plugin marketplace ("nim-byte")
├─ .claude/skills/                  ← pointers: the skills work when the repo is cloned
├─ AGENTS.md, CLAUDE.md             ← instructions for any AI agent
├─ scripts/create-bot.mjs           ← one command: init + scaffold + install + tests
├─ site/                            ← the guide site (React + Vite, en + fa)
├─ README.md, README.fa.md          ← this guide, in English and Persian
└─ .github/workflows/
   ├─ pages.yml                     ← deploys site/ to GitHub Pages
   ├─ kit.yml                       ← creates a bot from the kit and runs its tests
   └─ preview.yml                   ← deploys the kit's bot to @tgCloudKit_bot (live preview)
```

A bot made with the kit looks like this:

```
my-bot/
├─ tgcloud/            ← schema.js, handlers/, endpoints/, lib/ (the code Telegram runs; texts in lib/i18n.js)
├─ src/, index.html    ← the Mini App (with --mini-app)
├─ test/               ← offline tests on a mock SDK
├─ docs/               ← ARCHITECTURE.md, ADMIN-TOOLS.md, BOT-API.md, tgcloud-sdk.md
├─ .github/workflows/deploy.yml
├─ AGENTS.md
└─ tgcloud.jsonc
```

## The guide site

The site in `site/` is built with React and Vite and has no back end. On every push to `main` that changes `site/`, the `pages.yml` workflow publishes it to GitHub Pages.

- **One-time setup:** Settings → Pages → Build and deployment → Source: **GitHub Actions**. Then run the "Deploy site" workflow from Actions.
- **Run it locally:**

```bash
npm --prefix site install
```

```bash
npm --prefix site run dev
```

The site's texts (English and Persian) are in `site/src/content.js`. The same Pages setting is enough in a fork, because the site is built with relative paths.

## Live preview

[@tgCloudKit_bot](https://t.me/tgCloudKit_bot) is exactly the bot that `scripts/create-bot.mjs --mini-app` creates. On every push to `main` that changes the kit, the `preview.yml` workflow:
1. creates a fresh bot from the kit and runs its tests. If a test fails, nothing is deployed;
2. builds the Mini App;
3. deploys the bot with `push`, `migrate --safe` and `webhook sync`, then checks that the cloud runs exactly that code.

The token and the admin id are kept only in the repository's `preview` environment (the `PREVIEW_TGCLOUD_TOKEN` secret and the `PREVIEW_ADMIN_ID` variable), and that environment is limited to the `main` branch. Forks can't reach them: secrets aren't copied to forks, the workflow doesn't run outside this repository, and it never runs for pull requests.

## License

[MIT](LICENSE). Use, change, fork and publish it freely, personally or commercially. Just keep the license text and the copyright notice in copies.
