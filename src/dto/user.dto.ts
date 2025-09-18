import { z } from "zod";

// Update User Profile DTO
export const UpdateUserProfileDto = z.object({
  first_name: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must be less than 100 characters")
    .optional(),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name must be less than 100 characters")
    .optional(),
  employee_id: z
    .string()
    .max(100, "Employee ID must be less than 100 characters")
    .optional(),
  cadre_service: z
    .string()
    .max(100, "Cadre service must be less than 100 characters")
    .optional(),
  designation_rank: z
    .string()
    .max(100, "Designation rank must be less than 100 characters")
    .optional(),
  profile_photo_url: z.string().url("Invalid URL format").optional(),
  head_office_address: z
    .string()
    .max(500, "Head office address must be less than 500 characters")
    .optional(),
  branch_office_address: z
    .string()
    .max(500, "Branch office address must be less than 500 characters")
    .optional(),
  country: z
    .string()
    .max(100, "Country must be less than 100 characters")
    .optional(),
  state: z
    .string()
    .max(100, "State must be less than 100 characters")
    .optional(),
  district: z
    .string()
    .max(100, "District must be less than 100 characters")
    .optional(),
  city: z.string().max(100, "City must be less than 100 characters").optional(),
  preferred_language: z
    .string()
    .length(2, "Language code must be 2 characters")
    .default("en")
    .optional(),
});

// Export types
export type UpdateUserProfileDtoType = z.infer<typeof UpdateUserProfileDto>;
