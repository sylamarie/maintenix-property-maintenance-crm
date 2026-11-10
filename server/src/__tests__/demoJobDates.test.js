import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  demoJobs,
  formatDateOffset,
  getDemoJobDates,
  getDemoJobDatesByTitle,
  refreshDemoJobDates,
  startDemoDateRefresh
} from '../db/demoJobDates.js';

// A fixed "today" so the tests give the same answer on every day they run.
const TODAY = new Date('2026-11-10T09:30:00Z');

describe('formatDateOffset', () => {
  it('moves forward and backward from today', () => {
    expect(formatDateOffset(0, TODAY)).toBe('2026-11-10');
    expect(formatDateOffset(3, TODAY)).toBe('2026-11-13');
    expect(formatDateOffset(-1, TODAY)).toBe('2026-11-09');
  });

  it('handles the end of a month and the end of a year', () => {
    expect(formatDateOffset(2, new Date('2026-12-30T12:00:00Z'))).toBe('2027-01-01');
    expect(formatDateOffset(-1, new Date('2026-03-01T12:00:00Z'))).toBe('2026-02-28');
  });

  it('gives the same date whatever the time of day is', () => {
    expect(formatDateOffset(1, new Date('2026-11-10T00:00:01Z'))).toBe('2026-11-11');
    expect(formatDateOffset(1, new Date('2026-11-10T23:59:59Z'))).toBe('2026-11-11');
  });
});

describe('the demo job schedule', () => {
  const dates = demoJobs.map((job) => ({ job, ...getDemoJobDates(job, TODAY) }));
  const unfinished = dates.filter(({ job }) => job.completed === null);

  it('is relative to today, so it never ages', () => {
    const inTenDays = new Date('2026-11-20T09:30:00Z');

    expect(getDemoJobDates(demoJobs[0], inTenDays).dueDate).not.toBe(
      getDemoJobDates(demoJobs[0], TODAY).dueDate
    );
  });

  it('never schedules a job after its due date', () => {
    dates.forEach(({ scheduledDate, dueDate }) => {
      expect(scheduledDate <= dueDate).toBe(true);
    });
  });

  it('shows exactly one overdue job, so the overdue alerts have something to show', () => {
    const overdue = unfinished.filter(({ dueDate }) => dueDate < '2026-11-10');

    expect(overdue).toHaveLength(1);
    expect(overdue[0].job.title).toBe('Bathroom leak repair');
  });

  it('has jobs due within the next 7 days and one further away', () => {
    const dueSoon = unfinished.filter(
      ({ dueDate }) => dueDate >= '2026-11-10' && dueDate <= '2026-11-17'
    );
    const dueLater = unfinished.filter(({ dueDate }) => dueDate > '2026-11-17');

    expect(dueSoon.length).toBeGreaterThanOrEqual(2);
    expect(dueLater.length).toBeGreaterThanOrEqual(1);
  });

  it('gives the completed job a completion date in the past', () => {
    const completed = dates.filter(({ job }) => job.completed !== null);

    expect(completed).toHaveLength(1);
    expect(completed[0].completionDate < '2026-11-10').toBe(true);
  });
});

describe('getDemoJobDatesByTitle', () => {
  it('finds a demo job by its title', () => {
    expect(getDemoJobDatesByTitle('Boiler pressure check', TODAY)).toEqual({
      scheduledDate: '2026-11-02',
      dueDate: '2026-11-04',
      completionDate: '2026-11-03'
    });
  });

  it('fails loudly for a title it does not know, so the seed cannot drift out of step', () => {
    expect(() => getDemoJobDatesByTitle('Some other job', TODAY)).toThrow(/Some other job/);
  });
});

describe('refreshDemoJobDates', () => {
  it('updates every demo job and reports how many rows changed', async () => {
    const runQuery = vi.fn().mockResolvedValue({ rowCount: 1 });

    const updated = await refreshDemoJobDates(runQuery, TODAY);

    expect(updated).toBe(demoJobs.length);
    expect(runQuery).toHaveBeenCalledTimes(demoJobs.length);

    const [, firstParams] = runQuery.mock.calls[0];
    expect(firstParams).toEqual([
      '2026-11-08', // scheduled
      '2026-11-09', // due
      null, // not completed
      'Bathroom leak repair',
      'Flat 12, Harbour View Block C'
    ]);
  });

  it('only ever changes dates, never status or anything a visitor typed', async () => {
    const runQuery = vi.fn().mockResolvedValue({ rowCount: 1 });

    await refreshDemoJobDates(runQuery, TODAY);

    runQuery.mock.calls.forEach(([sql]) => {
      expect(sql).not.toMatch(/\bstatus\b|description|notes/i);
      expect(sql).toMatch(/scheduled_date/);
      expect(sql).toMatch(/due_date/);
    });
  });

  it('counts only the rows that were really found and updated', async () => {
    const runQuery = vi
      .fn()
      .mockResolvedValueOnce({ rowCount: 1 })
      .mockResolvedValue({ rowCount: 0 });

    expect(await refreshDemoJobDates(runQuery, TODAY)).toBe(1);
  });
});

describe('startDemoDateRefresh', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('refreshes straight away and then again on every interval', async () => {
    const runQuery = vi.fn().mockResolvedValue({ rowCount: 1 });

    const timer = startDemoDateRefresh(runQuery, 1000);

    await vi.advanceTimersByTimeAsync(0);
    expect(runQuery).toHaveBeenCalledTimes(demoJobs.length);

    await vi.advanceTimersByTimeAsync(1000);
    expect(runQuery).toHaveBeenCalledTimes(demoJobs.length * 2);

    clearInterval(timer);
  });

  it('logs a database problem and carries on instead of crashing the API', async () => {
    const runQuery = vi.fn().mockRejectedValue(new Error('database is waking up'));

    const timer = startDemoDateRefresh(runQuery, 1000);

    await vi.advanceTimersByTimeAsync(1000);

    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('database is waking up'));
    // It tried again on the next interval rather than giving up.
    expect(runQuery.mock.calls.length).toBeGreaterThanOrEqual(2);

    clearInterval(timer);
  });
});
