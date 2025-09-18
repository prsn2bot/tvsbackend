"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailController = void 0;
const sendmail_1 = require("../../utils/sendmail");
const cache_1 = require("../../utils/cache");
const user_service_1 = require("../../services/user.service");
const errorHandler_middleware_1 = require("../../middleware/errorHandler.middleware");
const AppError_1 = require("../../utils/AppError");
const HOUR_IN_SECONDS = 3600;
const DAY_IN_SECONDS = 86400;
const MAX_OTP_VERIFY_ATTEMPTS = 5;
class MailController {
}
exports.MailController = MailController;
_a = MailController;
MailController.sendOtp = (0, errorHandler_middleware_1.asyncHandler)(async (req, res, next) => {
    const { to, validityDuration } = req.body;
    const normalizedEmail = to.toLowerCase();
    // Check if user exists
    const existingUser = await user_service_1.UserService.getUserByEmail(normalizedEmail);
    if (!existingUser) {
        throw new AppError_1.AppError("User with this email does not exist", 404);
    }
    const otpSendCacheKey = `otp_count_hourly_${normalizedEmail}`;
    let otpSendCount = (0, cache_1.getCache)(otpSendCacheKey) || 0;
    if (otpSendCount >= 3) {
        throw new AppError_1.AppError("Too many OTP requests for this email address. Please try again after an hour", 429);
    }
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    let ttlInSeconds = 600;
    const durationMatch = validityDuration.match(/(\d+)\s*(minute|second)s?/i);
    if (durationMatch) {
        const value = parseInt(durationMatch[1]);
        const unit = durationMatch[2].toLowerCase();
        if (unit.startsWith("minute")) {
            ttlInSeconds = value * 60;
        }
        else if (unit.startsWith("second")) {
            ttlInSeconds = value;
        }
    }
    (0, cache_1.setCache)(`otp_${normalizedEmail}`, otpCode, ttlInSeconds);
    (0, cache_1.setCache)(otpSendCacheKey, otpSendCount + 1, HOUR_IN_SECONDS);
    (0, cache_1.deleteCache)(`otp_verify_attempts_${normalizedEmail}`);
    await (0, sendmail_1.sendOtpEmail)(normalizedEmail, otpCode, validityDuration);
    res.status(200).json({
        success: true,
        message: "OTP email sent successfully",
        data: {
            otpCode: process.env.NODE_ENV === "development" ? otpCode : undefined,
        },
    });
});
MailController.verifyOtp = (0, errorHandler_middleware_1.asyncHandler)(async (req, res, next) => {
    const { to, otpCode, is_verified, forgot_password } = req.body;
    const normalizedEmail = to.toLowerCase();
    const otpVerifyAttemptKey = `otp_verify_attempts_${normalizedEmail}`;
    let attempts = (0, cache_1.getCache)(otpVerifyAttemptKey) || 0;
    if (attempts >= MAX_OTP_VERIFY_ATTEMPTS) {
        throw new AppError_1.AppError("Too many OTP verification attempts. Please try sending a new OTP", 429);
    }
    const storedOtp = (0, cache_1.getCache)(`otp_${normalizedEmail}`);
    if (!storedOtp) {
        (0, cache_1.setCache)(otpVerifyAttemptKey, attempts + 1, HOUR_IN_SECONDS);
        throw new AppError_1.AppError("OTP expired or invalid", 400);
    }
    if (storedOtp !== otpCode) {
        (0, cache_1.setCache)(otpVerifyAttemptKey, attempts + 1, HOUR_IN_SECONDS);
        throw new AppError_1.AppError("Invalid OTP", 400);
    }
    (0, cache_1.deleteCache)(`otp_${normalizedEmail}`);
    (0, cache_1.deleteCache)(otpVerifyAttemptKey);
    const user = await user_service_1.UserService.getUserByEmail(normalizedEmail);
    if (!user) {
        throw new AppError_1.AppError("User not found", 404);
    }
    if (is_verified === true) {
        await user_service_1.UserService.updateUserStatus(user.id, "active");
    }
    if (forgot_password === true) {
        // Implement password reset token generation and response here if needed
    }
    res.status(200).json({
        success: true,
        message: "OTP verified successfully",
    });
});
MailController.sendUpdate = (0, errorHandler_middleware_1.asyncHandler)(async (req, res, next) => {
    const { to, userName, updateDetails, actionLink } = req.body;
    await (0, sendmail_1.sendUpdateEmail)(to, userName, updateDetails, actionLink);
    res.status(200).json({
        success: true,
        message: "Account update email sent successfully",
    });
});
MailController.sendNotification = (0, errorHandler_middleware_1.asyncHandler)(async (req, res, next) => {
    const { to, userName, notificationSubject, notificationBody, actionLink, actionText, } = req.body;
    await (0, sendmail_1.sendNotificationEmail)(to, userName, notificationSubject, notificationBody, actionLink, actionText);
    res.status(200).json({
        success: true,
        message: "Notification email sent successfully",
    });
});
MailController.sendWelcome = (0, errorHandler_middleware_1.asyncHandler)(async (req, res, next) => {
    const { to, userName, actionLink } = req.body;
    const welcomeCacheKey = `welcome_sent_${to}`;
    if ((0, cache_1.getCache)(welcomeCacheKey)) {
        throw new AppError_1.AppError("Welcome email already sent to this email address today", 429);
    }
    (0, cache_1.setCache)(welcomeCacheKey, true, DAY_IN_SECONDS);
    await (0, sendmail_1.sendWelcomeEmail)(to, userName, actionLink);
    res.status(200).json({
        success: true,
        message: "Welcome email sent successfully",
    });
});
MailController.sendPasswordReset = (0, errorHandler_middleware_1.asyncHandler)(async (req, res, next) => {
    const { to, userName, resetLink, validityDuration } = req.body;
    await (0, sendmail_1.sendPasswordResetEmail)(to, userName, resetLink, validityDuration);
    res.status(200).json({
        success: true,
        message: "Password reset email sent successfully",
    });
});
MailController.sendInvoice = (0, errorHandler_middleware_1.asyncHandler)(async (req, res, next) => {
    const { to, invoiceNumber, amountDue, dueDate, downloadLink } = req.body;
    await (0, sendmail_1.sendInvoiceEmail)(to, invoiceNumber, amountDue, dueDate, downloadLink);
    res.status(200).json({
        success: true,
        message: "Invoice email sent successfully",
    });
});
MailController.sendCustom = (0, errorHandler_middleware_1.asyncHandler)(async (req, res, next) => {
    const { to, subject, body } = req.body;
    await (0, sendmail_1.sendCustomEmail)(to, subject, body);
    res.status(200).json({
        success: true,
        message: "Custom email sent successfully",
    });
});
//# sourceMappingURL=mail.controller.js.map