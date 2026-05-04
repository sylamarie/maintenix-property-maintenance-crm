import { ApiError } from './apiError.js';

export const requireFields = (body, fields) => {
  const missing = fields.filter((field) => {
    const value = body[field];
    return value === undefined || value === null || String(value).trim() === '';
  });

  if (missing.length > 0) {
    throw new ApiError(400, `Missing required fields: ${missing.join(', ')}`);
  }
};

export const cleanString = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  const cleaned = String(value).trim();
  return cleaned === '' ? null : cleaned;
};

export const cleanRequiredString = (value, fieldName) => {
  const cleaned = cleanString(value);

  if (!cleaned) {
    throw new ApiError(400, `${fieldName} is required.`);
  }

  return cleaned;
};

export const cleanEmail = (value) => {
  const cleaned = cleanRequiredString(value, 'Email').toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
    throw new ApiError(400, 'Email must be a valid email address.');
  }

  return cleaned;
};

export const cleanEnum = (value, allowedValues, fieldName) => {
  const cleaned = cleanRequiredString(value, fieldName).toLowerCase();

  if (!allowedValues.includes(cleaned)) {
    throw new ApiError(
      400,
      `${fieldName} must be one of: ${allowedValues.join(', ')}.`
    );
  }

  return cleaned;
};

export const cleanOptionalEnum = (value, allowedValues, fieldName) => {
  const cleaned = cleanString(value);

  if (!cleaned) {
    return null;
  }

  return cleanEnum(cleaned, allowedValues, fieldName);
};

export const cleanDate = (value, fieldName) => {
  const cleaned = cleanString(value);

  if (!cleaned) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(cleaned);

  if (!match) {
    throw new ApiError(400, `${fieldName} must use YYYY-MM-DD format.`);
  }

  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const isValidDate =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  if (!isValidDate) {
    throw new ApiError(400, `${fieldName} must be a valid calendar date.`);
  }

  return cleaned;
};
