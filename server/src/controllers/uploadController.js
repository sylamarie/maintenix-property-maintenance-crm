import fs from 'fs';

import { createJobPhoto } from '../models/jobPhotoModel.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { cleanEnum, cleanString } from '../utils/validators.js';

const operativeUploadPhotoTypes = ['before', 'after', 'general'];

export const uploadJobPhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Photo file is required.');
  }

  let photoType;

  try {
    photoType = cleanEnum(
      req.body.photoType || req.body.photo_type || 'general',
      operativeUploadPhotoTypes,
      'Photo type'
    );
  } catch (error) {
    fs.rmSync(req.file.path, { force: true });
    throw error;
  }

  const fileUrl = `/uploads/jobs/${req.params.jobId}/${req.file.filename}`;

  let photo;

  try {
    photo = await createJobPhoto({
      jobId: req.params.jobId,
      uploadedBy: req.user.id,
      photoType,
      fileUrl,
      caption: cleanString(req.body.caption)
    });
  } catch (error) {
    // Do not leave an orphan file on disk when the database save fails.
    fs.rmSync(req.file.path, { force: true });
    throw error;
  }

  res.status(201).json({ photo });
});
