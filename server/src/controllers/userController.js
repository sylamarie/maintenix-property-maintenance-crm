import { listActiveOperatives } from '../models/userDirectoryModel.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getOperatives = asyncHandler(async (req, res) => {
  const operatives = await listActiveOperatives();

  res.json({ operatives });
});
