// POST /api/feedback { text } — the Mini App's feedback form. Sends the text to
// the admin together with the caller's verified identity. → { ok: true }
// Anyone who opens the Mini App can call this: validate the input and throttle.
// Error messages are for the user, in their language (lib/i18n.js).

import { BotApiError, EndpointError } from 'sdk';
import { badInput, callerId } from '../lib/access.js';
import { forwardFeedback, takeFeedbackSlot, FEEDBACK_MAX } from '../lib/feedback.js';
import { userLang } from '../lib/users.js';
import { t } from '../lib/i18n.js';

export default async function ({ text } = {}, ctx) {
  const lang = await userLang(ctx.initData.user);
  const body = typeof text === 'string' ? text.trim() : '';
  if (!body) throw badInput(t(lang, 'err_empty'));
  if (body.length > FEEDBACK_MAX) throw badInput(t(lang, 'err_too_long', FEEDBACK_MAX));

  const slot = await takeFeedbackSlot(callerId(ctx));
  if (slot === 'not_started') throw new EndpointError(t(lang, 'err_not_started'), { code: 'NOT_STARTED' });
  if (slot === 'wait') throw new EndpointError(t(lang, 'err_too_soon'), { code: 'TOO_SOON' });

  try {
    await forwardFeedback(ctx.initData.user, body);
  } catch (e) {
    if (!(e instanceof BotApiError)) throw e;
    console.error('feedback not delivered (has the admin started the bot?)', e.description);
    throw new EndpointError(t(lang, 'err_unavailable'), { code: 'UNAVAILABLE' });
  }
  return { ok: true };
}
