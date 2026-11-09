import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import { findUserByEmail, toPublicUser } from '../models/userModel.js';
import { ApiError } from '../utils/apiError.js';

export const generateToken = (user) => {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn
    }
  );
};

export const loginWithPassword = async ({ email, password }) => {
  const normalisedEmail = email?.trim();

  if (!normalisedEmail || !password) {
    throw new ApiError(400, 'Email and password are required.');
  }

  // Very long strings make bcrypt do needless work, so reject them early.
  if (typeof password !== 'string' || password.length > 128 || normalisedEmail.length > 254) {
    throw new ApiError(400, 'Email or password is too long.');
  }

  const user = await findUserByEmail(normalisedEmail);

  if (!user || !user.is_active) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  return {
    token: generateToken(user),
    user: toPublicUser(user)
  };
};
