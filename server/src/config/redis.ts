import { Redis } from 'ioredis';
// import { env } from './env.ts';
// import { logger } from '@/utils/logger.ts';

import { logger } from "@/utils/logger.js";
import { env } from './env.js';

// Main Redis Connection Instance
export const redisClient = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: true,
});

redisClient.on('connect', () => {
  logger.info('Redis client connected.');
});

redisClient.on('error', (err:Error) => {
  logger.error(`Redis Client Error:${err}`);
});

// Reusable connection object for BullMQ workers and queues
export const queueConnectionOptions = {
  connection: {
    url: env.REDIS_URL,
    maxRetriesPerRequest: null,
  }
};