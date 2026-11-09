# Bot API 10.4 for tgcloud bots

The Telegram Bot API as of **Bot API 10.4 (November 9, 2026)**, cut down to
what a tgcloud bot uses: which update types exist (one handler file each), and
the features added since 10.0, with the code shape for each. The scaffold
copies this file into the project as `docs/BOT-API.md`.

Sources, in Markdown (fetch these rather than the HTML pages):
- Bot API reference: https://core.telegram.org/bots/api.md
- Changelog: https://core.telegram.org/bots/api-changelog
- Widgets guide: https://core.telegram.org/bots/widgets.md
- tgcloud: https://core.telegram.org/bots/serverless.md

When this file and the docs disagree, the docs win. Check the changelog for
anything newer than 10.4.

## Calling the API from tgcloud

`api.<method>(params)` from `sdk` calls **any** Bot API method, including
methods added after the SDK was released: there is nothing to update. The
parameters are the Bot API's snake_case names. The result comes back
unwrapped, and failures throw `BotApiError` (`.code`, `.description`,
`.method`, `.parameters`). In tests, the mock SDK records every method the
same way (`take()`), so new methods work there too.

## Update types → handler files

The platform runs `tgcloud/handlers/<type>.js` for each update type and keeps
the webhook's `allowed_updates` in sync with the handler files that exist.
Adding the file is all it takes to receive a type, including the ones the Bot
API only sends when asked for (`message_reaction`, `chat_member`, …). Scaffold
one with `npx tgcloud add handlers/<type>`. The handler gets the payload
(`update.<type>`), and the raw update is `ctx.update`.

| Handler | Payload | When |
|---|---|---|
| `message` | Message | a new message of any kind |
| `edited_message` | Message | an edited message |
| `channel_post` | Message | a new post in a channel where the bot is an admin |
| `edited_channel_post` | Message | an edited channel post |
| `business_connection` | BusinessConnection | a business account connected, changed or disconnected |
| `business_message` | Message | a message in a connected business account |
| `edited_business_message` | Message | an edited business message |
| `deleted_business_messages` | BusinessMessagesDeleted | business messages deleted |
| `guest_message` | Message | **10.0** a guest message (guest mode, below) |
| `message_reaction` | MessageReactionUpdated | a user changed a reaction (bot must be an admin) |
| `message_reaction_count` | MessageReactionCountUpdated | anonymous reaction counts changed (admin) |
| `inline_query` | InlineQuery | an inline query |
| `chosen_inline_result` | ChosenInlineResult | an inline result was chosen (enable feedback in BotFather) |
| `callback_query` | CallbackQuery | an inline button was pressed |
| `widget_query` | WidgetQuery | **10.4** a request from a widget the bot sent |
| `shared_widget_query` | SharedWidgetQuery | **10.4** a request from a forwarded shared widget |
| `shipping_query` | ShippingQuery | flexible-price invoices only |
| `pre_checkout_query` | PreCheckoutQuery | before a payment completes: answer it |
| `purchased_paid_media` | PaidMediaPurchased | paid media with a payload was bought |
| `poll` | Poll | a poll the bot sent changed, or was stopped |
| `poll_answer` | PollAnswer | a vote in a non-anonymous poll the bot sent |
| `my_chat_member` | ChatMemberUpdated | the bot's own status changed (blocked / unblocked in private chats) |
| `chat_member` | ChatMemberUpdated | a member's status changed (bot must be an admin) |
| `chat_join_request` | ChatJoinRequest | a join request (needs `can_invite_users`) |
| `chat_boost` | ChatBoostUpdated | a boost was added or changed (admin) |
| `removed_chat_boost` | ChatBoostRemoved | a boost was removed (admin) |
| `managed_bot` | ManagedBotUpdated | a managed bot was created, or its token or owner changed |
| `subscription` | BotSubscriptionUpdated | **10.2** a user's payment subscription changed |
| `stopped_message_generation` | MessageGenerationStopped | **10.3** the user pressed Stop on a streaming draft |

Keep only the handlers the bot needs: each one is another kind of update the
platform wakes the bot up for.

## Widgets

**10.4.** Small interactive HTML blocks drawn inside a message: a poll with moving bars,
a price ticker, a board game, a promo code that copies on a tap. They run on
the user's device with **no network**. They talk to the bot only through
`widget_query` updates, and only the bot changes their state. In production,
widgets work only in **private chats** with the bot.

Use the **tgcloud-widgets** skill for them. In short:
- send with `api.sendWidget({ chat_id, html, caption, chat_data, public_data, allow_queries, is_shared })`;
- answer every request within 15 s with `api.answerWidgetQuery({ widget_query_id, data })`;
- change the state with `editMessageWidgetData` / `editSharedWidgetData`.

Widgets can't be copied (`copyMessage` refuses them). The `can_send_other_messages`
permission now also covers widgets.

