"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAiProcessingJob = exports.aiProcessingQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_config_1 = require("../config/redis.config");
// The name for our primary AI processing queue
const AI_PROCESSING_QUEUE_NAME = "ai-processing";
// Create a new queue instance that connects to your Redis server
exports.aiProcessingQueue = new bullmq_1.Queue(AI_PROCESSING_QUEUE_NAME, {
    connection: redis_config_1.redisClient,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000, // Wait 5 seconds before the first retry
        },
    },
});
/**
 * Adds a new AI processing job to the queue.
 * This is called by a service (e.g., CaseService) after a document record is created.
 * @param data - The ID of the document to process.
 */
const addAiProcessingJob = async (data) => {
    try {
        await exports.aiProcessingQueue.add("process-document", data);
        console.log(`Added AI processing job for document ID: ${data.documentId}`);
    }
    catch (error) {
        console.error("Failed to add job to queue", error);
        throw new Error("Could not schedule AI processing job.");
    }
};
exports.addAiProcessingJob = addAiProcessingJob;
//# sourceMappingURL=queue.js.map