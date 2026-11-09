import request from 'supertest';
import { expect, it, vi } from 'vitest';

// Its own file so the rate limiter starts fresh (each test file gets its own
// copy of the app). Failed requests from earlier tests would otherwise count.
const queryMock = vi.hoisted(() => vi.fn());
vi.mock('../config/db.js', () => ({
  query: queryMock,
  pool: { on: vi.fn(), end: vi.fn() },
  closePool: vi.fn()
}));

const { default: app } = await import('../app.js');

it('blocks an IP after 5 failed logins', async () => {
  queryMock.mockResolvedValue({ rows: [] }); // no such user -> 401 each time

  const statuses = [];
  for (let i = 0; i < 6; i += 1) {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'wrong-password' });
    statuses.push(res.status);
  }

  expect(statuses.slice(0, 5)).toEqual([401, 401, 401, 401, 401]);
  expect(statuses[5]).toBe(429);
});
