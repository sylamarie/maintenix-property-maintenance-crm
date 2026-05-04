import { query } from '../config/db.js';

const userFields = `
  id,
  name,
  email,
  password_hash,
  role,
  phone,
  is_active,
  created_at,
  updated_at
`;

export const toPublicUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    isActive: user.is_active,
    createdAt: user.created_at,
    updatedAt: user.updated_at
  };
};

export const findUserByEmail = async (email) => {
  const result = await query(
    `
      SELECT ${userFields}
      FROM users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
    `,
    [email]
  );

  return result.rows[0] || null;
};

export const findUserById = async (id) => {
  const result = await query(
    `
      SELECT ${userFields}
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] || null;
};
