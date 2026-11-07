# Admin tools: build them on request

The kit's template ships **no admin routes and no admin commands**. A fresh bot
exposes only `POST /api/me` (plus `POST /api/feedback` with the Mini App). Admin
tools are powerful: raw database access, user lists, exports. So each bot gets
only the ones its owner asks for, written for that bot and tested.

When the user asks for one of the tools below, build it from this page with its
tests. Then tell them how to use it: the command, `npm run deploy` (or a push to
`main`), and the command list in BotFather.

| The user asks for | Section |
|---|---|
| "query the database from the terminal", `npm run sql` | [1](#1-npm-run-sql-the-database-from-the-terminal) |
| `/stats`, `/backup`, any admin-only chat command | [2](#2-admin-chat-commands) |
| an admin panel / dashboard in the Mini App | [3](#3-admin-endpoints-for-the-mini-app) |
| something that runs every day / hour / week | [4](#4-scheduled-jobs) |
| storing an API key | [5](#5-secrets-api-keys) |

## Rules for every admin tool

1. **Identity comes only from Telegram.**
   - Bot updates: `message.from.id === ADMIN_ID` (or `query.from.id` for a
     button), in a **private** chat.
   - Endpoints: `requireAdmin(ctx)` from `lib/access.js` is the **first line**.
     `ctx.initData.user` is verified by the platform. Every Mini App user can
     call every endpoint, so an admin endpoint without this line is public.
   - Never take a user id, role or "is admin" flag from `input`,
     `callback_data` or a deep-link payload.
2. **Report failures to the admin.** Logs are visible only through
   `tgcloud run`, so an admin command that throws must send
   `⚠️ Command failed: …` to the admin. Otherwise it fails silently.
3. **Tests come with the tool**:
   - a non-admin is refused: no reply in the chat, or `FORBIDDEN` from the
     endpoint;
   - the happy path;
   - a Bot API failure, when it matters (`failNext`).
4. **Secrets never leave the database.** The `settings` table is never printed,
   exported or backed up to a chat.
5. **The CLI token** (`TGCLOUD_TOKEN`) lives only in `.tgcloud/` (gitignored)
   and in the repository secret. Never put it in code, docs or chat.
6. **Read-only first.** A tool that changes or deletes data asks for a
   confirmation (an inline button the admin presses) or says so loudly.
7. **Keep `ADMIN_ID` in one place** (`lib/config.js`). A workflow that needs it
   repeats the same number. Say so in a comment next to both.

## 1. `npm run sql`: the database from the terminal

What the user gets:

```
npm run sql -- "SELECT * FROM users ORDER BY first_seen_at DESC LIMIT 5"
npm run sql -- "SELECT name FROM sqlite_master WHERE type = 'table'"
```

How it works: `scripts/sql.mjs` runs `tgcloud run endpoints/sql` with the
admin's id as the ctx. `tgcloud run` executes the **local** module in the cloud,
against the real database, and needs only `npx tgcloud login`. Once deployed,
the same module is also reachable as `POST /api/sql` from the Mini App. That is
why it refuses everyone but the admin.

`tgcloud/endpoints/sql.js`:

```js
import { db, EndpointError } from 'sdk';
import { requireAdmin } from '../lib/access.js';

// Raw SQL for `npm run sql -- "<query>"` (scripts/sql.mjs). Admin only: once
// deployed it is reachable as POST /api/sql, so anyone else is refused.
export default async function ({ q } = {}, ctx) {
  requireAdmin(ctx);
  if (typeof q !== 'string' || !q.trim()) {
    throw new EndpointError('Pass the query as { q: "..." }', { code: 'NO_QUERY' });
  }
  // Statements that return rows go through all(); the rest (UPDATE, DELETE, …) through run().
  return /^\s*(select|with|pragma|explain)\b/i.test(q) || /\breturning\b/i.test(q)
    ? await db.all(q)
    : await db.run(q);
}
```

`scripts/sql.mjs` (runs on the developer's machine, not in the cloud):

```js
// Usage: npm run sql -- "SELECT * FROM users LIMIT 5"
// Runs the query in the cloud through tgcloud/endpoints/sql.js (no deploy needed).
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const q = process.argv.slice(2).join(' ').trim();
if (!q) {
  console.error('Usage: npm run sql -- "SELECT * FROM users LIMIT 5"');
  process.exit(1);
}
const config = readFileSync(new URL('../tgcloud/lib/config.js', import.meta.url), 'utf8');
const adminId = Number(config.match(/ADMIN_ID\s*=\s*(\d+)/)[1]);
const cli = new URL('../node_modules/@tgcloud/cli/bin/tgcloud.js', import.meta.url);
const { status } = spawnSync(process.execPath, [
  cli.pathname.replace(/^\/(\w:)/, '$1'),   // Windows: /C:/… → C:/…
  '--no-pager', 'run', 'endpoints/sql',
  JSON.stringify({ q }),
  '--ctx', JSON.stringify({ initData: { user: { id: adminId } } }),
], { stdio: 'inherit' });
process.exit(status ?? 1);
```

`package.json`: `"sql": "node scripts/sql.mjs"`.

Test (`test/sql.test.mjs`):
- `sql({ q: 'SELECT 1' }, ctxOf(USER))` rejects with `FORBIDDEN`;
- after a `/start`, `sql({ q: 'SELECT count(*) AS n FROM users' }, ctxOf(ADMIN_ID))`
  returns `[{ n: 1 }]`.

Tell the user:
- Put double quotes around the query and single quotes around values.
- Writes run for real, with no undo. Run a SELECT with the same WHERE first.
- It works before deploying. After `npm run deploy` the endpoint is live too,
  and it accepts only the admin.

## 2. Admin chat commands

Bodies go in `lib/admin.js` (or the feature's own module). `handlers/message.js`
routes to them **after `/stop` and before the pending answer**:

```js
import { ADMIN_ID } from '../lib/config.js';
import { sendStats, sendBackup, setCommands } from '../lib/admin.js';

// The admin command in `text`, started; or null when it is not one.
// Scheduled jobs call these too (.github/workflows/scheduled.yml).
function adminCommand(message, text) {
  if (text === '/stats') return sendStats();
  if (text === '/backup') return sendBackup();
  if (text === '/setcommands') return setCommands();
  // with arguments: const m = /^\/give\s+(\d+)\s+(\d+)$/.exec(text); if (m) return give(Number(m[1]), Number(m[2]));
  return null;
}

// in the default export:
if (isPrivate && message.from?.id === ADMIN_ID) {
  const command = adminCommand(message, text);
  if (command) {
    try {
      await command;
    } catch (e) {
      console.error(e);
      await api.sendMessage({ chat_id: ADMIN_ID, text: `⚠️ Command failed:\n${e.message}` });
    }
    return;
  }
}
```

`lib/admin.js` examples:

```js
import { api, db, InputFile } from 'sdk';
import { sql } from 'sdk/db';
import { ADMIN_ID } from './config.js';
import { toCsv, utf8Encode } from './files.js';
import { fa } from './html.js';
import { stamp } from './time.js';

const tell = (text, extra = {}) => api.sendMessage({ chat_id: ADMIN_ID, text, ...extra });

// Counts over the users table: /stats and the admin panel (section 3) share it.
export async function userStats() {
  const s = await db.get(sql`
    SELECT count(*) AS users,
           coalesce(sum(start_count > 0), 0) AS started,
           coalesce(sum(blocked = 1), 0) AS blocked,
           coalesce(sum(first_seen_at > unixepoch() - 7 * 86400), 0) AS new_7d
    FROM users`);
  return Object.fromEntries(Object.entries(s ?? {}).map(([k, v]) => [k, Number(v ?? 0)]));   // raw SQL: may be strings
}

export async function sendStats() {
  const s = await userStats();
  await tell(`👥 Users: ${fa(s.users)}\n▶️ Started: ${fa(s.started)}\n⛔️ Blocked: ${fa(s.blocked)}\n🆕 Last 7 days: ${fa(s.new_7d)}`);
}

// /backup: tables as CSV files. Never `settings` (secrets).
const BACKUP_TABLES = ['users'];
export async function sendBackup() {
  for (const table of BACKUP_TABLES) {
    const rows = await db.all(sql`SELECT * FROM ${sql.raw(table)}`);
    if (!rows.length) continue;
    const file = new InputFile(utf8Encode('\uFEFF' + toCsv(rows)), `${table}_${stamp(new Date(), true)}.csv`, { type: 'text/csv' });   // BOM: Excel reads UTF-8
    await api.sendDocument({ chat_id: ADMIN_ID, document: file, caption: `🗄 ${table} — ${stamp()}` });
  }
}

// /setcommands: the "/" list. Everyone sees the public commands; the admin's
// own chat also lists the admin ones.
export async function setCommands() {
  const everyone = [{ command: 'start', description: 'شروع' }, { command: 'help', description: 'راهنما' }];
  await api.setMyCommands({ commands: everyone });
  await api.setMyCommands({
    scope: { type: 'chat', chat_id: ADMIN_ID },
    commands: [...everyone, { command: 'stats', description: 'آمار' }, { command: 'backup', description: 'بکاپ CSV' }],
  });
  await tell('Commands updated ✅');
}
```

Tests:
- a non-admin sending `/stats` gets no reply (`take()` is empty);
- the admin gets the numbers;
- `failNext('sendMessage', 400, '…')` and then `/stats` → the second call is
  `⚠️ Command failed` to the admin.

After deploying, the admin sends `/setcommands` once, and again whenever the
list changes. Telegram doesn't pick up new commands by itself.

## 3. Admin endpoints for the Mini App

One endpoint per screen. Each is thin, with `requireAdmin` first:

```js
// tgcloud/endpoints/adminStats.js
import { requireAdmin } from '../lib/access.js';
import { userStats } from '../lib/admin.js';
export default async function (input, ctx) {
  requireAdmin(ctx);
  return userStats();
}
```

```js
// tgcloud/endpoints/adminUsers.js — { page, size, q, sort, dir } → { rows, page, size, total, pages }
import { requireAdmin } from '../lib/access.js';
import { listUsers } from '../lib/users.js';
export default async function (input, ctx) {
  requireAdmin(ctx);
  return listUsers(input);
}
```

`listUsers` in `lib/users.js` uses the helpers in `lib/query.js`:

```js
import { pageParams, pageResult, whereOf, searchCondition, orderBy, num } from './query.js';

export async function listUsers(input = {}) {
  const p = pageParams(input);   // size clamped to 5…100, page ≥ 1
  const where = whereOf([searchCondition(input.q, { names: ['username', 'first_name', 'last_name'], ids: ['user_id'] })]);
  const total = num((await db.get(sql`SELECT count(*) AS n FROM users ${where}`))?.n);
  const rows = await db.all(sql`
    SELECT user_id, username, first_name, last_name, start_count, blocked, unsubscribed, first_seen_at, last_seen_at
    FROM users ${where}
    ${orderBy(input, { first: 'first_seen_at', last: 'last_seen_at', starts: 'start_count' }, 'first', 'user_id DESC')}
    LIMIT ${p.size} OFFSET ${p.offset}`);
  return pageResult(rows.map((r) => ({ ...r, blocked: r.blocked === 1, unsubscribed: r.unsubscribed === 1 })), total, p);
}
```

- `endpoints/me.js` can add `isAdmin: isAdmin(ctx)` so the UI knows which
  screen to show. The UI only hides things. Every admin endpoint still checks.
- Front-end: `useEndpoint('adminUsers', { page, size, q })`, a debounced
  search box, a table that turns into cards on phones, and pagination. See the
  tgcloud-mini-app skill.
- Tests: each admin endpoint refuses `ctxOf(ADMIN_ID + 1)` with `FORBIDDEN`.
  `adminUsers` clamps `{ page: -3, size: 10000 }` to page 1, size 100, and finds
  a user by id.

## 4. Scheduled jobs

Telegram Serverless has no scheduler. A periodic job is **an admin command
(section 2) plus a GitHub Actions workflow** that runs it in the cloud. So the
job also works by hand: send the command, or press "Run workflow" in GitHub.

`.github/workflows/scheduled.yml`:

```yaml
# Runs an admin command in the cloud on a schedule. `tgcloud run` executes the
# checked-out modules against the bot's real database and Bot API, as if the
# admin had sent the command. Needs the repository secret TGCLOUD_TOKEN.
# The id is ADMIN_ID from tgcloud/lib/config.js; change both together.
# Cron is UTC (Tehran = UTC+3:30).
name: Scheduled jobs

on:
  schedule:
    - cron: '0 6 * * *'   # every day at 06:00 UTC
  workflow_dispatch: {}

jobs:
  backup:
    runs-on: ubuntu-latest
    env:
      TGCLOUD_TOKEN: ${{ secrets.TGCLOUD_TOKEN }}
    steps:
      - uses: actions/checkout@v4
        if: env.TGCLOUD_TOKEN != ''
      - uses: actions/setup-node@v4
        if: env.TGCLOUD_TOKEN != ''
        with:
          node-version: 22
          cache: npm
      - run: npm ci
        if: env.TGCLOUD_TOKEN != ''
      - if: env.TGCLOUD_TOKEN != ''
        run: |
          mkdir -p .tgcloud
          npx tgcloud run handlers/message '{ text: "/backup", from: { id: <ADMIN_ID> }, chat: { id: <ADMIN_ID>, type: "private" } }'
```

- Add one job per command, and keep `workflow_dispatch`.
- A job that goes through many rows (reminders, digests, messages to all users)
  works in batches. It keeps a cursor (the last id handled) in a table, stops
  on a 429 and continues on the next run.
- Without the `TGCLOUD_TOKEN` secret the workflow does nothing.

## 5. Secrets (API keys)

There are no env vars at runtime, so a key lives in the `settings` table:

```js
// adminCommand(): /setkey <name> <value>
const key = /^\/setkey\s+(\w+)\s+(\S+)$/.exec(text);
if (key) return saveKey(message, key[1], key[2]);

// lib/admin.js
export async function saveKey(message, name, value) {
  await setSetting(`key:${name}`, value);
  await api.deleteMessage({ chat_id: message.chat.id, message_id: message.message_id }).catch(console.error);   // don't leave it in the chat
  await tell(`🔑 ${name} saved`);
}
```

Read it with `getSetting('key:openai')` and call the outside API with `fetch`
from `sdk`. Never add `settings` to a backup or an export.
