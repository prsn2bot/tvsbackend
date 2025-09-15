import { Router } from "express";
import rateLimitMiddleware from "../middleware/rateLimitMiddleware";
import {
  RATE_LIMIT_CONFIG,
  getRateLimitConfig,
  getSpecificRouteConfig,
} from "../config/rateLimits.config";

// Pre-configured rate limiters for different route types
export const AI_RATE_LIMITER = rateLimitMiddleware(
  RATE_LIMIT_CONFIG.AI.limit,
  RATE_LIMIT_CONFIG.AI.windowMinutes * 60
);

export const CONTENT_RATE_LIMITER = rateLimitMiddleware(
  RATE_LIMIT_CONFIG.CONTENT_GENERATION.limit,
  RATE_LIMIT_CONFIG.CONTENT_GENERATION.windowMinutes * 60
);

export const MAIL_RATE_LIMITER = rateLimitMiddleware(
  RATE_LIMIT_CONFIG.MAIL.limit,
  RATE_LIMIT_CONFIG.MAIL.windowMinutes * 60
);

export const AUTH_RATE_LIMITER = rateLimitMiddleware(
  RATE_LIMIT_CONFIG.AUTH.limit,
  RATE_LIMIT_CONFIG.AUTH.windowMinutes * 60
);

export const DASHBOARD_RATE_LIMITER = rateLimitMiddleware(
  RATE_LIMIT_CONFIG.DASHBOARD.limit,
  RATE_LIMIT_CONFIG.DASHBOARD.windowMinutes * 60
);

export const GENERAL_RATE_LIMITER = rateLimitMiddleware(
  RATE_LIMIT_CONFIG.GENERAL_CRUD.limit,
  RATE_LIMIT_CONFIG.GENERAL_CRUD.windowMinutes * 60
);

export const PUBLIC_RATE_LIMITER = rateLimitMiddleware(
  RATE_LIMIT_CONFIG.PUBLIC.limit,
  RATE_LIMIT_CONFIG.PUBLIC.windowMinutes * 60
);

export const ADMIN_RATE_LIMITER = rateLimitMiddleware(
  RATE_LIMIT_CONFIG.ADMIN.limit,
  RATE_LIMIT_CONFIG.ADMIN.windowMinutes * 60
);

export const INQUIRY_RATE_LIMITER = rateLimitMiddleware(
  RATE_LIMIT_CONFIG.INQUIRY.limit,
  RATE_LIMIT_CONFIG.INQUIRY.windowMinutes * 60
);

/**
 * Create a custom rate limiter with specific limits
 */
export function createRateLimiter(limit: number, windowMinutes: number) {
  return rateLimitMiddleware(limit, windowMinutes * 60);
}

/**
 * Apply rate limiting to a router based on route type
 */
export function applyRateLimit(
  router: Router,
  routeType: keyof typeof RATE_LIMIT_CONFIG
) {
  const config = getRateLimitConfig(routeType);
  const rateLimiter = rateLimitMiddleware(
    config.limit,
    config.windowMinutes * 60
  );
  router.use(rateLimiter);
}

/**
 * Apply specific rate limiting to individual routes
 */
export function applySpecificRateLimit(
  router: Router,
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  limit: number,
  windowMinutes: number
) {
  const rateLimiter = rateLimitMiddleware(limit, windowMinutes * 60);

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

/**
 * Get rate limiter by route type name
 */
export function getRateLimiterByType(routeType: string) {
  switch (routeType.toUpperCase()) {
    case "AI":
      return AI_RATE_LIMITER;
    case "CONTENT":
    case "CONTENT_GENERATION":
      return CONTENT_RATE_LIMITER;
    case "MAIL":
    case "EMAIL":
      return MAIL_RATE_LIMITER;
    case "AUTH":
    case "AUTHENTICATION":
      return AUTH_RATE_LIMITER;
    case "DASHBOARD":
      return DASHBOARD_RATE_LIMITER;
    case "ADMIN":
      return ADMIN_RATE_LIMITER;
    case "PUBLIC":
      return PUBLIC_RATE_LIMITER;
    case "INQUIRY":
      return INQUIRY_RATE_LIMITER;
    case "GENERAL":
    default:
      return GENERAL_RATE_LIMITER;
  }
}
