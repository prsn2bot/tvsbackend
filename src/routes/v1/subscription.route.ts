import express from "express";
import { authenticate, hasRole } from "../../middleware/auth.middleware";
import rateLimitMiddleware from "../../middleware/rateLimitMiddleware";
import {
  validateBody,
  validateParams,
} from "../../middleware/validation.middleware";
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  SubscriptionParamsDto,
} from "../../dto/subscription.dto";
import { SubscriptionController } from "../../controllers/v1/subscription.controller";

const router = express.Router();

// GET / - Get user's active subscription
router.get(
  "/",
  authenticate,
  rateLimitMiddleware(),
  SubscriptionController.getSubscription
);

// POST / - Create a subscription
router.post(
  "/",
  authenticate,
  hasRole(["admin", "owner"]),
  rateLimitMiddleware(),
  validateBody(CreateSubscriptionDto, "subscription"),
  SubscriptionController.createSubscription
);

// PUT /:id - Update a subscription
router.put(
  "/:id",
  authenticate,
  hasRole(["admin", "owner"]),
  rateLimitMiddleware(),
  validateParams(SubscriptionParamsDto, "subscription"),
  validateBody(UpdateSubscriptionDto, "subscription"),
  SubscriptionController.updateSubscription
);

// DELETE /:id - Cancel a subscription
router.delete(
  "/:id",
  authenticate,
  hasRole(["admin", "owner"]),
  rateLimitMiddleware(),
  validateParams(SubscriptionParamsDto, "subscription"),
  SubscriptionController.deleteSubscription
);

export default router;
