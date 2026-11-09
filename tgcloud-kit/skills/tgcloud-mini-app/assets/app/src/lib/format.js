// Numbers and dates in the UI's language (lib/i18n.js): 1,234 / ۱٬۲۳۴.

const locale = (lang) => (lang === 'fa' ? 'fa-IR' : 'en-US');

export const formatNumber = (lang, n) => Number(n ?? 0).toLocaleString(locale(lang));

// Unix seconds → "Oct 16, 2026, 12:30 PM" / "۲۴ مهر ۱۴۰۵، ۱۲:۳۰", in the device's timezone.
export const formatDate = (lang, unix) => (unix
  ? new Intl.DateTimeFormat(locale(lang), { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(unix * 1000))
  : '—');

// 0.1234 → "12.3%" / "۱۲٫۳٪"; null → "—"
export const formatPercent = (lang, ratio) => (ratio == null || !Number.isFinite(ratio)
  ? '—'
  : new Intl.NumberFormat(locale(lang), { style: 'percent', maximumFractionDigits: 1 }).format(ratio));
