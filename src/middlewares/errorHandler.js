import { AppError } from '../utils/errors.js';

const errorHandler = (err, req, res, next) => {
  // Log error with request context
  const errorLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    error: {
      message: err.message,
      stack: err.stack,
      code: err.code || 'UNKNOWN_ERROR'
    }
  };

  // Log based on environment
  if (process.env.NODE_ENV === 'production') {
    console.error(JSON.stringify(errorLog));
  } else {
    console.error('Error occurred:', errorLog);
  }

  // Handle different error types
  let statusCode = 500;
  let message = 'Internal Server Error';
  let code = 'INTERNAL_ERROR';
  let details = null;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
    details = err.details;
  } else if (err.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation Error';
    code = 'VALIDATION_ERROR';
    details = err.issues;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    code = 'VALIDATION_ERROR';
    details = err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
    code = 'UNAUTHORIZED';
  } else if (err.status) {
    statusCode = err.status;
    message = err.message || 'An error occurred';
  }

  // Prepare response
  const response = {
    success: false,
    error: {
      code,
      message: process.env.NODE_ENV === 'production' && statusCode === 500 
        ? 'Something went wrong' 
        : message,
      timestamp: new Date().toISOString()
    }
  };

  // Add details in development or for client errors (4xx)
  if (details && (process.env.NODE_ENV !== 'production' || statusCode < 500)) {
    response.error.details = details;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;