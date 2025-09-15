// Rate Limiting Configuration
// Adjust these values based on your application's needs

export const RATE_LIMIT_CONFIG = {
  // High resource usage routes
  AI: {
    limit: 30, // 30 requests
    windowMinutes: 15, // per 15 minutes
  },

  CONTENT_GENERATION: {
    limit: 10, // 10 requests
    windowMinutes: 60, // per hour
  },

  // Email and communication
  MAIL: {
    limit: 5, // 5 emails
    windowMinutes: 60, // per hour
  },

  INQUIRY: {
    limit: 10, // 10 inquiries
    windowMinutes: 60, // per hour
  },

  // Authentication routes
  AUTH: {
    limit: 10, // 10 attempts
    windowMinutes: 15, // per 15 minutes
  },

  // Database intensive routes
  DASHBOARD: {
    limit: 50, // 50 requests
    windowMinutes: 15, // per 15 minutes
  },

  // General CRUD operations
  GENERAL_CRUD: {
    limit: 100, // 100 requests
    windowMinutes: 15, // per 15 minutes
  },

  // Public routes (no auth required)
  PUBLIC: {
    limit: 20, // 20 requests
    windowMinutes: 15, // per 15 minutes
  },

  // Admin/Management routes
  ADMIN: {
    limit: 200, // 200 requests
    windowMinutes: 15, // per 15 minutes
  },
};

// Route-specific configurations
export const ROUTE_SPECIFIC_LIMITS = {
  // Authentication endpoints
  "/auth/login": {
    limit: 5, // 5 login attempts
    windowMinutes: 15, // per 15 minutes
  },

  "/auth/register": {
    limit: 3, // 3 registration attempts
    windowMinutes: 60, // per hour
  },

  "/auth/forgot-password": {
    limit: 3, // 3 password reset requests
    windowMinutes: 60, // per hour
  },

  // Content operations
  "/contents": {
    limit: 100, // 15 content operations
    windowMinutes: 60, // per hour
  },

  // AI operations
  "/ai/keywords": {
    limit: 100, // 20 keyword suggestions
    windowMinutes: 15, // per 15 minutes
  },

  "/ai/generate-article": {
    limit: 100, // 5 article generations
    windowMinutes: 60, // per hour
  },

  // Mail operations
  "/mail/send-otp": {
    limit: 3, // 3 OTP requests
    windowMinutes: 60, // per hour
  },
};

// Helper function to get rate limit config
export function getRateLimitConfig(routeType: keyof typeof RATE_LIMIT_CONFIG) {
  return RATE_LIMIT_CONFIG[routeType] || RATE_LIMIT_CONFIG.GENERAL_CRUD;
}

// Helper function to get specific route config
export function getSpecificRouteConfig(routePath: string) {
  return ROUTE_SPECIFIC_LIMITS[routePath as keyof typeof ROUTE_SPECIFIC_LIMITS];
}
