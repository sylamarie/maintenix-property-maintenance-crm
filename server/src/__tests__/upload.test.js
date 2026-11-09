import express from 'express';
import fs from 'fs';
import path from 'path';
import request from 'supertest';
import { fileURLToPath } from 'url';
import { afterAll, describe, expect, it } from 'vitest';

import { errorHandler } from '../middleware/errorMiddleware.js';
import {
  uploadJobPhotoFile,
  verifyUploadedImage
} from '../middleware/uploadMiddleware.js';

// A tiny app with ONLY the upload steps (login is tested elsewhere).
const app = express();
app.post(
  '/jobs/:jobId/photos',
  uploadJobPhotoFile.single('photo'),
  verifyUploadedImage,
  (req, res) => res.status(201).json({ filename: req.file.filename })
);
app.use(errorHandler);

const jobId = 'test-job-upload';
const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const uploadFolder = path.join(serverRoot, 'uploads', 'jobs', jobId);

// First bytes of a real PNG, JPEG and WEBP file.
const pngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
const jpegBytes = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
const webpBytes = Buffer.concat([
  Buffer.from('RIFF'),
  Buffer.from([0, 0, 0, 0]),
  Buffer.from('WEBP')
]);

const upload = (bytes, filename, contentType) =>
  request(app)
    .post(`/jobs/${jobId}/photos`)
    .attach('photo', bytes, { filename, contentType });

afterAll(() => {
  fs.rmSync(uploadFolder, { recursive: true, force: true });
});

describe('photo uploads', () => {
  it('accepts real PNG, JPEG and WEBP images', async () => {
    expect((await upload(pngBytes, 'a.png', 'image/png')).status).toBe(201);
    expect((await upload(jpegBytes, 'a.jpg', 'image/jpeg')).status).toBe(201);
    expect((await upload(webpBytes, 'a.webp', 'image/webp')).status).toBe(201);
  });

  it('ignores the user file name and picks a safe random name and extension', async () => {
    const res = await upload(pngBytes, 'evil.html', 'image/png');

    expect(res.status).toBe(201);
    expect(res.body.filename).toMatch(/^[0-9a-f-]{36}\.png$/);
    expect(res.body.filename).not.toContain('evil');
  });

  it('rejects HTML pretending to be a PNG, and deletes it', async () => {
    const before = fs.readdirSync(uploadFolder).length;
    const html = Buffer.from('<script>alert(1)</script>');

    const res = await upload(html, 'fake.png', 'image/png');

    expect(res.status).toBe(400);
    expect(fs.readdirSync(uploadFolder).length).toBe(before);
  });

  it('rejects a file type that is not an allowed image', async () => {
    const res = await upload(Buffer.from('<svg></svg>'), 'x.svg', 'image/svg+xml');

    expect(res.status).toBe(400);
  });
});
