import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

//  DYNAMIC ENV LOADING
// This looks for .env.local first for local Docker dev, then falls back to .env
const environment = process.env.NODE_ENV || 'development';
dotenv.config({
  path: environment === 'production' ? '.env' : '.env.local'
});

//  VALIDATION SCHEMA
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Coerces string input from process.env into a number for your app
  PORT: z.coerce.number().default(3000), 
  
  // Validates standard connection string URL formats
  MONGO_URI: z.string().url({ message: "MONGO_URI must be a valid connection string" }),
  
  REDIS_URL: z.string().url({ message: "REDIS_URL must be a valid Redis connection string" }),
  
  JWT_SECRET: z.string().min(32, { message: "JWT_SECRET must be at least 32 characters long" }),
  JWT_REFRESH_SECRET: z.string().min(32, { message: "JWT_REFRESH_SECRET must be at least 32 characters long" }),
  
  MAPS_API_KEY: z.string().min(1, { message: "Maps API key is required" }),
  OTP_PROVIDER_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration variables:');
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

// 3. SAFE EXPORT
export const env = parsed.data;