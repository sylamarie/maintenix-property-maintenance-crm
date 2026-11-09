import { describe, expect, it } from 'vitest';

import { buildPaginationMeta, cleanSearch, parsePagination } from '../utils/pagination.js';

describe('parsePagination', () => {
  it('returns null when the request does not ask for pages (full list)', () => {
    expect(parsePagination({})).toBeNull();
    expect(parsePagination({ status: 'pending' })).toBeNull();
  });

  it('uses defaults when only page is given', () => {
    expect(parsePagination({ page: '1' })).toEqual({ page: 1, limit: 20, offset: 0 });
  });

  it('calculates the offset for later pages', () => {
    expect(parsePagination({ page: '3', limit: '10' })).toEqual({
      page: 3,
      limit: 10,
      offset: 20
    });
  });

  it('caps the limit at 100 and fixes bad numbers', () => {
    expect(parsePagination({ page: '1', limit: '9999' }).limit).toBe(100);
    expect(parsePagination({ page: '-4', limit: 'abc' })).toEqual({
      page: 1,
      limit: 20,
      offset: 0
    });
    expect(parsePagination({ page: '0', limit: '0' }).page).toBe(1);
  });
});

describe('buildPaginationMeta', () => {
  it('rounds the page count up and never goes below 1', () => {
    expect(buildPaginationMeta({ page: 1, limit: 10 }, 21).totalPages).toBe(3);
    expect(buildPaginationMeta({ page: 1, limit: 10 }, 0).totalPages).toBe(1);
  });
});

describe('cleanSearch', () => {
  it('trims, caps the length and turns empty text into null', () => {
    expect(cleanSearch('  boiler  ')).toBe('boiler');
    expect(cleanSearch('   ')).toBeNull();
    expect(cleanSearch('x'.repeat(500))).toHaveLength(100);
  });
});
