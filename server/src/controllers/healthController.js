import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getDatabaseErrorCode,
  getDatabaseErrorMessage
} from '../utils/databaseError.js';

export const getHealth = asyncHandler(async (req, res) => {
  let database;

  try {
    const result = await query('SELECT NOW() AS checked_at');
    database = {
      status: 'connected',
      checkedAt: result.rows[0].checked_at
    };
  } catch (error) {
    database = {
      status: 'unavailable',
      message:
        process.env.NODE_ENV === 'production'
          ? 'PostgreSQL connection failed'
          : getDatabaseErrorMessage(error),
      code: getDatabaseErrorCode(error)
    };
  }

  const isHealthy = database.status === 'connected';

  // 503 lets hosting platforms detect that the database is down.
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    service: 'maintenix-api',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database
  });
});
