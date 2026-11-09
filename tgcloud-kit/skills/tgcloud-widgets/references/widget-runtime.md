# Widget runtime: what the HTML can use

A summary of https://core.telegram.org/bots/widgets.md (widget profile 1). When
this and the guide disagree, the guide wins. Every Telegram app removes what
the profile doesn't support and runs the rest, so something unsupported never
shows an error: it just isn't there. Check against this list.

## The document

- One HTML document or fragment, with inline `<style>` and `<script>`. No
  external scripts, styles, fonts or images. Images are `data:` PNG, JPEG,
  GIF or WebP (≤1024×1024), inline SVG, or `<canvas>`.
- At most **32768 bytes** of UTF-8, and **4096 bytes after zlib level 9**.
  `npm run widgets` measures it. `data:` images barely compress, so use SVG
  and CSS. No comments, no dead code. Aim below about 3800 bytes compressed.
- `window.TelegramWidget` is there before the first script runs. No script tag is needed.

## The bubble and the look

- Width 200-600 px (phones about 320-430: design for 320). Height = content,
  50-600 px. The rest is clipped, and **nothing scrolls**. For long content,
  use pages, tabs or "show more".
- `html` has no background, so the bubble's color shows through. The body's
  margin is the message's text padding (about 8px 12px). `body{margin:0}` goes
  edge to edge.
- Defaults: message text color, size and line height. Headings, lists,
  tables, `pre` and quotes get native styles. An **unstyled `<button>`** looks like
  the app's own, with pressed and `[disabled]` states. Your CSS always wins.
- Colors: `--tg-theme-bg-color`, `-text-color`, `-hint-color`, `-link-color`,
  `-button-color`, `-button-text-color`, `-secondary-bg-color`,
  `-accent-text-color`, `-subtitle-text-color`, `-destructive-text-color`,
  `-section-separator-color` (also `TelegramWidget.themeParams`).
  `prefers-color-scheme`, `light-dark()` and `color-scheme` follow the chat
  theme, live. Never hard-code colors that have to contrast with the bubble:
  a widget the user sent via the bot sits in their outgoing bubble.
- Text: `--tg-text-font-size` (about 15px), `--tg-text-line-height`. Fonts:
  only `system-ui`, `sans-serif`, `serif`, `monospace`, `ui-*`. Use `em`
  for sizes.
- Without a caption below the widget, the app draws the time in the bottom
  corner. Keep `env(safe-area-inset-bottom)` clear (the default body padding
  does it, and if you pad for it yourself, set `body{padding:0}`). With a
  caption below, the inset is 0.
- Text isn't selectable unless you set `user-select:text` (and `-webkit-`).
  For a one-tap copy, use `copyText`.

## Supported (in) / removed (out)

| | In | Out |
|---|---|---|
| HTML | div, span, p, h1-h6, lists, tables, details/summary, figure, sections, inline text tags, `a`, `img` (data:), `canvas`, `button` | **every form control** (input, select, textarea, …), progress, meter, dialog, popover, audio, video, iframe, `script src`, template, contenteditable, tabindex |
| SVG | shapes, paths, g, defs, symbol, use, text, gradients, CSS animation | clipPath, mask, pattern, marker, filters, SMIL (`<animate>`), foreignObject, `<image>` |
| CSS layout | flex (gap), grid, position (fixed = inside the bubble), z-index, aspect-ratio, `overflow: hidden/clip` | `vh` and other height units, `overflow: auto/scroll`, `position: sticky`, logical properties, multi-column, `display: contents/flow-root` |
| CSS paint | borders, radius, box-shadow, gradients, 2D transforms, `filter`/`backdrop-filter` with blur/brightness/drop-shadow only | 3D transforms, other filter functions, clip-path, masks, blend modes, text-shadow, line-clamp, `background-clip:text`, oklch()/color-mix() |
| CSS other | transitions, @keyframes, custom properties, calc/min/max/clamp, `@media` width/orientation/color-scheme/reduced-motion, @supports, :active, `:hover` (mouse only), ::before/::after, :is/:where/:not | @font-face, @import, @container, @layer, nesting, `:has()`, `:focus*`, `:checked`, ::marker |
| JS | ES2023 (QuickJS), async/await, timers, requestAnimationFrame, the DOM, MutationObserver, ResizeObserver, canvas 2D, `element.animate`, Intl in the user's locale, crypto.getRandomValues, TextEncoder, URL, localStorage/sessionStorage (4 KB, this message, this device) | **all network APIs** (fetch, XHR, WebSocket, …: NetworkDisabledError), location/history, alert/confirm/prompt, navigator.clipboard/share/vibrate, Blob/FileReader, workers, WebGL, `getImageData`, `toDataURL`, CDN libraries |
| Input | click, pointer events, dblclick, contextmenu on a hold over `touch-action:none` | touch events, keyboard, focus, wheel/scroll |

