import { query } from '../config/db.js';
import { listJobNotes } from './jobNoteModel.js';
import { listJobPhotos } from './jobPhotoModel.js';
import { listVariations } from './variationModel.js';

const mapReportJob = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  status: row.status,
  priority: row.priority,
  scheduledDate: row.scheduled_date,
  dueDate: row.due_date,
  completionDate: row.completion_date,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  clientId: row.client_id,
  assignedOperativeId: row.assigned_operative_id,
  client: {
    id: row.client_id,
    name: row.client_name,
    contactName: row.client_contact_name,
    email: row.client_email,
    phone: row.client_phone,
    billingAddress: row.billing_address,
    clientUserId: row.client_user_id
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
        email: row.operative_email,
        phone: row.operative_phone
      }
    : null
});

export const getJobReport = async (jobId) => {
  const result = await query(
    `
      SELECT
        j.*,
        c.name AS client_name,
        c.contact_name AS client_contact_name,
        c.email AS client_email,
        c.phone AS client_phone,
        c.billing_address,
        c.client_user_id,
        p.name AS property_name,
        p.address_line1,
        p.address_line2,
        p.city,
        p.postcode,
        p.access_notes,
        u.name AS operative_name,
        u.email AS operative_email,
        u.phone AS operative_phone
      FROM jobs j
      JOIN clients c ON c.id = j.client_id
      JOIN properties p ON p.id = j.property_id
      LEFT JOIN users u ON u.id = j.assigned_operative_id
      WHERE j.id = $1
      LIMIT 1
    `,
    [jobId]
  );

  if (!result.rows[0]) {
    return null;
  }

  const job = mapReportJob(result.rows[0]);
  const [notes, photos, variations] = await Promise.all([
    listJobNotes(job.id),
    listJobPhotos(job.id),
    listVariations({ jobId: job.id })
  ]);

  return {
    job,
    notes,
    photos,
    variations
  };
};
