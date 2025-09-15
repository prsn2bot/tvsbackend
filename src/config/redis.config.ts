import Redis from "ioredis";
import { REDIS_URL } from "./redis";

export const redisClient = new Redis(REDIS_URL || "redis://localhost:6379");

// Redis connection event handlers
redisClient.on("connect", () => {
  console.log("✅ Connected to Redis");
});

redisClient.on("error", (error) => {
  console.error("❌ Redis connection error:", error);
});

redisClient.on("ready", () => {
  console.log("✅ Redis is ready");
});

redisClient.on("close", () => {
  console.log("❌ Redis connection closed");
});

export default redisClient;
