import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { connectDB } from './config/database.js';
import { redisClient } from './config/redis.js';


const server = http.createServer(app);

const startServer = async () => {
  try {
    // Initialize Database Connections
    await connectDB();

    // Explicitly wake up Redis for test now
    await redisClient.ping(); 

    server.listen(env.PORT, () => {
      logger.info(`🚀Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error(`Failed to start server components:${error}`);
    process.exit(1);
  }
};

// Handle unexpected application shutdown triggers gracefully
const handleSystemSignals = (signal: string) => {
  logger.warn(`Received ${signal}. Gracefully stopping server process...`);
  server.close(() => {
    logger.info('HTTP server closed cleanly.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleSystemSignals('SIGTERM'));
process.on('SIGINT', () => handleSystemSignals('SIGINT'));

startServer();