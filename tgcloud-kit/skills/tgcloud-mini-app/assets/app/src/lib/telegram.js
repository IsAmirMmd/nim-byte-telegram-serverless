import { useEffect } from 'react';

export const tg = window.Telegram?.WebApp;
const atLeast = (v) => Boolean(tg?.isVersionAtLeast?.(v));

// Follows Telegram's light/dark scheme. The colors themselves come from the
// --tg-theme-* CSS variables that telegram-web-app.js keeps up to date (app.css).
export function useTelegramTheme() {
  useEffect(() => {
    const apply = () => {
      document.documentElement.dataset.theme = tg?.colorScheme === 'dark' ? 'dark' : 'light';
      if (atLeast('6.1')) {
        tg.setHeaderColor('secondary_bg_color');
        tg.setBackgroundColor('secondary_bg_color');
      }
    };
    apply();
    tg?.onEvent?.('themeChanged', apply);
    return () => tg?.offEvent?.('themeChanged', apply);
  }, []);
}

// Telegram's native back button (top of the Mini App). Every screen except
// the first must have a way back: it calls useBackButton(goBack) with a
// function that returns to the previous screen; the first screen calls
// useBackButton(null), which hides it. Pass a stable function (useCallback).
// Outside Telegram (a browser) nothing shows: render your own back link there.
export function useBackButton(onBack) {
  useEffect(() => {
    if (!onBack || !atLeast('6.1')) return undefined;
    tg.BackButton.onClick(onBack);
    tg.BackButton.show();
    return () => {
      tg.BackButton.offClick(onBack);
      tg.BackButton.hide();
    };
  }, [onBack]);
}

// 'success' | 'warning' | 'error' (Bot API 6.1+; nothing elsewhere).
export function haptic(type = 'success') {
  if (atLeast('6.1')) tg.HapticFeedback.notificationOccurred(type);
}

// Telegram's native dialogs (window.confirm / alert outside Telegram).
export function confirmDialog(message) {
  if (!atLeast('6.2')) return Promise.resolve(window.confirm(message));
  return new Promise((resolve) => tg.showConfirm(message, resolve));
}

export function alertDialog(message) {
  if (!atLeast('6.2')) return Promise.resolve(window.alert(message));
  return new Promise((resolve) => tg.showAlert(message, resolve));
}

// Opens Telegram's "share to chat" picker with a link.
export function shareLink(url, text = '') {
  const share = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  if (tg?.openTelegramLink) tg.openTelegramLink(share);
  else window.open(share, '_blank', 'noopener');
}

// Copies text, or shows it when the clipboard is not available (some Telegram clients).
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    await alertDialog('کپی شد');
  } catch {
    await alertDialog(text);
  }
}
