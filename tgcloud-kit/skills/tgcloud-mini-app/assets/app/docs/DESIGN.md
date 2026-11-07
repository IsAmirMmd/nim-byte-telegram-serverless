# Design

The Mini App's look. Every change to the front-end (`src/`) follows this file.

**Design system: Default (the Telegram theme).**

**Chosen by the user: not yet.** This is the scaffold's default. The agent that
sets up the Mini App asks the user once (the default, or their own design
system) and records the answer here: `yes` for the default, or this whole file
rewritten for their own system.

To use another design system later, ask your AI agent, e.g. "use my design system:
<link / file / description>". It applies it (tgcloud-mini-app skill, Step 1b)
and rewrites this file.

## Colors

The app takes its colors from the user's Telegram theme. `telegram-web-app.js`
sets the `--tg-theme-*` CSS variables (light, dark and custom themes) and keeps
them updated. `src/app.css` maps them to app variables, with fallbacks for
`npm run dev` in a browser:

| Variable | From | Used for |
|---|---|---|
| `--bg` | `--tg-theme-secondary-bg-color` | page background |
| `--section-bg` | `--tg-theme-section-bg-color` | cards / sections |
| `--text` | `--tg-theme-text-color` | text |
| `--hint` | `--tg-theme-hint-color` | secondary text, labels |
| `--link` | `--tg-theme-link-color` | links, success messages |
| `--button`, `--button-text` | `--tg-theme-button-color`, `--tg-theme-button-text-color` | primary buttons, focus ring |
| `--destructive` | `--tg-theme-destructive-text-color` | errors, destructive actions |
| `--separator` | `--tg-theme-section-separator-color` | row dividers, input borders |
| `--section-title` | `--tg-theme-section-header-text-color` | section headings |

## Rules

- Use only the variables above; no hard-coded colors.
- Font: the system font stack (`body` in `app.css`).
- Radius: `--radius` (14px) for sections, 10px for inputs and buttons.
- Layout: one column, max 640px, 16px side padding; `.app` keeps the safe-area
  padding for fullscreen.
- RTL: `dir="rtl"`, logical properties (`margin-inline-start`, `text-align: start`).
- Tap targets of at least 44px; readable contrast in light and dark.
