import { Router } from "express";
import { MailController } from "../../controllers/v1/mail.controller";
import { authenticate, hasRole } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validation.middleware";
import {
  SendOtpDto,
  VerifyOtpDto,
  SendUpdateEmailDto,
  SendNotificationEmailDto,
  SendWelcomeEmailDto,
  SendPasswordResetEmailDto,
  SendInvoiceEmailDto,
  SendCustomEmailDto,
} from "../../dto/mail.dto";

const router = Router();

router.post("/send-otp", validateBody(SendOtpDto), MailController.sendOtp);

router.post(
  "/send-update",
  authenticate,
  hasRole(["admin", "owner"]),
  validateBody(SendUpdateEmailDto),
  MailController.sendUpdate
);

router.post(
  "/send-notification",
  authenticate,
  hasRole(["admin", "owner"]),
  validateBody(SendNotificationEmailDto),
  MailController.sendNotification
);

router.post(
  "/send-welcome",
  authenticate,
  hasRole(["admin", "owner"]),
  validateBody(SendWelcomeEmailDto),
  MailController.sendWelcome
);

router.post(
  "/send-password-reset",
  validateBody(SendPasswordResetEmailDto),
  MailController.sendPasswordReset
);

router.post(
  "/verify-otp",
  validateBody(VerifyOtpDto),
  MailController.verifyOtp
);

router.post(
  "/send-invoice",
  authenticate,
  hasRole(["admin", "owner"]),
  validateBody(SendInvoiceEmailDto),
  MailController.sendInvoice
);

router.post(
  "/send-custom",
  authenticate,
  hasRole(["admin", "owner"]),
  validateBody(SendCustomEmailDto),
  MailController.sendCustom
);

export default router;
