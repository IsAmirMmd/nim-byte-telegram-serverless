// Navigation. Every screen the bot shows is a node in a tree, and **every
// screen except the root gets «🔙 بازگشت» to its parent automatically**, so a
// user can always go back to where they were. Two kinds of screens:
//
// - Inline screens (SCREENS): a message with inline buttons. `menu:<screen>`
//   buttons edit the same message into that screen; back is `menu:<parent>`.
// - Reply-keyboard screens (KEYBOARDS): the buttons under the input field.
//   They send their label as a text message, so the bot remembers which
//   keyboard each user sees (users.keyboard) to know where back leads.
//
// A question (askFor) is a screen too: entering it asks, and going back from
// it cancels the question. Buttons a feature builds on its own (lists, item
// pages) get their back row from withBack() / backButton().
// test/bot.test.mjs checks that every screen has a way back.

import { api, db } from 'sdk';
import { sql } from 'sdk/db';
import { MINI_APP_URL } from './config.js';
import { askFor, cancelPending } from './users.js';

export const BACK = '🔙 بازگشت';
export const HOME = '🏠 منوی اصلی';

// A back button for any inline keyboard: to a menu screen ('help'), or to a
// feature's own screen by its callback_data ('shop:list:2').
export const backButton = (to = 'home') => ({ text: BACK, callback_data: to.includes(':') ? to : `menu:${to}` });
export const homeButton = () => ({ text: HOME, callback_data: 'menu:home' });

// Rows of buttons plus the back row: use it for every inline keyboard a feature sends.
export const withBack = (rows, to = 'home') => ({ inline_keyboard: [...rows, [backButton(to)]] });

// ---------- inline screens ----------

// name → { parent, text(user), rows(user), enter?(user) }. Only the root has parent: null.
export const SCREENS = {
  home: {
    parent: null,
    text: (user) => `سلام${user?.first_name ? ` ${user.first_name}` : ''} 👋\n\nچه کاری برات انجام بدم؟`,
    rows: () => [
      ...(MINI_APP_URL ? [[{ text: '📱 باز کردن اپ', web_app: { url: MINI_APP_URL } }]] : []),
      [{ text: '📖 راهنما', callback_data: 'menu:help' }, { text: '💬 ارسال نظر', callback_data: 'menu:feedback' }],
    ],
  },
  help: {
    parent: 'home',
    text: () => '📖 راهنما\n\nاینجا توضیح بده ربات چه کاری انجام میده.',
    rows: () => [],
  },
  // A question: handlers/message.js takes the answer (takePending).
  feedback: {
    parent: 'home',
    text: () => '💬 پیامت رو بنویس و بفرست 👇',
    rows: () => [],
    enter: (user) => askFor(user, 'feedback'),
  },
};

// { text, reply_markup } of a screen, with its back row.
export function screen(name, user) {
  const s = SCREENS[name];
  const rows = s.rows(user);
  if (s.parent) rows.push([backButton(s.parent)]);
  return { text: s.text(user), reply_markup: { inline_keyboard: rows } };
}

// Sends a screen as a new message (after a command, or an answer to a question).
export async function showScreen(chatId, name, user) {
  await SCREENS[name].enter?.(user);
  return api.sendMessage({ chat_id: chatId, ...screen(name, user) });
}

export const sendHome = (message) => showScreen(message.chat.id, 'home', message.from);
export const sendHelp = (message) => showScreen(message.chat.id, 'help', message.from);   // /help

// true when `query` was a menu button (back buttons included).
export async function handleMenuCallback(query) {
  const m = /^menu:(\w+)$/.exec(query.data ?? '');
  if (!m || !SCREENS[m[1]]) return false;
  // Stop the button's spinner; fails when the query is too old — the screen still changes.
  await api.answerCallbackQuery({ callback_query_id: query.id }).catch(console.error);
  // Moving to any screen cancels an open question; a question screen asks again.
  await cancelPending(query.from.id);
  await SCREENS[m[1]].enter?.(query.from);
  if (!query.message) return true;
  const view = screen(m[1], query.from);
  try {
    await api.editMessageText({ chat_id: query.message.chat.id, message_id: query.message.message_id, ...view });
  } catch (e) {
    if (/not modified/i.test(e.description ?? '')) return true;   // the same screen pressed twice
    // A photo, a widget or a too-old message can't become a text screen: send it instead.
    if (!/no text in the message|can't be edited|message to edit not found/i.test(e.description ?? '')) throw e;
    await api.sendMessage({ chat_id: query.message.chat.id, ...view });
  }
  return true;
}

// ---------- reply-keyboard screens ----------

// name → { parent, text(user), rows(user) }, each button { text, to: '<keyboard>' }
// or { text, run: async (message) => … }. Empty in the template; for example:
//   main:     { parent: null,   text: () => 'منوی اصلی', rows: () => [[{ text: '📦 محصولات', to: 'products' }]] },
//   products: { parent: 'main', text: () => 'یکی رو انتخاب کن', rows: () => [[{ text: '🍕 پیتزا', run: showPizza }]] },
// Show the root with showKeyboard(message, 'main') (from /start, for example).
export const KEYBOARDS = {};

// The keyboard of a question asked from a reply-keyboard screen: only «🔙 بازگشت».
export const questionKeyboard = () => ({ keyboard: [[{ text: BACK }]], resize_keyboard: true });

// Sends keyboard screen `name` and remembers it as the user's current one.
export async function showKeyboard(message, name) {
  const k = KEYBOARDS[name];
  const rows = k.rows(message.from).map((row) => row.map((b) => ({ text: b.text })));
  if (k.parent) rows.push([{ text: BACK }]);
  await db.run(sql`
    INSERT INTO users (user_id, username, first_name, keyboard) VALUES (${message.from.id}, ${message.from.username ?? null}, ${message.from.first_name ?? null}, ${name})
    ON CONFLICT (user_id) DO UPDATE SET keyboard = excluded.keyboard`);
  return api.sendMessage({
    chat_id: message.chat.id,
    text: k.text(message.from),
    reply_markup: { keyboard: rows, resize_keyboard: true, is_persistent: true },
  });
}

// A private text message that is «🔙 بازگشت» or a label of the user's current
// keyboard. true when handled. Call it before takePending() in handlers/message.js.
export async function handleKeyboardText(message) {
  const text = (message.text ?? '').trim();
  if (message.chat.type !== 'private' || !message.from) return false;
  const isLabel = (t) => Object.values(KEYBOARDS).some((k) => k.rows(message.from).flat().some((b) => b.text === t));
  if (text !== BACK && !isLabel(text)) return false;

  const u = await db.get(sql`SELECT keyboard, pending_action FROM users WHERE user_id = ${message.from.id}`);
  const current = KEYBOARDS[u?.keyboard] ? u.keyboard : null;

  if (text === BACK) {
    // Out of a question: back to the screen it was asked from. Otherwise: to the parent.
    if (u?.pending_action) await cancelPending(message.from.id);
    const target = u?.pending_action ? current : (current && KEYBOARDS[current].parent) || current;
    if (target) return showKeyboard(message, target).then(() => true);
    return sendHome(message).then(() => true);   // no keyboard: the inline menu
  }

  const button = current && KEYBOARDS[current].rows(message.from).flat().find((b) => b.text === text);
  if (!button) return false;
  await cancelPending(message.from.id);
  if (button.to) await showKeyboard(message, button.to);
  else await button.run(message);
  return true;
}
