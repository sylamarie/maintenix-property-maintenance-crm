import dotenv from 'dotenv';

dotenv.config();

const requiredInProduction = ['CLIENT_URL', 'DATABASE_URL', 'JWT_SECRET'];

if (process.env.NODE_ENV === 'production') {
  requiredInProduction.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  });
}

// The JWT secret signs every login token, so it must be strong in ALL
// environments (not only production). Anyone who knows it can forge logins.
// server.js calls this before the API starts listening, so the API never runs
// with a weak secret. (Database scripts such as db:schema and db:seed do not
// sign logins, so they do not need a secret.)
const knownWeakSecrets = [
  'development_secret_change_me',
  'change_me',
  'secret',
  'your_jwt_secret_here'
];

export const assertJwtSecret = (secret = process.env.JWT_SECRET) => {
  if (!secret || secret.length < 32 || knownWeakSecrets.includes(secret)) {
    throw new Error(
      'JWT_SECRET must be set to a random value of at least 32 characters. ' +
        `Generate one with: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
    );
  }
};

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean),
  databaseUrl:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/maintenix',
  databaseConnectionTimeoutMs:
    Number(process.env.DATABASE_CONNECTION_TIMEOUT_MS) || 5000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  // One-click demo sign-in (see authService.loginAsDemoUser). OFF unless the
  // environment variable DEMO_LOGIN_ENABLED is exactly 'true'.
  demoLoginEnabled: process.env.DEMO_LOGIN_ENABLED === 'true',
  uploadDir: process.env.UPLOAD_DIR || 'uploads'
};
