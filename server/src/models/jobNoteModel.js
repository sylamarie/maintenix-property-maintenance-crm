import { query } from '../config/db.js';

const mapNote = (row) => ({
  id: row.id,
  jobId: row.job_id,
  userId: row.user_id,
  note: row.note,
  createdAt: row.created_at,
  author: {
    id: row.user_id,
    name: row.author_name,
    role: row.author_role
  }
});

export const listJobNotes = async (jobId) => {
  const result = await query(
    `
      SELECT
        n.*,
        u.name AS author_name,
        u.role AS author_role
      FROM job_notes n
      JOIN users u ON u.id = n.user_id
      WHERE n.job_id = $1
      ORDER BY n.created_at DESC
    `,
    [jobId]
  );

  return result.rows.map(mapNote);
};

export const createJobNote = async ({ jobId, userId, note }) => {
  const result = await query(
    `
      INSERT INTO job_notes (job_id, user_id, note)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
    [jobId, userId, note]
  );

  const [createdNote] = await listJobNotes(result.rows[0].job_id);
  return createdNote;
};
