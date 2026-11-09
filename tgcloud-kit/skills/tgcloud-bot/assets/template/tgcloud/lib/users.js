// The `users` table: who has started the bot, whether they can still be
// messaged, and what their next message answers (pending_action).

import { api, db } from 'sdk';
import { sql } from 'sdk/db';
import { now } from './time.js';
import { num } from './query.js';
import { t, pickLang, LANGS } from './i18n.js';

// How long the bot waits for the answer to a question (askFor → takePending).
const PENDING_WINDOW = 15 * 60;

// /start in a private chat: a new row the first time, then fresh names and a
// bumped counter. Starting again undoes /stop and a past block.
// Never throws — tracking must not break /start.
export async function trackStart(message) {
  const u = message.from;
  if (!u || u.is_bot) return;
  const param = /^\/start\s+(\S+)/.exec(message.text ?? '')?.[1]?.slice(0, 64) ?? null;
  try {
    await db.run(sql`
      INSERT INTO users (user_id, username, first_name, last_name, language_code, is_premium, start_param, start_count)
      VALUES (${u.id}, ${u.username ?? null}, ${u.first_name ?? null}, ${u.last_name ?? null},
              ${u.language_code ?? null}, ${u.is_premium ? 1 : 0}, ${param}, 1)
      ON CONFLICT (user_id) DO UPDATE SET
        username = excluded.username,
        first_name = excluded.first_name,
        last_name = excluded.last_name,
        language_code = excluded.language_code,
        is_premium = excluded.is_premium,
        -- a row made before the first /start (e.g. by a button press) keeps that start's payload
        start_param = CASE WHEN coalesce(users.start_count, 0) = 0 THEN excluded.start_param ELSE users.start_param END,
        start_count = coalesce(users.start_count, 0) + 1,
        unsubscribed = 0,
        blocked = 0,
        last_seen_at = unixepoch()`);
  } catch (e) {
    console.error(e);
  }
}

// The user blocked (true) or unblocked (false) the bot — from my_chat_member in
// a private chat, or a 403 while sending.
export async function setBlocked(userId, blocked) {
  await db.run(sql`UPDATE users SET blocked = ${blocked ? 1 : 0} WHERE user_id = ${userId}`);
}

// /stop: no more broadcasts until the next /start.
export async function unsubscribe(message) {
  await db.run(sql`UPDATE users SET unsubscribed = 1 WHERE user_id = ${message.from.id}`);
  await api.sendMessage({ chat_id: message.chat.id, text: t(await userLang(message.from), 'stopped') });
}

// The language to answer `user` (a Telegram User) in: their choice in the
// 🌐 Language screen, else their Telegram app's language, else English (lib/i18n.js).
export async function userLang(user) {
  if (!user?.id) return pickLang(null, user?.language_code);
  const row = await db.get(sql`SELECT lang FROM users WHERE user_id = ${user.id}`);
  return pickLang(row?.lang, user.language_code);
}

// The 🌐 Language screen: remember the user's choice.
export async function setLang(user, lang) {
  if (!LANGS[lang]) return;
  await db.run(sql`
    INSERT INTO users (user_id, username, first_name, lang) VALUES (${user.id}, ${user.username ?? null}, ${user.first_name ?? null}, ${lang})
    ON CONFLICT (user_id) DO UPDATE SET lang = excluded.lang`);
}

// Multi-step input: remember that the user's next message answers `action`
// (e.g. 'feedback' or 'rename:42'), then ask the question.
export async function askFor(user, action) {
  await db.run(sql`
    INSERT INTO users (user_id, username, first_name, pending_action, pending_at)
    VALUES (${user.id}, ${user.username ?? null}, ${user.first_name ?? null}, ${action}, ${now()})
    ON CONFLICT (user_id) DO UPDATE SET pending_action = excluded.pending_action, pending_at = excluded.pending_at`);
}

// Drops the open question, if any: the user went back or elsewhere (lib/menu.js).
export async function cancelPending(userId) {
  await db.run(sql`UPDATE users SET pending_action = NULL, pending_at = NULL WHERE user_id = ${userId} AND pending_action IS NOT NULL`);
}

// The pending action this message answers, cleared once read; null when there
// is none or it expired. Call it last in handlers/message.js, after commands.
export async function takePending(message) {
  const userId = message.from?.id;
  if (!userId || message.chat.type !== 'private') return null;
  const row = await db.get(sql`SELECT pending_action, pending_at FROM users WHERE user_id = ${userId}`);
  if (!row?.pending_action) return null;
  await db.run(sql`UPDATE users SET pending_action = NULL, pending_at = NULL WHERE user_id = ${userId}`);
  return row.pending_at > now() - PENDING_WINDOW ? row.pending_action : null;
}

// The user's own row, for the Mini App's `me` endpoint. Never pass it an id
// from client input: endpoints take it from ctx.initData.user.
export async function profileOf(userId) {
  const row = await db.get(sql`SELECT start_count, first_seen_at, lang FROM users WHERE user_id = ${userId}`);
  return {
    lang: row?.lang ?? null,   // chosen in the bot; the Mini App falls back to Telegram's language
    started: num(row?.start_count) > 0,
    start_count: num(row?.start_count),
    first_seen_at: row?.first_seen_at == null ? null : num(row.first_seen_at),
  };
}
