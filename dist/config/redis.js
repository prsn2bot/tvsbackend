"use strict";
// src/config/env.config.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.TZ = exports.CLOUDINARY_API_SECRET = exports.CLOUDINARY_API_KEY = exports.CLOUDINARY_CLOUD_NAME = exports.LOGO = exports.BULLMQ_DASH_PASS = exports.BULLMQ_DASH_USER = exports.LOG_LEVEL = exports.COMPANY_MAIL = exports.WEBSITE = exports.REDIS_URL = exports.RAZORPAY_WEBHOOK_SECRET = exports.RAZORPAY_KEY_SECRET = exports.RAZORPAY_KEY_ID = exports.STRIPE_SUCCESS_URL = exports.STRIPE_CANCEL_URL = exports.STRIPE_WEBHOOK_SECRET = exports.STRIPE_SECRET_KEY = exports.GEMINI_API_KEYS = exports.CORS_ORIGINS = exports.UTIL_SECRET = exports.UTILS_API = exports.BASE_URL = exports.BCRYPT_SALT_ROUNDS = exports.ENCRYPTION_IV_LENGTH = exports.ENCRYPTION_KEY = exports.API_KEY_ENCRYPTION_SECRET = exports.DEFAULT_EMAIL_FROM = exports.EMAIL_PASS = exports.EMAIL_USER = exports.EMAIL_SECURE = exports.EMAIL_PORT = exports.EMAIL_HOST = exports.DB_SSL = exports.DB_NAME = exports.DB_PORT = exports.DB_HOST = exports.DB_PASSWORD = exports.DB_USER = exports.JWT_REFRESH_EXPIRES_IN = exports.JWT_REFRESH_SECRET = exports.JWT_EXPIRES_IN = exports.JWT_SECRET = exports.PORT = exports.NODE_ENV = exports.env = void 0;
const dotenv_1 = require("dotenv");
const zod_1 = require("zod");
// Load environment variables from .env file
(0, dotenv_1.config)();
// Define the schema for all required environment variables
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z
        .enum(["development", "production", "test", "staging"])
        .default("development"),
    PORT: zod_1.z
        .string()
        .default("3000")
        .transform((val) => parseInt(val, 10)),
    JWT_SECRET: zod_1.z.string().min(32),
    JWT_EXPIRES_IN: zod_1.z
        .string()
        .default("1d")
        .transform((val) => val),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32),
    JWT_REFRESH_EXPIRES_IN: zod_1.z
        .string()
        .default("7d")
        .transform((val) => val),
    API_KEY_ENCRYPTION_SECRET: zod_1.z.string().length(32),
    ENCRYPTION_KEY: zod_1.z.string().length(64),
    ENCRYPTION_IV_LENGTH: zod_1.z
        .string()
        .default("16")
        .transform((val) => parseInt(val, 10)),
    DATABASE_URL: zod_1.z.string().url(),
    EMAIL_HOST: zod_1.z.string().optional(),
    EMAIL_PORT: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : undefined)),
    EMAIL_SECURE: zod_1.z
        .enum(["true", "false"])
        .default("false")
        .transform((val) => val === "true")
        .optional(),
    EMAIL_USER: zod_1.z.string().optional(),
    EMAIL_PASS: zod_1.z.string().optional(),
    DEFAULT_EMAIL_FROM: zod_1.z.string().email().optional(),
    CORS_ORIGINS: zod_1.z.string().optional(),
    STRIPE_SECRET_KEY: zod_1.z.string().optional(),
    STRIPE_WEBHOOK_SECRET: zod_1.z.string().optional(),
    STRIPE_CANCEL_URL: zod_1.z.string().url().optional(),
    STRIPE_SUCCESS_URL: zod_1.z.string().url().optional(),
    RAZORPAY_KEY_ID: zod_1.z.string().optional(),
    RAZORPAY_KEY_SECRET: zod_1.z.string().optional(),
    RAZORPAY_WEBHOOK_SECRET: zod_1.z.string().optional(),
    REDIS_URL: zod_1.z.string().optional(),
    GEMINI_API_KEYS: zod_1.z.string().min(1),
    WEBSITE: zod_1.z.string(),
    COMPANY_MAIL: zod_1.z.string(),
    BCRYPT_SALT_ROUNDS: zod_1.z
        .string()
        .default("10")
        .transform((val) => parseInt(val, 10)),
    LOG_LEVEL: zod_1.z
        .enum(["error", "warn", "info", "http", "verbose", "debug", "silly"])
        .default("info"),
    BASE_URL: zod_1.z.string().url().optional(),
    UTILS_API: zod_1.z.string().url(),
    UTIL_SECRET: zod_1.z.string(),
    BULLMQ_DASH_USER: zod_1.z.string().default("admin"),
    BULLMQ_DASH_PASS: zod_1.z.string().default("supersecret"),
    LOGO: zod_1.z.string().url().optional(),
    CLOUDINARY_CLOUD_NAME: zod_1.z.string().optional(),
    CLOUDINARY_API_KEY: zod_1.z.string().optional(),
    CLOUDINARY_API_SECRET: zod_1.z.string().optional(),
    TZ: zod_1.z.string().optional(),
});
// Validate the environment variables
let parsedEnv;
try {
    parsedEnv = envSchema.parse(process.env);
}
catch (error) {
    if (error instanceof zod_1.z.ZodError) {
        console.error("❌ Invalid environment variables:");
        error.errors.forEach((err) => {
            console.error(`- ${err.path.join(".")}: ${err.message}`);
        });
        process.exit(1);
    }
    throw error;
}
// Export the validated environment object
exports.env = parsedEnv;
// Named exports for convenience
// App Environment
exports.NODE_ENV = exports.env.NODE_ENV;
exports.PORT = exports.env.PORT;
// JWT Configuration
exports.JWT_SECRET = exports.env.JWT_SECRET;
exports.JWT_EXPIRES_IN = exports.env.JWT_EXPIRES_IN;
exports.JWT_REFRESH_SECRET = exports.env.JWT_REFRESH_SECRET;
exports.JWT_REFRESH_EXPIRES_IN = exports.env.JWT_REFRESH_EXPIRES_IN;
// Database Configuration
const dbUrl = new URL(exports.env.DATABASE_URL);
exports.DB_USER = dbUrl.username;
exports.DB_PASSWORD = dbUrl.password;
exports.DB_HOST = dbUrl.hostname;
exports.DB_PORT = parseInt(dbUrl.port || "5432", 10);
exports.DB_NAME = dbUrl.pathname.slice(1);
exports.DB_SSL = dbUrl.searchParams.get("sslmode") === "require";
// Email Configuration
exports.EMAIL_HOST = exports.env.EMAIL_HOST;
exports.EMAIL_PORT = exports.env.EMAIL_PORT;
exports.EMAIL_SECURE = exports.env.EMAIL_SECURE;
exports.EMAIL_USER = exports.env.EMAIL_USER;
exports.EMAIL_PASS = exports.env.EMAIL_PASS;
exports.DEFAULT_EMAIL_FROM = exports.env.DEFAULT_EMAIL_FROM;
// Security & Encryption
exports.API_KEY_ENCRYPTION_SECRET = exports.env.API_KEY_ENCRYPTION_SECRET;
exports.ENCRYPTION_KEY = exports.env.ENCRYPTION_KEY;
exports.ENCRYPTION_IV_LENGTH = exports.env.ENCRYPTION_IV_LENGTH;
exports.BCRYPT_SALT_ROUNDS = exports.env.BCRYPT_SALT_ROUNDS;
// External APIs and Services
exports.BASE_URL = exports.env.BASE_URL;
exports.UTILS_API = exports.env.UTILS_API;
exports.UTIL_SECRET = exports.env.UTIL_SECRET;
exports.CORS_ORIGINS = exports.env.CORS_ORIGINS;
exports.GEMINI_API_KEYS = exports.env.GEMINI_API_KEYS.split(",")
    .map((key) => key.trim())
    .filter(Boolean);
