import { getJobById } from '../models/jobModel.js';
import { createJobNote, listJobNotes } from '../models/jobNoteModel.js';
import { isJobAssignedToOperative } from '../models/operativeModel.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { cleanRequiredString } from '../utils/validators.js';

const ensureNoteAccess = async ({ jobId, user }) => {
  if (user.role === 'admin') {
    const job = await getJobById(jobId);

    if (!job) {
      throw new ApiError(404, 'Job not found.');
    }

    return;
  }

  if (user.role === 'operative') {
    const isAssigned = await isJobAssignedToOperative(jobId, user.id);

    if (!isAssigned) {
      throw new ApiError(404, 'Assigned job not found.');
    }

    return;
  }

  throw new ApiError(403, 'You do not have access to this job.');
};

export const getNotesForJob = asyncHandler(async (req, res) => {
  await ensureNoteAccess({
    jobId: req.params.jobId,
    user: req.user
  });

  const notes = await listJobNotes(req.params.jobId);

  res.json({ notes });
});

export const postJobNote = asyncHandler(async (req, res) => {
  const jobId = cleanRequiredString(req.body.jobId, 'Job');
  const noteText = cleanRequiredString(req.body.note, 'Note');

  await ensureNoteAccess({
    jobId,
    user: req.user
  });

  const note = await createJobNote({
    jobId,
    userId: req.user.id,
    note: noteText
  });

  res.status(201).json({ note });
});
