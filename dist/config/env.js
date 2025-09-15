"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RAZORPAY_KEY_SECRET = exports.RAZORPAY_KEY_ID = exports.GEMINI_API_KEYS = exports.LOGO = exports.BULLMQ_DASH_PASS = exports.BULLMQ_DASH_USER = exports.UTIL_SECRET = exports.UTILS_API = exports.BASE_URL = exports.DB_SSL = exports.DB_NAME = exports.DB_PASSWORD = exports.DB_USER = exports.DB_PORT = exports.DB_HOST = exports.JWT_EXPIRES_IN = exports.JWT_SECRET = exports.PORT = exports.NODE_ENV = exports.env = void 0;
const dotenv_1 = require("dotenv");
const zod_1 = require("zod");
// Load environment variables from .env file
(0, dotenv_1.config)();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z
        .enum(["development", "production", "test", "staging"])
        .default("development"),
    PORT: zod_1.z
        .string()
        .default("3000")
        .transform((val) => parseInt(val, 10)),
    JWT_SECRET: zod_1.z.string().min(32),
    API_KEY_ENCRYPTION_SECRET: zod_1.z
        .string()
        .length(32, "API_KEY_ENCRYPTION_SECRET must be a 32-character string"),
    ENCRYPTION_KEY: zod_1.z
        .string()
        .length(64, "ENCRYPTION_KEY must be a 64-character hex string (32 bytes)"),
    ENCRYPTION_IV_LENGTH: zod_1.z.number().default(16),
    DATABASE_URL: zod_1.z.string().url("DATABASE_URL must be a valid URL"),
    TZ: zod_1.z.string().optional(),
    // Email Configuration (for Nodemailer)
    EMAIL_HOST: zod_1.z.string().optional(),
    EMAIL_PORT: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .optional(),
    EMAIL_SECURE: zod_1.z
        .enum(["true", "false"])
        .default("false")
        .transform((val) => val === "true")
        .optional(),
    EMAIL_USER: zod_1.z.string().optional(),
    EMAIL_PASS: zod_1.z.string().optional(),
    DEFAULT_EMAIL_FROM: zod_1.z
        .string()
        .email("DEFAULT_EMAIL_FROM must be a valid email address")
        .optional(),
    CORS_ORIGINS: zod_1.z.string().optional(),
    STRIPE_SECRET_KEY: zod_1.z.string().optional(),
    STRIPE_WEBHOOK_SECRET: zod_1.z.string().optional(),
    STRIPE_CANCEL_URL: zod_1.z.string().url().optional(),
    STRIPE_SUCCESS_URL: zod_1.z.string().url().optional(),
    RAZORPAY_KEY_ID: zod_1.z.string().optional(),
    RAZORPAY_KEY_SECRET: zod_1.z.string().optional(),
    RAZORPAY_WEBHOOK_SECRET: zod_1.z.string().optional(),
    REDIS_URL: zod_1.z.string().optional(),
    GEMINI_API_KEYS: zod_1.z
        .string()
        .min(1, "GEMINI_API_KEYS must be a comma-separated list of keys"),
    WEBSITE: zod_1.z.string(),
    COMPANY_MAIL: zod_1.z.string(),
    BCRYPT_SALT_ROUNDS: zod_1.z
        .string()
        .default("10")
        .transform((val) => parseInt(val, 10)),
    LOG_LEVEL: zod_1.z
        .enum(["error", "warn", "info", "http", "verbose", "debug", "silly"])
        .default("info"),
    BASE_URL: zod_1.z.string().url("BASE_URL must be a valid URL").optional(),
    UTILS_API: zod_1.z.string().url("UTILS_API must be a valid URL"),
    UTIL_SECRET: zod_1.z.string(),
    BULLMQ_DASH_USER: zod_1.z.string().default("admin"),
    BULLMQ_DASH_PASS: zod_1.z.string().default("supersecret"),
    LOGO: zod_1.z.string().url().optional(),
    // LinkedIn OAuth Configuration
    LINKEDIN_CLIENT_ID: zod_1.z.string().optional(),
    LINKEDIN_CLIENT_SECRET: zod_1.z.string().optional(),
    LINKEDIN_WEBSITE_ID: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .optional(),
    // Facebook OAuth Configuration
    FACEBOOK_APP_ID: zod_1.z.string().optional(),
    FACEBOOK_APP_SECRET: zod_1.z.string().optional(),
    FACEBOOK_WEBSITE_ID: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .optional(),
    // YouTube OAuth Configuration
    GOOGLE_CLIENT_ID: zod_1.z.string().optional(),
    GOOGLE_CLIENT_SECRET: zod_1.z.string().optional(),
    YOUTUBE_API_KEY: zod_1.z.string().optional(),
    YOUTUBE_WEBSITE_ID: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .optional(),
    FRONTEND_URL: zod_1.z.string().url().optional(),
    SERVER_URL: zod_1.z.string().url().optional(),
});
let parsedEnv;
try {
    parsedEnv = envSchema.parse(process.env);
}
catch (error) {
    if (error instanceof zod_1.z.ZodError) {
        console.error("FATAL ERROR: Environment variable validation failed! Issues:");
        error.errors.forEach((err) => {
            console.error(`  Path: ${err.path.join(".")}, Message: ${err.message}`);
        });
        process.exit(1);
    }
    console.error("FATAL ERROR: Could not parse environment variables during initial load.", error);
    process.exit(1);
}
exports.env = parsedEnv;
// Runtime validation for critical production/staging variables
if (exports.env.NODE_ENV === "production" || exports.env.NODE_ENV === "staging") {
    if (!exports.env.BASE_URL) {
        console.error("FATAL ERROR: BASE_URL environment variable is not set for production/staging.");
        process.exit(1);
    }
    if (!exports.env.JWT_SECRET) {
        console.error("FATAL ERROR: JWT_SECRET environment variable is not set for production/staging.");
        process.exit(1);
    }
    // Optional warning for email keys if they are intended to be used later
    // if (!env.SENDGRID_API_KEY || !env.DEFAULT_EMAIL_FROM) {
    //   console.warn("Warning: SENDGRID_API_KEY or DEFAULT_EMAIL_FROM is not set. Email features will fail if used.");
    // }
}
// Function to get environment variable and throw error if not set
const getEnvVar = (varName, defaultValue) => {
    const value = process.env[varName];
    if (value !== undefined) {
        return value;
    }
    if (defaultValue !== undefined) {
        // console.log(`Info: Environment variable ${varName} not set, using default value: '${defaultValue}'`);
        return defaultValue;
    }
    // If no value and no defaultValue, it's a required variable that's missing.
    const errorMessage = `FATAL ERROR: Required environment variable ${varName} is not set.`;
    console.error(errorMessage);
    if (exports.env.NODE_ENV === "production" || exports.env.NODE_ENV === "staging") {
        // Also exit for staging or other critical envs
        process.exit(1);
    }
    // For development, still throw to alert the developer immediately
    throw new Error(errorMessage);
};
exports.NODE_ENV = exports.env.NODE_ENV;
exports.PORT = exports.env.PORT;
// JWT Configuration
exports.JWT_SECRET = exports.env.JWT_SECRET;
if ((exports.env.NODE_ENV === "production" || exports.env.NODE_ENV === "staging") &&
    exports.JWT_SECRET === "your-default-super-secret-key-please-change") {
    console.error("FATAL ERROR: JWT_SECRET is not set to a secure value in production/staging!");
    process.exit(1); // Exit if critical secrets are not set in production/staging
}
exports.JWT_EXPIRES_IN = getEnvVar("JWT_EXPIRES_IN", "1d");
// Database Configuration
exports.DB_HOST = getEnvVar("DB_HOST", "localhost");
exports.DB_PORT = parseInt(getEnvVar("DB_PORT", "5432"), 10);
exports.DB_USER = getEnvVar("DB_USER"); // No default, now throws if not set by getEnvVar
exports.DB_PASSWORD = getEnvVar("DB_PASSWORD"); // No default, now throws if not set by getEnvVar
exports.DB_NAME = getEnvVar("DB_NAME"); // No default, now throws if not set by getEnvVar
exports.DB_SSL = getEnvVar("DB_SSL", "false").toLowerCase() === "true"; // Support boolean SSL config
// Base URL for the application, used for constructing absolute URLs (e.g., for Swagger)
exports.BASE_URL = exports.env.BASE_URL;
// Add other environment variables as needed
exports.UTILS_API = exports.env.UTILS_API;
exports.UTIL_SECRET = exports.env.UTIL_SECRET;
exports.BULLMQ_DASH_USER = exports.env.BULLMQ_DASH_USER;
exports.BULLMQ_DASH_PASS = exports.env.BULLMQ_DASH_PASS;
exports.LOGO = exports.env.LOGO;
exports.GEMINI_API_KEYS = (process.env.GEMINI_API_KEYS || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
// Razorpay Configuration
exports.RAZORPAY_KEY_ID = exports.env.RAZORPAY_KEY_ID || "";
exports.RAZORPAY_KEY_SECRET = exports.env.RAZORPAY_KEY_SECRET || "";
//# sourceMappingURL=env.js.map