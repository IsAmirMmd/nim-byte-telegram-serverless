// Feedback from users to the admin (ADMIN_ID in config.js). The bot's
// «💬 Send feedback» button (handlers/message.js) and, in a project with the
// Mini App, its form (endpoints/feedback.js) both end here.

import { api, db } from 'sdk';
import { sql } from 'sdk/db';
import { ADMIN_ID } from './config.js';
import { esc, userLabel } from './html.js';
import { now } from './time.js';

export const FEEDBACK_MAX = 2000;
export const FEEDBACK_EVERY = 60;   // seconds between two feedbacks from one user

// Sends `text` from `user` (a Telegram User) to the admin. Throws BotApiError
// when it can't be delivered — e.g. 403 until the admin has started the bot.
export async function forwardFeedback(user, text) {
  await api.sendMessage({
    chat_id: ADMIN_ID,
    parse_mode: 'HTML',
    text: `💬 Feedback from ${esc(userLabel(user))} (<code>${user.id}</code>):\n\n${esc(text)}`,
  });
}

// An endpoint can be called by anyone who opens the Mini App, as often as they
// like: let a user send one feedback per FEEDBACK_EVERY seconds, and only once
// they have started the bot. → 'ok' (the slot is taken) | 'wait' | 'not_started'
export async function takeFeedbackSlot(userId) {
  const t = now();
  const r = await db.run(sql`
    UPDATE users SET feedback_at = ${t}
    WHERE user_id = ${userId} AND start_count > 0 AND coalesce(feedback_at, 0) <= ${t - FEEDBACK_EVERY}`);
  if (r.rowsAffected > 0) return 'ok';
  const known = await db.get(sql`SELECT 1 AS x FROM users WHERE user_id = ${userId} AND start_count > 0`);
  return known ? 'wait' : 'not_started';
}
