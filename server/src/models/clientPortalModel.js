import { query } from '../config/db.js';

const mapClientProperty = (row) => ({
  id: row.id,
  clientId: row.client_id,
  name: row.name,
  addressLine1: row.address_line1,
  addressLine2: row.address_line2,
  city: row.city,
  postcode: row.postcode,
  accessNotes: row.access_notes,
  jobCount: Number(row.job_count || 0),
  activeJobCount: Number(row.active_job_count || 0),
  completedJobCount: Number(row.completed_job_count || 0),
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const mapClientJob = (row) => ({
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
  variationCount: Number(row.variation_count || 0),
  pendingVariationCount: Number(row.pending_variation_count || 0),
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
        name: row.operative_name
      }
    : null
});

const clientJobSelect = `
  SELECT
    j.*,
    p.name AS property_name,
    p.address_line1,
    p.address_line2,
    p.city,
    p.postcode,
    p.access_notes,
    u.name AS operative_name,
    (
      SELECT COUNT(*)
      FROM job_notes n
      WHERE n.job_id = j.id
    ) AS note_count,
    (
      SELECT COUNT(*)
      FROM job_photos ph
      WHERE ph.job_id = j.id
    ) AS photo_count,
    (
      SELECT COUNT(*)
      FROM variations v
      WHERE v.job_id = j.id
    ) AS variation_count,
    (
      SELECT COUNT(*)
      FROM variations v
      WHERE v.job_id = j.id
        AND v.status = 'pending_client_approval'
    ) AS pending_variation_count
  FROM jobs j
  JOIN clients c ON c.id = j.client_id
  JOIN properties p ON p.id = j.property_id
  LEFT JOIN users u ON u.id = j.assigned_operative_id
`;

export const getLinkedClientForUser = async (userId) => {
  const result = await query(
    `
      SELECT id, name, contact_name, email, phone, billing_address
      FROM clients
      WHERE client_user_id = $1
      LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] || null;
};

export const getClientDashboard = async (userId) => {
  const [metrics, recentJobs, recentVariations] = await Promise.all([
    query(
      `
        SELECT
          (SELECT COUNT(*)
           FROM properties p
           JOIN clients c ON c.id = p.client_id
           WHERE c.client_user_id = $1) AS total_properties,
          (SELECT COUNT(*)
           FROM jobs j
           JOIN clients c ON c.id = j.client_id
           WHERE c.client_user_id = $1
             AND j.status NOT IN ('completed', 'cancelled')) AS active_jobs,
          (SELECT COUNT(*)
           FROM jobs j
           JOIN clients c ON c.id = j.client_id
           WHERE c.client_user_id = $1
             AND j.status = 'completed') AS completed_jobs,
          (SELECT COUNT(*)
           FROM variations v
           JOIN jobs j ON j.id = v.job_id
           JOIN clients c ON c.id = j.client_id
           WHERE c.client_user_id = $1
             AND v.status = 'pending_client_approval') AS pending_variation_approvals
      `,
      [userId]
    ),
    query(
      `
        ${clientJobSelect}
        WHERE c.client_user_id = $1
        ORDER BY j.created_at DESC
        LIMIT 6
      `,
      [userId]
    ),
    query(
      `
        SELECT
          v.id,
          v.description,
          v.status,
          v.admin_price,
          v.created_at,
          j.id AS job_id,
          j.title AS job_title,
          p.name AS property_name
        FROM variations v
        JOIN jobs j ON j.id = v.job_id
        JOIN clients c ON c.id = j.client_id
        JOIN properties p ON p.id = j.property_id
        WHERE c.client_user_id = $1
        ORDER BY v.created_at DESC
        LIMIT 6
      `,
      [userId]
    )
  ]);

  return {
    metrics: {
      totalProperties: Number(metrics.rows[0].total_properties || 0),
      activeJobs: Number(metrics.rows[0].active_jobs || 0),
      completedJobs: Number(metrics.rows[0].completed_jobs || 0),
      pendingVariationApprovals: Number(
        metrics.rows[0].pending_variation_approvals || 0
      )
    },
    recentJobs: recentJobs.rows.map(mapClientJob),
    recentVariations: recentVariations.rows.map((row) => ({
      id: row.id,
      description: row.description,
      status: row.status,
      adminPrice: row.admin_price,
      createdAt: row.created_at,
      job: {
        id: row.job_id,
        title: row.job_title,
        propertyName: row.property_name
      }
    }))
  };
};

export const listClientProperties = async (userId) => {
  const result = await query(
    `
      SELECT
        p.*,
        COUNT(j.id) AS job_count,
        COUNT(j.id) FILTER (
          WHERE j.status NOT IN ('completed', 'cancelled')
        ) AS active_job_count,
        COUNT(j.id) FILTER (
          WHERE j.status = 'completed'
        ) AS completed_job_count
      FROM properties p
      JOIN clients c ON c.id = p.client_id
      LEFT JOIN jobs j ON j.property_id = p.id
      WHERE c.client_user_id = $1
      GROUP BY p.id
      ORDER BY p.name ASC
    `,
    [userId]
  );

  return result.rows.map(mapClientProperty);
};

export const listClientJobs = async ({
  userId,
  search,
  status,
  priority
}) => {
  const values = [userId];
  const conditions = ['c.client_user_id = $1'];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(
      `(j.title ILIKE $${values.length} OR j.description ILIKE $${values.length} OR p.name ILIKE $${values.length} OR p.postcode ILIKE $${values.length})`
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
      ${clientJobSelect}
      WHERE ${conditions.join(' AND ')}
      ORDER BY
        j.scheduled_date ASC NULLS LAST,
        j.due_date ASC NULLS LAST,
        j.created_at DESC
    `,
    values
  );

  return result.rows.map(mapClientJob);
};

export const getClientJobById = async (userId, jobId) => {
  const result = await query(
    `
      ${clientJobSelect}
      WHERE c.client_user_id = $1
        AND j.id = $2
      LIMIT 1
    `,
    [userId, jobId]
  );

  return result.rows[0] ? mapClientJob(result.rows[0]) : null;
};
