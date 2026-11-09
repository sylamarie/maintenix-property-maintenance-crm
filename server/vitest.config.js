import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // A fake secret so the app can load in tests. It is not a real credential.
    env: {
      NODE_ENV: 'test',
      JWT_SECRET: 'test-only-secret-that-is-long-enough-0123456789',
      CLIENT_URL: 'http://localhost:5173'
    }
  }
});
