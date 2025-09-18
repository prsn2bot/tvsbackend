import express from "express";
import rateLimitMiddleware from "../../middleware/rateLimitMiddleware";
import { validateBody } from "../../middleware/validation.middleware";
import { AuthController } from "../../controllers/v1/auth.controller";
import { RegisterDto, LoginDto, RefreshTokenDto } from "../../dto/auth.dto";

const router = express.Router();

// POST /register - Register new user
router.post(
  "/register",
  rateLimitMiddleware(),
  validateBody(RegisterDto),
  AuthController.register
);

// POST /login - Login user
router.post(
  "/login",
  rateLimitMiddleware(),
  validateBody(LoginDto),
  AuthController.login
);

// POST /refresh-token - Refresh access token
router.post(
  "/refresh-token",
  rateLimitMiddleware(),
  validateBody(RefreshTokenDto),
  AuthController.refreshToken
);

export default router;
