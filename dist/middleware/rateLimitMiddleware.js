"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_config_1 = __importDefault(require("../config/redis.config"));
const rateLimitMiddleware = (maxRequests = 100, windowSizeInSeconds = 60) => {
    return async (req, res, next) => {
        try {
            const identifier = req.user?.userId || req.ip;
            const key = `rate-limit:${identifier}`;
            const current = await redis_config_1.default.incr(key);
            if (current === 1) {
                await redis_config_1.default.expire(key, windowSizeInSeconds);
            }
            if (current > maxRequests) {
                res.set("Retry-After", windowSizeInSeconds.toString());
                return res.status(429).json({ message: "Too many requests" });
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.default = rateLimitMiddleware;
//# sourceMappingURL=rateLimitMiddleware.js.map