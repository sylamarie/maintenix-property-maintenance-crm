import { describe, expect, it, vi } from 'vitest';

import { requireRole } from '../middleware/roleMiddleware.js';

const run = (user, ...roles) => {
  const next = vi.fn();
  requireRole(...roles)({ user }, {}, next);
  return next.mock.calls[0][0];
};

describe('requireRole', () => {
  it('returns 401 when nobody is logged in', () => {
    expect(run(undefined, 'admin').statusCode).toBe(401);
  });

  it('returns 403 when the role is not allowed', () => {
    expect(run({ role: 'client' }, 'admin').statusCode).toBe(403);
  });

  it('lets an allowed role through', () => {
    expect(run({ role: 'operative' }, 'admin', 'operative')).toBeUndefined();
  });
});
