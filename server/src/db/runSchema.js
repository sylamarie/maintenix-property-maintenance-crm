import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import { closePool, query } from '../config/db.js';
import { getDatabaseErrorMessage } from '../utils/databaseError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = await readFile(schemaPath, 'utf8');

  await query(schema);

  console.log('Database schema applied successfully.');
} catch (error) {
  console.error('Failed to apply database schema:');
  console.error(getDatabaseErrorMessage(error));
  process.exitCode = 1;
} finally {
  await closePool();
}
