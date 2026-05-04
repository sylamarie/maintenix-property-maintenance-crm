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
  jwtSecret: process.env.JWT_SECRET || 'development_secret_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  uploadDir: process.env.UPLOAD_DIR || 'uploads'
};
