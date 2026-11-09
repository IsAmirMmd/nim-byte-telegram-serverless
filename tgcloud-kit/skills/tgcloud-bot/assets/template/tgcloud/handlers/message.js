// handlers/message.js — runs on each `message` update (private chats, groups).
// The platform calls the default export with the Message; the full update is
// `ctx.update`. Keep this file a router: the work happens in lib/.
//
// Order matters: /start (with deep-link payloads) → /stop → public commands →
// reply-keyboard buttons and «🔙 Back» → the answer to a pending question → ignore.
// Every reply ends with a way back (a back or 🏠 button): see lib/menu.js.
// Every text comes from lib/i18n.js, in the user's language (English by default).
//
// Admin-only commands (/stats, /backup, …) are not part of the template. Ask
// your AI agent for them when you need them: the tgcloud-bot skill's
// references/admin-tools.md shows it how to add them safely.

import { api, BotApiError } from 'sdk';
import { trackStart, unsubscribe, takePending, askFor, userLang } from '../lib/users.js';
import { t } from '../lib/i18n.js';
import { sendHome, sendHelp, handleKeyboardText, withBack, homeButton, syncCommands } from '../lib/menu.js';
import { ADMIN_ID } from '../lib/config.js';
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
    // The admin's /start also (re)sets the command list in every language.
    if (message.from?.id === ADMIN_ID) await syncCommands().catch(console.error);
    const payload = /^\/start\s+(\S+)$/.exec(text)?.[1];
    if (payload && (await startPayload(message, payload))) return;
    return sendHome(message);
  }
  if (isPrivate && text === '/stop') return unsubscribe(message);

  // Public commands. List them in BotFather (/setcommands) so Telegram suggests them.
  if (isPrivate && text === '/help') return sendHelp(message);

  // Reply-keyboard buttons and «🔙 Back» (which also cancels an open question).
  if (isPrivate && (await handleKeyboardText(message))) return;

  // The answer to a question the bot asked (lib/users.js askFor).
  const pending = await takePending(message);
  if (pending === 'feedback') {
    const lang = await userLang(message.from);
    const home = { inline_keyboard: [[homeButton(lang)]] };
    if (!text) {
      await askFor(message.from, 'feedback');   // still waiting for the text; back cancels it
      return api.sendMessage({ chat_id: message.chat.id, text: t(lang, 'feedback_text_only'), reply_markup: withBack(lang, [], 'home') });
    }
    try {
      await forwardFeedback(message.from, text.slice(0, FEEDBACK_MAX));
    } catch (e) {
      if (!(e instanceof BotApiError)) throw e;
      console.error('feedback not delivered (has the admin started the bot?)', e.description);
      return api.sendMessage({ chat_id: message.chat.id, text: t(lang, 'feedback_failed'), reply_markup: home });
    }
    return api.sendMessage({ chat_id: message.chat.id, text: t(lang, 'feedback_thanks'), reply_markup: home });
  }

  // Anything else (unknown commands, free text in groups) gets no reply.
}
