/**
 * Easy Rate Limiting Application Utility
 *
 * This file provides simple functions to apply rate limiting to your routes
 * without conflicts between different route files.
 */

import { Router } from "express";
import {
  AI_RATE_LIMITER,
  CONTENT_RATE_LIMITER,
  MAIL_RATE_LIMITER,
  AUTH_RATE_LIMITER,
  DASHBOARD_RATE_LIMITER,
  GENERAL_RATE_LIMITER,
  PUBLIC_RATE_LIMITER,
  ADMIN_RATE_LIMITER,
  INQUIRY_RATE_LIMITER,
  createRateLimiter,
} from "./routeRateLimiter";

/**
 * Apply rate limiting to AI routes
 * Usage: applyAIRateLimit(router);
 */
export function applyAIRateLimit(router: Router) {
  router.use(AI_RATE_LIMITER);
}

/**
 * Apply rate limiting to Content routes
 * Usage: applyContentRateLimit(router);
 */
export function applyContentRateLimit(router: Router) {
  router.use(CONTENT_RATE_LIMITER);
}

/**
 * Apply rate limiting to Mail routes
 * Usage: applyMailRateLimit(router);
 */
export function applyMailRateLimit(router: Router) {
  router.use(MAIL_RATE_LIMITER);
}

/**
 * Apply rate limiting to Authentication routes
 * Usage: applyAuthRateLimit(router);
 */
export function applyAuthRateLimit(router: Router) {
  router.use(AUTH_RATE_LIMITER);
}

/**
 * Apply rate limiting to Dashboard routes
 * Usage: applyDashboardRateLimit(router);
 */
export function applyDashboardRateLimit(router: Router) {
  router.use(DASHBOARD_RATE_LIMITER);
}

/**
 * Apply rate limiting to General CRUD routes
 * Usage: applyGeneralRateLimit(router);
 */
export function applyGeneralRateLimit(router: Router) {
  router.use(GENERAL_RATE_LIMITER);
}

/**
 * Apply rate limiting to Public routes (no auth required)
 * Usage: applyPublicRateLimit(router);
 */
export function applyPublicRateLimit(router: Router) {
  router.use(PUBLIC_RATE_LIMITER);
}

/**
 * Apply rate limiting to Admin routes
 * Usage: applyAdminRateLimit(router);
 */
export function applyAdminRateLimit(router: Router) {
  router.use(ADMIN_RATE_LIMITER);
}

/**
 * Apply rate limiting to Inquiry routes
 * Usage: applyInquiryRateLimit(router);
 */
export function applyInquiryRateLimit(router: Router) {
  router.use(INQUIRY_RATE_LIMITER);
}

/**
 * Apply custom rate limiting
 * Usage: applyCustomRateLimit(router, 50, 15); // 50 requests per 15 minutes
 */
export function applyCustomRateLimit(
  router: Router,
  limit: number,
  windowMinutes: number
) {
  const customLimiter = createRateLimiter(limit, windowMinutes);
  router.use(customLimiter);
}

/**
 * Apply rate limiting to specific routes only
 * Usage: applySpecificRateLimit(router, 'POST', '/login', 5, 15);
 */
export function applySpecificRateLimit(
  router: Router,
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  path: string,
  limit: number,
  windowMinutes: number
) {
  const specificLimiter = createRateLimiter(limit, windowMinutes);

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
