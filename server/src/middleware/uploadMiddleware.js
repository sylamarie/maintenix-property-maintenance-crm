import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, '..', '..');

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

const getSafeFilename = (originalName, fallbackName) => {
  const extension = path.extname(originalName).toLowerCase() || '.jpg';
  const safeName = path
    .basename(originalName, extension)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  const uniquePart = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

  return `${safeName || fallbackName}-${uniquePart}${extension}`;
};

const fileFilter = (req, file, callback) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    callback(new ApiError(400, 'Only JPEG, PNG, and WEBP images are allowed.'));
    return;
  }

  callback(null, true);
};

const jobPhotoStorage = multer.diskStorage({
  destination(req, file, callback) {
    const destination = path.join(serverRoot, env.uploadDir, 'jobs', req.params.jobId);
    fs.mkdirSync(destination, { recursive: true });
    callback(null, destination);
  },
  filename(req, file, callback) {
    callback(null, getSafeFilename(file.originalname, 'job-photo'));
  }
});

const variationPhotoStorage = multer.diskStorage({
  destination(req, file, callback) {
    const destination = path.join(serverRoot, env.uploadDir, 'variations');
    fs.mkdirSync(destination, { recursive: true });
    callback(null, destination);
  },
  filename(req, file, callback) {
    callback(null, getSafeFilename(file.originalname, 'variation-photo'));
  }
});

export const uploadJobPhotoFile = multer({
  storage: jobPhotoStorage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter
});

export const uploadVariationPhotoFile = multer({
  storage: variationPhotoStorage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter
});
