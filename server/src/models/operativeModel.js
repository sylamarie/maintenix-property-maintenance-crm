import { query } from '../config/db.js';

export const operativeStatuses = ['in_progress', 'on_hold', 'completed'];

const baseOperativeJobSelect = `
  SELECT
    j.*,
    c.name AS client_name,
    c.contact_name AS client_contact_name,
    c.email AS client_email,
    c.phone AS client_phone,
    p.name AS property_name,
    p.address_line1,
    p.address_line2,
    p.city,
    p.postcode,
    p.access_notes,
    u.name AS operative_name,
    u.email AS operative_email,
    (
      SELECT COUNT(*)
      FROM job_notes n
      WHERE n.job_id = j.id
    ) AS note_count,
    (
      SELECT COUNT(*)
      FROM job_photos ph
      WHERE ph.job_id = j.id
    ) AS photo_count
  FROM jobs j
  JOIN clients c ON c.id = j.client_id
  JOIN properties p ON p.id = j.property_id
  LEFT JOIN users u ON u.id = j.assigned_operative_id
`;

const mapOperativeJob = (row) => ({
  id: row.id,
  clientId: row.client_id,
  propertyId: row.property_id,
  assignedOperativeId: row.assigned_operative_id,
  title: row.title,
  description: row.description,
  status: row.status,
  priority: row.priority,
  scheduledDate: row.scheduled_date,
  dueDate: row.due_date,
  completionDate: row.completion_date,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  noteCount: Number(row.note_count || 0),
  photoCount: Number(row.photo_count || 0),
  client: {
    id: row.client_id,
    name: row.client_name,
    contactName: row.client_contact_name,
    email: row.client_email,
    phone: row.client_phone
  },
  property: {
    id: row.property_id,
    name: row.property_name,
    addressLine1: row.address_line1,
    addressLine2: row.address_line2,
    city: row.city,
    postcode: row.postcode,
    accessNotes: row.access_notes
  },
  assignedOperative: row.assigned_operative_id
    ? {
        id: row.assigned_operative_id,
        name: row.operative_name,
        email: row.operative_email
      }
    : null
});

export const listAssignedJobs = async ({
  operativeId,
  search,
  status,
  priority
}) => {
  const values = [operativeId];
  const conditions = ['j.assigned_operative_id = $1'];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(
      `(j.title ILIKE $${values.length} OR j.description ILIKE $${values.length} OR c.name ILIKE $${values.length} OR p.name ILIKE $${values.length} OR p.postcode ILIKE $${values.length})`
    );
  }

  if (status) {
    values.push(status);
    conditions.push(`j.status = $${values.length}`);
  }

  if (priority) {
    values.push(priority);
    conditions.push(`j.priority = $${values.length}`);
  }

  const result = await query(
    `
      ${baseOperativeJobSelect}
      WHERE ${conditions.join(' AND ')}
      ORDER BY
        j.scheduled_date ASC NULLS LAST,
        j.due_date ASC NULLS LAST,
        j.created_at DESC
    `,
    values
  );

  return result.rows.map(mapOperativeJob);
};

export const getAssignedJobById = async (jobId, operativeId) => {
  const result = await query(
    `
      ${baseOperativeJobSelect}
      WHERE j.id = $1
        AND j.assigned_operative_id = $2
      LIMIT 1
    `,
    [jobId, operativeId]
  );

  return result.rows[0] ? mapOperativeJob(result.rows[0]) : null;
};

export const isJobAssignedToOperative = async (jobId, operativeId) => {
  const result = await query(
    `
      SELECT id
      FROM jobs
      WHERE id = $1
        AND assigned_operative_id = $2
      LIMIT 1
    `,
    [jobId, operativeId]
  );

  return Boolean(result.rows[0]);
};

export const updateAssignedJobStatus = async (jobId, operativeId, status) => {
  const completionDate =
    status === 'completed' ? new Date().toISOString().slice(0, 10) : null;
  const result = await query(
    `
      UPDATE jobs
      SET status = $3,
          completion_date = $4
      WHERE id = $1
        AND assigned_operative_id = $2
      RETURNING id
    `,
    [jobId, operativeId, status, completionDate]
  );

  return result.rows[0]
    ? getAssignedJobById(result.rows[0].id, operativeId)
    : null;
};

export const getOperativeDashboard = async (operativeId) => {
  const [counts, recentJobs] = await Promise.all([
    query(
      `
        SELECT
          COUNT(*) AS assigned_jobs,
          COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress_jobs,
          COUNT(*) FILTER (WHERE status = 'completed') AS completed_jobs,
          COUNT(*) FILTER (
            WHERE due_date IS NOT NULL
              AND due_date <= CURRENT_DATE + INTERVAL '7 days'
              AND status NOT IN ('completed', 'cancelled')
          ) AS due_soon_jobs
        FROM jobs
        WHERE assigned_operative_id = $1
      `,
      [operativeId]
    ),
    query(
      `
        ${baseOperativeJobSelect}
        WHERE j.assigned_operative_id = $1
        ORDER BY
          j.scheduled_date ASC NULLS LAST,
          j.due_date ASC NULLS LAST,
          j.created_at DESC
        LIMIT 6
      `,
      [operativeId]
    )
  ]);

  return {
    metrics: {
      assignedJobs: Number(counts.rows[0].assigned_jobs || 0),
      inProgressJobs: Number(counts.rows[0].in_progress_jobs || 0),
      completedJobs: Number(counts.rows[0].completed_jobs || 0),
      dueSoonJobs: Number(counts.rows[0].due_soon_jobs || 0)
    },
    recentJobs: recentJobs.rows.map(mapOperativeJob)
  };
};
