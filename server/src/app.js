import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import apiRoutes from './routes/index.js';
import { ApiError } from './utils/apiError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, '..');

const app = express();

// Behind Render/Railway/Vercel there is a proxy in front of the app.
// Trusting it lets rate limiting see each visitor's real IP address.
if (env.nodeEnv === 'production') {
  app.set('trust proxy', 1);
}

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.clientUrls.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new ApiError(403, 'Origin not allowed.'));
    },
    credentials: true
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

if (env.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Uploaded files are served as inert images only: no folder listing, no hidden
// files, and a strict policy so a file can never run scripts even if one slips in.
app.use(
  '/uploads',
  express.static(path.join(serverRoot, env.uploadDir), {
    dotfiles: 'deny',
    index: false,
    setHeaders(res) {
      res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }
  })
);
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Maintenix API is running',
    health: '/api/health'
  });
});

app.use(notFound);
app.use(errorHandler);

export default app;
