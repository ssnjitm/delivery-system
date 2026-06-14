import { Request, Response } from 'express';
import { AppError } from '@/middlewares/auth.js';
import { AuthService } from './service.js';
import { UserRole } from '@/types/enums.js';
import { CustomerModel, DriverModel, NormalUserModel, UserModel, VendorModel } from '../users/model.js';

export class AuthController {
  
  public static async register(req: Request, res: Response): Promise<void> {
    const { phone, password, role } = req.body;

    const existingUser = await UserModel.findOne({ phone });
    if (existingUser) {
      throw new AppError(400, 'An account with this phone number is already registered.');
    }

    const hashedPassword = password ? await AuthService.hashPassword(password) : undefined;
    
    let newUser;

    switch (role) {
      case UserRole.VENDOR:
        newUser = new VendorModel({
          ...req.body,
          password: hashedPassword,
          pickupLocation: {
            type: 'Point',
            coordinates: req.body.coordinates
          },
          isVerified: false
        });
        break;

      case UserRole.DRIVER:
        newUser = new DriverModel({
          ...req.body,
          password: hashedPassword,
          isVerified: false 
        });
        break;

      case UserRole.CUSTOMER:
        newUser = new CustomerModel({
          ...req.body,
          password: hashedPassword,
          isVerified: true 
        });
        break;

      case UserRole.NORMAL_USER:
        newUser = new NormalUserModel({
          ...req.body,
          password: hashedPassword,
          isVerified: true
        });
        break;

      default:
        throw new AppError(400, 'The designated application role does not exist within this platform.');
    }

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'Registration profile saved successfully.',
      data: {
        userId: newUser._id,
        role: newUser.role,
        isVerified: newUser.isVerified
      }
    });
  }

  public static async login(req: Request, res: Response): Promise<void> {
    const { phone, password } = req.body;

    const user = await UserModel.findOne({ phone });
    if (!user) {
      throw new AppError(401, 'Invalid phone number or security password provided.');
    }

    if (!user.isActive) {
      throw new AppError(403, 'This profile context has been explicitly suspended by administrative action.');
    }

    if (!user.password) {
      throw new AppError(400, 'This user space requires security code verification (OTP-only routing setup).');
    }

    const credentialsMatch = await AuthService.comparePassword(password, user.password);
    if (!credentialsMatch) {
      throw new AppError(401, 'Invalid phone number or security password provided.');
    }

    // Generate tokens
    const tokens = AuthService.generateTokens({
      userId: user._id.toString(),
      role: user.role,
      phone: user.phone
    });

    // ✅ Store refresh token in database
    await AuthService.storeRefreshToken(user._id.toString(), tokens.refreshToken);

    res.status(200).json({
      success: true,
      message: 'Authentication verification completed successfully.',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user._id,
          role: user.role,
          phone: user.phone
        }
      }
    });
  }

  // ✅ NEW: Refresh Token Endpoint
  public static async refreshToken(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError(401, 'Refresh token is required.');
    }

    // Verify the refresh token
    const decoded = AuthService.verifyRefreshToken(refreshToken);
    
    // Check if token matches stored token in database
    const isValid = await AuthService.validateRefreshToken(decoded.userId, refreshToken);
    if (!isValid) {
      throw new AppError(403, 'Invalid or expired refresh token. Please login again.');
    }

    // Get fresh user data to ensure account is still active
    const user = await UserModel.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new AppError(403, 'Account is no longer active. Please contact support.');
    }

    // Generate new access token (and optionally a new refresh token)
    const newAccessToken = AuthService.generateAccessToken({
      userId: user._id.toString(),
      role: user.role,
      phone: user.phone
    });

    // Optional: Rotate refresh token for better security
    // const newRefreshToken = AuthService.generateRefreshToken({ userId: user._id.toString() });
    // await AuthService.storeRefreshToken(user._id.toString(), newRefreshToken);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully.',
      data: {
        accessToken: newAccessToken,
        // refreshToken: newRefreshToken, // Uncomment if rotating
      }
    });
  }

  // ✅ NEW: Logout Endpoint - removes refresh token
  public static async logout(req: Request, res: Response): Promise<void> {
    // req.user comes from authenticateToken middleware
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    await AuthService.removeRefreshToken(req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  }
}