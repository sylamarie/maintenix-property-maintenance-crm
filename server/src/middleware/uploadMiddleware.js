import crypto from 'crypto';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, '..', '..');

// The extension is chosen by US from the validated image type. We never trust
// the extension in the user's file name (a ".html" or ".svg" file could run
// scripts when opened from our own website address).
const extensionByMimeType = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp'
};
const allowedMimeTypes = Object.keys(extensionByMimeType);

// Random names cannot be guessed, so a photo link only works for people who
// were given it.
const getSafeFilename = (file) =>
  `${crypto.randomUUID()}${extensionByMimeType[file.mimetype]}`;

// The first bytes of a real image file always look the same. We check them
// because the "mimetype" a browser reports can be faked.
const hasValidImageSignature = (bytes, mimetype) => {
  if (mimetype === 'image/jpeg') {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (mimetype === 'image/png') {
    return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
      (byte, index) => bytes[index] === byte
    );
  }

  if (mimetype === 'image/webp') {
    return (
      bytes.subarray(0, 4).toString('ascii') === 'RIFF' &&
      bytes.subarray(8, 12).toString('ascii') === 'WEBP'
    );
  }

  return false;
};

// Runs AFTER multer has saved the file. Deletes it if the content is not
// really the image type it claims to be.
export const verifyUploadedImage = (req, res, next) => {
  if (!req.file) {
    next();
    return;
  }

  let isValid = false;

  try {
    const fileDescriptor = fs.openSync(req.file.path, 'r');
    const bytes = Buffer.alloc(12);

    try {
      fs.readSync(fileDescriptor, bytes, 0, 12, 0);
    } finally {
      fs.closeSync(fileDescriptor);
    }

    isValid = hasValidImageSignature(bytes, req.file.mimetype);
  } catch {
    isValid = false;
  }

  if (!isValid) {
    fs.rmSync(req.file.path, { force: true });
    next(new ApiError(400, 'The uploaded file is not a valid JPEG, PNG, or WEBP image.'));
    return;
  }

  next();
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
    callback(null, getSafeFilename(file));
  }
});

const variationPhotoStorage = multer.diskStorage({
  destination(req, file, callback) {
    const destination = path.join(serverRoot, env.uploadDir, 'variations');
    fs.mkdirSync(destination, { recursive: true });
    callback(null, destination);
  },
  filename(req, file, callback) {
    callback(null, getSafeFilename(file));
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
