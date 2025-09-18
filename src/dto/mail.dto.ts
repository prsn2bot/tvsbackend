import { z } from "zod";

// Send OTP DTO
export const SendOtpDto = z.object({
  to: z.string().email("Invalid email format").min(1, "Email is required"),
  validityDuration: z
    .string()
    .regex(
      /^\d+\s*(minute|second)s?$/i,
      "Invalid duration format. Use format like '10 minutes' or '30 seconds'"
    ),
});

// Verify OTP DTO
export const VerifyOtpDto = z.object({
  to: z.string().email("Invalid email format").min(1, "Email is required"),
  otpCode: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only digits"),
  is_verified: z.boolean().optional().default(false),
  forgot_password: z.boolean().optional().default(false),
});

// Send Update Email DTO
export const SendUpdateEmailDto = z.object({
  to: z.string().email("Invalid email format").min(1, "Email is required"),
  userName: z
    .string()
    .min(1, "User name is required")
    .max(200, "User name must be less than 200 characters"),
  updateDetails: z
    .string()
    .min(1, "Update details are required")
    .max(1000, "Update details must be less than 1000 characters"),
  actionLink: z.string().url("Invalid action link URL").optional(),
});

// Send Notification Email DTO
export const SendNotificationEmailDto = z.object({
  to: z.string().email("Invalid email format").min(1, "Email is required"),
  userName: z
    .string()
    .min(1, "User name is required")
    .max(200, "User name must be less than 200 characters"),
  notificationSubject: z
    .string()
    .min(1, "Notification subject is required")
    .max(200, "Notification subject must be less than 200 characters"),
  notificationBody: z
    .string()
    .min(1, "Notification body is required")
    .max(2000, "Notification body must be less than 2000 characters"),
  actionLink: z.string().url("Invalid action link URL").optional(),
  actionText: z
    .string()
    .max(50, "Action text must be less than 50 characters")
    .optional(),
});

// Send Welcome Email DTO
export const SendWelcomeEmailDto = z.object({
  to: z.string().email("Invalid email format").min(1, "Email is required"),
  userName: z
    .string()
    .min(1, "User name is required")
    .max(200, "User name must be less than 200 characters"),
  actionLink: z.string().url("Invalid action link URL").optional(),
});

// Send Password Reset Email DTO
export const SendPasswordResetEmailDto = z.object({
  to: z.string().email("Invalid email format").min(1, "Email is required"),
  userName: z
    .string()
    .min(1, "User name is required")
    .max(200, "User name must be less than 200 characters"),
  resetLink: z
    .string()
    .url("Invalid reset link URL")
    .min(1, "Reset link is required"),
  validityDuration: z
    .string()
    .regex(
      /^\d+\s*(hour|minute)s?$/i,
      "Invalid duration format. Use format like '1 hour' or '30 minutes'"
    ),
});

// Send Invoice Email DTO
export const SendInvoiceEmailDto = z.object({
  to: z.string().email("Invalid email format").min(1, "Email is required"),
  invoiceNumber: z
    .string()
    .min(1, "Invoice number is required")
    .max(50, "Invoice number must be less than 50 characters"),
  amountDue: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format")
    .min(1, "Amount due is required"),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD")
    .min(1, "Due date is required"),
  downloadLink: z.string().url("Invalid download link URL").optional(),
});

// Send Custom Email DTO
export const SendCustomEmailDto = z.object({
  to: z.string().email("Invalid email format").min(1, "Email is required"),
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(200, "Subject must be less than 200 characters"),
  body: z
    .string()
    .min(1, "Email body is required")
    .max(5000, "Email body must be less than 5000 characters"),
});

// Export types
export type SendOtpDtoType = z.infer<typeof SendOtpDto>;
export type VerifyOtpDtoType = z.infer<typeof VerifyOtpDto>;
export type SendUpdateEmailDtoType = z.infer<typeof SendUpdateEmailDto>;
export type SendNotificationEmailDtoType = z.infer<
  typeof SendNotificationEmailDto
>;
export type SendWelcomeEmailDtoType = z.infer<typeof SendWelcomeEmailDto>;
export type SendPasswordResetEmailDtoType = z.infer<
  typeof SendPasswordResetEmailDto
>;
export type SendInvoiceEmailDtoType = z.infer<typeof SendInvoiceEmailDto>;
export type SendCustomEmailDtoType = z.infer<typeof SendCustomEmailDto>;
