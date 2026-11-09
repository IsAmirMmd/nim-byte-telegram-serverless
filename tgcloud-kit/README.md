# tgcloud-kit (Claude Code plugin)

Skills for building Telegram bots on Telegram Serverless (tgcloud) with an AI agent.
Full guide (Persian and English): the [repository README](../README.md) and the
[guide site](https://isamirmmd.github.io/nim-byte-telegram-serverless/).
Try what it builds: [@tgCloudKit_bot](https://t.me/tgCloudKit_bot), the live preview.

```
/plugin marketplace add IsAmirMmd/nim-byte-telegram-serverless
/plugin install tgcloud-kit@nim-byte
```

| Skill | Use it for |
|---|---|
| `tgcloud-bot` | Start here: scaffold a bot (`scripts/scaffold.mjs`), the architecture, patterns, and admin tools built on request (`references/admin-tools.md`) |
| `tgcloud-endpoints` | Mini App endpoints (`POST /api/<name>`): auth, errors, pagination, throttling, tests |
| `tgcloud-mini-app` | The React + Vite Mini App: Telegram theme, wiring, deploy (`assets/app/` starter) |
| `tgcloud-widgets` | HTML widgets inside messages (Bot API 10.4): sendWidget, `widget_query`, the widget's state, a tested counter example |

```
skills/
├─ tgcloud-bot/
│  ├─ SKILL.md                    ← entry point: inputs → scaffold → login → features → CI → admin tools on request
│  ├─ references/architecture.md  ← the architecture (copied to docs/ARCHITECTURE.md)
│  ├─ references/patterns.md      ← buttons, menus, upserts, files, deep links…
│  ├─ references/admin-tools.md   ← npm run sql, admin commands, admin panel, cron, secrets (copied to docs/ADMIN-TOOLS.md)
│  ├─ references/bot-api.md       ← Bot API 10.4: update types → handlers, new features (copied to docs/BOT-API.md)
│  ├─ scripts/scaffold.mjs        ← the scaffold (Node built-ins only)
│  └─ assets/template/            ← tgcloud/, test/, .github/workflows/deploy.yml
├─ tgcloud-endpoints/SKILL.md
├─ tgcloud-mini-app/              ← SKILL.md, references/recipes.md, assets/app/
└─ tgcloud-widgets/               ← SKILL.md, references/widget-runtime.md, scripts/widgets.mjs, assets/example/
```
