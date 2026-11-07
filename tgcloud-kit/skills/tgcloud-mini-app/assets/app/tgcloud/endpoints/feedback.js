// POST /api/feedback { text } — the Mini App's feedback form. Sends the text to
// the admin together with the caller's verified identity. → { ok: true }
// Anyone who opens the Mini App can call this: validate the input and throttle.

import { BotApiError, EndpointError } from 'sdk';
import { badInput, callerId } from '../lib/access.js';
import { forwardFeedback, takeFeedbackSlot, FEEDBACK_MAX } from '../lib/feedback.js';
import { fa } from '../lib/html.js';

export default async function ({ text } = {}, ctx) {
  const body = typeof text === 'string' ? text.trim() : '';
  if (!body) throw badInput('متن پیام خالیه.');
  if (body.length > FEEDBACK_MAX) throw badInput(`پیام حداکثر ${fa(FEEDBACK_MAX)} کاراکتر می‌تونه باشه.`);

  const slot = await takeFeedbackSlot(callerId(ctx));
  if (slot === 'not_started') throw new EndpointError('اول ربات رو استارت کن، بعد پیام بده.', { code: 'NOT_STARTED' });
  if (slot === 'wait') throw new EndpointError('یه دقیقه صبر کن و دوباره بفرست.', { code: 'TOO_SOON' });

  try {
    await forwardFeedback(ctx.initData.user, body);
  } catch (e) {
    if (!(e instanceof BotApiError)) throw e;
    console.error('feedback not delivered (has the admin started the bot?)', e.description);
    throw new EndpointError('الان نشد پیامت رو برسونم، کمی بعد دوباره امتحان کن.', { code: 'UNAVAILABLE' });
  }
  return { ok: true };
}
