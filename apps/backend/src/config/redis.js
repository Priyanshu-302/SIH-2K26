import Redis from 'ioredis';
import config from './index.js';
import logger from './logger.js';

let redisClient = null;

export function getRedisClient() {
  if (!redisClient) {
    logger.info(`Connecting to Redis at ${config.REDIS_URL}...`);
    redisClient = new Redis(config.REDIS_URL, {
      maxRetriesPerRequest: null, // Required by BullMQ
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Connection Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Successfully connected to Redis');
    });
  }
  return redisClient;
}

export default redisClient;
