"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanParamsDto = exports.PlanQueryDto = exports.UpdatePlanDto = exports.CreatePlanDto = void 0;
const zod_1 = require("zod");
// Plan Features Schema
const PlanFeaturesSchema = zod_1.z
    .object({
    max_cases: zod_1.z
        .number()
        .int("Max cases must be an integer")
        .min(0, "Max cases must be 0 or greater")
        .nullable()
        .optional(),
    cvo_review_enabled: zod_1.z.boolean().default(false),
    legal_board_audit_enabled: zod_1.z.boolean().default(false),
    ai_analysis_enabled: zod_1.z.boolean().default(true),
    priority_support: zod_1.z.boolean().default(false),
    advanced_analytics: zod_1.z.boolean().default(false),
    custom_reports: zod_1.z.boolean().default(false),
})
    .catchall(zod_1.z.any()); // Allow additional properties
// Create Plan DTO
exports.CreatePlanDto = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, "Plan name is required")
        .max(255, "Plan name must be less than 255 characters"),
    price_monthly: zod_1.z
        .number()
        .min(0, "Price must be 0 or greater")
        .max(999999.99, "Price must be less than 999999.99"),
    features: PlanFeaturesSchema.default({}),
});
// Update Plan DTO
exports.UpdatePlanDto = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, "Plan name is required")
        .max(255, "Plan name must be less than 255 characters")
        .optional(),
    price_monthly: zod_1.z
        .number()
        .min(0, "Price must be 0 or greater")
        .max(999999.99, "Price must be less than 999999.99")
        .optional(),
    features: PlanFeaturesSchema.optional(),
});
// Plan Query Parameters DTO
exports.PlanQueryDto = zod_1.z.object({
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
    q: zod_1.z.string().min(1, "Search query must not be empty").optional(),
});
// Plan ID Parameter DTO
exports.PlanParamsDto = zod_1.z.object({
    id: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => !isNaN(val) && val > 0, "Invalid plan ID"),
});
//# sourceMappingURL=plan.dto.js.map