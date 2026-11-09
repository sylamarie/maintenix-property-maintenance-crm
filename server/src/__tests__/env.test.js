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
});
