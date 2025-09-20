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

// Base Admin Query Parameters DTO
export const BaseAdminQueryDto = z.object({
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
});

// Admin Query Parameters DTO for Users
export const AdminUserQueryDto = BaseAdminQueryDto.extend({
  role: z.enum(["officer", "cvo", "legal_board", "admin", "owner"]).optional(),
  account_status: z
    .enum(["pending_verification", "active", "inactive", "suspended"])
    .optional(),
  q: z.string().min(1, "Search query must not be empty").optional(),
});

// Admin Query Parameters DTO for Cases
export const AdminCaseQueryDto = BaseAdminQueryDto.extend({
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
  q: z.string().min(1, "Search query must not be empty").optional(),
});

// Admin Query Parameters DTO for Subscriptions
export const AdminSubscriptionQueryDto = BaseAdminQueryDto.extend({
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
  q: z.string().min(1, "Search query must not be empty").optional(),
});

// Admin Query Parameters DTO for Plans
export const AdminPlanQueryDto = BaseAdminQueryDto.extend({
  q: z.string().min(1, "Search query must not be empty").optional(),
});

// Admin Query Parameters DTO for Audit Logs
export const AdminAuditLogQueryDto = BaseAdminQueryDto.extend({
  q: z.string().min(1, "Search query must not be empty").optional(),
});

// Generic Admin Query DTO (for other generic endpoints)
export const AdminQueryDto = BaseAdminQueryDto;

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

// Case ID Parameter DTO
export const CaseParamsDto = z.object({
  caseId: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, "Invalid case ID"),
});

// Assign CVO DTO
export const AssignCvoDto = z.object({
  cvo_id: z
    .number()
    .int("CVO ID must be an integer")
    .positive("CVO ID must be positive"),
});

// Assign Legal Board DTO
export const AssignLegalBoardDto = z.object({
  legal_board_id: z
    .number()
    .int("Legal board ID must be an integer")
    .positive("Legal board ID must be positive"),
});

// Export types
export type UpdateUserStatusDtoType = z.infer<typeof UpdateUserStatusDto>;
export type UpdateUserRoleDtoType = z.infer<typeof UpdateUserRoleDto>;
export type AdminQueryDtoType = z.infer<typeof AdminQueryDto>;
export type AdminUserQueryDtoType = z.infer<typeof AdminUserQueryDto>;
export type AdminCaseQueryDtoType = z.infer<typeof AdminCaseQueryDto>;
export type AdminSubscriptionQueryDtoType = z.infer<
  typeof AdminSubscriptionQueryDto
>;
export type AdminPlanQueryDtoType = z.infer<typeof AdminPlanQueryDto>;
export type AdminAuditLogQueryDtoType = z.infer<typeof AdminAuditLogQueryDto>;
export type UserParamsDtoType = z.infer<typeof UserParamsDto>;
export type SubscriptionParamsDtoType = z.infer<typeof SubscriptionParamsDto>;
export type PlanParamsDtoType = z.infer<typeof PlanParamsDto>;
export type CaseParamsDtoType = z.infer<typeof CaseParamsDto>;
export type AssignCvoDtoType = z.infer<typeof AssignCvoDto>;
export type AssignLegalBoardDtoType = z.infer<typeof AssignLegalBoardDto>;
