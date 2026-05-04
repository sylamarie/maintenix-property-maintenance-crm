import { query } from '../config/db.js';

export const variationStatuses = [
  'pending_admin_review',
  'pending_client_approval',
  'approved',
  'rejected'
];

const baseSelect = `
  SELECT
    v.*,
    j.title AS job_title,
    j.description AS job_description,
    j.status AS job_status,
    j.priority AS job_priority,
    j.assigned_operative_id,
    c.id AS client_id,
    c.name AS client_name,
    c.client_user_id,
    p.id AS property_id,
    p.name AS property_name,
    p.address_line1,
    p.city,
    p.postcode,
    raised.name AS raised_by_name,
    raised.role AS raised_by_role,
    reviewed.name AS reviewed_by_name,
    reviewed.role AS reviewed_by_role,
    operative.name AS operative_name
  FROM variations v
  JOIN jobs j ON j.id = v.job_id
  JOIN clients c ON c.id = j.client_id
  JOIN properties p ON p.id = j.property_id
  JOIN users raised ON raised.id = v.raised_by
  LEFT JOIN users reviewed ON reviewed.id = v.reviewed_by
  LEFT JOIN users operative ON operative.id = j.assigned_operative_id
`;

const mapVariation = (row) => ({
  id: row.id,
  jobId: row.job_id,
  raisedById: row.raised_by,
  reviewedById: row.reviewed_by,
  description: row.description,
  reason: row.reason,
  estimatedAmount: row.estimated_amount,
  adminPrice: row.admin_price,
  clientDecisionNote: row.client_decision_note,
  status: row.status,
  photoUrl: row.photo_url,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  job: {
    id: row.job_id,
    title: row.job_title,
    description: row.job_description,
    status: row.job_status,
    priority: row.job_priority,
    assignedOperativeId: row.assigned_operative_id,
    client: {
      id: row.client_id,
      name: row.client_name,
      clientUserId: row.client_user_id
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
          name: row.operative_name
        }
      : null
  },
  raisedBy: {
    id: row.raised_by,
    name: row.raised_by_name,
    role: row.raised_by_role
  },
  reviewedBy: row.reviewed_by
    ? {
        id: row.reviewed_by,
        name: row.reviewed_by_name,
        role: row.reviewed_by_role
      }
    : null
});

export const listVariations = async ({
  search,
  status,
  jobId,
  operativeId,
  clientUserId
} = {}) => {
  const values = [];
  const conditions = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(
      `(v.description ILIKE $${values.length} OR v.reason ILIKE $${values.length} OR j.title ILIKE $${values.length} OR c.name ILIKE $${values.length} OR p.name ILIKE $${values.length} OR raised.name ILIKE $${values.length})`
    );
  }

  if (status) {
    values.push(status);
    conditions.push(`v.status = $${values.length}`);
  }

  if (jobId) {
    values.push(jobId);
    conditions.push(`v.job_id = $${values.length}`);
  }

  if (operativeId) {
    values.push(operativeId);
    conditions.push(`j.assigned_operative_id = $${values.length}`);
  }

  if (clientUserId) {
    values.push(clientUserId);
    conditions.push(`c.client_user_id = $${values.length}`);
  }

  const result = await query(
    `
      ${baseSelect}
      ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
      ORDER BY
        CASE v.status
          WHEN 'pending_admin_review' THEN 1
          WHEN 'pending_client_approval' THEN 2
          WHEN 'approved' THEN 3
          WHEN 'rejected' THEN 4
          ELSE 5
        END,
        v.created_at DESC
    `,
    values
  );

  return result.rows.map(mapVariation);
};

export const getVariationById = async (id) => {
  const result = await query(
    `
      ${baseSelect}
      WHERE v.id = $1
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] ? mapVariation(result.rows[0]) : null;
};

export const createVariation = async ({
  jobId,
  raisedBy,
  description,
  reason,
  estimatedAmount,
  photoUrl
}) => {
  const result = await query(
    `
      INSERT INTO variations (
        job_id,
        raised_by,
        description,
        reason,
        estimated_amount,
        photo_url,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'pending_admin_review')
      RETURNING id
    `,
    [jobId, raisedBy, description, reason, estimatedAmount, photoUrl]
  );

  return getVariationById(result.rows[0].id);
};

export const reviewVariation = async ({
  id,
  reviewedBy,
  adminPrice,
  status
}) => {
  const result = await query(
    `
      UPDATE variations
      SET
        reviewed_by = $2,
        admin_price = $3,
        status = $4::varchar,
        client_decision_note = CASE
          WHEN $4::varchar = 'pending_client_approval' THEN NULL
          ELSE client_decision_note
        END
      WHERE id = $1
      RETURNING id
    `,
    [id, reviewedBy, adminPrice, status]
  );

  return result.rows[0] ? getVariationById(result.rows[0].id) : null;
};

export const decideVariation = async ({
  id,
  status,
  clientDecisionNote
}) => {
  const result = await query(
    `
      UPDATE variations
      SET
        status = $2::varchar,
        client_decision_note = $3
      WHERE id = $1
      RETURNING id
    `,
    [id, status, clientDecisionNote]
  );

  return result.rows[0] ? getVariationById(result.rows[0].id) : null;
};
