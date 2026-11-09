// Every text of the Mini App, in English (the default) and Persian, like the
// bot's tgcloud/lib/i18n.js. The language is the bot's choice for this user
// (`me.lang` from the `me` endpoint), else the Telegram app's language, else English.
//
//   const { t, lang } = useI18n(me.data?.lang);   t('profile'), t('hello', name)
//
// Add a language: an entry in TEXTS (and in the bot's lib/i18n.js), and in RTL
// if it is written right to left.

import { useEffect, useMemo } from 'react';
import { tg } from './telegram.js';

export const DEFAULT_LANG = 'en';
const RTL = new Set(['fa']);

export const TEXTS = {
  en: {
    loading: 'Loading…',
    open_in_telegram: 'Open this page from inside Telegram.',
    server_error: (what) => `Couldn't reach the server (${what})`,
    hello: (name) => `Hi ${name} 👋`,
    profile: 'Profile',
    name: 'Name',
    username: 'Username',
    user_id: 'User ID',
    member_since: 'Member since',
    starts: 'Starts',
    not_started: 'You haven\'t started the bot yet. Send /start in the bot\'s chat.',
    feedback: 'Send feedback',
    feedback_placeholder: 'An idea, a suggestion or a problem you found…',
    send: 'Send',
    sending: 'Sending…',
    sent: 'Got it, thanks 🙏',
    copied: 'Copied',
  },
  fa: {
    loading: 'در حال بارگذاری…',
    open_in_telegram: 'این صفحه رو از داخل تلگرام باز کن.',
    server_error: (what) => `خطا در ارتباط با سرور (${what})`,
    hello: (name) => `سلام ${name} 👋`,
    profile: 'پروفایل',
    name: 'نام',
    username: 'یوزرنیم',
    user_id: 'آیدی عددی',
    member_since: 'عضو از',
    starts: 'تعداد استارت',
    not_started: 'هنوز ربات رو استارت نکردی. توی چت ربات /start رو بزن.',
    feedback: 'ارسال نظر',
    feedback_placeholder: 'نظر، پیشنهاد یا مشکلی که دیدی…',
    send: 'ارسال',
    sending: 'در حال ارسال…',
    sent: 'رسید، ممنون 🙏',
    copied: 'کپی شد',
  },
};

export function pickLang(chosen, languageCode = tg?.initDataUnsafe?.user?.language_code) {
  if (TEXTS[chosen]) return chosen;
  const fromApp = String(languageCode ?? '').toLowerCase().split('-')[0];
  return TEXTS[fromApp] ? fromApp : DEFAULT_LANG;
}

export function translate(lang, key, ...args) {
  const text = TEXTS[lang]?.[key] ?? TEXTS[DEFAULT_LANG][key] ?? key;
  return typeof text === 'function' ? text(...args) : text;
}

// The language and t() for the UI; keeps <html lang dir> in step.
export function useI18n(chosen) {
  const lang = pickLang(chosen);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL.has(lang) ? 'rtl' : 'ltr';
  }, [lang]);
  return useMemo(() => ({ lang, t: (key, ...args) => translate(lang, key, ...args) }), [lang]);
}
