"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendCustomEmailDto = exports.SendInvoiceEmailDto = exports.SendPasswordResetEmailDto = exports.SendWelcomeEmailDto = exports.SendNotificationEmailDto = exports.SendUpdateEmailDto = exports.VerifyOtpDto = exports.SendOtpDto = void 0;
const zod_1 = require("zod");
// Send OTP DTO
exports.SendOtpDto = zod_1.z.object({
    to: zod_1.z.string().email("Invalid email format").min(1, "Email is required"),
    validityDuration: zod_1.z
        .string()
        .regex(/^\d+\s*(minute|second)s?$/i, "Invalid duration format. Use format like '10 minutes' or '30 seconds'"),
});
// Verify OTP DTO
exports.VerifyOtpDto = zod_1.z.object({
    to: zod_1.z.string().email("Invalid email format").min(1, "Email is required"),
    otpCode: zod_1.z
        .string()
        .length(6, "OTP must be 6 digits")
        .regex(/^\d{6}$/, "OTP must contain only digits"),
    is_verified: zod_1.z.boolean().optional().default(false),
    forgot_password: zod_1.z.boolean().optional().default(false),
});
// Send Update Email DTO
exports.SendUpdateEmailDto = zod_1.z.object({
    to: zod_1.z.string().email("Invalid email format").min(1, "Email is required"),
    userName: zod_1.z
        .string()
        .min(1, "User name is required")
        .max(200, "User name must be less than 200 characters"),
    updateDetails: zod_1.z
        .string()
        .min(1, "Update details are required")
        .max(1000, "Update details must be less than 1000 characters"),
    actionLink: zod_1.z.string().url("Invalid action link URL").optional(),
});
// Send Notification Email DTO
exports.SendNotificationEmailDto = zod_1.z.object({
    to: zod_1.z.string().email("Invalid email format").min(1, "Email is required"),
    userName: zod_1.z
        .string()
        .min(1, "User name is required")
        .max(200, "User name must be less than 200 characters"),
    notificationSubject: zod_1.z
        .string()
        .min(1, "Notification subject is required")
        .max(200, "Notification subject must be less than 200 characters"),
    notificationBody: zod_1.z
        .string()
        .min(1, "Notification body is required")
        .max(2000, "Notification body must be less than 2000 characters"),
    actionLink: zod_1.z.string().url("Invalid action link URL").optional(),
    actionText: zod_1.z
        .string()
        .max(50, "Action text must be less than 50 characters")
        .optional(),
});
// Send Welcome Email DTO
exports.SendWelcomeEmailDto = zod_1.z.object({
    to: zod_1.z.string().email("Invalid email format").min(1, "Email is required"),
    userName: zod_1.z
        .string()
        .min(1, "User name is required")
        .max(200, "User name must be less than 200 characters"),
    actionLink: zod_1.z.string().url("Invalid action link URL").optional(),
});
// Send Password Reset Email DTO
exports.SendPasswordResetEmailDto = zod_1.z.object({
    to: zod_1.z.string().email("Invalid email format").min(1, "Email is required"),
    userName: zod_1.z
        .string()
        .min(1, "User name is required")
        .max(200, "User name must be less than 200 characters"),
    resetLink: zod_1.z
        .string()
        .url("Invalid reset link URL")
        .min(1, "Reset link is required"),
    validityDuration: zod_1.z
        .string()
        .regex(/^\d+\s*(hour|minute)s?$/i, "Invalid duration format. Use format like '1 hour' or '30 minutes'"),
});
// Send Invoice Email DTO
exports.SendInvoiceEmailDto = zod_1.z.object({
    to: zod_1.z.string().email("Invalid email format").min(1, "Email is required"),
    invoiceNumber: zod_1.z
        .string()
        .min(1, "Invoice number is required")
        .max(50, "Invoice number must be less than 50 characters"),
    amountDue: zod_1.z
        .string()
        .regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format")
        .min(1, "Amount due is required"),
    dueDate: zod_1.z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD")
        .min(1, "Due date is required"),
    downloadLink: zod_1.z.string().url("Invalid download link URL").optional(),
});
// Send Custom Email DTO
exports.SendCustomEmailDto = zod_1.z.object({
    to: zod_1.z.string().email("Invalid email format").min(1, "Email is required"),
    subject: zod_1.z
        .string()
        .min(1, "Subject is required")
        .max(200, "Subject must be less than 200 characters"),
    body: zod_1.z
        .string()
        .min(1, "Email body is required")
        .max(5000, "Email body must be less than 5000 characters"),
});
//# sourceMappingURL=mail.dto.js.map