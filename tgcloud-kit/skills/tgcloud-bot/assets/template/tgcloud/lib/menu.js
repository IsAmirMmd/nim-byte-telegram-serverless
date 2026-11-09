// Navigation. Every screen the bot shows is a node in a tree, and **every
// screen except the root gets «🔙 Back» to its parent automatically**, so a
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
// Every text comes from lib/i18n.js in the user's language (English by default).
// test/bot.test.mjs checks that every screen has a way back.

import { api, db } from 'sdk';
import { sql } from 'sdk/db';
import { MINI_APP_URL } from './config.js';
import { askFor, cancelPending, userLang, setLang } from './users.js';
import { t, inAnyLang, LANGS, DEFAULT_LANG } from './i18n.js';

// A back button for any inline keyboard: to a menu screen ('help'), or to a
// feature's own screen by its callback_data ('shop:list:2').
export const backButton = (lang, to = 'home') => ({ text: t(lang, 'back'), callback_data: to.includes(':') ? to : `menu:${to}` });
export const homeButton = (lang) => ({ text: t(lang, 'home'), callback_data: 'menu:home' });

// Rows of buttons plus the back row: use it for every inline keyboard a feature sends.
export const withBack = (lang, rows, to = 'home') => ({ inline_keyboard: [...rows, [backButton(lang, to)]] });

// The command list Telegram suggests, in every language: English for everyone,
// plus one list per other language (shown to users whose app is in it).
// Runs when the admin sends /start (handlers/message.js), so there is nothing to
// set in BotFather. A new public command: add it here and its text in lib/i18n.js.
export const COMMANDS = ['start', 'help'];

export async function syncCommands() {
  for (const lang of Object.keys(LANGS)) {
    await api.setMyCommands({
      commands: COMMANDS.map((command) => ({ command, description: t(lang, `cmd_${command}`) })),
      ...(lang === DEFAULT_LANG ? {} : { language_code: lang }),
    });
  }
}

// ---------- inline screens ----------

// name → { parent, text(lang, user), rows(lang, user), enter?(user) }. Only the root has parent: null.
export const SCREENS = {
  home: {
    parent: null,
    text: (lang, user) => t(lang, 'hello', user?.first_name),
    rows: (lang) => [
      ...(MINI_APP_URL ? [[{ text: t(lang, 'open_app'), web_app: { url: MINI_APP_URL } }]] : []),
      [{ text: t(lang, 'help_button'), callback_data: 'menu:help' }, { text: t(lang, 'feedback_button'), callback_data: 'menu:feedback' }],
      [{ text: t(lang, 'language_button'), callback_data: 'menu:language' }],
    ],
  },
  help: {
    parent: 'home',
    text: (lang) => t(lang, 'help'),
    rows: () => [],
  },
  // A question: handlers/message.js takes the answer (takePending).
  feedback: {
    parent: 'home',
    text: (lang) => t(lang, 'feedback_ask'),
    rows: () => [],
    enter: (user) => askFor(user, 'feedback'),
  },
  // lang:<code> buttons (handleMenuCallback): the choice is kept in users.lang.
  language: {
    parent: 'home',
    text: (lang) => t(lang, 'language'),
    rows: (lang) => Object.entries(LANGS).map(([code, name]) => [
      { text: `${code === lang ? '✅ ' : ''}${name}`, callback_data: `lang:${code}` },
    ]),
  },
};

// { text, reply_markup } of a screen in `lang`, with its back row.
export function screen(name, lang, user) {
  const s = SCREENS[name];
  const rows = s.rows(lang, user);
  if (s.parent) rows.push([backButton(lang, s.parent)]);
  return { text: s.text(lang, user), reply_markup: { inline_keyboard: rows } };
}

// Sends a screen as a new message (after a command, or an answer to a question).
export async function showScreen(chatId, name, user) {
  await SCREENS[name].enter?.(user);
  return api.sendMessage({ chat_id: chatId, ...screen(name, await userLang(user), user) });
}

export const sendHome = (message) => showScreen(message.chat.id, 'home', message.from);
export const sendHelp = (message) => showScreen(message.chat.id, 'help', message.from);   // /help

