import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { DatabaseConnection } from '../../shared/database/connection';
import { ResponseUtil } from '../../shared/utils/response';
import { LessonSeeder } from './seeders/lessonSeeder';
import lessonRoutes from './routes/lessonRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.CONTENT_SERVICE_PORT || 3008;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-production-domain.com'] 
    : ['http://localhost:8100', 'http://localhost:4200', 'http://localhost:3000'],
  credentials: true
}));

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  const dbStatus = DatabaseConnection.getInstance().getConnectionStatus();
  ResponseUtil.success(res, {
    service: 'Content Service',
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: dbStatus ? 'connected' : 'disconnected',
    uptime: process.uptime()
  }, 'Content service is healthy');
});

// Seed data endpoint (for development)
app.post('/seed', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return ResponseUtil.forbidden(res, 'Seeding not allowed in production');
    }
    
    await LessonSeeder.seedLessons();
    ResponseUtil.success(res, null, 'Lesson data seeded successfully');
  } catch (error) {
    console.error('Seeding error:', error);
    ResponseUtil.serverError(res, error);
  }
});

// Routes
app.use('/lessons', lessonRoutes);

// Default route for content service
app.get('/', (req, res) => {
  ResponseUtil.success(res, {
    service: 'Content Service',
    version: '1.0.0',
    endpoints: [
      'GET /lessons - Get all lessons',
      'GET /lessons/popular - Get popular lessons',
      'GET /lessons/category/:categoryId - Get lessons by category',
      'GET /lessons/:id - Get lesson by ID',
      'GET /lessons/search?q=query - Search lessons',
      'POST /seed - Seed lesson data (dev only)'
    ]
  }, 'Content service API');
});

// 404 handler
app.use('*', (req, res) => {
  ResponseUtil.notFound(res, `Content service route ${req.originalUrl} not found`);
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Content service error:', error);
  ResponseUtil.serverError(res, error);
});

// Start server
async function startServer() {
  try {
    // Connect to database
    const db = DatabaseConnection.getInstance();
    await db.connect();

    // Seed initial data in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Seeding initial lesson data...');
      await LessonSeeder.seedLessons();
    }

    app.listen(PORT, () => {
      console.log(`📚 Content Service running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start Content service:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Content Service - Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Content Service - Unhandled Rejection:', error);
  process.exit(1);
});

startServer();
