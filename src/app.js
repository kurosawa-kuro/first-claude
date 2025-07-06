import express from 'express';
import 'express-async-errors';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import routes from './routes/index.js';
import {
  corsMiddleware,
  helmetMiddleware,
  morganMiddleware,
  errorHandler
} from './middlewares/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load OpenAPI definition
const apiDefinition = YAML.load(path.resolve(__dirname, '../openapi/api.yaml'));

// Create Express app
const app = express();

// Security middleware
app.use(helmetMiddleware);
app.use(corsMiddleware);

// Logging middleware
app.use(morganMiddleware);

// Body parsing middleware
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(apiDefinition));

// API Routes
app.use('/api', routes);

// For root level routes (backward compatibility)
app.use('/', routes);

// 404 handler
app.use('*', (_, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Start server only if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;