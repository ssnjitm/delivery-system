import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors'; 
import { logger } from './utils/logger.js';
import authRoutes from './modules/auth/routes.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';

const app: Application = express();

// Global Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Core Architectural Service Routes Mounts
app.use('/api/v1/auth', authRoutes);

// Health Check Endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Centralized Error Catching Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err, err.message || 'Unhandled Exception Occurred');
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});
//need to add error handler middleware 
app.use(errorHandler);
export default app;