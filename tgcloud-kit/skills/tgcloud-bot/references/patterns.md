# Patterns (from a production tgcloud bot)

Each one fits the layout in [architecture.md](architecture.md). The template
already contains the first few. Copy their shape for new features.

## Where code goes

- `handlers/<update_type>.js` is thin: read the payload, route it to lib, answer.
- `lib/<feature>.js` holds one feature's DB queries, Bot API helpers and
  `handleXCallback(query)`.
- `lib/config.js` holds constants only. There are no env vars, so secrets go in
  the `settings` table (`lib/settings.js`).
- Admin tools (admin commands, `npm run sql`, admin endpoints, scheduled
  jobs) are not in the template. Add them only on request, from
  [admin-tools.md](admin-tools.md).

## Inline buttons and callback_query

```js
// lib/votes.js
export function voteKeyboard(itemId, up = 0, down = 0) {
  return { inline_keyboard: [[
    { text: `❤️ (${up})`, callback_data: `vote:up:${itemId}` },
    { text: `🥀 (${down})`, callback_data: `vote:down:${itemId}` },
  ]] };
}

// Buttons that start with `vote:`. true when handled.
export async function handleVoteCallback(query) {
  const m = /^vote:(up|down):(\d+)$/.exec(query.data ?? '');
  if (!m) return false;
  await saveVote({ user_id: query.from.id, item_id: Number(m[2]), liked: m[1] === 'up' });
  const lang = await userLang(query.from);
  await api.answerCallbackQuery({ callback_query_id: query.id, text: t(lang, 'vote_saved') });   // always answer; a toast
  if (query.message) await refreshButtons(query.message.chat.id, query.message.message_id, Number(m[2]));
  return true;
}

// Redraw the buttons. Ignore "message is not modified" (the same counts pressed twice).
export async function refreshButtons(chatId, messageId, itemId) {
  const { up, down } = await countVotes(itemId);
  try {
    await api.editMessageReplyMarkup({ chat_id: chatId, message_id: messageId, reply_markup: voteKeyboard(itemId, up, down) });
  } catch (e) {
    if (!(e.code === 400 && /not modified/i.test(e.description ?? ''))) throw e;
  }
}
```

`handlers/callback_query.js` gains one line: `if (await handleVoteCallback(query)) return;`.
callback_data is at most **64 bytes**. Keep it `<feature>:<action>:<id>`.

