import { env } from '@/config/env.js';
import { ITokenPayload } from '@/types/index.js';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';


export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <TOKEN>"

  if (!token) {
    throw new AppError(401, 'Access denied. Security session token missing.');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as ITokenPayload;
    req.user = decoded;
    next();
  } catch (err) {
    throw new AppError(403, 'Invalid or expired secure session token.');
  }
};