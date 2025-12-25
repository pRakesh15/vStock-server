// src/config/index.ts
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("3000"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AWS_ACCESS_KEY_ID: z.string().min(1, "DATABASE_URL is required"),
  AWS_SECRET_ACCESS_KEY: z.string().min(1, "DATABASE_URL is required"),
  S3_BUCKET_NAME: z.string().min(1, "DATABASE_URL is required"),
  S3_REGION: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(10, "JWT_SECRET must be at least 10 characters"),
  REDIS_HOST: z.string().default("127.0.0.1"),
  REDIS_PORT: z.string().default("6379"),
  CORS_ORIGIN: z.string().default("*"),
  LOG_LEVEL: z.string().default("info"),
  REQUEST_BODY_LIMIT: z.string().default("100kb"),
  RATE_LIMIT_WINDOW_MS: z.string().default("60000"), // 1 min
  RATE_LIMIT_MAX: z.string().default("200"),
  SHUTDOWN_TIMEOUT_MS: z.string().default("30000"),
  ERP_SECRET_KEY: z.string().min(32, "ERP_SECRET_KEY must be at least 32 characters"),
  ENCRYPTION_SECRET: z.string().min(32, "ERP_SECRET_KEY must be at least 32 characters")
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("Invalid environment variables:", _env.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = {
  NODE_ENV: _env.data.NODE_ENV,
  PORT: Number(_env.data.PORT),
  DATABASE_URL: _env.data.DATABASE_URL,
  JWT_SECRET: _env.data.JWT_SECRET,
  CORS_ORIGIN: _env.data.CORS_ORIGIN,
  LOG_LEVEL: _env.data.LOG_LEVEL,
  REQUEST_BODY_LIMIT: _env.data.REQUEST_BODY_LIMIT,
  RATE_LIMIT_WINDOW_MS: Number(_env.data.RATE_LIMIT_WINDOW_MS),
  RATE_LIMIT_MAX: Number(_env.data.RATE_LIMIT_MAX),
  REDIS_HOST: _env.data.REDIS_HOST,
  REDIS_PORT: Number(_env.data.REDIS_PORT),
  SHUTDOWN_TIMEOUT_MS: Number(_env.data.SHUTDOWN_TIMEOUT_MS),
  ERP_SECRET_KEY: _env.data.ERP_SECRET_KEY,
  AWS_ACCESS_KEY_ID: _env.data.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: _env.data.AWS_SECRET_ACCESS_KEY,
  S3_BUCKET_NAME: _env.data.S3_BUCKET_NAME,
  S3_REGION: _env.data.S3_REGION,
  ENCRYPTION_SECRET: _env.data.ENCRYPTION_SECRET,

};
