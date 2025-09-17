"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const env_1 = require("../config/env");
const aiDraftProcessor_1 = __importDefault(require("./processors/aiDraftProcessor"));
const logger_1 = __importDefault(require("../utils/logger"));
// The name for our primary AI processing queue
const AI_PROCESSING_QUEUE_NAME = "ai-processing";
// Create a new worker instance using centralized BullMQ config
const aiProcessingWorker = new bullmq_1.Worker(AI_PROCESSING_QUEUE_NAME, aiDraftProcessor_1.default, {
    connection: { url: env_1.env.REDIS_URL },
    concurrency: 2,
    limiter: {
        max: 10,
        duration: 1000, // Per 1 second
    },
});
// Event handlers for monitoring
aiProcessingWorker.on("completed", (job) => {
    logger_1.default.info(`Job ${job.id} completed successfully`);
});
aiProcessingWorker.on("failed", (job, err) => {
    logger_1.default.error(`Job ${job?.id} failed with error: ${err.message}`);
});
aiProcessingWorker.on("stalled", (jobId) => {
    logger_1.default.warn(`Job ${jobId} has stalled`);
});
// Graceful shutdown
process.on("SIGTERM", async () => {
    logger_1.default.info("Shutting down AI processing worker...");
    await aiProcessingWorker.close();
    process.exit(0);
});
process.on("SIGINT", async () => {
    logger_1.default.info("Shutting down AI processing worker...");
    await aiProcessingWorker.close();
    process.exit(0);
});
logger_1.default.info("AI Processing Worker started and listening for jobs...");
exports.default = aiProcessingWorker;
//# sourceMappingURL=worker.js.map