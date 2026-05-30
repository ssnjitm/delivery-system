import dotenv from 'dotenv';
import { z } from 'zod';

// Load variables from .env file
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default(3000),
  
  // Databases
  MONGO_URI: z.string().url("MONGO_URI must be a valid connection string"),
  REDIS_URL: z.string().url("REDIS_URL must be a valid Redis connection string"),
  
  // Security
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters long"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters long"),
  
  // Third-party API configurations
  MAPS_API_KEY: z.string().min(1, "Maps API key is required"),
  OTP_PROVIDER_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration variables:');
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;