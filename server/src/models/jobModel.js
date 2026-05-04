import { query } from '../config/db.js';

export const jobStatuses = [
  'pending',
  'assigned',
  'in_progress',
  'on_hold',
  'completed',
  'cancelled'
];

export const jobPriorities = ['low', 'medium', 'high', 'urgent'];

const baseSelect = `
  SELECT
    j.*,
    c.name AS client_name,
    p.name AS property_name,
    p.address_line1,
    p.city,
    p.postcode,
    u.name AS operative_name,
    u.email AS operative_email,
    creator.name AS created_by_name
  FROM jobs j
  JOIN clients c ON c.id = j.client_id
  JOIN properties p ON p.id = j.property_id
  LEFT JOIN users u ON u.id = j.assigned_operative_id
  LEFT JOIN users creator ON creator.id = j.created_by
`;

const mapJob = (row) => ({
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
  createdBy: row.created_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  client: {
    id: row.client_id,
    name: row.client_name
  },
  property: {
    id: row.property_id,
    name: row.property_name,
    addressLine1: row.address_line1,
    city: row.city,
    postcode: row.postcode
  },
  assignedOperative: row.assigned_operative_id
    ? {
        id: row.assigned_operative_id,
        name: row.operative_name,
        email: row.operative_email
      }
    : null,
  createdByUser: row.created_by
    ? {
        id: row.created_by,
        name: row.created_by_name
      }
    : null
});

export const listJobs = async ({
  search,
  status,
  priority,
  clientId,
  operativeId,
  scheduledDate
} = {}) => {
  const values = [];
  const conditions = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(
      `(j.title ILIKE $${values.length} OR j.description ILIKE $${values.length} OR c.name ILIKE $${values.length} OR p.name ILIKE $${values.length})`
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

  if (clientId) {
    values.push(clientId);
    conditions.push(`j.client_id = $${values.length}`);
  }

  if (operativeId) {
    values.push(operativeId);
    conditions.push(`j.assigned_operative_id = $${values.length}`);
  }

  if (scheduledDate) {
    values.push(scheduledDate);
    conditions.push(`j.scheduled_date = $${values.length}`);
  }

  const result = await query(
    `
      ${baseSelect}
      ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
      ORDER BY
        j.scheduled_date ASC NULLS LAST,
        j.due_date ASC NULLS LAST,
        j.created_at DESC
    `,
    values
  );

  return result.rows.map(mapJob);
};

export const getJobById = async (id) => {
  const result = await query(
    `
      ${baseSelect}
      WHERE j.id = $1
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] ? mapJob(result.rows[0]) : null;
};

export const getPropertyClientId = async (propertyId) => {
  const result = await query('SELECT client_id FROM properties WHERE id = $1', [
    propertyId
  ]);

  return result.rows[0]?.client_id || null;
};

export const isActiveOperative = async (userId) => {
  if (!userId) {
    return true;
  }

  const result = await query(
    `
      SELECT id
      FROM users
      WHERE id = $1
        AND role = 'operative'
        AND is_active = true
      LIMIT 1
    `,
    [userId]
  );

  return Boolean(result.rows[0]);
};

export const createJob = async (payload) => {
  const result = await query(
    `
      INSERT INTO jobs (
        client_id,
        property_id,
        assigned_operative_id,
        title,
        description,
        status,
        priority,
        scheduled_date,
        due_date,
        completion_date,
        created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `,
    [
      payload.clientId,
      payload.propertyId,
      payload.assignedOperativeId,
      payload.title,
      payload.description,
      payload.status,
      payload.priority,
      payload.scheduledDate,
      payload.dueDate,
      payload.completionDate,
      payload.createdBy
    ]
  );

  return getJobById(result.rows[0].id);
};

export const updateJob = async (id, payload) => {
  const result = await query(
    `
      UPDATE jobs
      SET
        client_id = COALESCE($2, client_id),
        property_id = COALESCE($3, property_id),
        assigned_operative_id = $4,
        title = COALESCE($5, title),
        description = COALESCE($6, description),
        status = COALESCE($7, status),
        priority = COALESCE($8, priority),
        scheduled_date = $9,
        due_date = $10,
        completion_date = $11
      WHERE id = $1
      RETURNING id
    `,
    [
      id,
      payload.clientId,
      payload.propertyId,
      payload.assignedOperativeId,
      payload.title,
      payload.description,
      payload.status,
      payload.priority,
      payload.scheduledDate,
      payload.dueDate,
      payload.completionDate
    ]
  );

  return result.rows[0] ? getJobById(result.rows[0].id) : null;
};

export const updateJobStatus = async (id, status) => {
  const completionDate =
    status === 'completed' ? new Date().toISOString().slice(0, 10) : null;
  const result = await query(
    `
      UPDATE jobs
      SET status = $2,
          completion_date = $3
      WHERE id = $1
      RETURNING id
    `,
    [id, status, completionDate]
  );

  return result.rows[0] ? getJobById(result.rows[0].id) : null;
};

export const assignJob = async (id, operativeId) => {
  const result = await query(
    `
      UPDATE jobs
      SET assigned_operative_id = $2,
          status = CASE
            WHEN $2::uuid IS NOT NULL AND status = 'pending' THEN 'assigned'
            WHEN $2::uuid IS NULL AND status = 'assigned' THEN 'pending'
            ELSE status
          END
      WHERE id = $1
      RETURNING id
    `,
    [id, operativeId]
  );

  return result.rows[0] ? getJobById(result.rows[0].id) : null;
};

export const deleteJob = async (id) => {
  const result = await query('DELETE FROM jobs WHERE id = $1 RETURNING id', [id]);

  return Boolean(result.rows[0]);
};
