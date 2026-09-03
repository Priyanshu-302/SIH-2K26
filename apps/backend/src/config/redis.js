import Redis from 'ioredis';
import config from './index.js';
import logger from './logger.js';

let redisClient = null;
let isConnected = false;

export function getRedisClient() {
  if (!redisClient) {
    logger.info(`Connecting to Redis at ${config.REDIS_URL}...`);
    redisClient = new Redis(config.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
      lazyConnect: false,
      retryStrategy: (times) => {
        if (times > 3) {
          return null; // Stop spamming reconnect if Redis is down
        }
        return Math.min(times * 1000, 2000);
      },
    });

    redisClient.on('error', (err) => {
      isConnected = false;
      logger.warn({ error: err.message }, 'Redis connection unavailable; operating in local fallback mode');
    });

    redisClient.on('connect', () => {
      isConnected = true;
      logger.info('Successfully connected to Redis');
    });
  }
  return redisClient;
}

export function isRedisConnected() {
  return isConnected;
}

export default redisClient;
