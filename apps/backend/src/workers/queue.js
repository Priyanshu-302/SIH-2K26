import { Queue } from 'bullmq';
import { getRedisClient } from '../config/redis.js';
import logger from '../config/logger.js';

const connection = getRedisClient();

export const ingestionQueue = new Queue('ingestion-jobs', { connection });

/**
 * Pushes a document ingestion task onto the BullMQ queue
 * 
 * @param {string} jobId - MongoDB ObjectId representing the IngestionJob
 * @param {Object} data - Payload data
 * @param {string} data.filePath - Local filesystem path of the uploaded document
 * @param {string} [data.title] - Optional document title
 * @param {string} data.category - Category string ('classical_text' | 'patent_doc' | etc.)
 * @returns {Promise<Object>} The added BullMQ job
 */
export async function addIngestionJob(jobId, data) {
  logger.info({ jobId }, 'Adding ingestion task to BullMQ queue');
  return ingestionQueue.add(
    'process-document', 
    { jobId, ...data }, 
    { jobId, removeOnComplete: true, removeOnFail: false }
  );
}
