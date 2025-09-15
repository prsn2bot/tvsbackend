import { config } from "dotenv";
import { http } from "winston";
import { z } from "zod";

// Load environment variables from .env file
config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test", "staging"])
    .default("development"),
  PORT: z
    .string()
    .default("3000")
    .transform((val) => parseInt(val, 10)),
  JWT_SECRET: z.string().min(32),
  API_KEY_ENCRYPTION_SECRET: z
    .string()
    .length(32, "API_KEY_ENCRYPTION_SECRET must be a 32-character string"),
  ENCRYPTION_KEY: z
    .string()
    .length(64, "ENCRYPTION_KEY must be a 64-character hex string (32 bytes)"),
  ENCRYPTION_IV_LENGTH: z.number().default(16),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  TZ: z.string().optional(), // Timezone for cron job, e.g., 'Asia/Kolkata' or 'UTC'

  // Email Configuration (for Nodemailer)
  EMAIL_HOST: z.string().optional(),
  EMAIL_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .optional(),
  EMAIL_SECURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((val) => val === "true")
    .optional(),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),
  DEFAULT_EMAIL_FROM: z
    .string()
    .email("DEFAULT_EMAIL_FROM must be a valid email address")
    .optional(),

  CORS_ORIGINS: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_CANCEL_URL: z.string().url().optional(),
  STRIPE_SUCCESS_URL: z.string().url().optional(),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  REDIS_URL: z.string().optional(),
  GEMINI_API_KEYS: z
    .string()
    .min(1, "GEMINI_API_KEYS must be a comma-separated list of keys"),
  WEBSITE: z.string(),
  COMPANY_MAIL: z.string(),
  BCRYPT_SALT_ROUNDS: z
    .string()
    .default("10")
    .transform((val) => parseInt(val, 10)),
  LOG_LEVEL: z
    .enum(["error", "warn", "info", "http", "verbose", "debug", "silly"])
    .default("info"),
  BASE_URL: z.string().url("BASE_URL must be a valid URL").optional(),
  UTILS_API: z.string().url("UTILS_API must be a valid URL"),
  UTIL_SECRET: z.string(),
  BULLMQ_DASH_USER: z.string().default("admin"),
  BULLMQ_DASH_PASS: z.string().default("supersecret"),
  LOGO: z.string().url().optional(),

  // LinkedIn OAuth Configuration
  LINKEDIN_CLIENT_ID: z.string().optional(),
  LINKEDIN_CLIENT_SECRET: z.string().optional(),
  LINKEDIN_WEBSITE_ID: z
    .string()
    .transform((val) => parseInt(val, 10))
    .optional(),

  // Facebook OAuth Configuration
  FACEBOOK_APP_ID: z.string().optional(),
  FACEBOOK_APP_SECRET: z.string().optional(),
  FACEBOOK_WEBSITE_ID: z
    .string()
    .transform((val) => parseInt(val, 10))
    .optional(),

  // YouTube OAuth Configuration
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  YOUTUBE_API_KEY: z.string().optional(),
  YOUTUBE_WEBSITE_ID: z
    .string()
    .transform((val) => parseInt(val, 10))
    .optional(),

  FRONTEND_URL: z.string().url().optional(),
  SERVER_URL: z.string().url().optional(),
});

type EnvSchemaType = z.infer<typeof envSchema>;

let parsedEnv: EnvSchemaType;
try {
  parsedEnv = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error(
      "FATAL ERROR: Environment variable validation failed! Issues:"
    );
    error.errors.forEach((err) => {
      console.error(`  Path: ${err.path.join(".")}, Message: ${err.message}`);
    });
    process.exit(1);
  }
  console.error(
    "FATAL ERROR: Could not parse environment variables during initial load.",
    error
  );
  process.exit(1);
}

export const env = parsedEnv;

// Runtime validation for critical production/staging variables
if (env.NODE_ENV === "production" || env.NODE_ENV === "staging") {
  if (!env.BASE_URL) {
    console.error(
      "FATAL ERROR: BASE_URL environment variable is not set for production/staging."
    );
    process.exit(1);
  }
  if (!env.JWT_SECRET) {
    console.error(
      "FATAL ERROR: JWT_SECRET environment variable is not set for production/staging."
    );
    process.exit(1);
  }
  // Optional warning for email keys if they are intended to be used later
  // if (!env.SENDGRID_API_KEY || !env.DEFAULT_EMAIL_FROM) {
  //   console.warn("Warning: SENDGRID_API_KEY or DEFAULT_EMAIL_FROM is not set. Email features will fail if used.");
  // }
}

// Function to get environment variable and throw error if not set
const getEnvVar = (varName: string, defaultValue?: string): string => {
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
  if (env.NODE_ENV === "production" || env.NODE_ENV === "staging") {
    // Also exit for staging or other critical envs
    process.exit(1);
  }
  // For development, still throw to alert the developer immediately
  throw new Error(errorMessage);
};

export const NODE_ENV = env.NODE_ENV;
export const PORT = env.PORT;

// JWT Configuration
export const JWT_SECRET = env.JWT_SECRET;
if (
  (env.NODE_ENV === "production" || env.NODE_ENV === "staging") &&
  JWT_SECRET === "your-default-super-secret-key-please-change"
) {
  console.error(
    "FATAL ERROR: JWT_SECRET is not set to a secure value in production/staging!"
  );
  process.exit(1); // Exit if critical secrets are not set in production/staging
}
export const JWT_EXPIRES_IN = getEnvVar("JWT_EXPIRES_IN", "1d");

// Database Configuration
export const DB_HOST = getEnvVar("DB_HOST", "localhost");
export const DB_PORT = parseInt(getEnvVar("DB_PORT", "5432"), 10);
export const DB_USER = getEnvVar("DB_USER"); // No default, now throws if not set by getEnvVar
export const DB_PASSWORD = getEnvVar("DB_PASSWORD"); // No default, now throws if not set by getEnvVar
export const DB_NAME = getEnvVar("DB_NAME"); // No default, now throws if not set by getEnvVar
export const DB_SSL = getEnvVar("DB_SSL", "false").toLowerCase() === "true"; // Support boolean SSL config

// Base URL for the application, used for constructing absolute URLs (e.g., for Swagger)
export const BASE_URL = env.BASE_URL;

// Add other environment variables as needed
export const UTILS_API = env.UTILS_API;
export const UTIL_SECRET = env.UTIL_SECRET;
export const BULLMQ_DASH_USER = env.BULLMQ_DASH_USER;
export const BULLMQ_DASH_PASS = env.BULLMQ_DASH_PASS;
export const LOGO = env.LOGO;

export const GEMINI_API_KEYS = (process.env.GEMINI_API_KEYS || "")
  .split(",")
  .map((k) => k.trim())
  .filter(Boolean);

// Razorpay Configuration
export const RAZORPAY_KEY_ID = env.RAZORPAY_KEY_ID || "";
export const RAZORPAY_KEY_SECRET = env.RAZORPAY_KEY_SECRET || "";
