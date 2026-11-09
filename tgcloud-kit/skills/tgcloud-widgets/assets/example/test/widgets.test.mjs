// The counter widget: sending, requests, state edits, and the size limits.

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { fresh, take, failNext, row, msg, widgetQuery } from './helpers.mjs';
import message from '../tgcloud/handlers/message.js';
import widgetQueryHandler from '../tgcloud/handlers/widget_query.js';
import COUNTER from '../tgcloud/lib/widgets/counter.html.js';

const USER = 555;

beforeEach(fresh);

async function sendCounterTo(user) {
  await message(msg(user, '/counter'), {});
  const [sent] = take();
  assert.equal(sent.method, 'sendWidget');
  return sent;
}

test('/counter sends the widget with requests allowed and a zero state', async () => {
  const sent = await sendCounterTo(USER);
  assert.equal(sent.params.chat_id, USER);
  assert.equal(sent.params.html, COUNTER);
  assert.equal(sent.params.allow_queries, true);
  assert.deepEqual(JSON.parse(sent.params.chat_data), { n: 0, r: 0 });
  assert.ok(sent.params.caption);
  assert.equal(sent.params.reply_markup.inline_keyboard[0][0].callback_data, 'menu:home');   // a way back
});

test('a tap edits the chat state, saves it, and answers with it', async () => {
  await sendCounterTo(USER);
  const { message_id } = row('SELECT message_id FROM widget_counters WHERE chat_id = ?', USER);

  await widgetQueryHandler(widgetQuery(USER, 'count:inc', message_id), {});
  const [edit, answer] = take();
  assert.equal(edit.method, 'editMessageWidgetData');
  assert.equal(edit.params.message_id, message_id);
  assert.deepEqual(JSON.parse(edit.params.chat_data), { n: 1, r: 1 });
  assert.equal(answer.method, 'answerWidgetQuery');
  assert.deepEqual(JSON.parse(answer.params.data), { n: 1, r: 1 });
  assert.equal(row('SELECT count FROM widget_counters WHERE chat_id = ?', USER).count, 1);
});

test('a failed edit changes nothing and still answers', async () => {
  await sendCounterTo(USER);
  const { message_id } = row('SELECT message_id FROM widget_counters WHERE chat_id = ?', USER);
  failNext('editMessageWidgetData', 400, 'Bad Request: message to edit not found');

  await assert.rejects(widgetQueryHandler(widgetQuery(USER, 'count:inc', message_id), {}));
  const [, answer] = take();
  assert.equal(answer.method, 'answerWidgetQuery');
  assert.equal(JSON.parse(answer.params.data).e, 'failed');
  assert.equal(row('SELECT count FROM widget_counters WHERE chat_id = ?', USER).count, 0);
});

test('unknown or stale requests are answered, never left to time out', async () => {
  await widgetQueryHandler(widgetQuery(USER, 'count:inc', 999), {});   // no such widget
  assert.equal(JSON.parse(take()[0].params.data).e, 'gone');

  await widgetQueryHandler(widgetQuery(USER, 'hack:me', 1), {});
  const [answer] = take();
  assert.equal(answer.method, 'answerWidgetQuery');
  assert.equal(answer.params.data, undefined);
});

test('every widget is built and within Telegram\'s limits', () => {
  assert.equal(COUNTER, readFileSync('widgets/counter.html', 'utf8').trim(), 'run `npm run widgets`');
  const bytes = Buffer.from(COUNTER, 'utf8');
  assert.ok(bytes.length <= 32768, `${bytes.length} bytes of HTML`);
  assert.ok(deflateSync(bytes, { level: 9 }).length + 6 <= 4096, 'over 4096 bytes compressed');
  assert.ok(!COUNTER.includes('\u0000'));
});
