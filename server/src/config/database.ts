import mongoose from 'mongoose'
import { env } from './env.js';
import { logger } from '@/utils/logger.js';

export const connectDB = async (): Promise<void> => {
  try {
    mongoose.set('strictQuery', true);
    
    await mongoose.connect(env.MONGO_URI, {
      autoIndex: true, // Ensures our GeoJSON indexes build automatically in development
    });

    logger.info(' MongoDB connected successfully.');
  } catch (error) {
    logger.error(`MongoDB connection error:${error}`);
    process.exit(1);
  }
};

// Monitor connection disruptions
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected! Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error state: ${err}`);
});