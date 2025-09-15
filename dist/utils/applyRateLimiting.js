"use strict";
/**
 * Easy Rate Limiting Application Utility
 *
 * This file provides simple functions to apply rate limiting to your routes
 * without conflicts between different route files.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.applySpecificRateLimit = exports.applyCustomRateLimit = exports.applyInquiryRateLimit = exports.applyAdminRateLimit = exports.applyPublicRateLimit = exports.applyGeneralRateLimit = exports.applyDashboardRateLimit = exports.applyAuthRateLimit = exports.applyMailRateLimit = exports.applyContentRateLimit = exports.applyAIRateLimit = void 0;
const routeRateLimiter_1 = require("./routeRateLimiter");
/**
 * Apply rate limiting to AI routes
 * Usage: applyAIRateLimit(router);
 */
function applyAIRateLimit(router) {
    router.use(routeRateLimiter_1.AI_RATE_LIMITER);
}
exports.applyAIRateLimit = applyAIRateLimit;
/**
 * Apply rate limiting to Content routes
 * Usage: applyContentRateLimit(router);
 */
function applyContentRateLimit(router) {
    router.use(routeRateLimiter_1.CONTENT_RATE_LIMITER);
}
exports.applyContentRateLimit = applyContentRateLimit;
/**
 * Apply rate limiting to Mail routes
 * Usage: applyMailRateLimit(router);
 */
function applyMailRateLimit(router) {
    router.use(routeRateLimiter_1.MAIL_RATE_LIMITER);
}
exports.applyMailRateLimit = applyMailRateLimit;
/**
 * Apply rate limiting to Authentication routes
 * Usage: applyAuthRateLimit(router);
 */
function applyAuthRateLimit(router) {
    router.use(routeRateLimiter_1.AUTH_RATE_LIMITER);
}
exports.applyAuthRateLimit = applyAuthRateLimit;
/**
 * Apply rate limiting to Dashboard routes
 * Usage: applyDashboardRateLimit(router);
 */
function applyDashboardRateLimit(router) {
    router.use(routeRateLimiter_1.DASHBOARD_RATE_LIMITER);
}
exports.applyDashboardRateLimit = applyDashboardRateLimit;
/**
 * Apply rate limiting to General CRUD routes
 * Usage: applyGeneralRateLimit(router);
 */
function applyGeneralRateLimit(router) {
    router.use(routeRateLimiter_1.GENERAL_RATE_LIMITER);
}
exports.applyGeneralRateLimit = applyGeneralRateLimit;
/**
 * Apply rate limiting to Public routes (no auth required)
 * Usage: applyPublicRateLimit(router);
 */
function applyPublicRateLimit(router) {
    router.use(routeRateLimiter_1.PUBLIC_RATE_LIMITER);
}
exports.applyPublicRateLimit = applyPublicRateLimit;
/**
 * Apply rate limiting to Admin routes
 * Usage: applyAdminRateLimit(router);
 */
function applyAdminRateLimit(router) {
    router.use(routeRateLimiter_1.ADMIN_RATE_LIMITER);
}
exports.applyAdminRateLimit = applyAdminRateLimit;
/**
 * Apply rate limiting to Inquiry routes
 * Usage: applyInquiryRateLimit(router);
 */
function applyInquiryRateLimit(router) {
    router.use(routeRateLimiter_1.INQUIRY_RATE_LIMITER);
}
exports.applyInquiryRateLimit = applyInquiryRateLimit;
/**
 * Apply custom rate limiting
 * Usage: applyCustomRateLimit(router, 50, 15); // 50 requests per 15 minutes
 */
function applyCustomRateLimit(router, limit, windowMinutes) {
    const customLimiter = (0, routeRateLimiter_1.createRateLimiter)(limit, windowMinutes);
    router.use(customLimiter);
}
exports.applyCustomRateLimit = applyCustomRateLimit;
/**
 * Apply rate limiting to specific routes only
 * Usage: applySpecificRateLimit(router, 'POST', '/login', 5, 15);
 */
function applySpecificRateLimit(router, method, path, limit, windowMinutes) {
    const specificLimiter = (0, routeRateLimiter_1.createRateLimiter)(limit, windowMinutes);
    switch (method.toUpperCase()) {
        case "GET":
            router.get(path, specificLimiter);
            break;
        case "POST":
            router.post(path, specificLimiter);
            break;
        case "PUT":
            router.put(path, specificLimiter);
            break;
        case "DELETE":
            router.delete(path, specificLimiter);
            break;
        case "PATCH":
            router.patch(path, specificLimiter);
            break;
    }
}
exports.applySpecificRateLimit = applySpecificRateLimit;
//# sourceMappingURL=applyRateLimiting.js.map