import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Replace the database so these tests never need PostgreSQL running.
const queryMock = vi.hoisted(() => vi.fn());
vi.mock('../config/db.js', () => ({
  query: queryMock,
  pool: { on: vi.fn(), end: vi.fn() },
  closePool: vi.fn()
}));

const { default: app } = await import('../app.js');

beforeEach(() => {
  queryMock.mockReset();
});

describe('GET /api/health', () => {
  it('returns 200 when the database answers', async () => {
    queryMock.mockResolvedValue({ rows: [{ checked_at: new Date() }] });

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('returns 503 when the database is down', async () => {
    queryMock.mockRejectedValue(new Error('connection refused'));

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(503);
    expect(res.body.status).toBe('degraded');
  });
});

describe('error responses', () => {
  it('404 responses never include a stack trace', async () => {
    const res = await request(app).get('/api/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body.stack).toBeUndefined();
  });

  it('rejects a disallowed CORS origin with 403', async () => {
    const res = await request(app).get('/api/health').set('Origin', 'http://evil.example');

    expect(res.status).toBe(403);
  });
});

describe('protected routes', () => {
  it('rejects requests with no token', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
  });

  it('rejects a token that was not signed by this server', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer not-a-real-token');

    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/login', () => {
  it('requires an email and password', async () => {
    const res = await request(app).post('/api/auth/login').send({});

    expect(res.status).toBe(400);
  });

  it('rejects very long passwords', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'a@b.com', password: 'x'.repeat(500) });

    expect(res.status).toBe(400);
  });
});
