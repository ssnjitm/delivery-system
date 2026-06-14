import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { ITokenPayload } from '@/types/index.js';
import { env } from '@/config/env.js';
import { UserModel } from '../users/model.js';
import { AppError } from '@/middlewares/auth.js';

export class AuthService {
  private static readonly SALT_ROUNDS = 12;

  public static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  public static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate Access & Refresh Tokens
   * Access Token: Short-lived (15 min)
   * Refresh Token: Long-lived (7 days)
   */
  public static generateTokens(payload: ITokenPayload): { accessToken: string; refreshToken: string } {
    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: '15m',
    });

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  /**
   * Generate ONLY Access Token (for refresh flow)
   */
  public static generateAccessToken(payload: ITokenPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: '15m',
    });
  }

  /**
   * Verify Refresh Token and return decoded payload
   */
  public static verifyRefreshToken(token: string): ITokenPayload {
    try {
      return jwt.verify(token, env.JWT_REFRESH_SECRET) as ITokenPayload;
    } catch (error) {
      throw new AppError(403, 'Invalid or expired refresh token.');
    }
  }

  /**
   * Store refresh token in database for a user
   */
  public static async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { refreshToken });
  }

  /**
   * Remove refresh token from database (logout)
   */
  public static async removeRefreshToken(userId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
  }

  /**
   * Validate refresh token matches stored token
   */
  public static async validateRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    const user = await UserModel.findById(userId);
    if (!user || !user.refreshToken) return false;
    return user.refreshToken === refreshToken;
  }

  public static generateOTP(): string {
    if (env.NODE_ENV === 'development') return '123456';
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}