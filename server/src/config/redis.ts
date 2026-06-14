import { Redis } from 'ioredis';
import { logger } from "@/utils/logger.js";
import { env } from './env.js';

// Detect if we are connecting to Upstash (Cloud Redis uses secure TLS 'rediss://')
const isCloudRedis = env.REDIS_URL.startsWith('rediss://');

// Main Redis Connection Instance
export const redisClient = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: true,
  // CRITICAL: Upstash requires TLS encryption over TCP. Local dev docker does not.
  tls: isCloudRedis ? {} : undefined,
  connectTimeout: 10000, 
});

redisClient.on('connect', () => {
  logger.info(`Redis client connected to ${isCloudRedis ? 'Upstash Cloud' : 'Local Container'}.`);
});

redisClient.on('error', (err: Error) => {
  logger.error(`Redis Client Error: ${err}`);
});

// Reusable connection object for BullMQ workers and queues
export const queueConnectionOptions = {
  connection: {
    url: env.REDIS_URL,
    maxRetriesPerRequest: null,
    tls: isCloudRedis ? {} : undefined,
  }
};