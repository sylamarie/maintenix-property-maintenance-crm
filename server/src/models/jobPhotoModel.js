import { query } from '../config/db.js';

export const photoTypes = ['before', 'after', 'variation', 'general'];

const mapPhoto = (row) => ({
  id: row.id,
  jobId: row.job_id,
  uploadedBy: row.uploaded_by,
  photoType: row.photo_type,
  fileUrl: row.file_url,
  caption: row.caption,
  createdAt: row.created_at,
  uploader: {
    id: row.uploaded_by,
    name: row.uploader_name,
    role: row.uploader_role
  }
});

export const listJobPhotos = async (jobId) => {
  const result = await query(
    `
      SELECT
        p.*,
        u.name AS uploader_name,
        u.role AS uploader_role
      FROM job_photos p
      JOIN users u ON u.id = p.uploaded_by
      WHERE p.job_id = $1
      ORDER BY p.created_at DESC
    `,
    [jobId]
  );

  return result.rows.map(mapPhoto);
};

export const createJobPhoto = async ({
  jobId,
  uploadedBy,
  photoType,
  fileUrl,
  caption
}) => {
  const result = await query(
    `
      INSERT INTO job_photos (job_id, uploaded_by, photo_type, file_url, caption)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `,
    [jobId, uploadedBy, photoType, fileUrl, caption]
  );

  const photos = await listJobPhotos(jobId);
  return photos.find((photo) => photo.id === result.rows[0].id) || photos[0];
};
