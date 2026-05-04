import { isJobAssignedToOperative } from '../models/operativeModel.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { cleanEnum } from '../utils/validators.js';

const operativeUploadPhotoTypes = ['before', 'after', 'general'];

export const ensureAssignedJobAccess = asyncHandler(async (req, res, next) => {
  const isAssigned = await isJobAssignedToOperative(req.params.jobId, req.user.id);

  if (!isAssigned) {
    throw new ApiError(404, 'Assigned job not found.');
  }

  next();
});

export const validateOperativePhotoType = (req, res, next) => {
  cleanEnum(
    req.body.photoType || req.body.photo_type || 'general',
    operativeUploadPhotoTypes,
    'Photo type'
  );

  next();
};
