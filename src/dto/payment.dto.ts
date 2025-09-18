import { z } from "zod";

// Create Razorpay Order DTO
export const CreateRazorpayOrderDto = z.object({
  planId: z
    .number()
    .int("Plan ID must be an integer")
    .min(1, "Plan ID must be greater than 0"),
  userId: z
    .string()
    .min(1, "User ID is required")
    .max(50, "User ID must be less than 50 characters"),
});

// Verify Payment DTO
export const VerifyPaymentDto = z.object({
  razorpay_order_id: z
    .string()
    .min(1, "Razorpay order ID is required")
    .regex(/^order_[A-Za-z0-9]+$/, "Invalid Razorpay order ID format"),
  razorpay_payment_id: z
    .string()
    .min(1, "Razorpay payment ID is required")
    .regex(/^pay_[A-Za-z0-9]+$/, "Invalid Razorpay payment ID format"),
  razorpay_signature: z
    .string()
    .min(1, "Razorpay signature is required")
    .min(64, "Invalid signature length")
    .max(256, "Signature too long"),
});

// Export types
export type CreateRazorpayOrderDtoType = z.infer<typeof CreateRazorpayOrderDto>;
export type VerifyPaymentDtoType = z.infer<typeof VerifyPaymentDto>;
