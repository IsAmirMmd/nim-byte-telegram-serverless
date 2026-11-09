// handlers/callback_query.js — an inline button was pressed. Routed by the
// prefix of callback_data, one lib module per prefix:
//   menu:<screen>   the menu screens and every back button (lib/menu.js);
//                   menu:feedback asks for a message, handlers/message.js takes the answer
// callback_data is at most 64 bytes, and it comes from the client: check who
// pressed (query.from.id) before acting, and always answer the query.
// Every screen a button opens needs a way back: see lib/menu.js.

import { api } from 'sdk';
import { handleMenuCallback } from '../lib/menu.js';

export default async function (query, ctx) {
  if (await handleMenuCallback(query)) return;

  // Unknown or stale button: stop the spinner anyway.
  await api.answerCallbackQuery({ callback_query_id: query.id }).catch(console.error);
}
