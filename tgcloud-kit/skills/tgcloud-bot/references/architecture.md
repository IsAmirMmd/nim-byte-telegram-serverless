# Architecture

How this bot is built, and the conventions every change follows. It comes from
tgcloud-kit (the architecture of a production bot on Telegram Serverless, cut
down to a starting point). The platform's own rules are in `AGENTS.md` and the
SDK reference in `docs/tgcloud-sdk.md`. This file is about *this project's*
structure. Keep it true when the structure changes.

## 1. The platform in one paragraph

Telegram Serverless runs the JavaScript modules in `tgcloud/` in a V8 isolate.
There is no server, filesystem, npm packages or env vars at runtime, only the
`sdk` module:
- `db`: SQLite with a query builder;
- `api`: the Bot API;
- `fetch`;
- `InputFile`;
- `EndpointError`.

A file in `handlers/` is named after a Telegram update type and receives that
update's payload. A file in `endpoints/` answers `POST /api/<name>` for the Mini
App. The Mini App's build folder is hosted at `https://app<id>.tgcloud.ai/`. The
`tgcloud` CLI deploys (`push`), migrates the schema (`migrate`) and runs modules
in the cloud (`run`).

## 2. Layout

```
tgcloud/                      ← deployed code; the only code the platform sees
  schema.js                   ← every table, as named exports
  handlers/                   ← one file per update type; thin routers
    message.js                ← /start (+ deep links), /stop, /help, pending answers
    callback_query.js         ← inline buttons, routed by callback_data prefix
    my_chat_member.js         ← the bot blocked/unblocked (private) or added/removed (groups, channels)
  endpoints/                  ← one file per Mini App call; thin: authorize → lib → JSON
    me.js                     ← the caller's own profile
    feedback.js               ← (with the Mini App) the feedback form: validated, throttled
  lib/                        ← all the logic; one module per feature
    config.js                 ← constants (ADMIN_ID, MINI_APP_URL, UTC offset): no env vars exist
    settings.js               ← key/value table: secrets, drafts, flags
    users.js                  ← users table: /start tracking, blocked, /stop, pending_action, profileOf
    feedback.js               ← feedback to the admin + a per-user throttle (bot and Mini App share it)
    access.js                 ← callerId / forbidden() / badInput(); isAdmin / requireAdmin for admin tools
    menu.js                   ← navigation: inline and reply-keyboard screens, each with an automatic back button; the command list
    i18n.js                   ← every user-facing text, English (default) and Persian: t(lang, key)
    query.js                  ← pagination, search, ORDER BY, WHERE helpers for list endpoints
    html.js                   ← esc(), link(), fa() for parse_mode HTML texts
    time.js                   ← now(), DAY, local time with a fixed UTC offset
    files.js                  ← CSV / XLSX / UTF-8 without npm packages
src/                          ← the Mini App (React + Vite), if there is one; talks to endpoints only
test/                         ← offline tests: the real modules on a mock SDK (node:sqlite)
.github/workflows/
  deploy.yml                  ← push to main → build, push, migrate --safe, webhook sync
docs/ARCHITECTURE.md          ← this file
docs/ADMIN-TOOLS.md           ← how to add admin tools (npm run sql, admin commands, admin panel, cron) on request
AGENTS.md, docs/tgcloud-sdk.md← platform rules + SDK reference (from `tgcloud init`)
tgcloud.jsonc                 ← "static": the Mini App's build folder
.tgcloud/                     ← CLI state + credentials; gitignored; never read or edit
```

## 3. Layers and the dependency rule

```
Telegram ──webhook──▶ handlers/<update>.js ─┐
Mini App ──/api/x───▶ endpoints/x.js ───────┼──▶ lib/<feature>.js ──▶ schema.js, sdk (db, api, fetch)
cron / terminal ─tgcloud run─▶ handlers/message.js or endpoints/x.js ─┘
```

