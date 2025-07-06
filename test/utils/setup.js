import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';

// Global test setup
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.PORT = '3001';
  process.env.DB_PATH = './test/db/test.json';
  
  // JWT configuration for tests
  process.env.JWT_SECRET = 'test-super-secure-32-character-secret-key-for-testing-12345678';
  process.env.JWT_EXPIRES_IN = '3600';
  process.env.JWT_REFRESH_EXPIRES_IN = '604800';
  
  // Password configuration
  process.env.BCRYPT_ROUNDS = '4'; // Lower rounds for faster tests
  
  // Email configuration (mock)
  process.env.FROM_EMAIL = 'test@example.com';
  
  // Rate limiting (relaxed for tests)
  process.env.RATE_LIMIT_WINDOW_MS = '60000';
  process.env.RATE_LIMIT_MAX_REQUESTS = '1000';
  process.env.AUTH_RATE_LIMIT_WINDOW_MS = '60000';
  process.env.AUTH_RATE_LIMIT_MAX_REQUESTS = '100';
  
  // API Configuration
  process.env.API_BASE_PATH = '/api/v1';
  process.env.SWAGGER_PATH = '/api-docs';
  
  // Initialize test database or mock data
  if (process.env.TEST_VERBOSE === 'true') {
    console.log('Setting up test environment...');
  }
});

afterAll(async () => {
  // Clean up test environment
  if (process.env.TEST_VERBOSE === 'true') {
    console.log('Cleaning up test environment...');
  }
});

beforeEach(async () => {
  // Reset test data before each test
  // This would reset the database or mock data
});

afterEach(async () => {
  // Clean up after each test
  // This would clean up any test artifacts
});

// Global test configuration
export const testConfig = {
  timeout: 10000,
  retries: 2,
  verbose: true
};

// Mock console methods in test environment for cleaner output
if (process.env.NODE_ENV === 'test' && process.env.TEST_SILENT !== 'false') {
  // Only mock console if jest is available and we want silent tests
  if (typeof jest !== 'undefined') {
    // Keep original console methods for test output
    const originalConsole = { ...console };
    
    global.console = {
      ...console,
      // Mock application logs but keep test framework logs
      log: process.env.TEST_VERBOSE === 'true' ? originalConsole.log : jest.fn(),
      error: process.env.TEST_VERBOSE === 'true' ? originalConsole.error : jest.fn(),
      warn: process.env.TEST_VERBOSE === 'true' ? originalConsole.warn : jest.fn(),
      info: process.env.TEST_VERBOSE === 'true' ? originalConsole.info : jest.fn(),
      debug: jest.fn() // Always mock debug logs
    };
  }
}