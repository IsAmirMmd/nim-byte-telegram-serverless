// handlers/my_chat_member.js — the bot's own membership changed in a chat.
// In a private chat that means the user blocked ('kicked') or unblocked the
// bot: keep users.blocked right so later messages skip them.
// In groups/channels: the bot was added, promoted or removed — handle that
// here when the bot works in groups or channels.

import { setBlocked } from '../lib/users.js';

export default async function (update, ctx) {
  if (update.chat.type === 'private') {
    await setBlocked(update.chat.id, update.new_chat_member?.status === 'kicked');
  }
}
