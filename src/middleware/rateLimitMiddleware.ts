import { Request, Response, NextFunction } from "express";
import redisClient from "../config/redis.config";

const rateLimitMiddleware = (
  maxRequests: number = 100,
  windowSizeInSeconds: number = 60
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const identifier = req.user?.userId || req.ip;
      const key = `rate-limit:${identifier}`;

      const current = await redisClient.incr(key);
      if (current === 1) {
        await redisClient.expire(key, windowSizeInSeconds);
      }

      if (current > maxRequests) {
        res.set("Retry-After", windowSizeInSeconds.toString());
        return res.status(429).json({ message: "Too many requests" });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default rateLimitMiddleware;
