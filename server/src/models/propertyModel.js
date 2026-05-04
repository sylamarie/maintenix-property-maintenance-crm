import { query } from '../config/db.js';

const mapProperty = (row) => ({
  id: row.id,
  clientId: row.client_id,
  clientName: row.client_name,
  name: row.name,
  addressLine1: row.address_line1,
  addressLine2: row.address_line2,
  city: row.city,
  postcode: row.postcode,
  accessNotes: row.access_notes,
  jobCount: Number(row.job_count || 0),
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

export const listProperties = async ({ search, clientId, postcode } = {}) => {
  const values = [];
  const conditions = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(
      `(p.name ILIKE $${values.length} OR p.address_line1 ILIKE $${values.length} OR p.city ILIKE $${values.length} OR p.postcode ILIKE $${values.length} OR c.name ILIKE $${values.length})`
    );
  }

  if (clientId) {
    values.push(clientId);
    conditions.push(`p.client_id = $${values.length}`);
  }

  if (postcode) {
    values.push(`%${postcode}%`);
    conditions.push(`p.postcode ILIKE $${values.length}`);
  }

  const result = await query(
    `
      SELECT
        p.*,
        c.name AS client_name,
        COUNT(j.id) AS job_count
      FROM properties p
      JOIN clients c ON c.id = p.client_id
      LEFT JOIN jobs j ON j.property_id = p.id
      ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
      GROUP BY p.id, c.name
      ORDER BY c.name ASC, p.name ASC
    `,
    values
  );

  return result.rows.map(mapProperty);
};

export const getPropertyById = async (id) => {
  const result = await query(
    `
      SELECT
        p.*,
        c.name AS client_name,
        COUNT(j.id) AS job_count
      FROM properties p
      JOIN clients c ON c.id = p.client_id
      LEFT JOIN jobs j ON j.property_id = p.id
      WHERE p.id = $1
      GROUP BY p.id, c.name
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] ? mapProperty(result.rows[0]) : null;
};

export const createProperty = async (payload) => {
  const result = await query(
    `
      INSERT INTO properties (
        client_id,
        name,
        address_line1,
        address_line2,
        city,
        postcode,
        access_notes
      )
      VALUES ($1, $2, $3, $4, $5, UPPER($6), $7)
      RETURNING *
    `,
    [
      payload.clientId,
      payload.name,
      payload.addressLine1,
      payload.addressLine2,
      payload.city,
      payload.postcode,
      payload.accessNotes
    ]
  );

  return getPropertyById(result.rows[0].id);
};

export const updateProperty = async (id, payload) => {
  const result = await query(
    `
      UPDATE properties
      SET
        client_id = COALESCE($2, client_id),
        name = COALESCE($3, name),
        address_line1 = COALESCE($4, address_line1),
        address_line2 = $5,
        city = COALESCE($6, city),
        postcode = COALESCE(UPPER($7), postcode),
        access_notes = $8
      WHERE id = $1
      RETURNING id
    `,
    [
      id,
      payload.clientId,
      payload.name,
      payload.addressLine1,
      payload.addressLine2,
      payload.city,
      payload.postcode,
      payload.accessNotes
    ]
  );

  return result.rows[0] ? getPropertyById(result.rows[0].id) : null;
};

export const deleteProperty = async (id) => {
  const result = await query(
    'DELETE FROM properties WHERE id = $1 RETURNING id',
    [id]
  );

  return Boolean(result.rows[0]);
};
