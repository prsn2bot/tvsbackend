import express from "express";
import { authenticate } from "../../middleware/auth.middleware";
import rateLimitMiddleware from "../../middleware/rateLimitMiddleware";
import { validateBody } from "../../middleware/validation.middleware";
import { UserController } from "../../controllers/v1/user.controller";
import { UpdateUserProfileDto } from "../../dto/user.dto";

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
  validateBody(UpdateUserProfileDto),
  UserController.updateUserProfile
);

export default router;
