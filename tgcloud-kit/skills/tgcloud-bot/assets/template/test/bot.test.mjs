// Runs the bot's handlers and endpoints locally against an in-memory database
// and a recorded Bot API (test/sdk/). `npm test` — no deploy, no network.
// Each test starts from an empty database. Add a test next to every feature.

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { fresh, take, failNext, row, msg, press, membership, ctxOf, ADMIN_ID } from './helpers.mjs';
import { SCREENS, KEYBOARDS, BACK, screen, showKeyboard } from '../tgcloud/lib/menu.js';
import { askFor } from '../tgcloud/lib/users.js';
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

test('navigation: every screen except the root has a back button, and every button leads somewhere', () => {
  const roots = Object.entries(SCREENS).filter(([, s]) => !s.parent);
  assert.deepEqual(roots.map(([name]) => name), ['home']);
  for (const [name, s] of Object.entries(SCREENS)) {
    const rows = screen(name, { id: USER, first_name: 'U' }).reply_markup.inline_keyboard;
    if (s.parent) {
      assert.ok(SCREENS[s.parent], `${name}: parent ${s.parent} doesn't exist`);
      assert.deepEqual(rows.at(-1), [{ text: BACK, callback_data: `menu:${s.parent}` }], `${name} has no back button`);
    }
    for (const b of rows.flat()) {
      const to = /^menu:(\w+)$/.exec(b.callback_data ?? '')?.[1];
      if (b.callback_data?.startsWith('menu:')) assert.ok(SCREENS[to], `${name}: button ${b.callback_data} leads nowhere`);
    }
  }
  for (const [name, k] of Object.entries(KEYBOARDS)) {
    if (k.parent) assert.ok(KEYBOARDS[k.parent], `keyboard ${name}: parent ${k.parent} doesn't exist`);
    for (const b of k.rows({ id: USER }).flat()) assert.ok(b.run || KEYBOARDS[b.to], `keyboard ${name}: «${b.text}» leads nowhere`);
  }
});

test('back from a question cancels it and returns to the menu', async () => {
  await callbackQuery(press(USER, 'menu:feedback', 7), {});
  const [, ask] = take();
  assert.equal(ask.method, 'editMessageText');
  assert.deepEqual(ask.params.reply_markup.inline_keyboard.at(-1), [{ text: BACK, callback_data: 'menu:home' }]);

  await callbackQuery(press(USER, 'menu:home', 7), {});
  const [, home] = take();
  assert.equal(home.method, 'editMessageText');
  assert.equal(home.params.message_id, 7);
  assert.equal(row('SELECT pending_action FROM users WHERE user_id = ?', USER).pending_action, null);

  await message(msg(USER, 'not feedback anymore'), {});   // the question is gone
  assert.deepEqual(take(), []);
});

test('a typed «🔙 بازگشت» also cancels the question; every reply offers a way back', async () => {
  await callbackQuery(press(USER, 'menu:feedback'), {});
  take();
  await message(msg(USER, BACK), {});
  const [home] = take();
  assert.equal(home.method, 'sendMessage');
  assert.match(home.params.text, /چه کاری/);
  await message(msg(USER, 'hello'), {});
  assert.deepEqual(take(), []);

  await callbackQuery(press(USER, 'menu:feedback'), {});
  take();
  await message(msg(USER, 'thanks!'), {});
  const [, thanks] = take();
  assert.equal(thanks.params.reply_markup.inline_keyboard[0][0].callback_data, 'menu:home');
});

test('back on a message that cannot become text (a photo, a widget) sends the screen instead', async () => {
  failNext('editMessageText', 400, 'Bad Request: there is no text in the message to edit');
  await callbackQuery(press(USER, 'menu:home', 9), {});
  const [, edit, sent] = take();
  assert.equal(edit.method, 'editMessageText');
  assert.equal(sent.method, 'sendMessage');
  assert.equal(sent.params.chat_id, USER);
});

test('reply keyboards: a button opens the next keyboard, «🔙 بازگشت» goes back, also out of a question', async () => {
  const asked = [];
  KEYBOARDS.main = { parent: null, text: () => 'main', rows: () => [[{ text: '📦 Products', to: 'products' }]] };
  KEYBOARDS.products = { parent: 'main', text: () => 'products', rows: () => [[{ text: '🔎 Search', run: async (m) => { asked.push(m.text); await askFor(m.from, 'search'); } }]] };
  try {
    await message(msg(USER, '/start'), {});
    take();
    await message(msg(USER, '📦 Products'), {});   // no keyboard shown yet: not a button for this user
    assert.deepEqual(take(), []);

    await showKeyboard(msg(USER, ''), 'main');
    assert.equal(take()[0].params.reply_markup.keyboard.flat().some((b) => b.text === BACK), false);   // the root has no back

    await message(msg(USER, '📦 Products'), {});
    const [products] = take();
    assert.equal(products.params.text, 'products');
    assert.deepEqual(products.params.reply_markup.keyboard.at(-1), [{ text: BACK }]);

    await message(msg(USER, '🔎 Search'), {});
    assert.deepEqual(asked, ['🔎 Search']);
    await message(msg(USER, BACK), {});              // out of the question: the same keyboard again
    assert.equal(take()[0].params.text, 'products');
    assert.equal(row('SELECT pending_action FROM users WHERE user_id = ?', USER).pending_action, null);

    await message(msg(USER, BACK), {});              // then up to the parent
    assert.equal(take()[0].params.text, 'main');
  } finally {
    delete KEYBOARDS.main;
    delete KEYBOARDS.products;
  }
});

test('there are no built-in admin commands: unknown commands get no reply', async () => {
  for (const text of ['/stats', '/backup', '/ping']) {
    await message(msg(ADMIN_ID, text), {});
    await message(msg(USER, text), {});
  }
  assert.deepEqual(take(), []);
});

test('feedback: the button asks, the next message is forwarded to the admin', async () => {
  await callbackQuery(press(USER, 'menu:feedback'), {});
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
  await callbackQuery(press(USER, 'menu:feedback'), {});
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
