"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailController = void 0;
const sendmail_1 = require("../../utils/sendmail");
const cache_1 = require("../../utils/cache");
const user_service_1 = require("../../services/user.service");
const HOUR_IN_SECONDS = 3600;
const DAY_IN_SECONDS = 86400;
const MAX_OTP_VERIFY_ATTEMPTS = 5;
class MailController {
    static async sendOtp(req, res, next) {
        try {
            const { to, validityDuration } = req.body;
            if (!to || !validityDuration) {
                return res
                    .status(400)
                    .json({ message: "Missing required fields: to, validityDuration" });
            }
            const normalizedEmail = to.toLowerCase();
            // Assuming UserService has a method getUserByEmail or similar
            const existingUser = await user_service_1.UserService.getUserByEmail(normalizedEmail);
            if (!existingUser) {
                return res
                    .status(404)
                    .json({ message: "User with this email does not exist." });
            }
            const otpSendCacheKey = `otp_count_hourly_${normalizedEmail}`;
            let otpSendCount = (0, cache_1.getCache)(otpSendCacheKey) || 0;
            if (otpSendCount >= 3) {
                return res.status(429).json({
                    message: "Too many OTP requests for this email address. Please try again after an hour.",
                });
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
                message: "OTP email sent successfully",
                otpCode,
                des: "get otp in only for development",
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async verifyOtp(req, res, next) {
        try {
            const { to, otpCode, is_verified, forgot_password } = req.body;
            if (!to || !otpCode) {
                return res
                    .status(400)
                    .json({ message: "Missing required fields: to, otpCode" });
            }
            const normalizedEmail = to.toLowerCase();
            const otpVerifyAttemptKey = `otp_verify_attempts_${normalizedEmail}`;
            let attempts = (0, cache_1.getCache)(otpVerifyAttemptKey) || 0;
            if (attempts >= MAX_OTP_VERIFY_ATTEMPTS) {
                return res.status(429).json({
                    message: "Too many OTP verification attempts. Please try sending a new OTP.",
                });
            }
            const storedOtp = (0, cache_1.getCache)(`otp_${normalizedEmail}`);
            if (!storedOtp) {
                (0, cache_1.setCache)(otpVerifyAttemptKey, attempts + 1, HOUR_IN_SECONDS);
                return res.status(400).json({ message: "OTP expired or invalid" });
            }
            if (storedOtp !== otpCode) {
                (0, cache_1.setCache)(otpVerifyAttemptKey, attempts + 1, HOUR_IN_SECONDS);
                return res.status(400).json({ message: "Invalid OTP" });
            }
            (0, cache_1.deleteCache)(`otp_${normalizedEmail}`);
            (0, cache_1.deleteCache)(otpVerifyAttemptKey);
            const user = await user_service_1.UserService.getUserProfile(normalizedEmail);
            if (!user) {
                return res.status(404).json({ message: "User not found." });
            }
            if (is_verified === true) {
                await user_service_1.UserService.updateUserStatus(user.id, "active");
            }
            if (forgot_password === true) {
                // Implement password reset token generation and response here if needed
            }
            res.status(200).json({ message: "OTP verified successfully" });
        }
        catch (error) {
            next(error);
        }
    }
    static async sendUpdate(req, res, next) {
        try {
            const { to, userName, updateDetails, actionLink } = req.body;
            if (!to || !userName || !updateDetails) {
                return res.status(400).json({
                    message: "Missing required fields: to, userName, updateDetails",
                });
            }
            await (0, sendmail_1.sendUpdateEmail)(to, userName, updateDetails, actionLink);
            res
                .status(200)
                .json({ message: "Account update email sent successfully" });
        }
        catch (error) {
            next(error);
        }
    }
    static async sendNotification(req, res, next) {
        try {
            const { to, userName, notificationSubject, notificationBody, actionLink, actionText, } = req.body;
            if (!to || !userName || !notificationSubject || !notificationBody) {
                return res.status(400).json({
                    message: "Missing required fields: to, userName, notificationSubject, notificationBody",
                });
            }
            await (0, sendmail_1.sendNotificationEmail)(to, userName, notificationSubject, notificationBody, actionLink, actionText);
            res.status(200).json({ message: "Notification email sent successfully" });
        }
        catch (error) {
            next(error);
        }
    }
    static async sendWelcome(req, res, next) {
        try {
            const { to, userName, actionLink } = req.body;
            if (!to || !userName) {
                return res
                    .status(400)
                    .json({ message: "Missing required fields: to, userName" });
            }
            const welcomeCacheKey = `welcome_sent_${to}`;
            if ((0, cache_1.getCache)(welcomeCacheKey)) {
                return res.status(429).json({
                    message: "Welcome email already sent to this email address today.",
                });
            }
            (0, cache_1.setCache)(welcomeCacheKey, true, DAY_IN_SECONDS);
            await (0, sendmail_1.sendWelcomeEmail)(to, userName, actionLink);
            res.status(200).json({ message: "Welcome email sent successfully" });
        }
        catch (error) {
            next(error);
        }
    }
    static async sendPasswordReset(req, res, next) {
        try {
            const { to, userName, resetLink, validityDuration } = req.body;
            if (!to || !userName || !resetLink || !validityDuration) {
                return res.status(400).json({
                    message: "Missing required fields: to, userName, resetLink, validityDuration",
                });
            }
            await (0, sendmail_1.sendPasswordResetEmail)(to, userName, resetLink, validityDuration);
            res
                .status(200)
                .json({ message: "Password reset email sent successfully" });
        }
        catch (error) {
            next(error);
        }
    }
    static async sendInvoice(req, res, next) {
        try {
            const { to, invoiceNumber, amountDue, dueDate, downloadLink } = req.body;
            if (!to || !invoiceNumber || !amountDue || !dueDate) {
                return res.status(400).json({
                    message: "Missing required fields: to, invoiceNumber, amountDue, dueDate",
                });
            }
            await (0, sendmail_1.sendInvoiceEmail)(to, invoiceNumber, amountDue, dueDate, downloadLink);
            res.status(200).json({ message: "Invoice email sent successfully" });
        }
        catch (error) {
            next(error);
        }
    }
    static async sendCustom(req, res, next) {
        try {
            const { to, subject, body } = req.body;
            if (!to || !subject || !body) {
                return res
                    .status(400)
                    .json({ message: "Missing required fields: to, subject, body" });
            }
            await (0, sendmail_1.sendCustomEmail)(to, subject, body);
            res.status(200).json({ message: "Custom email sent successfully" });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.MailController = MailController;
//# sourceMappingURL=mail.controller.js.map