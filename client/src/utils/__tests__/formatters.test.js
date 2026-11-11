import { describe, expect, it } from 'vitest';

import {
  formatCurrency,
  formatDate,
  formatJobCode,
  formatOptionalCurrency,
  pluralize
} from '../formatters.js';

describe('formatJobCode', () => {
  it('shortens a long UUID to JOB- plus its first 8 characters, in capitals', () => {
    expect(formatJobCode('17b06486-e5c8-4c42-ade0-1ece80ec1d8b')).toBe('JOB-17B06486');
  });

  it('gives different jobs different codes', () => {
    expect(formatJobCode('23bace92-5408-4cc9-92eb-b5cac4a57a56')).toBe('JOB-23BACE92');
    expect(formatJobCode('6baefe2f-7879-472a-9ecb-2ad92c0801b2')).not.toBe(
      formatJobCode('0a7c1bde-17ad-4335-a764-887666745c74')
    );
  });

  it('never shows the long id', () => {
    expect(formatJobCode('17b06486-e5c8-4c42-ade0-1ece80ec1d8b').length).toBe(12);
  });

  it('copes with a short or missing id instead of crashing', () => {
    expect(formatJobCode('12')).toBe('JOB-12');
    expect(formatJobCode(undefined)).toBe('JOB-');
    expect(formatJobCode(null)).toBe('JOB-');
  });
});

describe('pluralize', () => {
  it('uses the singular for exactly one', () => {
    expect(pluralize(1, 'job')).toBe('1 job');
    expect(pluralize(1, 'property', 'properties')).toBe('1 property');
  });

  it('uses the plural for zero and for many', () => {
    expect(pluralize(0, 'job')).toBe('0 jobs');
    expect(pluralize(3, 'job')).toBe('3 jobs');
    expect(pluralize(0, 'property', 'properties')).toBe('0 properties');
    expect(pluralize(2, 'property', 'properties')).toBe('2 properties');
  });

  it('treats a number that arrives as text (from an API) the same way', () => {
    expect(pluralize('1', 'job')).toBe('1 job');
    expect(pluralize('4', 'job')).toBe('4 jobs');
  });
});

describe('formatDate', () => {
  it('formats a date the UK way', () => {
    expect(formatDate('2026-11-04T12:00:00Z')).toBe('04 Nov 2026');
  });

  it('says "Not set" for a missing date, which suits any labelled field', () => {
    expect(formatDate(null)).toBe('Not set');
    expect(formatDate(undefined)).toBe('Not set');
    expect(formatDate('')).toBe('Not set');
  });

  it('lets a page choose its own words for a missing date', () => {
    expect(formatDate(null, 'Not scheduled')).toBe('Not scheduled');
  });
});

describe('currency', () => {
  it('formats pounds', () => {
    expect(formatCurrency(135)).toBe('£135.00');
    expect(formatCurrency('245')).toBe('£245.00');
  });

  it('says "Not provided" when an optional amount is empty, but still shows a real zero', () => {
    expect(formatOptionalCurrency(null)).toBe('Not provided');
    expect(formatOptionalCurrency('')).toBe('Not provided');
    expect(formatOptionalCurrency(0)).toBe('£0.00');
  });
});
