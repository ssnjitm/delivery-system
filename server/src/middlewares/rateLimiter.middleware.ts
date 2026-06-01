import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/ApiError.js';

// Strict limiter for OTP generation (Prevents email spam/costs)
export const otpLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 5, // Limit each IP to 5 OTP requests per hour
    handler: (req, res, next) => {
        throw new ApiError(429, "Too many OTP requests. Please try again after an hour.");
    },
    standardHeaders: true, 
    legacyHeaders: false,
});

// Moderate limiter for Login (Prevents brute-force/credential stuffing)
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login attempts per 15 mins
    handler: (req, res, next) => {
        throw new ApiError(429, "Too many login attempts. Please try again in 15 minutes.");
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict limiter for forgot password (Prevents abuse)
export const forgotPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 3, // Limit each IP to 3 forgot password requests per hour
    handler: (req, res, next) => {
        throw new ApiError(429, "Too many password reset requests. Please try again after an hour.");
    },
    standardHeaders: true,
    legacyHeaders: false,
});