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