- **handlers/** and **endpoints/** are entry points. They parse, route,
  authorize and answer. Logic lives in `lib/`, so a bot command, a Mini App
  button and a scheduled job can share one function. For example,
  `forwardFeedback()` serves both the bot's feedback button and the Mini
  App's `endpoints/feedback.js`.
- **lib/** never imports from `handlers/` or `endpoints/`. If two lib modules
  need each other, move the shared part into a third module. Import cycles
  break silently at load time.
- **The front-end** (`src/`) never imports from `tgcloud/`. It reaches the server
  only through endpoints (`callEndpoint` / `useEndpoint`).
- Imports: relative with `.js` (`'../lib/users.js'`), the SDK by name (`'sdk'`,
  `'sdk/db'`). Nothing outside `tgcloud/` is reachable.

## 4. The four ways code runs

| Trigger | Path | Caller identity |
|---|---|---|
| Telegram update | webhook → `handlers/<type>.js` default export `(payload, ctx)`; full update in `ctx.update` | `payload.from` (from Telegram) |
| Mini App call | `Telegram.WebApp.Serverless.call(name, input)` → `/api/<name>` → `endpoints/<name>.js` `(input, ctx)` | `ctx.initData.user` (verified by the platform; bad init data → 401) |
| Scheduled job (added on request) | GitHub Actions cron → `npx tgcloud run handlers/message '{ text: "/cmd", from: { id: ADMIN_ID }, chat: { id: ADMIN_ID, type: "private" } }'` | the admin, as configured in the workflow |
| Terminal | `npx tgcloud run endpoints/x '{…}' --ctx '{…}'` (and `npm run sql`, once added) | whatever `--ctx` says (not verified: logic tests only) |

There is no scheduler on the platform. Every periodic job is an admin command
plus a workflow, so it also works by hand: send the command, or "Run workflow"
in GitHub. The template has neither; `docs/ADMIN-TOOLS.md` shows how to add
them when the user asks.

## 5. Conventions

### Routing

- **`handlers/message.js`** checks, in this order:
  1. payments (`successful_payment`), when the bot sells something;
  2. `/start` (track the user, then the deep-link payload, then the menu);
  3. `/stop`;
  4. admin commands, once added (`docs/ADMIN-TOOLS.md`);
  5. public commands (`/help`);
  6. reply-keyboard buttons and `🔙 Back` (`handleKeyboardText`);
  7. the answer to a pending question;
  8. everything else is ignored, with no reply.
- **callback_data** is `<feature>:<action>[:<args>]`, at most 64 bytes, for
  example `menu:help` or `vote:up:42`. Each lib module exports
  `handleXCallback(query)`, which returns `true` when the button was one of
  its own. `callback_query.js` tries them in turn.
  - Always `answerCallbackQuery`, and make it a toast rather than an alert,
    unless the user must read it.
  - Check `query.from.id` before acting. A button can be pressed by anyone
    who sees it.
- **Deep links** look like `t.me/<bot>?start=<prefix>_<args>`. The payload is
  at most 64 characters, `[A-Za-z0-9_-]`. `startPayload()` in `message.js`
  routes them by prefix. The first payload a user ever came with is kept in
  `users.start_param` for attribution.
- **Navigation: every action has a way back.** Any message a button or
  command leads to has a way back to the screen before it: a
  `🔙 Back` button (or `🏠 Main menu` after a final result such as "sent ✅").
  Only the root (`home`) has none. This holds for inline buttons and for
  reply-keyboard buttons alike. `lib/menu.js` does it by construction:
  - every screen (`SCREENS` for inline, `KEYBOARDS` for reply keyboards)
    names its `parent`, and the back row is added automatically;
  - a question is a screen too (`enter: (user) => askFor(…)`). Going back
    from it cancels the question (`cancelPending`). A typed `🔙 Back` does
    the same;
  - inline keyboards a feature builds itself end with `withBack(lang, rows, to)` or
    `backButton(lang, to)`, where `to` is a menu screen or the feature's own
    callback_data (`shop:list:2`);
  - if a screen is reached from several places, carry the origin in its
    callback_data (`item:7:list2`), and point back there;
  - a test in `test/bot.test.mjs` fails when a screen's parent or a
    `menu:` button leads nowhere. Every new feature test checks its back
    button.
- **Languages: English by default, Persian built in.** Every user-facing text
  lives in `lib/i18n.js` (`TEXTS.en`, `TEXTS.fa`) and is read with
  `t(lang, 'key')`. Write no user text anywhere else (admin-only texts may stay
  English). `const lang = await userLang(user)` gives the language: the user's
  choice in the 🌐 Language screen (`users.lang`), else their Telegram app's
  `language_code`, else English. A new text is a key in **every** dictionary;
  a test fails otherwise. A new language is an entry in `LANGS` and `TEXTS`.
  The Mini App has the same dictionaries in `src/lib/i18n.js`, and follows the
  bot's choice through `me.lang`. Endpoint errors are written in the caller's
  language.
- **Multi-step input**: `askFor(user, 'action:args')` stores
  `users.pending_action`. The next private message is read by `takePending()`,
  which clears the action and expires it after 15 minutes. Call `takePending()`
  last, so commands still work while a question is pending.

### Admin tools

The template has **no admin routes and no admin commands**. Each one is added
only when the user asks, following `docs/ADMIN-TOOLS.md`:
- `npm run sql` (an admin-only `endpoints/sql.js` plus `scripts/sql.mjs`);
- admin chat commands through `adminCommand()` in `message.js`, with each
  failure sent to the admin as `⚠️ Command failed: …` (logs are visible only
  through `tgcloud run`, so an unreported failure is silent);
- admin endpoints for the Mini App, `requireAdmin(ctx)` first;
- scheduled jobs and secrets.

The bot sets up Telegram itself, so nothing is set by hand in BotFather.
`syncBotSetup()` (`lib/menu.js`) runs on `/start` and calls Telegram only when
something changed (`settings.bot_setup`). It publishes:
- the `/` suggestions in every language;
- the default menu button: the Mini App when `MINI_APP_URL` is set, the
  commands otherwise.

`syncMenuButton()` then sets this user's button in their language, on `/start`
and on a language switch. A new public command goes in `COMMANDS` there, with
its `cmd_<name>` text in `lib/i18n.js`.

### State and configuration

- Constants go in `lib/config.js`.
- Secrets (API keys) go in the `settings` table, set by an admin command that
  deletes the admin's message (`docs/ADMIN-TOOLS.md` §5).
- Per-user state goes in `users`. Per-feature state goes in its own table.
- Nothing is kept in module-level variables between updates, except caches
  that are safe to lose (e.g. `getMe`).

### Texts

- `parse_mode: 'HTML'`, with every user-provided string passed through `esc()`.
- User-facing copy comes from `lib/i18n.js` in the user's language: English
  by default, Persian built in (see Routing → Languages). Admin-only messages
  may be English.
- Numbers go through `number(lang, n)` from `lib/html.js` (Persian digits for
  `fa`).
- Wrap usernames in `<bdi>`, so they read correctly in right-to-left texts.

### Errors

- **Handlers:**
  - Expect `BotApiError`. A 403 means the user blocked the bot: call
    `setBlocked`.
  - A 400 "message is not modified" is harmless. Ignore it.
  - A 429 has `parameters.retry_after`. Stop the batch and continue on the
    next run.
  - A handler must never throw on tracking code (`trackStart` catches).
- **Endpoints:**
  - Refuse with `EndpointError(message, { code })`. The message is shown to
    the user, and `code` lets the UI branch.
  - Anything else becomes a generic 500.

### Time

- Store unix seconds (`unixepoch()` in SQL, `now()` in JS).
- Display with the fixed UTC offset in `config.js`. The runtime may lack Intl
  timezone data.

### Naming

| Kind | Rule | Examples |
|---|---|---|
| Tables, columns | `snake_case` | `users`, `start_param` |
| Endpoints | camelCase, prefixed by audience | `me`, `myOrders` (the caller's own data), `adminUsers` (admin tools) |
| lib modules | named by feature | `lib/broadcast.js` |
| Telegram chat ids of channels/groups | stored as TEXT | `-100…` ids were mangled by CSV exports |

## 6. Database rules

- **Every call is async.** `await` it.
- **No foreign keys**, so integrity lives in lib code. Delete children before
  parents.
- **One row per (x, y)**: use a `uniqueIndex` in `schema.js` plus
  `INSERT … ON CONFLICT (x, y) DO UPDATE`.
- **Migrations are additive.**
  - A new column on an existing table is **nullable or has a default**, so
    `migrate --safe` (in CI) always applies it. Read it as `coalesce(col, 0)`.
  - Dropping happens only through `.deprecated('reason')`. Deleting the
    declaration drops nothing.
  - Type changes are done by hand with `db.run`.
- **Raw SQL** (`db.all/get/run` with `` sql`…` ``) returns raw values: booleans as
  0/1, JSON as strings, and aggregates possibly as strings. Convert them with
  `Number()` and `=== 1` before returning. Only the table-bound builder
  converts.
- **Batch inserts**: about 50 rows per statement, because SQLite limits bound
  variables.
- **Composable SQL**: `` sql`…` `` fragments nest. Use `whereOf([...])` and
  `searchCondition` from `lib/query.js`. Values always go in `${}`; column
  names come only from code (`sql.raw`).

## 7. Security

- An endpoint trusts only `ctx.initData.user.id`. **Every** Mini App user can call
  **every** endpoint, so authorize inside each one:
  - `requireAdmin(ctx)`, or
  - a membership lookup (the caller's row in a members table).

  Never take a user id, role or price from `input`.
- An endpoint that sends messages or writes data is **throttled per user**
  (`takeFeedbackSlot` in `lib/feedback.js` is the pattern), because anyone who
  opens the Mini App can call it in a loop.
- `callback_data` and deep-link payloads come from the client. Re-check them
  against the DB. Before granting a role from a button, payment or link, check
  the user already holds the right to it.
- No admin route exists until one is added on request. Each one follows
  `docs/ADMIN-TOOLS.md`: `requireAdmin` first, a refused-caller test, and
  `settings` (secrets) never exported or backed up to a chat.
- The CLI token (`TGCLOUD_TOKEN`) lives only in `.tgcloud/` (gitignored) and in
  the repository secret. Never put it in code, docs or chat.

## 8. Testing

`npm test` runs `test/*.test.mjs` with Node's test runner. `test/sdk/` maps
`sdk` and `sdk/db` to local stand-ins:
- an in-memory node:sqlite database built from `schema.js`;
- an `api` that records calls instead of sending them;
- `failNext(method, code, description)` to simulate Bot API errors;
- `mockApi(method, fn)` to fake return values.

`helpers.mjs` builds updates for the tests: `msg`, `press`, `membership` and
`ctxOf`.

Every feature gets tests for:
- the happy path;
- a refused caller;
- a Bot API failure, when it matters.

The mock covers the common SDK surface. When it disagrees with the cloud, the
cloud is right. Check against the real DB and Bot API without deploying, using
`npx tgcloud run handlers/message '{ … }'` or
`npx tgcloud run endpoints/x '{…}' --ctx '{ initData: { user: { id: 1 } } }'`.

## 9. Deploy pipeline

`main` is what runs. `deploy.yml` runs on every push to main that touches
`tgcloud/` or the front-end:
1. `npm ci`
2. `npm run build --if-present` (the Mini App)
3. `tgcloud fetch` and `tgcloud push` (`fetch` first, because a fresh checkout
   has no snapshot). Push's exit code is not the verdict: CLI 0.2.0 can crash
   after the server has already accepted the deploy.
4. `tgcloud migrate --safe`, as its **own `always()` step**. A push can deploy
   the code and then fail while writing the CLI's local snapshot, and the
   schema must not stay behind the code.
5. `tgcloud webhook sync`, `always()`. The update types the bot receives
   come from `handlers/`, and a half-failed push may not have refreshed them.
6. **Verify**, the real verdict. It runs a fresh `tgcloud fetch`, then
   `tgcloud status` (with `FORCE_COLOR=0`). Any line under "Modified", "New",
   "Not yet deployed" or "Deleted" means the cloud doesn't run what is on main,
   and the job fails.

Setup, once:
- In BotFather, open the bot, then **Serverless → CLI Access → Access token**.
  Store the token as the repository secret **`TGCLOUD_TOKEN`**. Without it the
  workflows do nothing.
- After the first deploy:
  - run `npx tgcloud migrate` (or let CI do it);
  - with a Mini App, put its URL in `MINI_APP_URL` (`lib/config.js`) and deploy;
  - send `/start`: the bot sets its command list and its Mini App button itself.

Destructive schema changes, anything `--safe` skips, are applied by hand with
`npx tgcloud migrate`.

## 10. Adding a feature

1. **Schema**: new table(s) in `schema.js`. New columns on old tables must be
   nullable.
2. **Logic**: `lib/<feature>.js`. It holds the queries, the Bot API calls and
   `handleFeatureCallback(query)` when it has buttons.
3. **Entry points**:
   - one line in the public command list (or `adminCommand()`, once added);
   - a prefix in `callback_query.js`;
   - a thin `endpoints/<name>.js` for the Mini App.
4. **Tests**: `test/<feature>.test.mjs`. Then `npm test`.
5. **Ship**: commit and push to main. If commands changed, update the list in
   BotFather.

## 11. Lessons learned (each cost a bug)

- **Admin commands fail silently** unless the error is sent to the admin
  (once you add them).
- **The first `/start` of someone who already has a row** (e.g. they pressed a
  channel button first) must still record its payload. That is why
  `start_param` uses `CASE WHEN start_count = 0`.
- **Two lib modules importing each other** broke at load time. Split the
  shared helpers into a third module.
- **Channel ids exported to CSV** came back in scientific notation. Store them
  as TEXT and validate them on import.
- **The CLI can crash after a successful push.** It writes its local snapshot,
  and the server's response returns a module as `false`. So:
  - migrate and webhook sync run as separate `always()` steps;
  - push's exit code is ignored;
  - a Verify step compares a fresh fetch with the checkout.

  Without that, every such deploy showed red while the bot was up to date.
- **Telegram doesn't show new `/` commands** until `setMyCommands` runs again.
- **Invite links need the bot's "Add subscribers" admin right.**
  `chat_member` updates need the bot to be an admin and `chat_member` in the
  webhook's allowed updates. Deploying `handlers/chat_member.js` adds it.
- **Broadcasts must stop on 429 and resume from a cursor.** They must also
  mark 403 / "chat not found" users as blocked, and carry an opt-out (`/stop`).
