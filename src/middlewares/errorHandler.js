import { AppError } from '../utils/errors.js';

// セキュリティ向上: センシティブ情報のサニタイズ
const sanitizeErrorMessage = (message) => {
  if (!message || typeof message !== 'string') return 'An error occurred';
  
  // ファイルパス、環境変数、秘密鍵などを除去
  return message
    .replace(/\/[^\/\s]+\/[^\/\s]+\/[^\/\s]+/g, '[PATH_REMOVED]') // ファイルパス除去
    .replace(/password[^,}]*/gi, 'password=[REDACTED]') // パスワード除去
    .replace(/token[^,}]*/gi, 'token=[REDACTED]') // トークン除去
    .replace(/secret[^,}]*/gi, 'secret=[REDACTED]') // シークレット除去
    .replace(/key[^,}]*/gi, 'key=[REDACTED]'); // キー除去
};

const sanitizeUrl = (url) => {
  if (!url) return url;
  // クエリパラメータからセンシティブ情報を除去
  return url.replace(/([?&])(token|password|secret|key)=[^&]*/gi, '$1$2=[REDACTED]');
};

const errorHandler = (err, req, res, next) => {
  // Log error with request context (センシティブ情報をサニタイズ)
  const errorLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: sanitizeUrl(req.url),
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    error: {
      message: sanitizeErrorMessage(err.message),
      stack: process.env.NODE_ENV === 'production' ? '[REDACTED]' : err.stack,
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

  // Prepare response (センシティブ情報をサニタイズ)
  const response = {
    success: false,
    error: {
      code,
      message: process.env.NODE_ENV === 'production' && statusCode === 500 
        ? 'Something went wrong' 
        : sanitizeErrorMessage(message),
      timestamp: new Date().toISOString()
    }
  };

  // Add details in development or for client errors (4xx) - センシティブ情報は除外
  if (details && (process.env.NODE_ENV !== 'production' || statusCode < 500)) {
    // details内のセンシティブ情報もサニタイズ
    if (typeof details === 'string') {
      response.error.details = sanitizeErrorMessage(details);
    } else if (Array.isArray(details)) {
      response.error.details = details.map(detail => 
        typeof detail === 'string' ? sanitizeErrorMessage(detail) : detail
      );
    } else {
      response.error.details = details;
    }
  }

  // Stack traceは開発環境のみ、かつセンシティブ情報をサニタイズ
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    response.error.stack = sanitizeErrorMessage(err.stack);
  }

  res.status(statusCode).json(response);
};

export default errorHandler;