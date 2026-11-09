import { ApiError } from '../utils/apiError.js';

export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (error, req, res, next) => {
  const postgresStatusMap = {
    '23503': 409,
    '23505': 409,
    '23514': 400,
    '22P02': 400
  };
  const postgresMessageMap = {
    '23503': 'This record is linked to other records and cannot be removed.',
    '23505': 'A record with those details already exists.',
    '23514': 'The submitted data does not satisfy the required constraints.',
    '22P02': 'One or more submitted identifiers are invalid.'
  };
  const uploadStatusMap = {
    LIMIT_FILE_SIZE: 400,
    LIMIT_UNEXPECTED_FILE: 400
  };
  const uploadMessageMap = {
    LIMIT_FILE_SIZE: 'Uploaded files must be 5MB or smaller.',
    LIMIT_UNEXPECTED_FILE: 'Unexpected upload field. Use the field name "photo".'
  };
  const statusCode =
    error.statusCode ||
    postgresStatusMap[error.code] ||
    uploadStatusMap[error.code] ||
    500;
  // Unexpected 500 errors never send their raw message to the browser,
  // because it can reveal internals (SQL, file paths, library details).
  const isUnexpectedServerError = statusCode >= 500 && !error.statusCode;
  const resolvedMessage = isUnexpectedServerError
    ? 'Something went wrong. Please try again.'
    : error.statusCode
      ? error.message || 'Something went wrong'
      : uploadMessageMap[error.code] ||
        postgresMessageMap[error.code] ||
        error.message ||
        'Something went wrong';

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    message: resolvedMessage,
    details: error.details || null
  });
};
