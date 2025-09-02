import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { DatabaseConnection } from '../../shared/database/connection';
import { ResponseUtil } from '../../shared/utils/response';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.LEADERBOARD_SERVICE_PORT || 3005;

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
    service: 'Leaderboard Service',
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: dbStatus ? 'connected' : 'disconnected',
    uptime: process.uptime()
  }, 'Leaderboard service is healthy');
});

// Mock leaderboard data
app.get('/', (req, res) => {
  const mockLeaderboard = [
    { id: 1, name: 'Funmi', points: 2000, avatar: 'avatar1.jpg', position: 1 },
    { id: 2, name: 'John', points: 1600, avatar: 'avatar2.jpg', position: 2 },
    { id: 3, name: 'Kunle', points: 1300, avatar: 'avatar3.jpg', position: 3 },
    { id: 4, name: 'Adunni', points: 1200, avatar: 'avatar4.jpg', position: 4 },
    { id: 5, name: 'Kemi', points: 1100, avatar: 'avatar5.jpg', position: 5 }
  ];
  
  ResponseUtil.success(res, mockLeaderboard, 'Leaderboard retrieved successfully');
});

// 404 handler
app.use('*', (req, res) => {
  ResponseUtil.notFound(res, `Leaderboard service route ${req.originalUrl} not found`);
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Leaderboard service error:', error);
  ResponseUtil.serverError(res, error);
});

// Start server
async function startServer() {
  try {
    // Connect to database
    const db = DatabaseConnection.getInstance();
    await db.connect();

    app.listen(PORT, () => {
      console.log(`🏆 Leaderboard Service running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start Leaderboard service:', error);
    process.exit(1);
  }
}

startServer();
