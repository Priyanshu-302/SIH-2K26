import mongoose from 'mongoose';
import app from './app.js';
import config from './config/index.js';
import logger from './config/logger.js';
import { getRedisClient } from './config/redis.js';
import { startIngestionWorker, closeIngestionWorker } from './workers/ingestion.worker.js';

let server = null;

async function startServer() {
  try {
    logger.info('Initializing backend server dependencies...');

    // 1. Establish MongoDB connection
    logger.info('Connecting to MongoDB database...');
    await mongoose.connect(config.MONGODB_URI);
    logger.info('Successfully connected to MongoDB');

    // 2. Initialize Redis connection
    logger.info('Connecting to Redis instance...');
    const redisClient = getRedisClient();
    await redisClient.ping(); // Verify connection works
    logger.info('Successfully verified Redis connection');

    // 3. Start BullMQ Ingestion Worker
    startIngestionWorker();

    // 4. Start Express server listener
    server = app.listen(config.PORT, () => {
      logger.info(`🚀 Server running in [${config.NODE_ENV}] mode on port ${config.PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start backend server:', error);
    process.exit(1);
  }
}

// Graceful teardown handler
async function handleShutdown(signal) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  if (server) {
    logger.info('Closing HTTP server listener...');
    await new Promise((resolve) => server.close(resolve));
    logger.info('HTTP server closed');
  }

  try {
    logger.info('Stopping BullMQ worker...');
    await closeIngestionWorker();
  } catch (err) {
    logger.error('Error during worker close:', err);
  }

  try {
    logger.info('Disconnecting Mongoose MongoDB connection pool...');
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
  } catch (err) {
    logger.error('Error during MongoDB disconnect:', err);
  }

  try {
    logger.info('Quitting Redis connection...');
    const redisClient = getRedisClient();
    await redisClient.quit();
    logger.info('Redis connection closed');
  } catch (err) {
    logger.error('Error during Redis connection close:', err);
  }

  logger.info('Graceful shutdown completed. Exiting process.');
  process.exit(0);
}

// Register lifecycle signal listeners
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

startServer();
