import { closePool, query } from '../config/db.js';
import {
  getDatabaseErrorCode,
  getDatabaseErrorMessage
} from '../utils/databaseError.js';

try {
  const result = await query('SELECT NOW() AS connected_at');
  console.log('PostgreSQL connected at:', result.rows[0].connected_at);
} catch (error) {
  console.error('PostgreSQL connection failed:');
  console.error(getDatabaseErrorMessage(error));

  const code = getDatabaseErrorCode(error);

  if (code) {
    console.error('Error code:', code);
  }

  process.exitCode = 1;
} finally {
  await closePool();
}
