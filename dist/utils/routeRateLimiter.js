"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRateLimiterByType = exports.applySpecificRateLimit = exports.applyRateLimit = exports.createRateLimiter = exports.INQUIRY_RATE_LIMITER = exports.ADMIN_RATE_LIMITER = exports.PUBLIC_RATE_LIMITER = exports.GENERAL_RATE_LIMITER = exports.DASHBOARD_RATE_LIMITER = exports.AUTH_RATE_LIMITER = exports.MAIL_RATE_LIMITER = exports.CONTENT_RATE_LIMITER = exports.AI_RATE_LIMITER = void 0;
const rateLimitMiddleware_1 = __importDefault(require("../middleware/rateLimitMiddleware"));
const rateLimits_config_1 = require("../config/rateLimits.config");
// Pre-configured rate limiters for different route types
exports.AI_RATE_LIMITER = (0, rateLimitMiddleware_1.default)(rateLimits_config_1.RATE_LIMIT_CONFIG.AI.limit, rateLimits_config_1.RATE_LIMIT_CONFIG.AI.windowMinutes * 60);
exports.CONTENT_RATE_LIMITER = (0, rateLimitMiddleware_1.default)(rateLimits_config_1.RATE_LIMIT_CONFIG.CONTENT_GENERATION.limit, rateLimits_config_1.RATE_LIMIT_CONFIG.CONTENT_GENERATION.windowMinutes * 60);
exports.MAIL_RATE_LIMITER = (0, rateLimitMiddleware_1.default)(rateLimits_config_1.RATE_LIMIT_CONFIG.MAIL.limit, rateLimits_config_1.RATE_LIMIT_CONFIG.MAIL.windowMinutes * 60);
exports.AUTH_RATE_LIMITER = (0, rateLimitMiddleware_1.default)(rateLimits_config_1.RATE_LIMIT_CONFIG.AUTH.limit, rateLimits_config_1.RATE_LIMIT_CONFIG.AUTH.windowMinutes * 60);
exports.DASHBOARD_RATE_LIMITER = (0, rateLimitMiddleware_1.default)(rateLimits_config_1.RATE_LIMIT_CONFIG.DASHBOARD.limit, rateLimits_config_1.RATE_LIMIT_CONFIG.DASHBOARD.windowMinutes * 60);
exports.GENERAL_RATE_LIMITER = (0, rateLimitMiddleware_1.default)(rateLimits_config_1.RATE_LIMIT_CONFIG.GENERAL_CRUD.limit, rateLimits_config_1.RATE_LIMIT_CONFIG.GENERAL_CRUD.windowMinutes * 60);
exports.PUBLIC_RATE_LIMITER = (0, rateLimitMiddleware_1.default)(rateLimits_config_1.RATE_LIMIT_CONFIG.PUBLIC.limit, rateLimits_config_1.RATE_LIMIT_CONFIG.PUBLIC.windowMinutes * 60);
exports.ADMIN_RATE_LIMITER = (0, rateLimitMiddleware_1.default)(rateLimits_config_1.RATE_LIMIT_CONFIG.ADMIN.limit, rateLimits_config_1.RATE_LIMIT_CONFIG.ADMIN.windowMinutes * 60);
exports.INQUIRY_RATE_LIMITER = (0, rateLimitMiddleware_1.default)(rateLimits_config_1.RATE_LIMIT_CONFIG.INQUIRY.limit, rateLimits_config_1.RATE_LIMIT_CONFIG.INQUIRY.windowMinutes * 60);
/**
 * Create a custom rate limiter with specific limits
 */
function createRateLimiter(limit, windowMinutes) {
    return (0, rateLimitMiddleware_1.default)(limit, windowMinutes * 60);
}
exports.createRateLimiter = createRateLimiter;
/**
 * Apply rate limiting to a router based on route type
 */
function applyRateLimit(router, routeType) {
    const config = (0, rateLimits_config_1.getRateLimitConfig)(routeType);
    const rateLimiter = (0, rateLimitMiddleware_1.default)(config.limit, config.windowMinutes * 60);
    router.use(rateLimiter);
}
exports.applyRateLimit = applyRateLimit;
/**
 * Apply specific rate limiting to individual routes
 */
function applySpecificRateLimit(router, method, path, limit, windowMinutes) {
    const rateLimiter = (0, rateLimitMiddleware_1.default)(limit, windowMinutes * 60);
    switch (method.toUpperCase()) {
        case "GET":
            router.get(path, rateLimiter);
            break;
        case "POST":
            router.post(path, rateLimiter);
            break;
        case "PUT":
            router.put(path, rateLimiter);
            break;
        case "DELETE":
            router.delete(path, rateLimiter);
            break;
    }
}
exports.applySpecificRateLimit = applySpecificRateLimit;
/**
 * Get rate limiter by route type name
 */
function getRateLimiterByType(routeType) {
    switch (routeType.toUpperCase()) {
        case "AI":
            return exports.AI_RATE_LIMITER;
        case "CONTENT":
        case "CONTENT_GENERATION":
            return exports.CONTENT_RATE_LIMITER;
        case "MAIL":
        case "EMAIL":
            return exports.MAIL_RATE_LIMITER;
        case "AUTH":
        case "AUTHENTICATION":
            return exports.AUTH_RATE_LIMITER;
        case "DASHBOARD":
            return exports.DASHBOARD_RATE_LIMITER;
        case "ADMIN":
            return exports.ADMIN_RATE_LIMITER;
        case "PUBLIC":
            return exports.PUBLIC_RATE_LIMITER;
        case "INQUIRY":
            return exports.INQUIRY_RATE_LIMITER;
        case "GENERAL":
        default:
            return exports.GENERAL_RATE_LIMITER;
    }
}
exports.getRateLimiterByType = getRateLimiterByType;
//# sourceMappingURL=routeRateLimiter.js.map