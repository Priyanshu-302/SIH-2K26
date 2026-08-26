import logger from '../config/logger.js';

/**
 * Global Express exception catcher to normalize all errors into standard client responses
 */
export function errorMiddleware(err, req, res, next) {
  const correlationId = req.id || 'system-action';

  // Log the full traceback internally
  logger.error({
    correlationId,
    message: err.message,
    stack: err.stack,
    path: req.path,
  });

  // Handle Zod schema validations
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation Error',
      code: 'REQUEST_VALIDATION_FAILED',
      details: err.errors.map((e) => ({
        field: e.path.join('.').replace(/^(body|query|params)\./, ''),
        message: e.message,
      })),
    });
  }

  // Handle Multer upload constraints
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'Payload Too Large',
      code: 'UPLOAD_SIZE_EXCEEDED',
      details: 'Uploaded documents must not exceed 15MB.',
    });
  }

  // Check if headers have already been sent to client (relevant for streaming responses)
  if (res.headersSent) {
    return next(err);
  }

  const isDev = process.env.NODE_ENV === 'development';
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    error: statusCode === 404 ? 'Resource Not Found' : 'Internal Server Error',
    code: err.errorCode || 'INTERNAL_SERVER_ERROR',
    details: isDev ? err.message : 'An unexpected error occurred during execution.',
  });
}
