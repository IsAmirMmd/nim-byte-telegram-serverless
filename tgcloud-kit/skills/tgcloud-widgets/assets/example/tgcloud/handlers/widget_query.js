// handlers/widget_query.js — a widget the bot sent asked something
// (TelegramWidget.request(data)). Routed by the prefix of data, one lib module
// per widget, like callback_query:
//   count:<inc|dec|reset>   the counter (lib/widgets/counter.js)
// data is 1-64 bytes from the client: check it against the state kept in the
// DB. Answer every query within 15 seconds, or the widget gets TIMEOUT.

import { api } from 'sdk';
import { handleCounterQuery } from '../lib/widgets/counter.js';

export default async function (query, ctx) {
  if (await handleCounterQuery(query)) return;

  // Unknown or stale request: answer anyway, so the widget doesn't wait.
  await api.answerWidgetQuery({ widget_query_id: query.id }).catch(console.error);
}