// Stripe
exports.STRIPE_SECRET_KEY = exports.env.STRIPE_SECRET_KEY;
exports.STRIPE_WEBHOOK_SECRET = exports.env.STRIPE_WEBHOOK_SECRET;
exports.STRIPE_CANCEL_URL = exports.env.STRIPE_CANCEL_URL;
exports.STRIPE_SUCCESS_URL = exports.env.STRIPE_SUCCESS_URL;
// Razorpay
exports.RAZORPAY_KEY_ID = exports.env.RAZORPAY_KEY_ID || "";
exports.RAZORPAY_KEY_SECRET = exports.env.RAZORPAY_KEY_SECRET || "";
exports.RAZORPAY_WEBHOOK_SECRET = exports.env.RAZORPAY_WEBHOOK_SECRET;
// Redis
exports.REDIS_URL = exports.env.REDIS_URL;
// Misc
exports.WEBSITE = exports.env.WEBSITE;
exports.COMPANY_MAIL = exports.env.COMPANY_MAIL;
exports.LOG_LEVEL = exports.env.LOG_LEVEL;
exports.BULLMQ_DASH_USER = exports.env.BULLMQ_DASH_USER;
exports.BULLMQ_DASH_PASS = exports.env.BULLMQ_DASH_PASS;
exports.LOGO = exports.env.LOGO;
exports.CLOUDINARY_CLOUD_NAME = exports.env.CLOUDINARY_CLOUD_NAME;
exports.CLOUDINARY_API_KEY = exports.env.CLOUDINARY_API_KEY;
exports.CLOUDINARY_API_SECRET = exports.env.CLOUDINARY_API_SECRET;
exports.TZ = exports.env.TZ;
//# sourceMappingURL=redis.js.map