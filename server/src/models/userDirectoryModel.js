import { query } from '../config/db.js';
import { toPublicUser } from './userModel.js';

export const listActiveOperatives = async () => {
  const result = await query(
    `
      SELECT
        id,
        name,
        email,
        role,
        phone,
        is_active,
        created_at,
        updated_at
      FROM users
      WHERE role = 'operative'
        AND is_active = true
      ORDER BY name ASC
    `
  );

  return result.rows.map(toPublicUser);
};
