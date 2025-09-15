// src/config/env.config.ts

import { config } from "dotenv";
import { z } from "zod";
import type { SignOptions } from "jsonwebtoken"; // 🔐 Import the correct type

// Load environment variables from .env file
config();

// Define the schema for all required environment variables
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test", "staging"])
    .default("development"),

  PORT: z
    .string()
    .default("3000")
    .transform((val) => parseInt(val, 10)),

  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z
    .string()
    .default("1d")
    .transform((val) => val as SignOptions["expiresIn"]), // ✅ updated
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z
    .string()
    .default("7d")
    .transform((val) => val as SignOptions["expiresIn"]), // ✅ updated

  API_KEY_ENCRYPTION_SECRET: z.string().length(32),
  ENCRYPTION_KEY: z.string().length(64),
  ENCRYPTION_IV_LENGTH: z
    .string()
    .default("16")
    .transform((val) => parseInt(val, 10)),

  DATABASE_URL: z.string().url(),

  EMAIL_HOST: z.string().optional(),
  EMAIL_PORT: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  EMAIL_SECURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((val) => val === "true")
    .optional(),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),
  DEFAULT_EMAIL_FROM: z.string().email().optional(),

  CORS_ORIGINS: z.string().optional(),

  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_CANCEL_URL: z.string().url().optional(),
  STRIPE_SUCCESS_URL: z.string().url().optional(),

  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  REDIS_URL: z.string().optional(),

  GEMINI_API_KEYS: z.string().min(1),

  WEBSITE: z.string(),
  COMPANY_MAIL: z.string(),

  BCRYPT_SALT_ROUNDS: z
    .string()
    .default("10")
    .transform((val) => parseInt(val, 10)),

  LOG_LEVEL: z
    .enum(["error", "warn", "info", "http", "verbose", "debug", "silly"])
    .default("info"),

  BASE_URL: z.string().url().optional(),
  UTILS_API: z.string().url(),
  UTIL_SECRET: z.string(),

  BULLMQ_DASH_USER: z.string().default("admin"),
  BULLMQ_DASH_PASS: z.string().default("supersecret"),

  LOGO: z.string().url().optional(),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  TZ: z.string().optional(),
});

// Validate the environment variables
let parsedEnv: z.infer<typeof envSchema>;

try {
  parsedEnv = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("❌ Invalid environment variables:");
    error.errors.forEach((err) => {
      console.error(`- ${err.path.join(".")}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}

// Export the validated environment object
export const env = parsedEnv;

// Named exports for convenience

// App Environment
export const NODE_ENV = env.NODE_ENV;
export const PORT = env.PORT;

// JWT Configuration
export const JWT_SECRET = env.JWT_SECRET;
export const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN;
export const JWT_REFRESH_SECRET = env.JWT_REFRESH_SECRET;
export const JWT_REFRESH_EXPIRES_IN = env.JWT_REFRESH_EXPIRES_IN;

// Database Configuration
const dbUrl = new URL(env.DATABASE_URL);
export const DB_USER = dbUrl.username;
export const DB_PASSWORD = dbUrl.password;
export const DB_HOST = dbUrl.hostname;
export const DB_PORT = parseInt(dbUrl.port || "5432", 10);
export const DB_NAME = dbUrl.pathname.slice(1);
export const DB_SSL = dbUrl.searchParams.get("sslmode") === "require";

// Email Configuration
export const EMAIL_HOST = env.EMAIL_HOST;
export const EMAIL_PORT = env.EMAIL_PORT;
export const EMAIL_SECURE = env.EMAIL_SECURE;
export const EMAIL_USER = env.EMAIL_USER;
export const EMAIL_PASS = env.EMAIL_PASS;
export const DEFAULT_EMAIL_FROM = env.DEFAULT_EMAIL_FROM;

// Security & Encryption
export const API_KEY_ENCRYPTION_SECRET = env.API_KEY_ENCRYPTION_SECRET;
export const ENCRYPTION_KEY = env.ENCRYPTION_KEY;
export const ENCRYPTION_IV_LENGTH = env.ENCRYPTION_IV_LENGTH;
export const BCRYPT_SALT_ROUNDS = env.BCRYPT_SALT_ROUNDS;

// External APIs and Services
export const BASE_URL = env.BASE_URL;
export const UTILS_API = env.UTILS_API;
export const UTIL_SECRET = env.UTIL_SECRET;
export const CORS_ORIGINS = env.CORS_ORIGINS;

export const GEMINI_API_KEYS = env.GEMINI_API_KEYS.split(",")
  .map((key) => key.trim())
  .filter(Boolean);

// Stripe
export const STRIPE_SECRET_KEY = env.STRIPE_SECRET_KEY;
export const STRIPE_WEBHOOK_SECRET = env.STRIPE_WEBHOOK_SECRET;
export const STRIPE_CANCEL_URL = env.STRIPE_CANCEL_URL;
export const STRIPE_SUCCESS_URL = env.STRIPE_SUCCESS_URL;

// Razorpay
export const RAZORPAY_KEY_ID = env.RAZORPAY_KEY_ID || "";
export const RAZORPAY_KEY_SECRET = env.RAZORPAY_KEY_SECRET || "";
export const RAZORPAY_WEBHOOK_SECRET = env.RAZORPAY_WEBHOOK_SECRET;

// Redis
export const REDIS_URL = env.REDIS_URL;

// Misc
export const WEBSITE = env.WEBSITE;
export const COMPANY_MAIL = env.COMPANY_MAIL;
export const LOG_LEVEL = env.LOG_LEVEL;
export const BULLMQ_DASH_USER = env.BULLMQ_DASH_USER;
export const BULLMQ_DASH_PASS = env.BULLMQ_DASH_PASS;
export const LOGO = env.LOGO;
export const CLOUDINARY_CLOUD_NAME = env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = env.CLOUDINARY_API_SECRET;
export const TZ = env.TZ;
