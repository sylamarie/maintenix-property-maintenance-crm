import { query } from '../config/db.js';

const mapClient = (row) => ({
  id: row.id,
  name: row.name,
  contactName: row.contact_name,
  email: row.email,
  phone: row.phone,
  billingAddress: row.billing_address,
  propertyCount: Number(row.property_count || 0),
  jobCount: Number(row.job_count || 0),
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

export const listClients = async ({ search } = {}) => {
  const values = [];
  const conditions = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(
      `(c.name ILIKE $${values.length} OR c.contact_name ILIKE $${values.length} OR c.email ILIKE $${values.length})`
    );
  }

  const result = await query(
    `
      SELECT
        c.*,
        COUNT(DISTINCT p.id) AS property_count,
        COUNT(DISTINCT j.id) AS job_count
      FROM clients c
      LEFT JOIN properties p ON p.client_id = c.id
      LEFT JOIN jobs j ON j.client_id = c.id
      ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
      GROUP BY c.id
      ORDER BY c.name ASC
    `,
    values
  );

  return result.rows.map(mapClient);
};

export const getClientById = async (id) => {
  const result = await query(
    `
      SELECT
        c.*,
        COUNT(DISTINCT p.id) AS property_count,
        COUNT(DISTINCT j.id) AS job_count
      FROM clients c
      LEFT JOIN properties p ON p.client_id = c.id
      LEFT JOIN jobs j ON j.client_id = c.id
      WHERE c.id = $1
      GROUP BY c.id
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] ? mapClient(result.rows[0]) : null;
};

export const createClient = async (payload) => {
  const result = await query(
    `
      INSERT INTO clients (name, contact_name, email, phone, billing_address)
      VALUES ($1, $2, LOWER($3), $4, $5)
      RETURNING *
    `,
    [
      payload.name,
      payload.contactName,
      payload.email,
      payload.phone,
      payload.billingAddress
    ]
  );

  return mapClient(result.rows[0]);
};

export const updateClient = async (id, payload) => {
  const result = await query(
    `
      UPDATE clients
      SET
        name = COALESCE($2, name),
        contact_name = COALESCE($3, contact_name),
        email = COALESCE(LOWER($4), email),
        phone = $5,
        billing_address = $6
      WHERE id = $1
      RETURNING *
    `,
    [
      id,
      payload.name,
      payload.contactName,
      payload.email,
      payload.phone,
      payload.billingAddress
    ]
  );

  return result.rows[0] ? mapClient(result.rows[0]) : null;
};

export const deleteClient = async (id) => {
  const result = await query('DELETE FROM clients WHERE id = $1 RETURNING id', [
    id
  ]);

  return Boolean(result.rows[0]);
};
