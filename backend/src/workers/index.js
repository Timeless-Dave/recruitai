import { Worker } from 'bullmq';
import scoringService from '../services/scoringService.js';
import { logger } from '../utils/logger.js';
import { io } from '../server.js';

if (process.env.DISABLE_BACKGROUND_JOBS === 'true') {
  logger.info('[Worker] Background jobs disabled - exiting worker.');
  process.exit(0);
}

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined
};

/**
 * Scoring Worker - Processes applicant scoring
 */
const scoringWorker = new Worker(
  'scoring-queue',
  async (job) => {
    const { applicantId } = job.data;
    
    logger.info(`[Worker] Processing applicant ${applicantId}`);
    
    try {
      const result = await scoringService.processApplicant(applicantId);
      
      logger.info(`[Worker] Applicant ${applicantId} scored: ${result.finalScore}`);
      
      // Emit real-time update via Socket.io if available
      if (io) {
        const applicant = await import('../config/database.js').then(m => m.default.applicant.findUnique({
          where: { id: applicantId },
          select: { jobId: true }
        }));

        if (applicant) {
          io.emit('rank_update', {
            jobId: applicant.jobId,
            applicantId,
            score: result.finalScore,
            rank: result.rank,
            timestamp: new Date()
          });
        }
      }
      
      return result;
    } catch (error) {
      logger.error(`[Worker] Scoring failed for applicant ${applicantId}:`, error);
      throw error;
    }
  },
  {
    connection,
    concurrency: 5, // Process 5 jobs concurrently
    limiter: {
      max: 10, // Max 10 jobs
      duration: 1000 // per second
    }
  }
);

// Worker event handlers
scoringWorker.on('completed', (job, result) => {
  logger.info(`[Worker] Job ${job.id} completed successfully`);
});

scoringWorker.on('failed', (job, error) => {
  logger.error(`[Worker] Job ${job.id} failed:`, error);
});

scoringWorker.on('error', (error) => {
  logger.error('[Worker] Worker error:', error);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('[Worker] SIGTERM received, closing worker...');
  await scoringWorker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('[Worker] SIGINT received, closing worker...');
  await scoringWorker.close();
  process.exit(0);
});

logger.info('[Worker] Scoring worker started');

export default scoringWorker;



