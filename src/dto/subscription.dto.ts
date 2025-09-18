import { z } from "zod";

// Create Subscription DTO
export const CreateSubscriptionDto = z.object({
  user_id: z
    .number()
    .int("User ID must be an integer")
    .min(1, "User ID must be greater than 0"),
  plan_id: z
    .number()
    .int("Plan ID must be an integer")
    .min(1, "Plan ID must be greater than 0"),
  payment_provider_subscription_id: z
    .string()
    .max(
      255,
      "Payment provider subscription ID must be less than 255 characters"
    )
    .optional(),
  status: z
    .enum(["active", "cancelled", "past_due", "trialing"])
    .default("active"),
  start_date: z
    .string()
    .datetime("Invalid start date format. Use ISO 8601 format")
    .transform((val) => new Date(val)),
  end_date: z
    .string()
    .datetime("Invalid end date format. Use ISO 8601 format")
    .transform((val) => new Date(val))
    .optional(),
});

// Update Subscription DTO
export const UpdateSubscriptionDto = z.object({
  status: z.enum(["active", "cancelled", "past_due", "trialing"]).optional(),
  end_date: z
    .string()
    .datetime("Invalid end date format. Use ISO 8601 format")
    .transform((val) => new Date(val))
    .optional(),
  payment_provider_subscription_id: z
    .string()
    .max(
      255,
      "Payment provider subscription ID must be less than 255 characters"
    )
    .optional(),
});

// Subscription Query Parameters DTO
export const SubscriptionQueryDto = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, "Page must be greater than 0")
    .default("1")
    .optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 100, "Limit must be between 1 and 100")
    .default("10")
    .optional(),
  offset: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 0, "Offset must be 0 or greater")
    .default("0")
    .optional(),
  status: z.enum(["active", "cancelled", "past_due", "trialing"]).optional(),
  min_price: z
    .string()
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val >= 0, "Invalid minimum price")
    .optional(),
  max_price: z
    .string()
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val >= 0, "Invalid maximum price")
    .optional(),
});

// Subscription ID Parameter DTO
export const SubscriptionParamsDto = z.object({
  id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, "Invalid subscription ID"),
});

// Export types
export type CreateSubscriptionDtoType = z.infer<typeof CreateSubscriptionDto>;
export type UpdateSubscriptionDtoType = z.infer<typeof UpdateSubscriptionDto>;
export type SubscriptionQueryDtoType = z.infer<typeof SubscriptionQueryDto>;
export type SubscriptionParamsDtoType = z.infer<typeof SubscriptionParamsDto>;
