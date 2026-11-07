# Mini App recipes

## Register the user on first open

```js
// tgcloud/endpoints/me.js
import { db } from 'sdk';
import { sql } from 'sdk/db';

export default async function (input, ctx) {
  const u = ctx.initData.user;
  await db.run(sql`
    INSERT INTO users (user_id, first_name, username) VALUES (${u.id}, ${u.first_name}, ${u.username ?? null})
    ON CONFLICT (user_id) DO UPDATE SET first_name = excluded.first_name, username = excluded.username`);
  return db.get(sql`SELECT user_id, first_name, username FROM users WHERE user_id = ${u.id}`);
}
```

The kit's `users` table already has these columns (`user_id` is the primary key). The scaffold's `me` only reads the row, because the bot's `/start` creates it.

## Send a chat message from the app

The bot can message the user only after they've started it. Catch `BotApiError` 403 and handle it. Throttle it per user (see `takeFeedbackSlot` in the scaffold's `lib/feedback.js`): anyone who opens the app can call the endpoint in a loop.

```js
import { api, BotApiError, EndpointError } from 'sdk';

export default async function ({ text }, ctx) {
  if (typeof text !== 'string' || !text.trim() || text.length > 1000) {
    throw new EndpointError('Invalid text', { code: 'BAD_INPUT' });
  }
  try {
    await api.sendMessage({ chat_id: ctx.initData.user.id, text });
  } catch (e) {
    if (e instanceof BotApiError && e.code === 403) throw new EndpointError('Start the bot first', { code: 'BOT_BLOCKED' });
    throw e;
  }
  return { ok: true };
}
```

## Pagination

```js
export default async function ({ page = 0 } = {}, ctx) {
  const size = 20, p = Math.max(0, Math.floor(Number(page) || 0));
  const rows = await db.all(sql`SELECT * FROM items ORDER BY id DESC LIMIT ${size} OFFSET ${p * size}`);
  return { rows, next: rows.length === size ? p + 1 : null };
}
```

## Error handling in the UI

```js
import { callEndpoint } from './lib/serverless.js';

try {
  setProfile(await callEndpoint('getProfile'));
} catch (e) {
  if (e.code === 'NO_PROFILE') showOnboarding();
  else Telegram.WebApp.showAlert(e.type === 'ENDPOINT_ERROR' ? e.message : 'Something went wrong');
}
```

## Telegram UI helpers (front-end)

- `Telegram.WebApp.MainButton.setText('Save').show().onClick(save)`, plus `.showProgress()` / `.hideProgress()` around the call.
- `Telegram.WebApp.BackButton.show().onClick(() => history.back())` for SPA routes.
- `Telegram.WebApp.HapticFeedback.notificationOccurred('success')`.
- `Telegram.WebApp.initDataUnsafe.start_param` holds the `startapp` deep-link value. Trust it only via `ctx.initData.start_param` in an endpoint.

## Opening the app from the bot

```js
await api.sendMessage({
  chat_id, text: 'Open the app 👇',
  reply_markup: { inline_keyboard: [[{ text: 'Open', web_app: { url: 'https://app<app_id>.tgcloud.ai/' } }]] },
});
```

The URL goes in `lib/config.js` → `MINI_APP_URL` (the scaffold's menu shows an "open the app" button once it is set).

## Auto-deploy with a front-end (GitHub Actions)

The kit's `.github/workflows/deploy.yml` (from the tgcloud-bot scaffold) already
handles it:
1. It runs `npm run build --if-present`.
2. It runs `fetch` and `push`.
3. It runs `migrate --safe` and `webhook sync`, each as its own `always()` step.

Its `paths:` filter covers `src/**`, `public/**`, `index.html` and `vite.config.*`.
Add any other front-end folder you create to that list.
