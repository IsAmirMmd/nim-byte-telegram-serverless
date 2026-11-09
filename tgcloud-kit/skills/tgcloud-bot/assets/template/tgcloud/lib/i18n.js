// Every user-facing text of the bot, in English (the default) and Persian.
//
//   t(lang, 'key', ...args)       → the text in that language (English when missing)
//   const lang = await userLang(user)   (lib/users.js): the language to answer in
//
// A user's language: the one they chose in the 🌐 Language screen (users.lang),
// else their Telegram app's language (language_code 'fa' → Persian), else English.
// Add a language: a new entry in LANGS and in TEXTS. Add a text: a key in every
// dictionary (test/bot.test.mjs checks that they all have the same keys).
// Never write user-facing text anywhere else; texts for the admin may stay English.

export const DEFAULT_LANG = 'en';

// code → the language's name in itself (the 🌐 Language screen's buttons).
export const LANGS = { en: 'English', fa: 'فارسی' };

export const RTL = new Set(['fa']);

export const TEXTS = {
  en: {
    back: '🔙 Back',
    home: '🏠 Main menu',
    hello: (name) => `Hi${name ? ` ${name}` : ''} 👋\n\nWhat can I do for you?`,
    open_app: '📱 Open the app',
    help_button: '📖 Help',
    help: '📖 Help\n\nDescribe here what the bot does.',
    feedback_button: '💬 Send feedback',
    feedback_ask: '💬 Write your message and send it 👇',
    feedback_text_only: 'Please send your feedback as text 🙏',
    feedback_failed: 'Couldn\'t deliver your message right now, please try again a bit later 🙏',
    feedback_thanks: 'Thanks, got it 🙏',
    language_button: '🌐 Language',
    language: '🌐 Choose your language:',
    stopped: '🔕 OK, you won\'t get messages from us anymore.\nSend /start whenever you want to come back.',
    // Telegram's own setup (lib/menu.js syncBotSetup): the "/" list, and the
    // Mini App button next to the input field (short: it's a small button)
    cmd_start: 'Main menu',
    cmd_help: 'Help',
    menu_button: 'Open app',
    // Mini App endpoint errors (endpoints/feedback.js)
    err_empty: 'The message is empty.',
    err_too_long: (max) => `A message can be at most ${max} characters.`,
    err_not_started: 'Start the bot first, then send a message.',
    err_too_soon: 'Wait a minute and send it again.',
    err_unavailable: 'Couldn\'t deliver your message right now, please try again a bit later.',
  },
  fa: {
    back: '🔙 بازگشت',
    home: '🏠 منوی اصلی',
    hello: (name) => `سلام${name ? ` ${name}` : ''} 👋\n\nچه کاری برات انجام بدم؟`,
    open_app: '📱 باز کردن اپ',
    help_button: '📖 راهنما',
    help: '📖 راهنما\n\nاینجا توضیح بده ربات چه کاری انجام میده.',
    feedback_button: '💬 ارسال نظر',
    feedback_ask: '💬 پیامت رو بنویس و بفرست 👇',
    feedback_text_only: 'لطفاً نظرت رو به صورت متن بفرست 🙏',
    feedback_failed: 'الان نشد پیامت رو برسونم، کمی بعد دوباره امتحان کن 🙏',
    feedback_thanks: 'ممنون، رسید 🙏',
    language_button: '🌐 زبان',
    language: '🌐 زبانت رو انتخاب کن:',
    stopped: '🔕 باشه، دیگه پیامی ازمون نمی‌گیری.\nهر وقت خواستی برگردی، /start رو بزن.',
    cmd_start: 'منوی اصلی',
    cmd_help: 'راهنما',
    menu_button: 'باز کردن اپ',
    err_empty: 'متن پیام خالیه.',
    err_too_long: (max) => `پیام حداکثر ${Number(max).toLocaleString('fa-IR')} کاراکتر می‌تونه باشه.`,
    err_not_started: 'اول ربات رو استارت کن، بعد پیام بده.',
    err_too_soon: 'یه دقیقه صبر کن و دوباره بفرست.',
    err_unavailable: 'الان نشد پیامت رو برسونم، کمی بعد دوباره امتحان کن.',
  },
};

// The language for a stored choice (users.lang) and a Telegram language_code.
export function pickLang(chosen, languageCode) {
  if (TEXTS[chosen]) return chosen;
  const fromApp = String(languageCode ?? '').toLowerCase().split('-')[0];
  return TEXTS[fromApp] ? fromApp : DEFAULT_LANG;
}

export function t(lang, key, ...args) {
  const text = TEXTS[lang]?.[key] ?? TEXTS[DEFAULT_LANG][key];
  if (text === undefined) throw new Error(`i18n: no text "${key}"`);
  return typeof text === 'function' ? text(...args) : text;
}

// The same text in every language: to recognise a reply-keyboard label
// («🔙 Back» / «🔙 بازگشت») whatever language the keyboard was sent in.
export const inAnyLang = (key) => Object.keys(TEXTS).map((lang) => t(lang, key));
