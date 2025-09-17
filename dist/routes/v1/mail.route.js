"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mail_controller_1 = require("../../controllers/v1/mail.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// applyMailRateLimit(router);
router.post("/send-otp", mail_controller_1.MailController.sendOtp);
router.post("/send-update", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin", "owner"]), mail_controller_1.MailController.sendUpdate);
router.post("/send-notification", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin", "owner"]), mail_controller_1.MailController.sendNotification);
router.post("/send-welcome", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin", "owner"]), mail_controller_1.MailController.sendWelcome);
router.post("/send-password-reset", mail_controller_1.MailController.sendPasswordReset);
router.post("/verify-otp", mail_controller_1.MailController.verifyOtp);
router.post("/send-invoice", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin", "owner"]), mail_controller_1.MailController.sendInvoice);
router.post("/send-custom", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["admin", "owner"]), mail_controller_1.MailController.sendCustom);
exports.default = router;
//# sourceMappingURL=mail.route.js.map