Buttons can carry `style: 'primary' | 'success' | 'danger'` (blue, green, red),
`url`, `web_app: { url }` (opens the Mini App), or `copy_text: { text }`. A
button with `disabled: {}` (Bot API 10.3) is greyed out and does nothing, which
suits "already voted" or "sold out". Other button fields are in
[bot-api.md](bot-api.md#buttons-and-keyboards).

## A private answer to a button press (ephemeral)

In a group, answer only the user who pressed (Bot API 10.4). The rest of the
group sees nothing:

```js
const lang = await userLang(query.from);
await api.answerCallbackQuery({ callback_query_id: query.id });   // still required
await api.sendMessage({
  text: t(lang, 'only_you'),                                         // "Only you can see this 👀"
  ephemeral_message_parameters: { callback_query_id: query.id },   // no chat_id needed
});
```

Add `replace_callback_query_message: true` to show it *in place of* the
message, for that user only. More (receiver_user_id, edits, ephemeral
commands): [bot-api.md](bot-api.md#ephemeral-messages).

## Texts in two languages

Bots speak **English by default and Persian too**. Every user-facing text is a
key in `lib/i18n.js`, in every language:

```js
// lib/i18n.js
en: { vote_saved: 'Saved ✅', shop: '🛍 Shop', products: '📦 Products', items: (n) => `${n} items` },
fa: { vote_saved: 'ثبت شد ✅', shop: '🛍 فروشگاه', products: '📦 محصولات', items: (n) => `${number('fa', n)} مورد` },

// anywhere in lib/ or handlers/
const lang = await userLang(message.from);       // the 🌐 choice, else the Telegram app's language, else 'en'
await api.sendMessage({ chat_id, text: t(lang, 'items', 3), reply_markup: withBack(lang, rows, 'shop') });
```

- Never write user text outside `lib/i18n.js`. A test fails when a key is
  missing in one language.
- In Persian texts that hold user input or Latin words, wrap names in `<bdi>`
  (with `parse_mode: 'HTML'`, after `esc()`).
- Rich messages in Persian: `rich_message: { …, is_rtl: lang === 'fa' }`.
- A feature's tests check both languages: a user with
  `language_code: 'fa'`, or `users.lang = 'fa'`.

## Menus as screens, always with a way back

**Rule: every screen a button or command opens has a way back to the screen
before it**, for inline and reply-keyboard buttons alike. Only the root has
none. `lib/menu.js` in the template enforces it:

```js
// lib/menu.js → SCREENS: name → { parent, text(user), rows(user), enter?(user) }
shop: {
  parent: 'home',                                    // «🔙 Back» → menu:home is added automatically
  text: (lang) => t(lang, 'shop'),
  rows: (lang) => [[{ text: t(lang, 'products'), callback_data: 'shop:list:1' }]],
},
rename: {                                            // a question is a screen too
  parent: 'shop',
  text: (lang) => t(lang, 'rename_ask'),
  rows: () => [],
  enter: (user) => askFor(user, 'rename'),           // back from it cancels the question
},
```

- `menu:<screen>` buttons edit the same message into that screen. A "not
  modified" error is ignored. A message that can't become text (a photo, a
  widget) gets the screen as a new message instead.
- Pressing any `menu:` button cancels an open question.
- Keyboards a feature builds itself (lists, item pages) end with a back row:
  `reply_markup: withBack(lang, rows, 'shop')`, or `withBack(lang, rows, 'shop:list:2')`
  to go back to a feature's own screen. Its `handleXCallback` must handle that
  callback_data.
- After a final result ("sent ✅", "saved"), add `homeButton(lang)` (`🏠 Main menu`).
- When a screen can be reached from several places, put the origin in the
  callback_data (`item:7:list2`) and build back from it.
- Show a screen as a new message (after a command) with
  `showScreen(chatId, name, user)`.

## Reply keyboards (buttons under the input field)

They send their label as plain text, so `lib/menu.js` remembers which
keyboard each user sees (`users.keyboard`), and `handleKeyboardText()` in
`handlers/message.js` routes the labels and `🔙 Back` (in any language):

```js
// lib/menu.js → KEYBOARDS
main:     { parent: null,   text: (lang) => t(lang, 'main'),   rows: (lang) => [[{ text: t(lang, 'products'), to: 'products' }]] },
products: { parent: 'main', text: (lang) => t(lang, 'choose'), rows: (lang) => [[{ text: t(lang, 'pizza'), run: showPizza }]] },
```

- Show the root with `showKeyboard(message, 'main')`. Every non-root keyboard
  gets a `🔙 Back` row automatically, which goes to its parent.
- A question asked from a keyboard (`run` calls `askFor`) should be sent
  with `reply_markup: questionKeyboard(lang)` (only `🔙 Back`). Back cancels
  the question and shows that keyboard again.
- Labels must be unique within a keyboard. Keep them short.

## One row per (item, user): upsert

Use a unique index in schema.js, plus `ON CONFLICT`:

```js
await db.run(sql`
  INSERT INTO votes (user_id, item_id, liked) VALUES (${userId}, ${itemId}, ${liked ? 1 : 0})
  ON CONFLICT (item_id, user_id) DO UPDATE SET liked = excluded.liked`);
```

For bulk imports, insert about 50 rows per statement.

Counting with SQL:
`db.get(sql\`SELECT coalesce(sum(liked = 1), 0) AS up, coalesce(sum(liked = 0), 0) AS down FROM votes WHERE item_id = ${id}\`)`.
Wrap the results in `Number(...)`.

## Public commands

`handlers/message.js` has a public section (`/help` in the template). Add a
line there per command, and add it to `COMMANDS` in `lib/menu.js` with its
`cmd_<name>` text in `lib/i18n.js`: after the deploy, the next `/start`
updates the command list in every language (`syncBotSetup`).

Commands with arguments: `const m = /^\/find\s+(.+)$/.exec(text); if (m) return find(message, m[1]);`.
To accept a file sent as a reply, use `message.document ?? message.reply_to_message?.document`.

Admin-only commands (`/stats`, `/backup`, …) need the `adminCommand()` router
with error reports. Add it on request, from [admin-tools.md](admin-tools.md) §2.

## Deep links

`https://t.me/<bot username>?start=<payload>` takes a payload of at most 64
characters, `[A-Za-z0-9_-]`. Route the payload by prefix in `startPayload()` in
`handlers/message.js`. `trackStart` keeps the first payload in
`users.start_param`. Get the bot's username once with `api.getMe()` and cache it
in a module variable.

For a Mini App link with a parameter, use
`https://t.me/<bot>/<app short name>?startapp=<payload>`. Read the parameter as
`ctx.initData.start_param` in an endpoint.

## Multi-step input (ask, then take the answer)

```js
// a button or command asks:
await askFor(query.from, `rename:${itemId}`);
await api.sendMessage({ chat_id: query.from.id, text: t(lang, 'rename_ask'), reply_markup: withBack(lang, [], 'shop') });

// handlers/message.js, after the commands:
const pending = await takePending(message);
const rename = /^rename:(\d+)$/.exec(pending ?? '');
if (rename) return renameItem(Number(rename[1]), text, message);
```

`takePending` clears the action, so one question takes one answer. It ignores
answers older than 15 minutes. Every question has a way back: make it a
screen with `enter` (above) so its back button cancels it, or send it with
`withBack(lang, [], '<screen it came from>')`.

## Sending files

`import { api, InputFile } from 'sdk'`, then
`api.sendDocument({ chat_id, document: new InputFile(bytes, 'name.csv', { type: 'text/csv' }), caption })`.
`lib/files.js` builds CSV (`toCsv`), XLSX (`toXlsx`) and UTF-8 bytes
(`utf8Encode`) without npm packages, and parses CSV (`parseCsv`). Add a BOM
(`'﻿'`) so Excel reads UTF-8 CSV correctly. Use `sendMediaGroup` for 2–10
documents in one album.

Downloading what a user sent: `api.getFileContent({ file_id })` returns the
bytes, up to 20 MB.

## Channel posts

The bot must be an admin of the channel. `handlers/channel_post.js` receives each
post. To "edit" media (a new caption or buttons on audio, for example), re-send
it with the changes and then `deleteMessage` the original.

The link to a post:
- public channel: `https://t.me/<username>/<message_id>`;
- private channel: `https://t.me/c/<chat id without -100>/<message_id>`.

## Secrets (API keys)

There are no env vars at runtime, so keys live in the `settings` table
(`getSetting` / `setSetting`), set by an admin command that deletes the
admin's message. Call outside APIs with `fetch` from `sdk`. Never export or
back up `settings`. The `/setkey` command is in [admin-tools.md](admin-tools.md) §5.

## Scheduled jobs

The platform has no scheduler. A periodic job is an admin command plus a
GitHub Actions cron that runs it with `tgcloud run`. Add it on request, from
[admin-tools.md](admin-tools.md) §4. A job that goes through many rows
(reminders, digests) works in batches and keeps a cursor (the last id handled)
in a table, stops on a 429, and continues on the next run.

## Webhook

The deployed `handlers/*` decide which update types the bot receives. For
example, `chat_member` arrives only once `handlers/chat_member.js` exists. The
full list of update types, including the ones added in Bot API 10.x
(`guest_message`, `widget_query`, `shared_widget_query`, `subscription`,
`stopped_message_generation`), is in [bot-api.md](bot-api.md#update-types--handler-files). If
updates stop arriving, run `npx tgcloud webhook`, and `npx tgcloud webhook sync`
when it doesn't match. CI syncs on every deploy.
