"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const redis_1 = require("./redis");
exports.redisClient = new ioredis_1.default(redis_1.REDIS_URL || "redis://localhost:6379");
// Redis connection event handlers
exports.redisClient.on("connect", () => {
    console.log("✅ Connected to Redis");
});
exports.redisClient.on("error", (error) => {
    console.error("❌ Redis connection error:", error);
});
exports.redisClient.on("ready", () => {
    console.log("✅ Redis is ready");
});
exports.redisClient.on("close", () => {
    console.log("❌ Redis connection closed");
});
exports.default = exports.redisClient;
//# sourceMappingURL=redis.config.js.map