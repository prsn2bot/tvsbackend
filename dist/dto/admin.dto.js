"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignLegalBoardDto = exports.AssignCvoDto = exports.CaseParamsDto = exports.PlanParamsDto = exports.SubscriptionParamsDto = exports.UserParamsDto = exports.AdminQueryDto = exports.AdminAuditLogQueryDto = exports.AdminPlanQueryDto = exports.AdminSubscriptionQueryDto = exports.AdminCaseQueryDto = exports.AdminUserQueryDto = exports.BaseAdminQueryDto = exports.UpdateUserRoleDto = exports.UpdateUserStatusDto = void 0;
const zod_1 = require("zod");
// Update User Status DTO
exports.UpdateUserStatusDto = zod_1.z.object({
    account_status: zod_1.z
        .enum(["pending_verification", "active", "inactive", "suspended"])
        .refine((val) => val !== undefined, "Account status is required"),
});
// Update User Role DTO
exports.UpdateUserRoleDto = zod_1.z.object({
    role: zod_1.z
        .enum(["officer", "cvo", "legal_board", "admin", "owner"])
        .refine((val) => val !== undefined, "Role is required"),
});
// Base Admin Query Parameters DTO
exports.BaseAdminQueryDto = zod_1.z.object({
    page: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => val > 0, "Page must be greater than 0")
        .default("1")
        .optional(),
    limit: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => val > 0 && val <= 100, "Limit must be between 1 and 100")
        .default("10")
        .optional(),
    offset: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => val >= 0, "Offset must be 0 or greater")
        .default("0")
        .optional(),
    min_created_at: zod_1.z
        .string()
        .datetime("Invalid date format. Use ISO 8601 format")
        .optional(),
    max_created_at: zod_1.z
        .string()
        .datetime("Invalid date format. Use ISO 8601 format")
        .optional(),
    user_id: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => !isNaN(val) && val > 0, "Invalid user ID")
        .optional(),
});
// Admin Query Parameters DTO for Users
exports.AdminUserQueryDto = exports.BaseAdminQueryDto.extend({
    role: zod_1.z.enum(["officer", "cvo", "legal_board", "admin", "owner"]).optional(),
    account_status: zod_1.z
        .enum(["pending_verification", "active", "inactive", "suspended"])
        .optional(),
    q: zod_1.z.string().min(1, "Search query must not be empty").optional(),
});
// Admin Query Parameters DTO for Cases
exports.AdminCaseQueryDto = exports.BaseAdminQueryDto.extend({
    status: zod_1.z
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
    q: zod_1.z.string().min(1, "Search query must not be empty").optional(),
});
// Admin Query Parameters DTO for Subscriptions
exports.AdminSubscriptionQueryDto = exports.BaseAdminQueryDto.extend({
    status: zod_1.z.enum(["active", "cancelled", "past_due", "trialing"]).optional(),
    min_price: zod_1.z
        .string()
        .transform((val) => parseFloat(val))
        .refine((val) => !isNaN(val) && val >= 0, "Invalid minimum price")
        .optional(),
    max_price: zod_1.z
        .string()
        .transform((val) => parseFloat(val))
        .refine((val) => !isNaN(val) && val >= 0, "Invalid maximum price")
        .optional(),
    q: zod_1.z.string().min(1, "Search query must not be empty").optional(),
});
// Admin Query Parameters DTO for Plans
exports.AdminPlanQueryDto = exports.BaseAdminQueryDto.extend({
    q: zod_1.z.string().min(1, "Search query must not be empty").optional(),
});
// Admin Query Parameters DTO for Audit Logs
exports.AdminAuditLogQueryDto = exports.BaseAdminQueryDto.extend({
    q: zod_1.z.string().min(1, "Search query must not be empty").optional(),
});
// Generic Admin Query DTO (for other generic endpoints)
exports.AdminQueryDto = exports.BaseAdminQueryDto;
// User ID Parameter DTO
exports.UserParamsDto = zod_1.z.object({
    userId: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => !isNaN(val) && val > 0, "Invalid user ID"),
});
// Subscription ID Parameter DTO
exports.SubscriptionParamsDto = zod_1.z.object({
    id: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => !isNaN(val) && val > 0, "Invalid subscription ID"),
});
// Plan ID Parameter DTO
exports.PlanParamsDto = zod_1.z.object({
    id: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => !isNaN(val) && val > 0, "Invalid plan ID"),
});
// Case ID Parameter DTO
exports.CaseParamsDto = zod_1.z.object({
    caseId: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => !isNaN(val) && val > 0, "Invalid case ID"),
});
// Assign CVO DTO
exports.AssignCvoDto = zod_1.z.object({
    cvo_id: zod_1.z
        .number()
        .int("CVO ID must be an integer")
        .positive("CVO ID must be positive"),
});
// Assign Legal Board DTO
exports.AssignLegalBoardDto = zod_1.z.object({
    legal_board_id: zod_1.z
        .number()
        .int("Legal board ID must be an integer")
        .positive("Legal board ID must be positive"),
});
//# sourceMappingURL=admin.dto.js.map