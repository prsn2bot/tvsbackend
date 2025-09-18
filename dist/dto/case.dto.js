"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaseParamsDto = exports.CaseQueryDto = exports.SubmitReviewDto = exports.AddDocumentDto = exports.CreateCaseDto = void 0;
const zod_1 = require("zod");
// Create Case DTO
exports.CreateCaseDto = zod_1.z.object({
    title: zod_1.z
        .string()
        .min(1, "Case title is required")
        .max(255, "Case title must be less than 255 characters"),
    description: zod_1.z
        .string()
        .min(1, "Case description is required")
        .max(2000, "Case description must be less than 2000 characters"),
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
        .default("intake"),
});
// Add Document DTO
exports.AddDocumentDto = zod_1.z.object({
    cloudinary_public_id: zod_1.z.string().min(1, "Cloudinary public ID is required"),
    secure_url: zod_1.z
        .string()
        .url("Invalid secure URL format")
        .min(1, "Secure URL is required"),
    ocr_text: zod_1.z.string().optional(),
});
// Submit Review DTO
exports.SubmitReviewDto = zod_1.z.object({
    review_text: zod_1.z
        .string()
        .min(1, "Review text is required")
        .max(2000, "Review text must be less than 2000 characters"),
    decision: zod_1.z
        .enum(["pending", "approved", "rejected", "escalated_to_legal"])
        .default("pending"),
});
// Query Parameters DTO
exports.CaseQueryDto = zod_1.z.object({
    page: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => val > 0, "Page must be greater than 0")
        .default("1"),
    limit: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => val > 0 && val <= 100, "Limit must be between 1 and 100")
        .default("10"),
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
});
// Case ID Parameter DTO
exports.CaseParamsDto = zod_1.z.object({
    caseId: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => !isNaN(val) && val > 0, "Invalid case ID"),
});
//# sourceMappingURL=case.dto.js.map