import { z } from "zod";

// Create Case DTO
export const CreateCaseDto = z.object({
  title: z
    .string()
    .min(1, "Case title is required")
    .max(255, "Case title must be less than 255 characters"),
  description: z
    .string()
    .min(1, "Case description is required")
    .max(2000, "Case description must be less than 2000 characters"),
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
    .default("intake"),
});

// Add Document DTO
export const AddDocumentDto = z.object({
  cloudinary_public_id: z.string().min(1, "Cloudinary public ID is required"),
  secure_url: z
    .string()
    .url("Invalid secure URL format")
    .min(1, "Secure URL is required"),
  ocr_text: z.string().optional(),
  ocr_method_used: z.string().optional(),
  ocr_confidence: z.number().min(0).max(1).optional(),
  ocr_processing_time: z.number().min(0).optional(),
  ocr_retry_count: z.number().min(0).optional(),
  ocr_error_details: z.string().optional(),
  ocr_last_attempt: z.date().optional(),
});

// Submit Review DTO
export const SubmitReviewDto = z.object({
  review_text: z
    .string()
    .min(1, "Review text is required")
    .max(2000, "Review text must be less than 2000 characters"),
  decision: z
    .enum(["pending", "approved", "rejected", "escalated_to_legal"])
    .default("pending"),
});

// Query Parameters DTO
export const CaseQueryDto = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, "Page must be greater than 0")
    .default("1"),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 100, "Limit must be between 1 and 100")
    .default("10"),
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
});

// Case ID Parameter DTO
export const CaseParamsDto = z.object({
  caseId: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, "Invalid case ID"),
});

// Export types
export type CreateCaseDtoType = z.infer<typeof CreateCaseDto>;
export type AddDocumentDtoType = z.infer<typeof AddDocumentDto>;
export type SubmitReviewDtoType = z.infer<typeof SubmitReviewDto>;
export type CaseQueryDtoType = z.infer<typeof CaseQueryDto>;
export type CaseParamsDtoType = z.infer<typeof CaseParamsDto>;
