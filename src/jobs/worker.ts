import { Worker } from "bullmq";
import { env } from "../config/env";
import aiDraftProcessor from "./processors/aiDraftProcessor";
import logger from "../utils/logger";

// The name for our primary AI processing queue
const AI_PROCESSING_QUEUE_NAME = "ai-processing";

// Create a new worker instance using centralized BullMQ config
const aiProcessingWorker = new Worker(
  AI_PROCESSING_QUEUE_NAME,
  aiDraftProcessor,
  {
    connection: { url: env.REDIS_URL },
    concurrency: 2, // Process 2 jobs concurrently
    limiter: {
      max: 10, // Maximum 10 jobs per duration
      duration: 1000, // Per 1 second
    },
  }
);

// Event handlers for monitoring
aiProcessingWorker.on("completed", (job) => {
  logger.info(`Job ${job.id} completed successfully`);
});

aiProcessingWorker.on("failed", (job, err) => {
  logger.error(`Job ${job?.id} failed with error: ${err.message}`);
});

aiProcessingWorker.on("stalled", (jobId) => {
  logger.warn(`Job ${jobId} has stalled`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("Shutting down AI processing worker...");
  await aiProcessingWorker.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("Shutting down AI processing worker...");
  await aiProcessingWorker.close();
  process.exit(0);
});

logger.info("AI Processing Worker started and listening for jobs...");

export default aiProcessingWorker;
