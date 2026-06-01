import { Request, Response } from 'express';
// import { UserModel, VendorModel, DriverModel, CustomerModel, NormalUserModel } from '@/modules/users/model.ts';
import { AppError } from '@/middlewares/auth.js';
import { AuthService } from './service.js';
import { UserRole } from '@/types/enums.js';
import { CustomerModel, DriverModel, NormalUserModel, UserModel, VendorModel } from '../users/model.js';


export class AuthController {
  /**
   * Unified Polymorphic Onboarding Handler
   */
  public static async register(req: Request, res: Response): Promise<void> {
    const { phone, password, role } = req.body;

    // Fast-fail if the phone is already taken across ANY user profile type
    const existingUser = await UserModel.findOne({ phone });
    if (existingUser) {
      throw new AppError(400, 'An account with this phone number is already registered.');
    }

    // Passwords are structurally optional if a user is using OTP-only mode [cite: 173, 174]
    const hashedPassword = password ? await AuthService.hashPassword(password) : undefined;
    
    let newUser;

    // Polymorphically build the model based on specific business domain roles 
    switch (role) {
      case UserRole.VENDOR:
        newUser = new VendorModel({
          ...req.body,
          password: hashedPassword,
          pickupLocation: {
            type: 'Point',
            coordinates: req.body.coordinates // Expects clean spatial array [longitude, latitude]
          },
          isVerified: false // PRD: Requires strict manual Admin verification before active status [cite: 150]
        });
        break;

      case UserRole.DRIVER:
        newUser = new DriverModel({
          ...req.body,
          password: hashedPassword,
          isVerified: false // PRD: Requires active background document check [cite: 169]
        });
        break;

      case UserRole.CUSTOMER:
        newUser = new CustomerModel({
          ...req.body,
          password: hashedPassword,
          isVerified: true // PRD: Instant self-activation [cite: 158]
        });
        break;

      case UserRole.NORMAL_USER:
        newUser = new NormalUserModel({
          ...req.body,
          password: hashedPassword,
          isVerified: true // PRD: Instantly online [cite: 160]
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

  /**
   * High-Performance Multi-Method Authentication Endpoint [cite: 172]
   */
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

    // Verify cryptographic signature safety
    const credentialsMatch = await AuthService.comparePassword(password, user.password);
    if (!credentialsMatch) {
      throw new AppError(401, 'Invalid phone number or security password provided.');
    }

    // Issue standard, secure stateless tokens [cite: 175]
    const tokens = AuthService.generateTokens({
      userId: user._id.toString(),
      role: user.role,
      phone: user.phone
    });

    res.status(200).json({
      success: true,
      message: 'Authentication verification completed successfully.',
      data: {
        ...tokens,
        user: {
          id: user._id,
          role: user.role,
          phone: user.phone
        }
      }
    });
  }
}