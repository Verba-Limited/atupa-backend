import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { DatabaseConnection } from '../../shared/database/connection';
import { ResponseUtil } from '../../shared/utils/response';
import { QuizSeeder } from './seeders/quizSeeder';
import quizRoutes from './routes/quizRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.QUIZ_SERVICE_PORT || 3003;

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
    service: 'Quiz Service',
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: dbStatus ? 'connected' : 'disconnected',
    uptime: process.uptime()
  }, 'Quiz service is healthy');
});

// Seed data endpoint (for development)
app.post('/seed', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return ResponseUtil.forbidden(res, 'Seeding not allowed in production');
    }
    
    await QuizSeeder.seedAll();
    ResponseUtil.success(res, null, 'Quiz data seeded successfully');
  } catch (error) {
    console.error('Seeding error:', error);
    ResponseUtil.serverError(res, error);
  }
});

// Routes
app.use('/', quizRoutes);

// 404 handler
app.use('*', (req, res) => {
  ResponseUtil.notFound(res, `Quiz service route ${req.originalUrl} not found`);
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Quiz service error:', error);
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
      console.log('Seeding initial quiz data...');
      await QuizSeeder.seedAll();
    }

    app.listen(PORT, () => {
      console.log(`🧠 Quiz Service running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start Quiz service:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Quiz Service - Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Quiz Service - Unhandled Rejection:', error);
  process.exit(1);
});

startServer();
