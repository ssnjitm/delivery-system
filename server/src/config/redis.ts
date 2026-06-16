import dotenv from 'dotenv';
import { Redis } from 'ioredis';
import { logger } from "@/utils/logger.js";

// Make sure dotenv is loaded at the absolute top of your entry file (server.ts)
dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Detect if we are connecting to Upstash (Cloud Redis uses secure TLS 'rediss://')
const isCloudRedis = redisUrl.startsWith('rediss://');

// Main Redis Connection Instance
export const redisClient = new Redis(redisUrl, {
  maxRetriesPerRequest: null, 
  enableReadyCheck: true,
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
    url: redisUrl,
    maxRetriesPerRequest: null,
    tls: isCloudRedis ? {} : undefined,
  }
};