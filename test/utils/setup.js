import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';

// Global test setup
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.PORT = '3001';
  
  // Initialize test database or mock data
  console.log('Setting up test environment...');
});

afterAll(async () => {
  // Clean up test environment
  console.log('Cleaning up test environment...');
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

// Mock console methods in test environment
if (process.env.NODE_ENV === 'test') {
  // Only mock console if jest is available
  if (typeof jest !== 'undefined') {
    global.console = {
      ...console,
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn()
    };
  }
}