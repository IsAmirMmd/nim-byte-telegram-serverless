// Text for parse_mode: 'HTML' messages. Escape everything that came from a user.

export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const link = (url, text) => (url ? `<a href="${esc(url)}">${esc(text)}</a>` : esc(text));

// Numbers with Persian digits, for Persian texts (lib/i18n.js).
export const fa = (n) => Number(n ?? 0).toLocaleString('fa-IR');

// A number in the user's language: 1,234 (en) or ۱٬۲۳۴ (fa).
export const number = (lang, n) => Number(n ?? 0).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US');

// 0.1234 → "۱۲٫۳٪"
export const faPercent = (ratio) => `${Number((ratio * 100).toFixed(1)).toLocaleString('fa-IR')}٪`;

export const userLabel = (u) => (u?.username ? `@${u.username}` : u?.first_name || String(u?.user_id ?? u?.id ?? ''));

// Short enough for a list line.
export function clip(s, n = 60) {
  const t = String(s ?? '').trim();
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
}