## Ephemeral messages

**10.2, 10.3, 10.4.** A message in a group that only one user (and the bot) sees: a whisper, a
personal hint, a private answer to a button press. Any `send*` method among
sendMessage, sendRichMessage, sendPhoto, sendVideo, sendAnimation, sendAudio,
sendDocument, sendLivePhoto, sendSticker, sendVideoNote, sendVoice,
sendContact, sendLocation and sendVenue takes `ephemeral_message_parameters`
(EphemeralMessageParameters).

```js
// A private answer to the user who pressed a button, in any chat (10.4).
// chat_id is not needed: the callback query identifies the chat and the user.
await api.answerCallbackQuery({ callback_query_id: query.id });   // still required
await api.sendMessage({
  text: 'Only you can see this 👀',
  ephemeral_message_parameters: { callback_query_id: query.id },
});

// Show it *in place of* the message with the button, for this user only.
await api.sendMessage({
  text: 'Your personal view',
  ephemeral_message_parameters: { callback_query_id: query.id, replace_callback_query_message: true },
});

// An ephemeral message to one member of a group, without a button press.
await api.sendMessage({
  chat_id: groupId,
  text: 'Welcome! Read the rules first.',
  ephemeral_message_parameters: { receiver_user_id: userId },
});
```

- `receiver_user_id` is required unless the message is a reply to a callback
  query. Delivery isn't guaranteed (an offline user may never see it).
- Ephemeral replies don't work for callback queries in channel direct-messages chats.
- An ephemeral message arrives with `message.ephemeral_message_id` and
  `message.receiver_user`. Reply to one with
  `reply_parameters: { ephemeral_message_id }`.
- Edit with `editEphemeralMessageText` (also takes `rich_message`),
  `editEphemeralMessageCaption`, `editEphemeralMessageMedia` and
  `editEphemeralMessageReplyMarkup`. Delete with `deleteEphemeralMessage`. Each
  takes `chat_id`, `receiver_user_id` and `ephemeral_message_id`. A button
  pressed on an ephemeral message is edited with these, not with
  `replace_callback_query_message`.
- `web_app` and `login_url` buttons don't work in ephemeral messages.
- **Ephemeral commands**: `setMyCommands` with `{ command, description, is_ephemeral: true }`.
  The user's command message is then invisible to the rest of the group.
- Admin right `can_send_welcome_messages` (ChatAdministratorRights,
  `promoteChatMember`).

Test it in the mock: `take()` shows the `ephemeral_message_parameters` that were sent.

## Rich messages

**10.1–10.4.** Structured messages with headings, lists, tables, quotes, collapsible blocks,
formulas, footnotes, media and buttons inside the text. They hold up to 32768
characters, 500 blocks, 50 media and 20 table columns.

```js
await api.sendRichMessage({
  chat_id,
  rich_message: {
    markdown: `# گزارش هفته\n\n| مورد | تعداد |\n|:--|--:|\n| کاربران جدید | ${fa(n)} |\n\n> جزئیات در مینی‌اپ`,
    is_rtl: true,                 // Persian and other right-to-left text
  },
  reply_markup,                   // an inline keyboard still works
});
```

- `InputRichMessage` takes exactly one of `markdown`, `html` or `blocks`
  (InputRichBlock…). Add `media` for `tg://photo?id=` / `tg://video?id=` /
  `tg://document?id=` / `tg://audio?id=` links, and `skip_entity_detection`
  to stop URLs, mentions and the like from being detected.
- Escape user text: in `html`, use `esc()` from `lib/html.js`. In
  `markdown`, prefer `html` or `blocks` whenever user text goes in.
- Buttons inside the text (10.3), in `html`/`markdown` mode:
  `<tg-button type="callback_data" style="success" data="vote:up:7">👍</tg-button>`.
  They arrive as a normal `callback_query`.
- Edit with `editMessageText({ chat_id, message_id, rich_message })`. A
  received rich message is in `message.rich_message`.
- `InputRichMessageContent` works in inline results and `answerWebAppQuery`.
- Quote part of a rich message with `reply_parameters.quote_rich_texts` (10.4).
  `TextQuote.rich_texts` holds such a quote.
- Rich messages can be ephemeral (`ephemeral_message_parameters`).

## Streaming replies (drafts)

**9.3+ (open to all bots since 9.5); rich drafts 10.1, Stop button 10.3.** For an AI answer or a slow job in a **private chat**, show a draft while it is
generated, then send the real message. A draft is a 30-second preview and is
not kept.

```js
const draft_id = Date.now() % 2_000_000_000 || 1;              // non-zero; same id = animated update
await api.sendMessageDraft({ chat_id, draft_id, text: '' });    // empty text: "Thinking…"
await api.sendMessageDraft({ chat_id, draft_id, text: partial, can_stop: true });
// … when done:
await api.sendMessage({ chat_id, text: full });                 // or sendRichMessage
```

