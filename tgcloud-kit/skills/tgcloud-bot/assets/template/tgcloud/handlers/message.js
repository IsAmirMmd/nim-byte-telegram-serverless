// handlers/message.js — runs on each `message` update (private chats, groups).
// The platform calls the default export with the Message; the full update is
// `ctx.update`. Keep this file a router: the work happens in lib/.
//
// Order matters: /start (with deep-link payloads) → /stop → public commands →
// the answer to a pending question → ignore.
//
// Admin-only commands (/stats, /backup, …) are not part of the template. Ask
// your AI agent for them when you need them: the tgcloud-bot skill's
// references/admin-tools.md shows it how to add them safely.

import { api, BotApiError } from 'sdk';
import { trackStart, unsubscribe, takePending } from '../lib/users.js';
import { sendHome, sendHelp } from '../lib/menu.js';
import { forwardFeedback, FEEDBACK_MAX } from '../lib/feedback.js';

// /start <payload> from a deep link (t.me/<bot>?start=<payload>): route by
// prefix, e.g. `ref_<user id>`. true when handled.
// The first payload a user came with is kept in users.start_param (attribution).
async function startPayload(message, payload) {
  // const ref = /^ref_(\d+)$/.exec(payload);
  // if (ref) { await creditReferrer(Number(ref[1]), message.from); return false; }   // false: still show the menu
  return false;
}

export default async function (message, ctx) {
  const text = (message.text ?? message.caption ?? '').trim();
  const isPrivate = message.chat.type === 'private';

  if (isPrivate && /^\/start(\s|$)/.test(text)) {
    await trackStart(message);
    const payload = /^\/start\s+(\S+)$/.exec(text)?.[1];
    if (payload && (await startPayload(message, payload))) return;
    return sendHome(message);
  }
  if (isPrivate && text === '/stop') return unsubscribe(message);

  // Public commands. List them in BotFather (/setcommands) so Telegram suggests them.
  if (isPrivate && text === '/help') return sendHelp(message);

  // The answer to a question the bot asked (lib/users.js askFor).
  const pending = await takePending(message);
  if (pending === 'feedback') {
    if (!text) return api.sendMessage({ chat_id: message.chat.id, text: 'لطفاً نظرت رو به صورت متن بفرست 🙏' });
    try {
      await forwardFeedback(message.from, text.slice(0, FEEDBACK_MAX));
    } catch (e) {
      if (!(e instanceof BotApiError)) throw e;
      console.error('feedback not delivered (has the admin started the bot?)', e.description);
      return api.sendMessage({ chat_id: message.chat.id, text: 'الان نشد پیامت رو برسونم، کمی بعد دوباره امتحان کن 🙏' });
    }
    return api.sendMessage({ chat_id: message.chat.id, text: 'ممنون، رسید 🙏' });
  }

  // Anything else (unknown commands, free text in groups) gets no reply.
}
