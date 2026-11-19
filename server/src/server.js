import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pool, { testConnection } from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin === allowedOrigin || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Health Check API
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    const [rows] = await pool.query('SELECT 1 as is_alive');
    if (rows && rows[0]?.is_alive === 1) {
      dbStatus = 'connected';
    }
  } catch (err) {
    dbStatus = `error: ${err.message}`;
  }

  res.status(200).json({
    status: 'ok',
    message: 'AI Interview Preparation Platform API is operational',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  });
});

// Root API Welcome
app.get('/', (req, res) => {
  res.json({
    message: 'AI Interview Preparation Platform Backend Server',
    healthCheck: '/api/health',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      resumes: '/api/resumes',
      interviews: '/api/interviews',
      analytics: '/api/analytics',
    },
  });
});

// Mount Application Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Resource not found: ${req.method} ${req.originalUrl}`,
      statusCode: 404,
    },
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(`💥 [API Error] ${req.method} ${req.originalUrl}:`, err);

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      statusCode,
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    },
  });
});

// Server bootstrap
async function startServer() {
  console.log('🚀 Booting AI Interview Preparation Platform Backend...');
  
  // Test MySQL connection
  await testConnection();

  const server = app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`📡 Backend Server running on: http://localhost:${PORT}`);
    console.log(`🩺 Health check endpoint:     http://localhost:${PORT}/api/health`);
    console.log(`🌐 Allowed Frontend URL:      ${allowedOrigin}`);
    console.log(`======================================================\n`);
  });

  const shutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      console.log('🔒 HTTP server closed.');
      try {
        await pool.end();
        console.log('🔒 MySQL connection pool closed.');
      } catch (e) {}
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startServer();

export default app;
