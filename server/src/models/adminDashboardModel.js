import { query } from '../config/db.js';

export const getAdminDashboardMetrics = async () => {
  const [counts, statusSummary, recentJobs] = await Promise.all([
    query(`
      SELECT
        (SELECT COUNT(*) FROM clients) AS total_clients,
        (SELECT COUNT(*) FROM properties) AS total_properties,
        (SELECT COUNT(*) FROM jobs WHERE status NOT IN ('completed', 'cancelled')) AS active_jobs,
        (SELECT COUNT(*) FROM jobs WHERE status = 'completed') AS completed_jobs,
        (SELECT COUNT(*) FROM jobs WHERE status = 'pending') AS pending_jobs
    `),
    query(`
      SELECT status, COUNT(*) AS count
      FROM jobs
      GROUP BY status
      ORDER BY status ASC
    `),
    query(`
      SELECT
        j.id,
        j.title,
        j.status,
        j.priority,
        j.scheduled_date,
        j.due_date,
        c.name AS client_name,
        p.name AS property_name,
        u.name AS operative_name
      FROM jobs j
      JOIN clients c ON c.id = j.client_id
      JOIN properties p ON p.id = j.property_id
      LEFT JOIN users u ON u.id = j.assigned_operative_id
      ORDER BY j.created_at DESC
      LIMIT 8
    `)
  ]);

  return {
    metrics: {
      totalClients: Number(counts.rows[0].total_clients),
      totalProperties: Number(counts.rows[0].total_properties),
      activeJobs: Number(counts.rows[0].active_jobs),
      completedJobs: Number(counts.rows[0].completed_jobs),
      pendingJobs: Number(counts.rows[0].pending_jobs)
    },
    statusSummary: statusSummary.rows.map((row) => ({
      status: row.status,
      count: Number(row.count)
    })),
    recentJobs: recentJobs.rows.map((row) => ({
      id: row.id,
      title: row.title,
      status: row.status,
      priority: row.priority,
      scheduledDate: row.scheduled_date,
      dueDate: row.due_date,
      clientName: row.client_name,
      propertyName: row.property_name,
      operativeName: row.operative_name
    }))
  };
};
