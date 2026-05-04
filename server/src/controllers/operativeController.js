import {
  getAssignedJobById,
  getOperativeDashboard,
  listAssignedJobs,
  operativeStatuses,
  updateAssignedJobStatus
} from '../models/operativeModel.js';
import { listJobNotes } from '../models/jobNoteModel.js';
import { listJobPhotos } from '../models/jobPhotoModel.js';
import { listVariations } from '../models/variationModel.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  cleanEnum,
  cleanOptionalEnum,
  cleanString
} from '../utils/validators.js';
import { jobPriorities, jobStatuses } from '../models/jobModel.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await getOperativeDashboard(req.user.id);

  res.json(dashboard);
});

export const getJobs = asyncHandler(async (req, res) => {
  const jobs = await listAssignedJobs({
    operativeId: req.user.id,
    search: cleanString(req.query.search),
    status: cleanOptionalEnum(req.query.status, jobStatuses, 'Status'),
    priority: cleanOptionalEnum(req.query.priority, jobPriorities, 'Priority')
  });

  res.json({ jobs });
});

export const getJob = asyncHandler(async (req, res) => {
  const job = await getAssignedJobById(req.params.id, req.user.id);

  if (!job) {
    throw new ApiError(404, 'Assigned job not found.');
  }

  const [notes, photos, variations] = await Promise.all([
    listJobNotes(job.id),
    listJobPhotos(job.id),
    listVariations({
      jobId: job.id,
      operativeId: req.user.id
    })
  ]);

  res.json({ job, notes, photos, variations });
});

export const patchStatus = asyncHandler(async (req, res) => {
  const status = cleanEnum(req.body.status, operativeStatuses, 'Status');
  const job = await updateAssignedJobStatus(req.params.id, req.user.id, status);

  if (!job) {
    throw new ApiError(404, 'Assigned job not found.');
  }

  res.json({ job });
});
