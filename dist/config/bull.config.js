"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupLastYearJobs = exports.cleanupLastMonthJobs = exports.cleanupJobsByDateRange = exports.cleanupOldJobs = exports.createQueue = exports.queueConfig = exports.QUEUE_NAMES = void 0;
const bullmq_1 = require("bullmq");
const logger_1 = __importDefault(require("../utils/logger"));
const env_1 = require("./env");
// Queue names for all distinct job types
exports.QUEUE_NAMES = {
    CONTENT_GENERATION: "content-generation",
    SOCIAL_MEDIA_POST: "social-media-post",
    EMAIL_NOTIFICATION: "email-notification",
    WEBHOOK: "webhook",
    SCHEDULED_CONTENT: "scheduled-content",
    USAGE_TRACKING: "usage-tracking",
    DATA_PROCESSING: "data-processing",
};
// BullMQ queue config
exports.queueConfig = {
    connection: {
        // host: "localhost",
        // port: 6379,
        url: env_1.env.REDIS_URL,
    },
    defaultJobOptions: {
        removeOnComplete: {
            age: 60 * 60 * 24 * 7,
            count: 1000,
        },
        removeOnFail: {
            age: 60 * 60 * 24 * 30,
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
function createQueue(queueName, overrides) {
    return new bullmq_1.Queue(queueName, { ...exports.queueConfig, ...overrides });
}
exports.createQueue = createQueue;
async function cleanupOldJobs(queue, olderThanDays = 30) {
    const cutoff = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
    const states = ["completed", "failed", "delayed", "waiting"];
    for (const state of states) {
        const jobs = await queue.getJobs([state], 0, -1, false);
        for (const job of jobs) {
            if (job.finishedOn && job.finishedOn < cutoff) {
                await job.remove();
            }
        }
    }
    logger_1.default.info(`Cleaned up jobs older than ${olderThanDays} days in queue ${queue.name}`);
}
exports.cleanupOldJobs = cleanupOldJobs;
async function cleanupJobsByDateRange(queue, startDate, endDate) {
    const states = ["completed", "failed", "delayed", "waiting"];
    for (const state of states) {
        const jobs = await queue.getJobs([state], 0, -1, false);
        for (const job of jobs) {
            if (job.finishedOn &&
                job.finishedOn >= startDate.getTime() &&
                job.finishedOn <= endDate.getTime()) {
                await job.remove();
            }
        }
    }
    logger_1.default.info(`Cleaned up jobs in queue ${queue.name} from ${startDate} to ${endDate}`);
}
exports.cleanupJobsByDateRange = cleanupJobsByDateRange;
async function cleanupLastMonthJobs(queue) {
    await cleanupOldJobs(queue, 30);
}
exports.cleanupLastMonthJobs = cleanupLastMonthJobs;
async function cleanupLastYearJobs(queue) {
    await cleanupOldJobs(queue, 365);
}
exports.cleanupLastYearJobs = cleanupLastYearJobs;
//# sourceMappingURL=bull.config.js.map