// Edits the message with the button into a screen.
async function editInto(query, name) {
  const view = screen(name, await userLang(query.from), query.from);
  try {
    await api.editMessageText({ chat_id: query.message.chat.id, message_id: query.message.message_id, ...view });
  } catch (e) {
    if (/not modified/i.test(e.description ?? '')) return;   // the same screen pressed twice
    // A photo, a widget or a too-old message can't become a text screen: send it instead.
    if (!/no text in the message|can't be edited|message to edit not found/i.test(e.description ?? '')) throw e;
    await api.sendMessage({ chat_id: query.message.chat.id, ...view });
  }
}

// true when `query` was a menu button (back buttons included) or a language choice.
export async function handleMenuCallback(query) {
  const m = /^(menu|lang):(\w+)$/.exec(query.data ?? '');
  if (!m || (m[1] === 'menu' && !SCREENS[m[2]]) || (m[1] === 'lang' && !LANGS[m[2]])) return false;
  // Stop the button's spinner; fails when the query is too old — the screen still changes.
  await api.answerCallbackQuery({ callback_query_id: query.id }).catch(console.error);
  // Moving to any screen cancels an open question; a question screen asks again.
  await cancelPending(query.from.id);
  let name = m[2];
  if (m[1] === 'lang') {
    await setLang(query.from, m[2]);
    name = 'home';   // the menu again, now in the chosen language
  }
  await SCREENS[name].enter?.(query.from);
  if (query.message) await editInto(query, name);
  return true;
}

// ---------- reply-keyboard screens ----------

// name → { parent, text(lang, user), rows(lang, user) }, each button
// { text, to: '<keyboard>' } or { text, run: async (message) => … }.
// Labels come from t() too. Empty in the template; for example:
//   main:     { parent: null,   text: (lang) => t(lang, 'main'),   rows: (lang) => [[{ text: t(lang, 'products'), to: 'products' }]] },
//   products: { parent: 'main', text: (lang) => t(lang, 'choose'), rows: (lang) => [[{ text: t(lang, 'pizza'), run: showPizza }]] },
// Show the root with showKeyboard(message, 'main') (from /start, for example).
export const KEYBOARDS = {};

// The keyboard of a question asked from a reply-keyboard screen: only «🔙 Back».
export const questionKeyboard = (lang) => ({ keyboard: [[{ text: t(lang, 'back') }]], resize_keyboard: true });

// Sends keyboard screen `name` and remembers it as the user's current one.
export async function showKeyboard(message, name) {
  const k = KEYBOARDS[name];
  const lang = await userLang(message.from);
  const rows = k.rows(lang, message.from).map((row) => row.map((b) => ({ text: b.text })));
  if (k.parent) rows.push([{ text: t(lang, 'back') }]);
  await db.run(sql`
    INSERT INTO users (user_id, username, first_name, keyboard) VALUES (${message.from.id}, ${message.from.username ?? null}, ${message.from.first_name ?? null}, ${name})
    ON CONFLICT (user_id) DO UPDATE SET keyboard = excluded.keyboard`);
  return api.sendMessage({
    chat_id: message.chat.id,
    text: k.text(lang, message.from),
    reply_markup: { keyboard: rows, resize_keyboard: true, is_persistent: true },
  });
}

// A private text message that is «🔙 Back» (in any language) or a label of the
// user's current keyboard. true when handled. Call it before takePending() in
// handlers/message.js.
export async function handleKeyboardText(message) {
  const text = (message.text ?? '').trim();
  if (message.chat.type !== 'private' || !message.from) return false;
  const isBack = inAnyLang('back').includes(text);
  const isLabel = (s) => Object.values(KEYBOARDS).some((k) => Object.keys(LANGS).some((lang) => k.rows(lang, message.from).flat().some((b) => b.text === s)));
  if (!isBack && !isLabel(text)) return false;

  const u = await db.get(sql`SELECT keyboard, pending_action FROM users WHERE user_id = ${message.from.id}`);
  const current = KEYBOARDS[u?.keyboard] ? u.keyboard : null;

  if (isBack) {
    // Out of a question: back to the screen it was asked from. Otherwise: to the parent.
    if (u?.pending_action) await cancelPending(message.from.id);
    const target = u?.pending_action ? current : (current && KEYBOARDS[current].parent) || current;
    if (target) return showKeyboard(message, target).then(() => true);
    return sendHome(message).then(() => true);   // no keyboard: the inline menu
  }

  const lang = await userLang(message.from);
  const button = current && KEYBOARDS[current].rows(lang, message.from).flat().find((b) => b.text === text);
  if (!button) return false;
  await cancelPending(message.from.id);
  if (button.to) await showKeyboard(message, button.to);
  else await button.run(message);
  return true;
}
