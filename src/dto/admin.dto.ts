import { z } from "zod";

// Update User Status DTO
export const UpdateUserStatusDto = z.object({
  account_status: z
    .enum(["pending_verification", "active", "inactive", "suspended"])
    .refine((val) => val !== undefined, "Account status is required"),
});

// Update User Role DTO
export const UpdateUserRoleDto = z.object({
  role: z
    .enum(["officer", "cvo", "legal_board", "admin", "owner"])
    .refine((val) => val !== undefined, "Role is required"),
});

// Admin Query Parameters DTO
export const AdminQueryDto = z.object({
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
  role: z.enum(["officer", "cvo", "legal_board", "admin", "owner"]).optional(),
  account_status: z
    .enum(["pending_verification", "active", "inactive", "suspended"])
    .optional(),
  status: z
    .enum([
      "intake",
      "ai_analysis",
      "awaiting_officer_review",
      "awaiting_cvo_review",
      "awaiting_legal_review",
      "finalized",
      "archived",
    ])
    .optional(),
  min_created_at: z
    .string()
    .datetime("Invalid date format. Use ISO 8601 format")
    .optional(),
  max_created_at: z
    .string()
    .datetime("Invalid date format. Use ISO 8601 format")
    .optional(),
  user_id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, "Invalid user ID")
    .optional(),
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

// User ID Parameter DTO
export const UserParamsDto = z.object({
  userId: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, "Invalid user ID"),
});

// Subscription ID Parameter DTO
export const SubscriptionParamsDto = z.object({
  id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, "Invalid subscription ID"),
});

// Plan ID Parameter DTO
export const PlanParamsDto = z.object({
  id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, "Invalid plan ID"),
});

// Export types
export type UpdateUserStatusDtoType = z.infer<typeof UpdateUserStatusDto>;
export type UpdateUserRoleDtoType = z.infer<typeof UpdateUserRoleDto>;
export type AdminQueryDtoType = z.infer<typeof AdminQueryDto>;
export type UserParamsDtoType = z.infer<typeof UserParamsDto>;
export type SubscriptionParamsDtoType = z.infer<typeof SubscriptionParamsDto>;
export type PlanParamsDtoType = z.infer<typeof PlanParamsDto>;
