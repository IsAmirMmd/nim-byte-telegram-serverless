// Who may call which endpoint. The caller is always ctx.initData.user —
// verified by the platform — never an id sent in the input.

import { EndpointError } from 'sdk';
import { ADMIN_ID } from './config.js';

export const callerId = (ctx) => ctx.initData?.user?.id;

export const forbidden = (message = 'Forbidden') => new EndpointError(message, { code: 'FORBIDDEN' });
export const badInput = (message) => new EndpointError(message, { code: 'BAD_INPUT' });

// For admin-only endpoints. The template ships none; when you add one (the
// tgcloud-bot skill's references/admin-tools.md), call requireAdmin(ctx) first.
export const isAdmin = (ctx) => callerId(ctx) === ADMIN_ID;
export function requireAdmin(ctx) {
  if (!isAdmin(ctx)) throw forbidden('Admins only');
}

// Per-resource access (e.g. one bot serving many groups, each with its own
// managers): look the caller up in a membership table on every call and throw
// forbidden() when they have no row. The client may send any id.
