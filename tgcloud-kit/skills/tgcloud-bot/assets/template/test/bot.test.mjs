// Runs the bot's handlers and endpoints locally against an in-memory database
// and a recorded Bot API (test/sdk/). `npm test` — no deploy, no network.
// Each test starts from an empty database. Add a test next to every feature.

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { fresh, take, failNext, row, msg, press, membership, ctxOf, ADMIN_ID } from './helpers.mjs';
import message from '../tgcloud/handlers/message.js';
import callbackQuery from '../tgcloud/handlers/callback_query.js';
import myChatMember from '../tgcloud/handlers/my_chat_member.js';
import me from '../tgcloud/endpoints/me.js';

const USER = ADMIN_ID + 1;   // anyone but the admin

beforeEach(fresh);

test('/start records the user, keeps the first deep-link payload, and sends the menu', async () => {
  await message(msg(USER, '/start ref_42'), {});
  const [sent] = take();
  assert.equal(sent.method, 'sendMessage');
  assert.equal(sent.params.chat_id, USER);
  assert.ok(sent.params.reply_markup.inline_keyboard.flat().some((b) => b.callback_data === 'menu:help'));

  await message(msg(USER, '/start other'), {});
  const u = row('SELECT * FROM users WHERE user_id = ?', USER);
  assert.equal(u.start_count, 2);
  assert.equal(u.start_param, 'ref_42');
});

test('menu buttons edit the message into the next screen; /help sends it', async () => {
  await callbackQuery(press(USER, 'menu:help', 7), {});
  const [answer, edit] = take();
  assert.equal(answer.method, 'answerCallbackQuery');
  assert.equal(edit.method, 'editMessageText');
  assert.equal(edit.params.message_id, 7);
  assert.match(edit.params.text, /راهنما/);

  await message(msg(USER, '/help'), {});
  const [help] = take();
  assert.equal(help.params.chat_id, USER);
  assert.match(help.params.text, /راهنما/);
});

test('there are no built-in admin commands: unknown commands get no reply', async () => {
  for (const text of ['/stats', '/backup', '/ping']) {
    await message(msg(ADMIN_ID, text), {});
    await message(msg(USER, text), {});
  }
  assert.deepEqual(take(), []);
});

test('feedback: the button asks, the next message is forwarded to the admin', async () => {
  await callbackQuery(press(USER, 'feedback'), {});
  take();
  await message(msg(USER, 'Great bot <3'), {});
  const [forward, thanks] = take();
  assert.equal(forward.params.chat_id, ADMIN_ID);
  assert.match(forward.params.text, /Great bot &lt;3/);   // user text is HTML-escaped
  assert.equal(thanks.params.chat_id, USER);

  // The question was answered: the next message is ignored.
  await message(msg(USER, 'hello?'), {});
  assert.deepEqual(take(), []);
});

test('feedback the admin cannot receive (they never started the bot): the user is told', async () => {
  await callbackQuery(press(USER, 'feedback'), {});
  take();
  failNext('sendMessage', 403, 'Forbidden: bot can\'t initiate conversation with a user');
  await message(msg(USER, 'hi'), {});
  const [, sorry] = take();
  assert.equal(sorry.params.chat_id, USER);
  assert.match(sorry.params.text, /دوباره امتحان کن/);
});

test('/stop and blocking are recorded', async () => {
  await message(msg(USER, '/start'), {});
  await message(msg(USER, '/stop'), {});
  assert.equal(row('SELECT unsubscribed FROM users WHERE user_id = ?', USER).unsubscribed, 1);

  await myChatMember(membership(USER, 'kicked'), {});
  assert.equal(row('SELECT blocked FROM users WHERE user_id = ?', USER).blocked, 1);
  await myChatMember(membership(USER, 'member'), {});
  assert.equal(row('SELECT blocked FROM users WHERE user_id = ?', USER).blocked, 0);
});

test('endpoints: me returns only the caller\'s own profile', async () => {
  const before = await me({ id: ADMIN_ID }, ctxOf(USER));   // an id in the input is ignored
  assert.equal(before.id, USER);
  assert.equal(before.started, false);

  await message(msg(USER, '/start'), {});
  const after = await me({}, ctxOf(USER));
  assert.equal(after.started, true);
  assert.equal(after.start_count, 1);
  assert.equal(typeof after.first_seen_at, 'number');
  assert.equal('isAdmin' in after, false);
});
