import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Import database
import database from './database/connection.js';

// Import routes
import quotesRouter from './routes/quotes.js';
import uploadRouter from './routes/upload.js';

// Import services for health checks
import { EmailService } from './services/EmailService.js';
import { ObjectDetectionService } from './services/ObjectDetectionService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all routes
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://austinmovefinder.pages.dev', 'https://austinmovefinder.com'] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`${timestamp} - ${method} ${url} - ${ip}`);
  next();
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    await database.get('SELECT 1');
    
    // Check email service
    const emailService = new EmailService();
    const emailStatus = await emailService.testConnection();
    
    // Check object detection service
    const objectDetectionService = new ObjectDetectionService();
    const aiStatus = await objectDetectionService.healthCheck();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        email: emailStatus.success ? 'connected' : 'error',
        ai_detection: aiStatus.status,
        server: 'running'
      },
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// API Routes
app.use('/api/quotes', quotesRouter);
app.use('/api/upload', uploadRouter);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Austin Move Finder API',
    version: '1.0.0',
    description: 'Backend API for Austin Move Finder moving services platform',
    endpoints: {
      health: 'GET /api/health',
      quotes: {
        create: 'POST /api/quotes',
        get: 'GET /api/quotes/:id',
        update: 'PUT /api/quotes/:id',
        list: 'GET /api/quotes',
        addItems: 'POST /api/quotes/:id/items',
        submit: 'POST /api/quotes/:id/submit'
      },
      upload: {
        upload: 'POST /api/upload/:quote_id',
        getFiles: 'GET /api/upload/:quote_id/files',
        serveFile: 'GET /api/upload/file/:filename',
        deleteFile: 'DELETE /api/upload/file/:filename'
      }
    },
    documentation: 'See README.md for detailed API documentation'
  });
});

// Serve static files (uploaded media) in production
if (process.env.NODE_ENV === 'production') {
  const uploadsPath = process.env.UPLOAD_PATH || path.join(__dirname, '../uploads');
  app.use('/uploads', express.static(uploadsPath));
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    available_endpoints: '/api'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  res.status(error.status || 500).json({
    error: 'Internal server error',
    message: isDevelopment ? error.message : 'Something went wrong',
    ...(isDevelopment && { stack: error.stack })
  });
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\\n${signal} received. Starting graceful shutdown...`);
  
  server.close(async () => {
    console.log('HTTP server closed.');
    
    // Close database connection
    try {
      await database.close();
      console.log('Database connection closed.');
    } catch (error) {
      console.error('Error closing database:', error);
    }
    
    console.log('Graceful shutdown completed.');
    process.exit(0);
  });
};

// Initialize database and start server
async function startServer() {
  try {
    console.log('🚀 Starting Austin Move Finder Backend...');
    
    // Initialize database
    console.log('📊 Initializing database...');
    await database.initialize();
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log(`\\n✅ Austin Move Finder Backend is running!`);
      console.log(`🌐 Server: http://localhost:${PORT}`);
      console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`\\n🎯 Ready to handle moving quote requests!\\n`);
    });

    // Setup graceful shutdown
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    return server;
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
const server = await startServer();

export default app;