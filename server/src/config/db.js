import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.databaseUrl,
  connectionTimeoutMillis: env.databaseConnectionTimeoutMs,
  // Free hosted databases allow only a few connections, so keep the pool small.
  max: 10,
  idleTimeoutMillis: 30000
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error);
});

export const query = (text, params) => {
  return pool.query(text, params);
};

export const closePool = async () => {
  await pool.end();
};
