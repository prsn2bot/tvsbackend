import express from "express";
import rateLimitMiddleware from "../../middleware/rateLimitMiddleware";
import { AuthController } from "../../controllers/v1/auth.controller";

const router = express.Router();

// POST /register - Register new user
router.post("/register", rateLimitMiddleware(), AuthController.register);

// POST /login - Login user
router.post("/login", rateLimitMiddleware(), AuthController.login);

// POST /refresh-token - Refresh access token
router.post(
  "/refresh-token",
  rateLimitMiddleware(),
  AuthController.refreshToken
);

export default router;
