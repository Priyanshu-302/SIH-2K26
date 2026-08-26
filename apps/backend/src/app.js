import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import logger from './config/logger.js';
import apiRouter from './routes/index.js';
import { errorMiddleware } from './middleware/error.middleware.js';

const app = express();

// Standard request handlers configurations
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach Pino Http request logger and correlation identifier
app.use(
  pinoHttp({
    logger,
    genReqId: (req) => req.headers['x-request-id'] || Math.random().toString(36).substring(2, 11),
    customLogLevel: (req, res, err) => {
      if (res.statusCode >= 500 || err) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
  })
);

// Mount core endpoints
app.use('/api', apiRouter);

// Standard 404 handler for unknown routes
app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  error.errorCode = 'ROUTE_NOT_FOUND';
  next(error);
});

// Final error handling middleware mapping responses
app.use(errorMiddleware);

export default app;
