import { QdrantClient } from '@qdrant/js-client-rest';
import config from '../config/index.js';
import logger from '../config/logger.js';

let qdrantClient = null;

/**
 * Initializes and returns a Qdrant client connection
 * 
 * @returns {QdrantClient}
 */
export function getQdrantClient() {
  if (!qdrantClient) {
    logger.info(`Initializing Qdrant Client at ${config.QDRANT_URL}...`);
    qdrantClient = new QdrantClient({ url: config.QDRANT_URL });
  }
  return qdrantClient;
}
