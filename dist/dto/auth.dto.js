"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenDto = exports.LoginDto = exports.RegisterDto = void 0;
const zod_1 = require("zod");
// Register DTO
exports.RegisterDto = zod_1.z.object({
    email: zod_1.z
        .string()
        .email("Invalid email format")
        .min(1, "Email is required")
        .max(255, "Email must be less than 255 characters"),
    password: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password must be less than 128 characters")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
    role: zod_1.z
        .enum(["officer", "cvo", "legal_board", "admin", "owner"])
        .optional()
        .default("officer"),
});
// Login DTO
exports.LoginDto = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format").min(1, "Email is required"),
    password: zod_1.z.string().min(1, "Password is required"),
});
// Refresh Token DTO
exports.RefreshTokenDto = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, "Refresh token is required"),
});
//# sourceMappingURL=auth.dto.js.map