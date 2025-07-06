import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  
  // Database
  DB_PATH: z.string().default('./db/db.json'),
  
  // Security
  CORS_ORIGINS: z.string().optional(),
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  
  // API
  API_BASE_PATH: z.string().default('/api'),
  SWAGGER_PATH: z.string().default('/api-docs'),
});

// Validate environment variables
const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parseResult.error.format());
  process.exit(1);
}

const env = parseResult.data;

// Application configuration
export const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  
  // Database
  database: {
    path: env.DB_PATH,
  },
  
  // Security
  security: {
    corsOrigins: env.CORS_ORIGINS ? env.CORS_ORIGINS.split(',') : null,
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
  
  // Logging
  logging: {
    level: env.LOG_LEVEL,
  },
  
  // API
  api: {
    basePath: env.API_BASE_PATH,
    swaggerPath: env.SWAGGER_PATH,
  },
};

export default config;