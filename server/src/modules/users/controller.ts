import { AppError } from '@/middlewares/auth.js';
import { UserService } from './service.js';
import { Request, Response } from 'express';
import { UserRole } from '@/types/enums.js';
import { INearbyDriversQuery, IUserFilters } from '@/types/user.types.js';

export class UserController {
  // Profile Management (Authenticated User)
  /**
   * Get current user's profile
   * GET /api/v1/users/me
   */
  static async getMyProfile(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }
    const user = await UserService.getUserModelById(req.user.userId);
    res.status(200).json({
      success: true,
      data: user.toJSON(),
    });
  }

  /**
   * Update current user's profile
   * PATCH /api/v1/users/me
   */
  static async updateMyProfile(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const updatedUser = await UserService.updateProfile(req.user.userId, req.body);
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: updatedUser,
    });
  }
  /**
   * Deactivate my own account
   * DELETE /api/v1/users/me
   */
  static async deactivateMyAccount(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    await UserService.deactivateUser(req.user.userId, req.body.reason);
    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully.',
    });
  }

  // Driver Location & Status (Driver only)

  /**
   * Update driver's live location
   * POST /api/v1/users/driver/location
   */
  static async updateDriverLocation(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    if (req.user.role !== UserRole.DRIVER) {
      throw new AppError(403, 'Only drivers can update location.');
    }

    const { coordinates } = req.body;

    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      throw new AppError(400, 'Valid coordinates [longitude, latitude] are required.');
    }

    // Destructure the elements and type them explicitly as a tuple
    const [longitude, latitude]: [number, number] = coordinates as [number, number];

    // Pass the strictly-typed tuple smoothly
    await UserService.updateDriverLocation(req.user.userId, [longitude, latitude]);
  }

  /**
   * Toggle driver online/offline status
   * POST /api/v1/users/driver/toggle-status
   */

  static async toggleDriverStatus(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    if (req.user.role !== UserRole.DRIVER) {
      throw new AppError(403, 'Only drivers can toggle status.');
    }

    const { isOnline } = req.body;
    if (typeof isOnline !== 'boolean') {
      throw new AppError(400, 'isOnline boolean is required.');
    }

    const driver = await UserService.toggleDriverStatus(req.user.userId, isOnline);
    res.status(200).json({
      success: true,
      message: `Driver is now ${isOnline ? 'online' : 'offline'}.`,
      data: { isOnline: driver.isOnline },
    });
  }
  // Vendor Management (Admin)
  /**
   * Get all vendors (admin only)
   * GET /api/v1/users/vendors
   */
  static async getVendors(req: Request, res: Response): Promise<void> {
    const filters: IUserFilters = {
      isVerified:
        req.query.isVerified === 'true'
          ? true
          : req.query.isVerified === 'false'
            ? false
            : undefined,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    };

    const result = await UserService.getVendors(filters);
    res.status(200).json({
      success: true,
      data: result.vendors,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  }

  /**
   * Approve vendor (admin only)
   * POST /api/v1/users/vendors/:id/approve
   */
  static async approveVendor(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      throw new AppError(400, 'A valid vendor ID is required.');
    }
    const vendor = await UserService.approveVendor(id);

    res.status(200).json({
      success: true,
      message: 'Vendor approved successfully.',
      data: vendor,
    });
  }
  /**
   * Reject vendor (admin only)
   * POST /api/v1/users/vendors/:id/reject
   */

  static async rejectVendor(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { reason } = req.body;

    if (!id || typeof id !== 'string') {
      throw new AppError(400, 'A valid vendor ID is required.');
    }

    if (!reason || typeof reason !== 'string') {
      throw new AppError(400, 'A valid text rejection reason is required.');
    }

    await UserService.rejectVendor(id, reason);

    res.status(200).json({
      success: true,
      message: 'Vendor rejected.',
    });
  }

  // Driver Management (Admin)
  /**
   * Get all drivers (admin only)
   * GET /api/v1/users/drivers
   */
  static async getDrivers(req: Request, res: Response): Promise<void> {
    const filters: IUserFilters = {
      isVerified:
        req.query.isVerified === 'true'
          ? true
          : req.query.isVerified === 'false'
            ? false
            : undefined,
      isActive:
        req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    };

    const result = await UserService.getDrivers(filters);
    res.status(200).json({
      success: true,
      data: result.drivers,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  }
  /**
   * Get nearby drivers for dispatch (internal use)
   * GET /api/v1/users/drivers/nearby
   */

  static async getNearbyDrivers(req: Request, res: Response): Promise<void> {
    const { longitude, latitude, maxDistance, limit } = req.query;

    if (!longitude || !latitude) {
      throw new AppError(400, 'Longitude and latitude are required.');
    }

    const params: INearbyDriversQuery = {
      coordinates: [parseFloat(longitude as string), parseFloat(latitude as string)],
      maxDistance: maxDistance ? parseInt(maxDistance as string) : 5000,
      limit: limit ? parseInt(limit as string) : 10,
    };

    const drivers = await UserService.getNearbyDrivers(params);
    res.status(200).json({
      success: true,
      data: drivers,
    });
  }
  /**
   * Verify driver (admin only)
   * POST /api/v1/users/drivers/:id/verify
   */
  static async verifyDriver(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      throw new AppError(400, 'A valid vendor ID is required.');
    }
    const driver = await UserService.verifyDriver(id);
    res.status(200).json({
      success: true,
      message: 'Driver verified successfully.',
      data: driver,
    });
  }
  /**
   * Reject driver (admin only)
   * POST /api/v1/users/drivers/:id/reject
   */
  static async rejectDriver(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { reason } = req.body;
    if (!id || typeof id !== 'string') {
      throw new AppError(400, 'A valid vendor ID is required.');
    }

    if (!reason) {
      throw new AppError(400, 'Rejection reason is required.');
    }

    await UserService.rejectDriver(id, reason);
    res.status(200).json({
      success: true,
      message: 'Driver rejected.',
    });
  }

  // Customer & User Management (Admin)
  /**
   * Get all customers (admin only)
   * GET /api/v1/users/customers
   */
  static async getCustomers(req: Request, res: Response): Promise<void> {
    const filters: IUserFilters = {
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    };

    const result = await UserService.getCustomers(filters);
    res.status(200).json({
      success: true,
      data: result.customers,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  }
  /**
   * Get all normal users (admin only)
   * GET /api/v1/users/normal-users
   */
  static async getNormalUsers(req: Request, res: Response): Promise<void> {
    const filters: IUserFilters = {
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    };

    const result = await UserService.getNormalUsers(filters);
    res.status(200).json({
      success: true,
      data: result.users,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  }
  // Admin Utilities
  /**
   * Get user by ID (admin only)
   * GET /api/v1/users/:id
   */
  static async getUserById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      throw new AppError(400, 'A valid vendor ID is required.');
    }
    const user = await UserService.getUserById(id);
    res.status(200).json({
      success: true,
      data: user,
    });
  }
  /**
   * Get user statistics (admin only)
   * GET /api/v1/users/stats
   */
  static async getUserStats(req: Request, res: Response): Promise<void> {
    const stats = await UserService.getUserStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  }
  /**
   * Toggle user active status (admin only)
   * PATCH /api/v1/users/:id/toggle-status
   */
  static async toggleUserStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { isActive } = req.body;
    if (!id || typeof id !== 'string') {
      throw new AppError(400, 'A valid vendor ID is required.');
    }

    if (typeof isActive !== 'boolean') {
      throw new AppError(400, 'isActive boolean is required.');
    }

    if (isActive) {
      await UserService.reactivateUser(id);
    } else {
      await UserService.deactivateUser(id, req.body.reason);
    }

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully.`,
    });
  }
}
