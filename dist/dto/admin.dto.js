"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanParamsDto = exports.SubscriptionParamsDto = exports.UserParamsDto = exports.AdminQueryDto = exports.UpdateUserRoleDto = exports.UpdateUserStatusDto = void 0;
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
// Admin Query Parameters DTO
exports.AdminQueryDto = zod_1.z.object({
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
    role: zod_1.z.enum(["officer", "cvo", "legal_board", "admin", "owner"]).optional(),
    account_status: zod_1.z
        .enum(["pending_verification", "active", "inactive", "suspended"])
        .optional(),
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
});
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
//# sourceMappingURL=admin.dto.js.map