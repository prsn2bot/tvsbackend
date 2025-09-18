"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mail_controller_1 = require("../../controllers/v1/mail.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const mail_dto_1 = require("../../dto/mail.dto");
const router = (0, express_1.Router)();
router.post("/send-otp", (0, validation_middleware_1.validateBody)(mail_dto_1.SendOtpDto), mail_controller_1.MailController.sendOtp);
router.post("/send-update", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin", "owner"]), (0, validation_middleware_1.validateBody)(mail_dto_1.SendUpdateEmailDto), mail_controller_1.MailController.sendUpdate);
router.post("/send-notification", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin", "owner"]), (0, validation_middleware_1.validateBody)(mail_dto_1.SendNotificationEmailDto), mail_controller_1.MailController.sendNotification);
router.post("/send-welcome", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin", "owner"]), (0, validation_middleware_1.validateBody)(mail_dto_1.SendWelcomeEmailDto), mail_controller_1.MailController.sendWelcome);
router.post("/send-password-reset", (0, validation_middleware_1.validateBody)(mail_dto_1.SendPasswordResetEmailDto), mail_controller_1.MailController.sendPasswordReset);
router.post("/verify-otp", (0, validation_middleware_1.validateBody)(mail_dto_1.VerifyOtpDto), mail_controller_1.MailController.verifyOtp);
router.post("/send-invoice", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin", "owner"]), (0, validation_middleware_1.validateBody)(mail_dto_1.SendInvoiceEmailDto), mail_controller_1.MailController.sendInvoice);
router.post("/send-custom", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin", "owner"]), (0, validation_middleware_1.validateBody)(mail_dto_1.SendCustomEmailDto), mail_controller_1.MailController.sendCustom);
exports.default = router;
//# sourceMappingURL=mail.route.js.map