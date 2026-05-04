import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import { findUserById, toPublicUser } from '../models/userModel.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getBearerToken = (authorizationHeader) => {
  if (!authorizationHeader?.startsWith('Bearer ')) {
    return null;
  }

  return authorizationHeader.slice('Bearer '.length).trim();
};

export const authenticate = asyncHandler(async (req, res, next) => {
  const token = getBearerToken(req.headers.authorization);

  if (!token) {
    throw new ApiError(401, 'Authentication token is required.');
  }

  let payload;

  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch (error) {
    throw new ApiError(401, 'Authentication token is invalid or expired.');
  }

  if (!payload?.sub) {
    throw new ApiError(401, 'Authentication token is invalid.');
  }

  const user = await findUserById(payload.sub);

  if (!user || !user.is_active) {
    throw new ApiError(401, 'User account is inactive or no longer exists.');
  }

  req.user = toPublicUser(user);
  next();
});
