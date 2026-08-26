import { Worker } from 'bullmq';
import mongoose from 'mongoose';
import { getRedisClient } from '../config/redis.js';
import config from '../config/index.js';
import logger from '../config/logger.js';
import { IngestionJob } from '../models/ingestionJob.model.js';

let workerInstance = null;

/**
 * Simulates document processing step-by-step for testing and presentation
 * 
 * @param {string} jobId - IngestionJob database identifier
 * @returns {Promise<Object>} Processed metadata
 */
async function simulateIngestion(jobId) {
  const startTime = Date.now();
  
  const steps = [
    { progress: 10, delay: 400 },
    { progress: 40, delay: 500 },
    { progress: 70, delay: 400 },
    { progress: 95, delay: 300 },
  ];

  for (const step of steps) {
    await new Promise((resolve) => setTimeout(resolve, step.delay));
    await IngestionJob.findByIdAndUpdate(jobId, { progress: step.progress, status: 'PROCESSING' });
  }

  const chunkCount = Math.floor(Math.random() * 40) + 10; // Random mock chunks between 10 and 50
  const timeTakenMs = Date.now() - startTime;

  return { ingestedCount: chunkCount, timeTakenMs };
}

/**
 * Initializes the BullMQ Worker to process incoming document ingestion tasks
 */
export function startIngestionWorker() {
  const connection = getRedisClient();
  const correlationId = 'ingestion-worker';

  logger.info('Initializing BullMQ Ingestion Worker...');

  workerInstance = new Worker(
    'ingestion-jobs',
    async (job) => {
      const { jobId, filePath, title, category } = job.data;
      logger.info({ correlationId, jobId, title }, 'Consuming ingestion job task');

      // Ensure MongoDB connection is ready (relevant when running worker in tests or separate thread)
      if (mongoose.connection.readyState !== 1) {
        throw new Error('Database connection is not ready');
      }

      // 1. Update job to PROCESSING state
      await IngestionJob.findByIdAndUpdate(jobId, {
        status: 'PROCESSING',
        progress: 5,
        errorMessage: null,
      });

      let result;

      // 2. Route processing: mock simulation vs production AI engine
      if (config.AI_ADAPTER_MOCK) {
        logger.info({ correlationId, jobId }, 'Executing mock ingestion simulation');
        result = await simulateIngestion(jobId);
      } else {
        logger.info({ correlationId, jobId }, 'Executing production AI core ingestion pipeline');
        const aiCore = await import('@ayur/ai-core');
        const startTime = Date.now();
        
        // Mark progress before calling engine
        await IngestionJob.findByIdAndUpdate(jobId, { progress: 30 });
        
        const coreResult = await aiCore.runIngestion(filePath, { title, category });
        // coreResult is expected to be: { ingestedCount: number, timeTakenMs?: number }
        
        result = {
          ingestedCount: coreResult.ingestedCount || 0,
          timeTakenMs: coreResult.timeTakenMs || (Date.now() - startTime),
        };
      }

      // 3. Mark job as COMPLETED and update metadata logs
      await IngestionJob.findByIdAndUpdate(jobId, {
        status: 'COMPLETED',
        progress: 100,
        ingestedCount: result.ingestedCount,
        timeTakenMs: result.timeTakenMs,
      });

      logger.info({ correlationId, jobId, chunks: result.ingestedCount }, 'Ingestion job completed successfully');
    },
    { 
      connection,
      concurrency: 1, // Process one document at a time to save CPU cycles in demo
    }
  );

  workerInstance.on('failed', async (job, err) => {
    if (job) {
      const { jobId } = job.data;
      logger.error({ correlationId, jobId, error: err.message }, 'Ingestion job task failed');
      
      try {
        await IngestionJob.findByIdAndUpdate(jobId, {
          status: 'FAILED',
          progress: 0,
          errorMessage: err.message,
        });
      } catch (dbErr) {
        logger.error('Failed to write failure log to MongoDB:', dbErr);
      }
    }
  });

  workerInstance.on('error', (err) => {
    logger.error({ correlationId }, 'Worker system error:', err);
  });
}

/**
 * Shut down the BullMQ Worker gracefully
 */
export async function closeIngestionWorker() {
  if (workerInstance) {
    logger.info('Shutting down BullMQ Ingestion Worker...');
    await workerInstance.close();
    logger.info('Ingestion Worker closed');
  }
}
