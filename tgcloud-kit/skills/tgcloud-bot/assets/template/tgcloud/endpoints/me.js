// POST /api/me — who the Mini App's user is, as the server sees them, plus
// their own row in `users`. The front-end calls it first.
// Only ever the caller's own data: the id comes from the verified init data.

import { callerId } from '../lib/access.js';
import { profileOf } from '../lib/users.js';

export default async function (input, ctx) {
  const user = ctx.initData.user;   // verified by the platform; there is no ctx.user
  const profile = await profileOf(callerId(ctx));
  return {
    id: callerId(ctx),
    first_name: user?.first_name ?? null,
    username: user?.username ?? null,
    ...profile,
  };
}
