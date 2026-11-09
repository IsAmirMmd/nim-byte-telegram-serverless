// A counter widget: the full loop of a widget in one feature.
//   /counter          sends it (handlers/message.js → sendCounter)
//   a tap on − ↺ +    TelegramWidget.request('count:<inc|dec|reset>')
//                     → handlers/widget_query.js → handleCounterQuery
// The bot keeps the authoritative count in `widget_counters`, writes it into
// the widget's chat state with editMessageWidgetData, and returns it in the
// answer so the widget redraws at once. The state is JSON: { n: count, r: revision }.

import { api, db } from 'sdk';
import { sql } from 'sdk/db';
import HTML from './counter.html.js';
import { homeButton } from '../menu.js';

const state = (n, r) => JSON.stringify({ n, r });

export async function sendCounter(chatId) {
  const sent = await api.sendWidget({
    chat_id: chatId,
    html: HTML,
    caption: '🔢 شمارنده',          // shown in the chat list, notifications and old apps
    chat_data: state(0, 0),
    allow_queries: true,
    reply_markup: { inline_keyboard: [[homeButton()]] },   // a way back to the menu, like every message
  });
  await db.run(sql`INSERT INTO widget_counters (chat_id, message_id) VALUES (${chatId}, ${sent.message_id})`);
  return sent;
}

// widget_query with data `count:…`. true when it was this feature's.
export async function handleCounterQuery(query) {
  const m = /^count:(inc|dec|reset)$/.exec(query.data ?? '');
  if (!m) return false;
  const answer = (data) => api.answerWidgetQuery({ widget_query_id: query.id, data });

  // Requests come from the widget, so check them against the state kept here.
  const where = query.chat ? sql`chat_id = ${query.chat.id} AND message_id = ${query.message_id}` : null;
  const row = where && await db.get(sql`SELECT count, rev FROM widget_counters WHERE ${where}`);
  if (!row) {
    await answer(JSON.stringify({ e: 'gone' }));
    return true;
  }

  const n = m[1] === 'reset' ? 0 : Number(row.count) + (m[1] === 'inc' ? 1 : -1);
  const r = Number(row.rev) + 1;
  try {
    await api.editMessageWidgetData({ chat_id: query.chat.id, message_id: query.message_id, chat_data: state(n, r) });
  } catch (e) {
    if (!/not modified/i.test(e.description ?? '')) {
      await answer(JSON.stringify({ e: 'failed' })).catch(console.error);   // the widget shows it instead of waiting for TIMEOUT
      throw e;
    }
  }
  // Commit after the edit went through, so a failed edit changes nothing.
  await db.run(sql`UPDATE widget_counters SET count = ${n}, rev = ${r} WHERE ${where}`);
  await answer(state(n, r));
  return true;
}
