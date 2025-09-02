import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';
import { DatabaseConnection } from '../../shared/database/connection';
import { ResponseUtil } from '../../shared/utils/response';
import userRoutes from './routes/userRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.USER_SERVICE_PORT || 3002;

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

// Static file serving for uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../../../uploads')));

// Health check
app.get('/health', (req, res) => {
  const dbStatus = DatabaseConnection.getInstance().getConnectionStatus();
  ResponseUtil.success(res, {
    service: 'User Service',
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: dbStatus ? 'connected' : 'disconnected',
    uptime: process.uptime()
  }, 'User service is healthy');
});

// Routes
app.use('/', userRoutes);

// 404 handler
app.use('*', (req, res) => {
  ResponseUtil.notFound(res, `User service route ${req.originalUrl} not found`);
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('User service error:', error);
  ResponseUtil.serverError(res, error);
});

// Start server
async function startServer() {
  try {
    // Connect to database
    const db = DatabaseConnection.getInstance();
    await db.connect();

    // Create uploads directory if it doesn't exist
    const fs = await import('fs');
    const uploadsDir = path.join(__dirname, '../../../uploads/profiles');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    app.listen(PORT, () => {
      console.log(`👤 User Service running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start User service:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('User Service - Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('User Service - Unhandled Rejection:', error);
  process.exit(1);
});

startServer();
