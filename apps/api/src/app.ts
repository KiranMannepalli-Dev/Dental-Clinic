import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { requestId } from './middleware/requestId';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Security Middleware
app.use(requestId);
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Always allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) {
      callback(null, true);
      return;
    }
    // In development, allow everything
    if (process.env.NODE_ENV !== 'production') {
      callback(null, true);
      return;
    }
    const cleanOrigin = origin.replace(/\/$/, '');
    // Allow localhost
    if (cleanOrigin.startsWith('http://localhost') || cleanOrigin.startsWith('http://127.0.0.1')) {
      callback(null, true);
      return;
    }
    // Allow any Vercel deployment (*.vercel.app)
    if (cleanOrigin.endsWith('.vercel.app')) {
      callback(null, true);
      return;
    }
    // Allow explicitly configured frontend URL
    const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, '');
    if (frontendUrl && cleanOrigin === frontendUrl) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS: origin "${origin}" not allowed`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
import routes from './routes';
app.use('/api/v1', routes);

// Global Error Handler
app.use(errorHandler);

export default app;
