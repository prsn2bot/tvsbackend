import { Router } from "express";
import { MailController } from "../../controllers/v1/mail.controller";
import { authenticate, hasRole } from "../../middleware/auth.middleware";
import { applyMailRateLimit } from "../../utils/applyRateLimiting";

const router = Router();

// applyMailRateLimit(router);

router.post("/send-otp", MailController.sendOtp);

router.post(
  "/send-update",
  authenticate,
  hasRole(["admin"]),
  MailController.sendUpdate
);

router.post(
  "/send-notification",
  authenticate,
  hasRole(["admin"]),
  MailController.sendNotification
);

router.post(
  "/send-welcome",
  authenticate,
  hasRole(["admin"]),
  MailController.sendWelcome
);

router.post("/send-password-reset", MailController.sendPasswordReset);

router.post("/verify-otp", MailController.verifyOtp);

router.post(
  "/send-invoice",
  authenticate,
  hasRole(["admin"]),
  MailController.sendInvoice
);

router.post(
  "/send-custom",
  authenticate,
  hasRole(["admin"]),
  MailController.sendCustom
);

export default router;
