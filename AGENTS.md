# AGENTS.md

Instructions for any AI coding agent (Claude Code, Codex, Cursor, Gemini CLI,
GitHub Copilot, …) working in this repository.

This repository is **tgcloud-kit**: skills, a scaffold and a guide for building
Telegram bots on **Telegram Serverless (tgcloud)**. It is a toolbox, not a bot.
Bots made with it live in their own folders and their own git repositories.

## When the user asks for a Telegram bot

1. Read [`tgcloud-kit/skills/tgcloud-bot/SKILL.md`](tgcloud-kit/skills/tgcloud-bot/SKILL.md)
   and follow it step by step. Links in it are relative to
   `tgcloud-kit/skills/tgcloud-bot/`, and `${CLAUDE_SKILL_DIR}` means that folder.
2. You need two things from the user: their **numeric Telegram id** (from
   @userinfobot) and **what the bot should do**. Ask only for what is missing.
3. Create the bot **outside this repository**, in a new folder (default
   `../<bot-name>`), unless the user names another place. One command does
   init, scaffold, install and tests:

   ```
   node scripts/create-bot.mjs ../<bot-name> --admin <id> [--mini-app]
   ```

4. Then work inside the bot's folder. Its own `AGENTS.md`, `docs/ARCHITECTURE.md`
   and `docs/ADMIN-TOOLS.md` hold the rules, and `docs/BOT-API.md` covers the
   Bot API (10.4). Endpoints:
   [`tgcloud-endpoints`](tgcloud-kit/skills/tgcloud-endpoints/SKILL.md). The Mini App
   front-end: [`tgcloud-mini-app`](tgcloud-kit/skills/tgcloud-mini-app/SKILL.md).
   Widgets inside messages:
   [`tgcloud-widgets`](tgcloud-kit/skills/tgcloud-widgets/SKILL.md).
5. **Never ask for a token in the chat.** The user runs `npx tgcloud login`
   themselves and pastes the CLI token there.
6. **Design system.** When the bot gets a Mini App, ask the user which design
   system to use: **Default** (Telegram's theme) or **their own** (they type or
   link it). Don't choose for them. How to apply each is in
   [`tgcloud-mini-app`](tgcloud-kit/skills/tgcloud-mini-app/SKILL.md) Step 1b;
   the choice is saved in the bot's `docs/DESIGN.md`.
7. **Admin tools only on request.** The template has no admin routes or admin
   commands. Add `npm run sql`, `/stats`, `/backup`, an admin panel, scheduled
   jobs or secrets only when the user asks, following
   [`references/admin-tools.md`](tgcloud-kit/skills/tgcloud-bot/references/admin-tools.md).

## Layout

| Path | What it is |
|---|---|
| `tgcloud-kit/skills/tgcloud-bot/` | Entry point: SKILL.md, the architecture, patterns, admin-tools guide, the Bot API 10.4 reference (`references/bot-api.md`), `scripts/scaffold.mjs`, `assets/template/` |
| `tgcloud-kit/skills/tgcloud-endpoints/` | Reference for Mini App endpoints (`POST /api/<name>`) |
| `tgcloud-kit/skills/tgcloud-mini-app/` | The React Mini App: guide, recipes, `assets/app/` starter |
| `tgcloud-kit/skills/tgcloud-widgets/` | HTML widgets inside messages (Bot API 10.4): guide, runtime reference, `scripts/widgets.mjs`, `assets/example/` (a tested counter) |
| `tgcloud-kit/.claude-plugin/plugin.json` | The Claude Code plugin; `.claude-plugin/marketplace.json` lists it |
| `.claude/skills/` | Pointers so Claude Code finds the skills when this repo is opened |
| `scripts/create-bot.mjs` | One command: init + scaffold + install + tests (also `npx github:IsAmirMmd/nim-byte-telegram-serverless`) |
| `site/` | The guide website (React + Vite, Persian and English), deployed to GitHub Pages |

## Working on the kit itself

- After changing the template, the Mini App starter or the scaffold, create a
  bot in a temporary folder and run its tests:
  `node scripts/create-bot.mjs /tmp/kit-check --admin 123456789 --mini-app`.
  `.github/workflows/kit.yml` does the same on every push.
- Keep everything generic: no real bot ids, app ids, tokens, user ids, admin
  routes or code copied from a live bot.
- **When the Bot API changes**, read the changelog
  (https://core.telegram.org/bots/api-changelog) and the Markdown reference
  (https://core.telegram.org/bots/api.md). Then update
  `tgcloud-kit/skills/tgcloud-bot/references/bot-api.md` (the version at the
  top, the update-type table, the new features), and any skill the change
  touches.
- The site: `npm --prefix site install`, then `npm --prefix site run dev`. Its
  texts (both languages) are in `site/src/content.js`.
