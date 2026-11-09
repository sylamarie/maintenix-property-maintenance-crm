import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clearStoredToken, getStoredToken, setStoredToken } from '../../auth/authStorage.js';
import { apiClient, setUnauthorizedHandler } from '../apiClient.js';

// Fake server: every request is answered with the status we choose, and we
// record the request so tests can inspect it.
let lastRequest;
const answerWith = (status) => {
  apiClient.defaults.adapter = (config) => {
    lastRequest = config;
    const response = { status, data: { message: 'x' }, config, headers: {} };

    return status >= 400
      ? Promise.reject(Object.assign(new Error(`HTTP ${status}`), { config, response }))
      : Promise.resolve(response);
  };
};

let handler;

beforeEach(() => {
  handler = vi.fn();
  setUnauthorizedHandler(handler);
  setStoredToken('saved-login-pass');
});

afterEach(() => {
  setUnauthorizedHandler(null);
  clearStoredToken();
});

describe('apiClient', () => {
  it('sends the saved token with every request', async () => {
    answerWith(200);

    await apiClient.get('/jobs');

    expect(lastRequest.headers.Authorization).toBe('Bearer saved-login-pass');
  });

  it('on 401 it clears the saved login and tells the app to sign out', async () => {
    answerWith(401);

    await expect(apiClient.get('/jobs')).rejects.toBeTruthy();

    expect(getStoredToken()).toBeNull();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not sign out on a wrong password at the login form', async () => {
    answerWith(401);

    await expect(apiClient.post('/auth/login', {})).rejects.toBeTruthy();

    expect(getStoredToken()).toBe('saved-login-pass');
    expect(handler).not.toHaveBeenCalled();
  });

  it('does nothing about a 401 when nobody is signed in', async () => {
    clearStoredToken();
    answerWith(401);

    await expect(apiClient.get('/jobs')).rejects.toBeTruthy();

    expect(handler).not.toHaveBeenCalled();
  });

  it('keeps the login for other errors such as 403 or 500', async () => {
    for (const status of [403, 500]) {
      answerWith(status);
      await expect(apiClient.get('/jobs')).rejects.toBeTruthy();
    }

    expect(getStoredToken()).toBe('saved-login-pass');
    expect(handler).not.toHaveBeenCalled();
  });
});