- `sendRichMessageDraft({ chat_id, draft_id, rich_message })` streams rich
  content. `<tg-thinking>` or `InputRichBlockThinking` shows a placeholder.
- `can_stop: true` shows a Stop button. Pressing it sends
  `stopped_message_generation` (`{ chat, message_thread_id?, draft_id }`) to
  `handlers/stopped_message_generation.js`. Save the running `draft_id` in the
  DB and have the generating loop check it. `keep_on_stop: true` leaves the
  draft visible for a short while; to keep it, send it as a message.

## Buttons and keyboards

`InlineKeyboardButton` can carry, besides the button's action:
- `style`: `'primary' | 'success' | 'danger'` (blue, green, red);
- `icon_custom_emoji_id`;
- **`disabled: {}`** (10.3, DisabledButton): a greyed button that does nothing.
  Use it for "already voted" or "sold out". It's still an object, so pass `{}`.

Button types are `url`, `callback_data` (1–64 bytes), `web_app` (private
chats; not on business or ephemeral messages), `login_url`, the
`switch_inline_query*` family, `copy_text: { text }`, `callback_game` and `pay`.

`InlineKeyboardMarkup` and `ReplyKeyboardMarkup` accept `force_reply: true`
(10.3): the user's reply box opens on the message, as if they had tapped Reply.
It works well with `askFor()` / `takePending()`. It can't be changed when the
inline keyboard is edited.

## Guest mode

**10.0.** A bot with guest mode turned on receives some messages from chats it isn't a
member of, and can answer there. They arrive in `handlers/guest_message.js` as
a Message with `guest_query_id` (and `guest_bot_caller_user` /
`guest_bot_caller_chat`). The bot answers with one inline result:

```js
export default async function guestMessage(message) {
  await api.answerGuestQuery({
    guest_query_id: message.guest_query_id,
    result: { type: 'article', id: '1', title: 'Answer', input_message_content: { message_text: 'Hello!' } },
  });
}
```

`User.supports_guest_queries` tells whether a bot has it on.

## Payment subscriptions

**10.2.** `handlers/subscription.js` receives BotSubscriptionUpdated: `{ user,
invoice_payload, state }` with `state` `'canceled' | 'active' | 'failed'`. Use it
to turn a paid feature off or back on.

## Other changes since 10.0

- **Polls** (10.0, 10.1): media in the question, explanation and options
  (`media`, `explanation_media`, InputPollMedia / InputPollOptionMedia,
  `InputMediaLink`); `members_only`, `country_codes`; a poll can have a single option.
- **Live photos** (10.0): `sendLivePhoto`, `message.live_photo`, also in media
  groups and as paid media.
- **Reactions** (10.0): `deleteMessageReaction`, `deleteAllMessageReactions`, and
  the `can_react_to_messages` permission.
- **Join requests** (10.1): `ChatJoinRequest.query_id`, `answerChatJoinRequestQuery`,
  `sendChatJoinRequestWebApp` (a Mini App for the user who asked to join).
- **Communities** (10.2): `ChatFullInfo.community` and the service messages
  `community_chat_added` / `community_chat_removed` / `community_chat_joined`.
- **Bots**: bot-to-bot messages by username when both bots allow it
  (10.0); `getChatAdministrators({ return_bots })`; managed bots
  (`get/setManagedBotAccessSettings`); `getUserPersonalChatMessages`. Since 10.4,
  Premium users can give up to 2 of their bots a second username ending in
  `agent`, `ai`, `app`, `game` or `gay` (`KeyboardButtonRequestManagedBot.suggested_username`).
- **Topics in private chats**: a link `https://t.me/<bot_username>/<message_thread_id>`
  opens the topic, only for the user whose topic it is (10.4). Private-chat
  topics are turned on in BotFather.
- **TON** (10.4): `ChatFullInfo.ton_wallet_card` (TonWalletCard, TonNft…),
  the service message `message.ton_wallet_transfer`, the entity types
  `ton_address` and `bank_card_number`, and `RichTextTonAddress`.
  `StoryAreaPosition` is now named `AreaPosition`.
- **Share themes** (10.4): `ChatFullInfo.share_theme` (ChatShareTheme…),
  `getChatShareThemeBackdrops`.
- **Gifts** (10.4): `getUniqueGift({ name })`, `deleteBusinessAccountGift`.
- `message.paid_messages_waived` (10.4): the sender used a link that waives paid messages.
- `verifyUser` / `verifyChat` take `custom_description_parse_mode` and
  `custom_description_entities` (10.4).
- **Mini Apps** (10.2): Mini App methods only work from the Mini App's own
  origin. For tgcloud that is `https://app<id>.tgcloud.ai`. See the
  tgcloud-mini-app skill.
