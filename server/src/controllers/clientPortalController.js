import { listJobNotes } from '../models/jobNoteModel.js';
import { listJobPhotos } from '../models/jobPhotoModel.js';
import {
  getClientDashboard,
  getClientJobById,
  getLinkedClientForUser,
  listClientJobs,
  listClientProperties
} from '../models/clientPortalModel.js';
import { listVariations } from '../models/variationModel.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  cleanOptionalEnum,
  cleanString
} from '../utils/validators.js';
import { jobPriorities, jobStatuses } from '../models/jobModel.js';

const ensureLinkedClient = async (userId) => {
  const client = await getLinkedClientForUser(userId);

  if (!client) {
    throw new ApiError(
      403,
      'Your user account is not linked to a client record.'
    );
  }

  return client;
};

export const getDashboard = asyncHandler(async (req, res) => {
  await ensureLinkedClient(req.user.id);

  const dashboard = await getClientDashboard(req.user.id);

  res.json(dashboard);
});

export const getProperties = asyncHandler(async (req, res) => {
  await ensureLinkedClient(req.user.id);

  const properties = await listClientProperties(req.user.id);

  res.json({ properties });
});

export const getJobs = asyncHandler(async (req, res) => {
  await ensureLinkedClient(req.user.id);

  const jobs = await listClientJobs({
    userId: req.user.id,
    search: cleanString(req.query.search),
    status: cleanOptionalEnum(req.query.status, jobStatuses, 'Status'),
    priority: cleanOptionalEnum(req.query.priority, jobPriorities, 'Priority')
  });

  res.json({ jobs });
});

export const getJob = asyncHandler(async (req, res) => {
  await ensureLinkedClient(req.user.id);

  const job = await getClientJobById(req.user.id, req.params.id);

  if (!job) {
    throw new ApiError(404, 'Client job not found.');
  }

  const [notes, photos, variations] = await Promise.all([
    listJobNotes(job.id),
    listJobPhotos(job.id),
    listVariations({
      jobId: job.id,
      clientUserId: req.user.id
    })
  ]);

  res.json({ job, notes, photos, variations });
});
