import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { DatabaseConnection } from './shared/database/connection';
import { generalLimiter } from './shared/middleware/rateLimiter';
import { ResponseUtil } from './shared/utils/response';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.API_GATEWAY_PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-production-domain.com'] 
    : ['http://localhost:8100', 'http://localhost:4200'],
  credentials: true
}));

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limiting
app.use(generalLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = DatabaseConnection.getInstance().getConnectionStatus();
  ResponseUtil.success(res, {
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: dbStatus ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  }, 'Service is healthy');
});

// API Routes - Proxy to microservices
app.use('/api/v1/auth', createServiceProxy('http://localhost:3001'));
app.use('/api/v1/users', createServiceProxy('http://localhost:3002'));
app.use('/api/v1/quiz', createServiceProxy('http://localhost:3003'));
app.use('/api/v1/progress', createServiceProxy('http://localhost:3004'));
app.use('/api/v1/leaderboard', createServiceProxy('http://localhost:3005'));
app.use('/api/v1/subscription', createServiceProxy('http://localhost:3006'));
app.use('/api/v1/notifications', createServiceProxy('http://localhost:3007'));
app.use('/api/v1/content', createServiceProxy('http://localhost:3008'));
// Lessons are already available through the content service at /api/v1/content/lessons

// Simple proxy function for microservices
function createServiceProxy(serviceUrl: string) {
  return async (req: express.Request, res: express.Response) => {
    try {
      const fetch = (await import('node-fetch')).default;
      const url = `${serviceUrl}${req.path}`;
      const response = await fetch(url, {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          ...req.headers
        } as any,
        body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
      });

      // Check if response has content
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      
      if (contentLength === '0' || !contentType) {
        // Empty response, just forward the status
        res.status(response.status).end();
        return;
      }

      // Handle different content types
      if (contentType && contentType.includes('application/json')) {
        try {
          const data = await response.json();
          res.status(response.status).json(data);
        } catch (jsonError) {
          console.warn(`JSON parsing error for ${serviceUrl}:`, jsonError);
          // Forward the response as-is if JSON parsing fails
          const text = await response.text();
          res.status(response.status).type(contentType).send(text);
        }
      } else {
        // Non-JSON response, forward as-is
        const text = await response.text();
        res.status(response.status).type(contentType).send(text);
      }
    } catch (error) {
      console.error(`Service proxy error for ${serviceUrl}:`, error);
      ResponseUtil.serverError(res, error, 'Service temporarily unavailable');
    }
  };
}

// 404 handler
app.use('*', (req, res) => {
  ResponseUtil.notFound(res, `Route ${req.originalUrl} not found`);
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', error);
  ResponseUtil.serverError(res, error);
});

// Start server
async function startServer() {
  try {
    // Connect to database
    const db = DatabaseConnection.getInstance();
    await db.connect();

    app.listen(PORT, () => {
      console.log(`🚀 API Gateway running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

startServer();
