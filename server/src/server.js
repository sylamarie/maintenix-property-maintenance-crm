import app from './app.js';
import { pool } from './config/db.js';
import { assertJwtSecret, env } from './config/env.js';

// Refuse to start with a missing, short or placeholder JWT secret.
assertJwtSecret();

const server = app.listen(env.port, () => {
  console.log(`Maintenix API running on port ${env.port}`);
});

// Hosting platforms send SIGTERM when they stop or redeploy the app. Finish
// the requests in progress and close database connections before exiting.
const shutdown = (signal) => {
  console.log(`${signal} received: shutting down.`);

  server.close(async () => {
    try {
      await pool.end();
    } finally {
      process.exit(0);
    }
  });

  // If something hangs, do not wait forever.
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
