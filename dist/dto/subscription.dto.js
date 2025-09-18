"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionParamsDto = exports.SubscriptionQueryDto = exports.UpdateSubscriptionDto = exports.CreateSubscriptionDto = void 0;
const zod_1 = require("zod");
// Create Subscription DTO
exports.CreateSubscriptionDto = zod_1.z.object({
    user_id: zod_1.z
        .number()
        .int("User ID must be an integer")
        .min(1, "User ID must be greater than 0"),
    plan_id: zod_1.z
        .number()
        .int("Plan ID must be an integer")
        .min(1, "Plan ID must be greater than 0"),
    payment_provider_subscription_id: zod_1.z
        .string()
        .max(255, "Payment provider subscription ID must be less than 255 characters")
        .optional(),
    status: zod_1.z
        .enum(["active", "cancelled", "past_due", "trialing"])
        .default("active"),
    start_date: zod_1.z
        .string()
        .datetime("Invalid start date format. Use ISO 8601 format")
        .transform((val) => new Date(val)),
    end_date: zod_1.z
        .string()
        .datetime("Invalid end date format. Use ISO 8601 format")
        .transform((val) => new Date(val))
        .optional(),
});
// Update Subscription DTO
exports.UpdateSubscriptionDto = zod_1.z.object({
    status: zod_1.z.enum(["active", "cancelled", "past_due", "trialing"]).optional(),
    end_date: zod_1.z
        .string()
        .datetime("Invalid end date format. Use ISO 8601 format")
        .transform((val) => new Date(val))
        .optional(),
    payment_provider_subscription_id: zod_1.z
        .string()
        .max(255, "Payment provider subscription ID must be less than 255 characters")
        .optional(),
});
// Subscription Query Parameters DTO
exports.SubscriptionQueryDto = zod_1.z.object({
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
});
// Subscription ID Parameter DTO
exports.SubscriptionParamsDto = zod_1.z.object({
    id: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => !isNaN(val) && val > 0, "Invalid subscription ID"),
});
//# sourceMappingURL=subscription.dto.js.map