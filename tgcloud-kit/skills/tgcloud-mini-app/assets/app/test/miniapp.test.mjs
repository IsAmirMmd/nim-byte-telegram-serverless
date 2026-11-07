// The Mini App's endpoints, offline on the mock SDK.

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { fresh, take, failNext, msg, ctxOf, exec, ADMIN_ID } from './helpers.mjs';
import message from '../tgcloud/handlers/message.js';
import feedback from '../tgcloud/endpoints/feedback.js';

beforeEach(fresh);

const USER = ADMIN_ID + 1;
const code = (c) => (e) => e.parameters?.code === c;

test('feedback: validated, sent to the admin as the verified caller', async () => {
  await message(msg(USER, '/start'), {});
  take();
  await assert.rejects(feedback({ text: '   ' }, ctxOf(USER)), code('BAD_INPUT'));
  await assert.rejects(feedback({ text: 'x'.repeat(2001) }, ctxOf(USER)), code('BAD_INPUT'));
  await assert.rejects(feedback({ text: 42 }, ctxOf(USER)), code('BAD_INPUT'));

  assert.deepEqual(await feedback({ text: 'Nice <b>app</b>', from: ADMIN_ID }, ctxOf(USER)), { ok: true });
  const [sent] = take();
  assert.equal(sent.params.chat_id, ADMIN_ID);
  assert.match(sent.params.text, new RegExp(`<code>${USER}</code>`));   // the caller, not input.from
  assert.match(sent.params.text, /Nice &lt;b&gt;app&lt;\/b&gt;/);
});

test('feedback: only after /start, and at most once a minute', async () => {
  await assert.rejects(feedback({ text: 'hi' }, ctxOf(USER)), code('NOT_STARTED'));
  await message(msg(USER, '/start'), {});
  await feedback({ text: 'one' }, ctxOf(USER));
  await assert.rejects(feedback({ text: 'two' }, ctxOf(USER)), code('TOO_SOON'));

  exec(`UPDATE users SET feedback_at = feedback_at - 61 WHERE user_id = ${USER}`);
  assert.deepEqual(await feedback({ text: 'three' }, ctxOf(USER)), { ok: true });
});

test('feedback: a Bot API failure becomes a clear error', async () => {
  await message(msg(USER, '/start'), {});
  failNext('sendMessage', 403, 'Forbidden: bot can\'t initiate conversation with a user', (p) => p.chat_id === ADMIN_ID);
  await assert.rejects(feedback({ text: 'hi' }, ctxOf(USER)), code('UNAVAILABLE'));
});
