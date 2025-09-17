import express from "express";
import { authenticate } from "../../middleware/auth.middleware";
import rateLimitMiddleware from "../../middleware/rateLimitMiddleware";
import { UserController } from "../../controllers/v1/user.controller";

const router = express.Router();

// GET /me - Get my profile
router.get(
  "/me",
  authenticate,
  rateLimitMiddleware(),
  UserController.getUserProfile
);

// PUT /me - Update my profile
router.put(
  "/me",
  authenticate,
  rateLimitMiddleware(),
  UserController.updateUserProfile
);

export default router;