Element ids are not global variables: use `document.getElementById`.

## Gestures

- Taps and double taps are always the widget's. **Vertical drags always
  scroll the chat**, so there are no vertical sliders, pickers, drawing or
  panning.
- Holds and horizontal drags go to the chat (message menu, swipe to reply),
  unless the element (or an ancestor) has `touch-action: pan-y` (the widget
  gets horizontal drags: sliders, carousels) or `touch-action: none` (drags
  and holds: game buttons, a canvas). When the chat takes a press, the widget
  gets `pointercancel` and no click.
- Keep controls out of the leading 20 px (the system back gesture).

## TelegramWidget

| Member | |
|---|---|
| `chatData`, `publicData` | the state: a string ≤1024 bytes, or `null`. Read-only. `chatData` is always `null` in a forward |
| `onEvent(type, fn)` / `offEvent` | `chatDataChanged`, `publicDataChanged`, `themeChanged`, `activated`, `deactivated`, `contentSafeAreaChanged` |
| `request(data[, { wallet: true }])` | ask the bot: `data` 1-64 bytes. Resolves `{ result }` (string or `null`), rejects `WidgetRequestError` with `.code` |
| `watchPublicData()` / `unwatchPublicData()` | a shared widget on screen polls its shared state every `cache_time` |
| `viewer` | `{ id, first_name, last_name?, username?, is_premium? }`, only where the widget may ask, else `null` |
| `chatType` | `'private' \| 'group' \| 'supergroup' \| 'channel'`, `null` in a forward or preview |
| `isForward`, `isPreview`, `isActive` | where and whether it's shown |
| `colorScheme`, `themeParams` | the theme (also as CSS variables) |
| `copyText(text)` | 1-256 characters, on a tap. The app shows a toast |
| `openLink(url)` | https, ≤256 characters, not t.me, on a tap. The user confirms |
| `openTelegramLink(url)` | `https://t.me/…`, on a tap. Use it for the bot (`?start=`) or a Mini App |
| `HapticFeedback` | `impactOccurred(style)`, `notificationOccurred(type)`, `selectionChanged()`, mostly during and right after a touch |
| `wallet` | `sendTransaction(tx, data)`, `signData(payload, data)`, or `null` |
| `setResizeAnchor('top' \| 'bottom')` | which edge stays put when the height changes. Check `typeof … === 'function'` |
| `contentSafeAreaInset` | the corner the time covers |
| `ready()` | optional: the first state is drawn |
| `profile`, `isProfileAtLeast(n)` | feature profile (1) |

There is no `sendMessage`: the widget can't post to the chat.

**A tap unlocks one call**, shared by `request`, `openLink`,
`openTelegramLink` and `copyText`. Make it synchronously in the `click`
handler: not after `await`, in a timer, or in `pointerdown`. One request can
be in flight at a time (`BUSY`). Users get 5 requests per 5 s across all of
the bot's widgets (`RATE_LIMITED`).

Error codes: `NOT_ALLOWED` (no tap, `allow_queries` off, a forward of a static
widget, a preview), `BUSY`, `RATE_LIMITED`, `TIMEOUT` (the bot didn't answer
in 15 s), `FAILED`, `INVALID_ANSWER`, and for the wallet `REJECTED` and
`BAD_REQUEST`.

**Background requests**: only the original in the private chat, while it's
visible. One goes out when it appears (a request in the script's first lines
waits for that), then at most one every 5 s.

## Lifecycle and limits

- Off screen, a widget is paused: `document.hidden`, no animation frames,
  timers at most once a second. It can be destroyed and re-created at any
  time, so redraw from the state and `localStorage` when the script starts.
- CPU: 300 ms per second, 500 ms per task at most (more stops it). 8 MB of
  memory, 2000 nodes, 64 timers, 400 CSS rules, 32 @keyframes, 2048×2048
  canvas pixels. At most 16 "heavy" elements at once (blurred shadow, filter,
  backdrop-filter, opacity < 1), and 2 of them with backdrop-filter. Mute with
  color (`--tg-theme-hint-color`, rgba), not opacity.
- Past a limit, the widget stops on its last frame ("Widget stopped"). After
  two crashes in a row, it stays stopped until the app restarts.

## Checklist before sending

- [ ] `npm run widgets` passes: it's under 4096 bytes compressed.
- [ ] The first state is drawn synchronously from `chatData` / `publicData`, and `null` is handled.
- [ ] Every request shows that it's pending, then the result or the error code.
- [ ] Only theme variables are used for colors. Checked in light and dark.
- [ ] Nothing from the "out" column (inputs, `vh`, `overflow:auto`, fetch, …).
- [ ] It fits in 600 px tall at 320 px wide.
- [ ] The bot sends a caption, and the caption says what matters.
- [ ] A forward and a preview show something sensible (`isForward`, `isPreview`).
