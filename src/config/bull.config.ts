import { Queue, QueueOptions, JobsOptions } from "bullmq";
import logger from "../utils/logger";
import { env } from "./env";

// Queue names for all distinct job types
export const QUEUE_NAMES = {
  CONTENT_GENERATION: "content-generation",
  SOCIAL_MEDIA_POST: "social-media-post",
  EMAIL_NOTIFICATION: "email-notification",
  WEBHOOK: "webhook",
  SCHEDULED_CONTENT: "scheduled-content",
  USAGE_TRACKING: "usage-tracking",
  DATA_PROCESSING: "data-processing",
};

// BullMQ queue config
export const queueConfig: QueueOptions = {
  connection: {
    // host: "localhost",
    // port: 6379,
    url: env.REDIS_URL,
  },
  defaultJobOptions: {
    removeOnComplete: {
      age: 60 * 60 * 24 * 7, // 7 days
      count: 1000,
    },
    removeOnFail: {
      age: 60 * 60 * 24 * 30, // 30 days
      count: 1000,
    },
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
};

// Helper to create a queue
export function createQueue(
  queueName: string,
  overrides?: Partial<QueueOptions>
): Queue {
  return new Queue(queueName, { ...queueConfig, ...overrides });
}

// Cleanup utilities
import { Job, JobType } from "bullmq";

export async function cleanupOldJobs(
  queue: Queue,
  olderThanDays = 30
): Promise<void> {
  const cutoff = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
  const states: JobType[] = ["completed", "failed", "delayed", "waiting"];
  for (const state of states) {
    const jobs = await queue.getJobs([state], 0, -1, false);
    for (const job of jobs) {
      if (job.finishedOn && job.finishedOn < cutoff) {
        await job.remove();
      }
    }
  }
  logger.info(
    `Cleaned up jobs older than ${olderThanDays} days in queue ${queue.name}`
  );
}

export async function cleanupJobsByDateRange(
  queue: Queue,
  startDate: Date,
  endDate: Date
): Promise<void> {
  const states: JobType[] = ["completed", "failed", "delayed", "waiting"];
  for (const state of states) {
    const jobs = await queue.getJobs([state], 0, -1, false);
    for (const job of jobs) {
      if (
        job.finishedOn &&
        job.finishedOn >= startDate.getTime() &&
        job.finishedOn <= endDate.getTime()
      ) {
        await job.remove();
      }
    }
  }
  logger.info(
    `Cleaned up jobs in queue ${queue.name} from ${startDate} to ${endDate}`
  );
}

export async function cleanupLastMonthJobs(queue: Queue): Promise<void> {
  await cleanupOldJobs(queue, 30);
}

export async function cleanupLastYearJobs(queue: Queue): Promise<void> {
  await cleanupOldJobs(queue, 365);
}
