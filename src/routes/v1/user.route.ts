import express from "express";
import { authenticate } from "../../middleware/auth.middleware";
import rateLimitMiddleware from "../../middleware/rateLimitMiddleware";
import subscriptionFeatureMiddleware from "../../middleware/subscriptionFeature.middleware";
import { UserController } from "../../controllers/v1/user.controller";

const router = express.Router();

// GET /me - Get my profile
router.get(
  "/me",
  authenticate,
  rateLimitMiddleware(),
  subscriptionFeatureMiddleware,
  UserController.getUserProfile
);

// PUT /me - Update my profile
router.put(
  "/me",
  authenticate,
  rateLimitMiddleware(),
  subscriptionFeatureMiddleware,
  UserController.updateUserProfile
);

export default router;
