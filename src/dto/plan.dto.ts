import { z } from "zod";

// Plan Features Schema
const PlanFeaturesSchema = z
  .object({
    max_cases: z
      .number()
      .int("Max cases must be an integer")
      .min(0, "Max cases must be 0 or greater")
      .nullable()
      .optional(), // null for unlimited
    cvo_review_enabled: z.boolean().default(false),
    legal_board_audit_enabled: z.boolean().default(false),
    ai_analysis_enabled: z.boolean().default(true),
    priority_support: z.boolean().default(false),
    advanced_analytics: z.boolean().default(false),
    custom_reports: z.boolean().default(false),
  })
  .catchall(z.any()); // Allow additional properties

// Create Plan DTO
export const CreatePlanDto = z.object({
  name: z
    .string()
    .min(1, "Plan name is required")
    .max(255, "Plan name must be less than 255 characters"),
  price_monthly: z
    .number()
    .min(0, "Price must be 0 or greater")
    .max(999999.99, "Price must be less than 999999.99"),
  features: PlanFeaturesSchema.default({}),
});

// Update Plan DTO
export const UpdatePlanDto = z.object({
  name: z
    .string()
    .min(1, "Plan name is required")
    .max(255, "Plan name must be less than 255 characters")
    .optional(),
  price_monthly: z
    .number()
    .min(0, "Price must be 0 or greater")
    .max(999999.99, "Price must be less than 999999.99")
    .optional(),
  features: PlanFeaturesSchema.optional(),
});

// Plan ID Parameter DTO
export const PlanParamsDto = z.object({
  id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, "Invalid plan ID"),
});

// Export types
export type CreatePlanDtoType = z.infer<typeof CreatePlanDto>;
export type UpdatePlanDtoType = z.infer<typeof UpdatePlanDto>;
export type PlanParamsDtoType = z.infer<typeof PlanParamsDto>;
