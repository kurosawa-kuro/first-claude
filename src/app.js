import express from 'express';
import 'express-async-errors';
import compression from 'compression';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import routes from './routes/index.js';
import config from './config/index.js';
import {
  corsMiddleware,
  helmetMiddleware,
  requestLogger,
  errorHandler,
  apiLimiter,
  speedLimiter
} from './middlewares/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load OpenAPI definition
const apiDefinition = YAML.load(path.resolve(__dirname, '../openapi/api.yaml'));

// Create Express app
const app = express();

// Trust proxy for rate limiting and IP detection
app.set('trust proxy', 1);

// Health check endpoint (before any middleware)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.env
    }
  });
});

// Compression middleware (should be early)
app.use(compression({
  filter: (req, res) => {
    // Don't compress responses with this request header
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Fallback to standard filter function
    return compression.filter(req, res);
  }
}));

// Security middleware
app.use(helmetMiddleware);
app.use(corsMiddleware);

// Rate limiting (apply to API routes only)
if (config.isProduction) {
  app.use('/api', apiLimiter);
  app.use('/api', speedLimiter);
}

// Request logging
app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  strict: true
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Swagger UI
app.use(config.api.swaggerPath, swaggerUi.serve, swaggerUi.setup(apiDefinition, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Documentation'
}));

// API Routes (OpenAPI compliant)
app.use(config.api.basePath, routes);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ENDPOINT_NOT_FOUND',
      message: `API endpoint ${req.method} ${req.path} not found`,
      timestamp: new Date().toISOString()
    }
  });
});

// 404 handler for all other routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: 'The requested resource was not found',
      timestamp: new Date().toISOString()
    }
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
  
  // Force close server after 30 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

// Start server only if this file is run directly
let server;
if (import.meta.url === `file://${process.argv[1]}`) {
  server = app.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port} in ${config.env} mode`);
    console.log(`📚 API documentation available at http://localhost:${config.port}${config.api.swaggerPath}`);
    console.log(`🔗 API base URL: http://localhost:${config.port}${config.api.basePath}`);
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

export default app;