import { Types } from 'mongoose';
import { AppError } from '@/middlewares/auth.js';
import { UserRole } from '@/types/enums.js';
import {
  UserModel,
  VendorModel,
  DriverModel,
  CustomerModel,
  NormalUserModel,
} from './model.js';
import {
  IUser,
  IVendorUser,
  IDriverUser,
  IUserFilters,
  INearbyDriversQuery,
  IUpdateUserProfile,
  ICustomerUser,
  INormalUser,
} from '../../types/user.types.js';

export class UserService {
  // Basic CRUD Operations

  /**
   * Get user by ID with role-specific data
   */
  static async getUserById(userId: string): Promise<IUser> {
    const user = await UserModel.findById(userId).lean();
    if (!user) {
      throw new AppError(404, 'User not found.');
    }
    // Fixed structural mismatch error ts(2322) and syntax error via unknown downcasting
    return user as unknown as IUser;
  }

  /**
   * Get user with full role-specific model (Optimized to run a single database query)
   */
  static async getUserModelById(userId: string): Promise<any> {
    // Mongoose automatically builds out the proper discriminator sub-class schema instance natively
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError(404, 'User not found.');
    }
    return user;
  }

  /**
   * Update user profile (role-agnostic fields)
   */
  static async updateProfile(
    userId: string,
    updateData: IUpdateUserProfile
  ): Promise<IUser> {
    const userModel = await this.getUserModelById(userId);
    if (!userModel) {
      throw new AppError(404, 'User not found.');
    }

    // Only allow updating specific fields based on role
    const allowedUpdates: Record<string, string[]> = {
      [UserRole.VENDOR]: ['phone', 'businessName', 'address'],
      [UserRole.DRIVER]: ['phone', 'fullName'],
      [UserRole.CUSTOMER]: ['phone', 'fullName', 'email', 'defaultDeliveryAddress'],
      [UserRole.NORMAL_USER]: ['phone', 'fullName', 'email'],
    };

    const allowed = allowedUpdates[userModel.role as string] || [];
    Object.keys(updateData).forEach((key) => {
      if (allowed.includes(key) && updateData[key as keyof IUpdateUserProfile] !== undefined) {
        userModel[key] = updateData[key as keyof IUpdateUserProfile];
      }
    });

    await userModel.save();
    return userModel.toJSON() as unknown as IUser;
  }

  /**
   * Deactivate user account (soft delete)
   */
  static async deactivateUser(userId: string,reason?:string): Promise<void> {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { 
        isActive: false,
        deactivationReason: reason || 'No reason provided'
       },
      { new: true }
      
    );
    if (!user) {
      throw new AppError(404, 'User not found.');
    }
  }

  /**
   * Reactivate user account
   */
  static async reactivateUser(userId: string): Promise<void> {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { isActive: true },
      { new: true }
    );
    if (!user) {
      throw new AppError(404, 'User not found.');
    }
  }

  // Vendor-Specific Operations

  /**
   * Get all vendors with optional filters
   */
  static async getVendors(filters: IUserFilters = {}): Promise<{
    vendors: IVendorUser[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { isVerified, search, page = 1, limit = 20 } = filters;

    const query: any = { role: UserRole.VENDOR };
    if (isVerified !== undefined) query.isVerified = isVerified;
    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [vendors, total] = await Promise.all([
      VendorModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      VendorModel.countDocuments(query),
    ]);

    return { vendors: vendors as unknown as IVendorUser[], total, page, limit };
  }

  /**
   * Approve vendor account (admin action)
   */
  static async approveVendor(vendorId: string): Promise<IVendorUser> {
    const vendor = await VendorModel.findById(vendorId);
    if (!vendor) {
      throw new AppError(404, 'Vendor not found.');
    }

    if (vendor.isVerified) {
      throw new AppError(400, 'Vendor is already verified.');
    }

    vendor.isVerified = true;
    await vendor.save();

    return vendor.toJSON() as unknown as IVendorUser;
  }

  /**
   * Reject vendor account with reason
   */
  static async rejectVendor(vendorId: string, reason: string): Promise<void> {
    const vendor = await VendorModel.findById(vendorId);
    if (!vendor) {
      throw new AppError(404, 'Vendor not found.');
    }

    vendor.rejectionReason = reason;
    vendor.isActive = false;
    await vendor.save();
  }

  // Driver-Specific Operations

  /**
   * Get all drivers with optional filters
   */
  static async getDrivers(filters: IUserFilters = {}): Promise<{
    drivers: IDriverUser[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { isVerified, isActive, search, page = 1, limit = 20 } = filters;

    const query: any = { role: UserRole.DRIVER };
    if (isVerified !== undefined) query.isVerified = isVerified;
    if (isActive !== undefined) query.isActive = isActive;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { bikeModel: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [drivers, total] = await Promise.all([
      DriverModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      DriverModel.countDocuments(query),
    ]);

    return { drivers: drivers as unknown as IDriverUser[], total, page, limit };
  }

  /**
   * Get nearby online drivers for dispatch engine
   */
  static async getNearbyDrivers(params: INearbyDriversQuery): Promise<IDriverUser[]> {
    const { coordinates, maxDistance = 5000, limit = 10 } = params;

    const drivers = await DriverModel.find({
      isOnline: true,
      isActive: true,
      isVerified: true,
      currentLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates,
          },
          $maxDistance: maxDistance,
        },
      },
    })
      .limit(limit)
      .lean();

    return drivers as unknown as IDriverUser[];
  }

  /**
   * Update driver's live location
   */
  static async updateDriverLocation(
    driverId: string,
    coordinates: [number, number]
  ): Promise<void> {
    const driver = await DriverModel.findById(driverId);
    if (!driver) {
      throw new AppError(404, 'Driver not found.');
    }

    driver.currentLocation = {
      type: 'Point',
      coordinates,
    };
    driver.lastLocationUpdate = new Date();
    await driver.save();
  }

  /**
   * Toggle driver online/offline status
   */
  static async toggleDriverStatus(driverId: string, isOnline: boolean): Promise<IDriverUser> {
    const driver = await DriverModel.findById(driverId);
    if (!driver) {
      throw new AppError(404, 'Driver not found.');
    }

    if (!driver.isVerified) {
      throw new AppError(403, 'Driver account is not verified yet.');
    }

    if (!driver.isActive) {
      throw new AppError(403, 'Driver account is deactivated.');
    }

    driver.isOnline = isOnline;
    await driver.save();

    return driver.toJSON() as unknown as IDriverUser;
  }

  /**
   * Verify driver account (admin action)
   */
  static async verifyDriver(driverId: string): Promise<IDriverUser> {
    const driver = await DriverModel.findById(driverId);
    if (!driver) {
      throw new AppError(404, 'Driver not found.');
    }

    if (driver.isVerified) {
      throw new AppError(400, 'Driver is already verified.');
    }

    driver.isVerified = true;
    await driver.save();

    return driver.toJSON() as unknown as IDriverUser;
  }

  /**
   * Reject driver verification with reason
   */
  static async rejectDriver(driverId: string, reason: string): Promise<void> {
    const driver = await DriverModel.findById(driverId);
    if (!driver) {
      throw new AppError(404, 'Driver not found.');
    }

    driver.rejectionReason = reason;
    driver.isActive = false;
    await driver.save();
  }

  // Customer & Normal User Operations

  /**
   * Get customers list
   */
  static async getCustomers(filters: IUserFilters = {}): Promise<{
    customers: ICustomerUser[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { search, page = 1, limit = 20 } = filters;

    const query: any = { role: UserRole.CUSTOMER };
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [customers, total] = await Promise.all([
      CustomerModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      CustomerModel.countDocuments(query),
    ]);

    return { customers: customers as unknown as ICustomerUser[], total, page, limit };
  }

  /**
   * Get normal users list
   */
  static async getNormalUsers(filters: IUserFilters = {}): Promise<{
    users: INormalUser[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { search, page = 1, limit = 20 } = filters;

    const query: any = { role: UserRole.NORMAL_USER };
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      NormalUserModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      NormalUserModel.countDocuments(query),
    ]);

    return { users: users as unknown as INormalUser[], total, page, limit };
  }

  // Statistics & Utilities

  /**
   * Get user statistics for admin dashboard
   */
  static async getUserStats(): Promise<{
    totalUsers: number;
    totalVendors: number;
    pendingVendors: number;
    totalDrivers: number;
    pendingDrivers: number;
    totalCustomers: number;
    totalNormalUsers: number;
    onlineDrivers: number;
  }> {
    const [
      totalUsers,
      totalVendors,
      pendingVendors,
      totalDrivers,
      pendingDrivers,
      totalCustomers,
      totalNormalUsers,
      onlineDrivers,
    ] = await Promise.all([
      UserModel.countDocuments(),
      UserModel.countDocuments({ role: UserRole.VENDOR }),
      UserModel.countDocuments({ role: UserRole.VENDOR, isVerified: false }),
      UserModel.countDocuments({ role: UserRole.DRIVER }),
      UserModel.countDocuments({ role: UserRole.DRIVER, isVerified: false }),
      UserModel.countDocuments({ role: UserRole.CUSTOMER }),
      UserModel.countDocuments({ role: UserRole.NORMAL_USER }),
      DriverModel.countDocuments({ isOnline: true, isActive: true, isVerified: true }),
    ]);

    return {
      totalUsers,
      totalVendors,
      pendingVendors,
      totalDrivers,
      pendingDrivers,
      totalCustomers,
      totalNormalUsers,
      onlineDrivers,
    };
  }

  /**
   * Check if phone number is already taken
   */
  static async isPhoneTaken(phone: string, excludeUserId?: string): Promise<boolean> {
    const query: any = { phone };
    if (excludeUserId) {
      query._id = { $ne: new Types.ObjectId(excludeUserId) };
    }
    const user = await UserModel.findOne(query);
    return !!user;
  }

  /**
   * Update last login timestamp
   */
  static async updateLastLogin(userId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { lastLoginAt: new Date() });
  }
}