// Dates for the demo jobs.
//
// They are written as "days from today" (for example due = -1 means "due
// yesterday") instead of fixed dates. A fixed date such as 2026-05-02 looks fine
// on the day it is written, then slowly turns into "months overdue" the longer
// the demo stays online.
//
// The seed script uses these when it creates the demo jobs. On the public demo
// (DEMO_LOGIN_ENABLED=true) the API also re-applies them every few hours, so
// the dashboards always look current. A real deployment never runs this.

export const demoJobs = [
  {
    title: 'Bathroom leak repair',
    property: 'Flat 12, Harbour View Block C',
    scheduled: -2,
    due: -1, // the one overdue job, so the overdue alerts have something to show
    completed: null
  },
  {
    title: 'Communal hallway light replacement',
    property: '24 Maple Court',
    scheduled: 1,
    due: 3,
    completed: null
  },
  {
    title: 'Kitchen cabinet door repair',
    property: '8 King Street',
    scheduled: 3,
    due: 6,
    completed: null
  },
  {
    title: 'Boiler pressure check',
    property: '24 Maple Court',
    scheduled: -8,
    due: -6,
    completed: -7
  },
  {
    title: 'Damaged fence panel replacement',
    property: '8 King Street',
    scheduled: 5,
    due: 12, // far enough away to be "upcoming" but not "due soon"
    completed: null
  }
];

// Turns "N days from today" into a plain date such as '2026-11-14'.
// Uses UTC so the answer does not depend on the computer's time zone.
export const formatDateOffset = (days, today = new Date()) => {
  const date = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + days)
  );

  return date.toISOString().slice(0, 10);
};

export const getDemoJobDates = (job, today = new Date()) => ({
  scheduledDate: formatDateOffset(job.scheduled, today),
  dueDate: formatDateOffset(job.due, today),
  completionDate: job.completed === null ? null : formatDateOffset(job.completed, today)
});

// Looks up a demo job by title. The seed script uses this, and it fails loudly
// if the seed and this file ever disagree about the job titles.
export const getDemoJobDatesByTitle = (title, today = new Date()) => {
  const job = demoJobs.find((item) => item.title === title);

  if (!job) {
    throw new Error(`No demo date schedule for the job "${title}".`);
  }

  return getDemoJobDates(job, today);
};

// Re-applies the schedule to the demo jobs that already exist. It only touches
// dates (never status, notes, or anything a visitor typed) and only the jobs
// matched by title AND property name. Returns how many jobs were updated.
export const refreshDemoJobDates = async (runQuery, today = new Date()) => {
  let updatedJobs = 0;

  for (const job of demoJobs) {
    const dates = getDemoJobDates(job, today);

    const result = await runQuery(
      `
        UPDATE jobs
        SET
          scheduled_date = $1,
          due_date = $2,
          completion_date = COALESCE($3::date, completion_date)
        WHERE title = $4
          AND property_id IN (SELECT id FROM properties WHERE name = $5)
      `,
      [dates.scheduledDate, dates.dueDate, dates.completionDate, job.title, job.property]
    );

    updatedJobs += result.rowCount || 0;
  }

  return updatedJobs;
};

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

// Runs the refresh now and then every few hours. A failure (for example the
// database is still waking up) is logged and retried at the next run; it never
// stops the API. The timer does not keep the process alive on its own.
export const startDemoDateRefresh = (runQuery, intervalMs = SIX_HOURS_MS) => {
  const run = async () => {
    try {
      const updated = await refreshDemoJobDates(runQuery);
      console.log(`Demo mode: refreshed dates on ${updated} demo job(s).`);
    } catch (error) {
      console.warn(`Demo mode: could not refresh demo job dates (${error.message}).`);
    }
  };

  run();

  const timer = setInterval(run, intervalMs);
  timer.unref();

  return timer;
};
