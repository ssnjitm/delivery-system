import { Request, Response, NextFunction } from 'express';
import { AppError } from './auth.js';
import { UserRole } from '@/types/enums.js';


export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(401, 'User context execution failed. Authentication required.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(403, 'Forbidden. Your security level lacks execution privileges.');
    }

    next();
  }
};