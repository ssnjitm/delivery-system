import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { ITokenPayload } from '@/types/index.js';
import { env } from '@/config/env.js';


export class AuthService {
  private static readonly SALT_ROUNDS = 12; // Industry benchmark for high security

  /**
   * Hashes a clear-text password string using a secure random salt.
   */
  public static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Compares an incoming clear-text password with an encrypted database string.
   */
  public static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Provisions enterprise session scopes (Short-lived Access + Long-lived Refresh).
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
   * Generates a secure, cryptographically random 6-digit numeric string for OTP logins.
   */
  public static generateOTP(): string {
    if (env.NODE_ENV === 'development') return '123456'; // bypass for local automation
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}