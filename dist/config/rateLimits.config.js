"use strict";
// Rate Limiting Configuration
// Adjust these values based on your application's needs
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpecificRouteConfig = exports.getRateLimitConfig = exports.ROUTE_SPECIFIC_LIMITS = exports.RATE_LIMIT_CONFIG = void 0;
exports.RATE_LIMIT_CONFIG = {
    // High resource usage routes
    AI: {
        limit: 30,
        windowMinutes: 15, // per 15 minutes
    },
    CONTENT_GENERATION: {
        limit: 10,
        windowMinutes: 60, // per hour
    },
    // Email and communication
    MAIL: {
        limit: 5,
        windowMinutes: 60, // per hour
    },
    INQUIRY: {
        limit: 10,
        windowMinutes: 60, // per hour
    },
    // Authentication routes
    AUTH: {
        limit: 10,
        windowMinutes: 15, // per 15 minutes
    },
    // Database intensive routes
    DASHBOARD: {
        limit: 50,
        windowMinutes: 15, // per 15 minutes
    },
    // General CRUD operations
    GENERAL_CRUD: {
        limit: 100,
        windowMinutes: 15, // per 15 minutes
    },
    // Public routes (no auth required)
    PUBLIC: {
        limit: 20,
        windowMinutes: 15, // per 15 minutes
    },
    // Admin/Management routes
    ADMIN: {
        limit: 200,
        windowMinutes: 15, // per 15 minutes
    },
};
// Route-specific configurations
exports.ROUTE_SPECIFIC_LIMITS = {
    // Authentication endpoints
    "/auth/login": {
        limit: 5,
        windowMinutes: 15, // per 15 minutes
    },
    "/auth/register": {
        limit: 3,
        windowMinutes: 60, // per hour
    },
    "/auth/forgot-password": {
        limit: 3,
        windowMinutes: 60, // per hour
    },
    // Content operations
    "/contents": {
        limit: 100,
        windowMinutes: 60, // per hour
    },
    // AI operations
    "/ai/keywords": {
        limit: 100,
        windowMinutes: 15, // per 15 minutes
    },
    "/ai/generate-article": {
        limit: 100,
        windowMinutes: 60, // per hour
    },
    // Mail operations
    "/mail/send-otp": {
        limit: 3,
        windowMinutes: 60, // per hour
    },
};
// Helper function to get rate limit config
function getRateLimitConfig(routeType) {
    return exports.RATE_LIMIT_CONFIG[routeType] || exports.RATE_LIMIT_CONFIG.GENERAL_CRUD;
}
exports.getRateLimitConfig = getRateLimitConfig;
// Helper function to get specific route config
function getSpecificRouteConfig(routePath) {
    return exports.ROUTE_SPECIFIC_LIMITS[routePath];
}
exports.getSpecificRouteConfig = getSpecificRouteConfig;
//# sourceMappingURL=rateLimits.config.js.map