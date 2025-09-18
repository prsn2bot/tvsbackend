"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserProfileDto = void 0;
const zod_1 = require("zod");
// Update User Profile DTO
exports.UpdateUserProfileDto = zod_1.z.object({
    first_name: zod_1.z
        .string()
        .min(1, "First name is required")
        .max(100, "First name must be less than 100 characters")
        .optional(),
    last_name: zod_1.z
        .string()
        .min(1, "Last name is required")
        .max(100, "Last name must be less than 100 characters")
        .optional(),
    employee_id: zod_1.z
        .string()
        .max(100, "Employee ID must be less than 100 characters")
        .optional(),
    cadre_service: zod_1.z
        .string()
        .max(100, "Cadre service must be less than 100 characters")
        .optional(),
    designation_rank: zod_1.z
        .string()
        .max(100, "Designation rank must be less than 100 characters")
        .optional(),
    profile_photo_url: zod_1.z.string().url("Invalid URL format").optional(),
    head_office_address: zod_1.z
        .string()
        .max(500, "Head office address must be less than 500 characters")
        .optional(),
    branch_office_address: zod_1.z
        .string()
        .max(500, "Branch office address must be less than 500 characters")
        .optional(),
    country: zod_1.z
        .string()
        .max(100, "Country must be less than 100 characters")
        .optional(),
    state: zod_1.z
        .string()
        .max(100, "State must be less than 100 characters")
        .optional(),
    district: zod_1.z
        .string()
        .max(100, "District must be less than 100 characters")
        .optional(),
    city: zod_1.z.string().max(100, "City must be less than 100 characters").optional(),
    preferred_language: zod_1.z
        .string()
        .length(2, "Language code must be 2 characters")
        .default("en")
        .optional(),
});
//# sourceMappingURL=user.dto.js.map