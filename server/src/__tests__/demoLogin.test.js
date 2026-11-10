import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const queryMock = vi.hoisted(() => vi.fn());
vi.mock('../config/db.js', () => ({
  query: queryMock,
  pool: { on: vi.fn(), end: vi.fn() },
  closePool: vi.fn()
}));

const { default: app } = await import('../app.js');
const { env } = await import('../config/env.js');

const userRow = (overrides = {}) => ({
  id: 'user-1',
  name: 'Maintenix Admin',
  email: 'admin@maintenix.com',
  password_hash: 'not-used-by-demo-login',
  role: 'admin',
  phone: null,
  is_active: true,
  ...overrides
});

const demoLogin = (email) => request(app).post('/api/auth/demo-login').send({ email });

beforeEach(() => {
  queryMock.mockReset();
  env.demoLoginEnabled = false;
});

afterEach(() => {
  env.demoLoginEnabled = false;
});

describe('POST /api/auth/demo-login', () => {
  it('is OFF by default: refuses everyone and never touches the database', async () => {
    const res = await demoLogin('admin@maintenix.com');

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/not enabled/i);
    expect(queryMock).not.toHaveBeenCalled();
  });

  it('when enabled, signs in a demo account without a password', async () => {
    env.demoLoginEnabled = true;
    queryMock.mockResolvedValue({ rows: [userRow()] });

    const res = await demoLogin('admin@maintenix.com');

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({ email: 'admin@maintenix.com', role: 'admin' });
    expect(res.body.user.password_hash).toBeUndefined();
  });

  it('accepts the email in any letter case', async () => {
    env.demoLoginEnabled = true;
    queryMock.mockResolvedValue({ rows: [userRow({ email: 'client@maintenix.com', role: 'client' })] });

    const res = await demoLogin('  Client@Maintenix.com ');

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('client');
  });

  it('never signs in anyone who is not one of the three demo accounts', async () => {
    env.demoLoginEnabled = true;

    const res = await demoLogin('someone.real@company.com');

    expect(res.status).toBe(403);
    expect(queryMock).not.toHaveBeenCalled();
  });

  it('rejects a missing or non-text email', async () => {
    env.demoLoginEnabled = true;

    expect((await request(app).post('/api/auth/demo-login').send({})).status).toBe(403);
    expect((await demoLogin(['admin@maintenix.com'])).status).toBe(403);
    expect(queryMock).not.toHaveBeenCalled();
  });

  it('refuses a demo account that is deactivated or missing', async () => {
    env.demoLoginEnabled = true;

    queryMock.mockResolvedValueOnce({ rows: [userRow({ is_active: false })] });
    expect((await demoLogin('admin@maintenix.com')).status).toBe(401);

    queryMock.mockResolvedValueOnce({ rows: [] });
    expect((await demoLogin('operative@maintenix.com')).status).toBe(401);
  });
});
