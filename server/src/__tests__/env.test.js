import { describe, expect, it } from 'vitest';

import { assertJwtSecret } from '../config/env.js';

describe('assertJwtSecret', () => {
  it('accepts a long random secret', () => {
    expect(() => assertJwtSecret('a'.repeat(48))).not.toThrow();
  });

  it('rejects a missing secret', () => {
    expect(() => assertJwtSecret('')).toThrow(/JWT_SECRET/);
    expect(() => assertJwtSecret(null)).toThrow(/JWT_SECRET/);
  });

  it('rejects a secret shorter than 32 characters', () => {
    expect(() => assertJwtSecret('x'.repeat(31))).toThrow(/at least 32/);
  });

  it('rejects well-known placeholder secrets', () => {
    expect(() => assertJwtSecret('development_secret_change_me')).toThrow(/JWT_SECRET/);
  });

  it('rejects the placeholder that .env.example used to contain, even though it is long enough', () => {
    const oldExampleValue = 'replace_this_with_a_long_random_secret';

    expect(oldExampleValue.length).toBeGreaterThanOrEqual(32);
    expect(() => assertJwtSecret(oldExampleValue)).toThrow(/JWT_SECRET/);
  });

  it('rejects other placeholder-style text that is long enough to pass the length check', () => {
    expect(() => assertJwtSecret('please_replace_this_with_something_random')).toThrow(/JWT_SECRET/);
    expect(() => assertJwtSecret('CHANGE-ME-before-you-deploy-this-app-ok')).toThrow(/JWT_SECRET/);
  });

  it('accepts real generated secrets (hex and base64)', () => {
    expect(() => assertJwtSecret('3f9a1c7e5b2d48860a1f3c9e7b5d2a4f8c6e1b3d5a7f9c2e')).not.toThrow();
    expect(() => assertJwtSecret('q3Zk8vR1mYt6Wb9LxN2cJp7Hs4DfGa0UeKiVoTrBnMyXw5Sz')).not.toThrow();
  });
});
