---
name: tgcloud-bot
description: Start, scaffold or grow a Telegram bot on Telegram Serverless (tgcloud) with a proven architecture — tgcloud/ layout (schema, lib per feature, thin handlers and endpoints), users tracking, a /start menu, deep links, multi-step input, feedback to the admin, offline tests on a mock SDK, and auto-deploy on GitHub Actions; optionally a React Mini App. Admin tools (`npm run sql`, admin commands, an admin panel, scheduled jobs, secrets) are added on request from references/admin-tools.md. Use when the user wants to create, scaffold, start or set up a new Telegram serverless / tgcloud bot (or Mini App), asks to "use tgcloud-kit", asks for one of those admin tools, or wants an existing tgcloud project brought to this structure.
argument-hint: "[admin telegram id] [what the bot should do]"
---

# tgcloud-bot (from tgcloud-kit)

The skill lives in this repo's kit: **read `tgcloud-kit/skills/tgcloud-bot/SKILL.md` and follow it.**
Its relative links are relative to `tgcloud-kit/skills/tgcloud-bot/`, and the skill-directory
variable in it (`CLAUDE_SKILL_DIR`) stands for that folder.

Create the bot in its own folder **outside this repository** (default `../<bot-name>`),
unless the user names another place: the bot becomes its own git repository, so its
GitHub Actions deploy workflow can run.

Request: $ARGUMENTS
