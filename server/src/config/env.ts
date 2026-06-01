import dotenv from 'dotenv';
import { z } from 'zod';

// Load variables from .env file
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Custom error messages on primitives/transforms use the { error: '...' } configuration object
  PORT: z.string().transform((val) => parseInt(val, 10)).default(3000),
  
  // Databases: .url() is now a top-level validation in Zod v4
  MONGO_URI: z.url({ error: "MONGO_URI must be a valid connection string" }),
  REDIS_URL: z.url({ error: "REDIS_URL must be a valid Redis connection string" }),
  
  // Security: .min() takes an options object instead of a direct string argument
  JWT_SECRET: z.string().min(32, { error: "JWT_SECRET must be at least 32 characters long" }),
  JWT_REFRESH_SECRET: z.string().min(32, { error: "JWT_REFRESH_SECRET must be at least 32 characters long" }),
  
  // Third-party API configurations
  MAPS_API_KEY: z.string().min(1, { error: "Maps API key is required" }),
  OTP_PROVIDER_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration variables:');
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;