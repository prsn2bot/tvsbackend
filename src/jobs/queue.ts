import { createQueue, QUEUE_NAMES } from "../config/bull.config";

// The name for our primary AI processing queue
const AI_PROCESSING_QUEUE_NAME = "ai-processing";

// Create a new queue instance using the centralized BullMQ config
export const aiProcessingQueue = createQueue(AI_PROCESSING_QUEUE_NAME, {
  defaultJobOptions: {
    attempts: 3, // Retry the job up to 3 times if it fails
    backoff: {
      type: "exponential",
      delay: 5000, // Wait 5 seconds before the first retry
    },
  },
});

/**
 * Defines the data structure for a job
 */
export interface AiProcessingJobData {
  documentId: number;
}

/**
 * Adds a new AI processing job to the queue.
 * This is called by a service (e.g., CaseService) after a document record is created.
 * @param data - The ID of the document to process.
 */
export const addAiProcessingJob = async (data: AiProcessingJobData) => {
  try {
    await aiProcessingQueue.add("process-document", data);
    console.log(`Added AI processing job for document ID: ${data.documentId}`);
  } catch (error) {
    console.error("Failed to add job to queue", error);
    throw new Error("Could not schedule AI processing job.");
  }
};
