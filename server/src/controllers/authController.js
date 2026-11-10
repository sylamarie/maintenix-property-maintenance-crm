import { loginAsDemoUser, loginWithPassword } from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const login = asyncHandler(async (req, res) => {
  const result = await loginWithPassword(req.body || {});

  res.json(result);
});

export const demoLogin = asyncHandler(async (req, res) => {
  const result = await loginAsDemoUser(req.body || {});

  res.json(result);
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({
    user: req.user
  });
});
