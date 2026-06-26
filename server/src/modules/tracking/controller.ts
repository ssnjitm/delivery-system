import { Request, Response } from 'express';
import { AppError } from '@/middlewares/auth.js';
import { UserRole } from '@/types/enums.js';
import { TrackingService } from './service.js';
import { IUpdateLocationPayload } from './types.js';

export class TrackingController {
  // Driver Location Updates

  /**
   * Update driver location (called from Flutter app)
   * POST /api/v1/tracking/location
   */
  static async updateLocation(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    if (req.user.role !== UserRole.DRIVER) {
      throw new AppError(403, 'Only drivers can update location.');
    }

    const { coordinates, accuracy, altitude, speed, heading, batteryLevel, deviceInfo } = req.body;

    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      throw new AppError(400, 'Valid coordinates [longitude, latitude] are required.');
    }

    const payload: IUpdateLocationPayload = {
      driverId: req.user.userId,
      coordinates: coordinates as [number, number], // Casted to match strict tuple type requirement
      accuracy,
      altitude,
      speed,
      heading,
      batteryLevel,
      deviceInfo,
    };

    const location = await TrackingService.updateDriverLocation(payload);

    res.status(200).json({
      success: true,
      message: 'Location updated successfully.',
      data: location,
    });
  }

  /**
   * Get driver's current location
   * GET /api/v1/tracking/driver/:driverId
   */
  static async getDriverLocation(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const driverId = req.params.driverId as string; // Casted to resolve string | string[] discrepancy

    const isDriver = req.user.role === UserRole.DRIVER && driverId === req.user.userId;
    const isAdmin = req.user.role === UserRole.ADMIN;
    const isDispatch = req.user.role === UserRole.DISPATCH;

    if (!isDriver && !isAdmin && !isDispatch) {
      throw new AppError(403, "You do not have access to this driver's location.");
    }

    const location = await TrackingService.getDriverLocation(driverId);

    res.status(200).json({
      success: true,
      data: location,
    });
  }

  /**
   * Get nearby drivers
   * GET /api/v1/tracking/nearby
   */
  static async getNearbyDrivers(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const { longitude, latitude, radius, limit } = req.query;

    if (!longitude || !latitude) {
      throw new AppError(400, 'Longitude and latitude are required.');
    }

    const drivers = await TrackingService.getNearbyDrivers({
      coordinates: [parseFloat(longitude as string), parseFloat(latitude as string)],
      radius: radius ? parseFloat(radius as string) : 5000,
      limit: limit ? parseInt(limit as string) : 20,
    });

    res.status(200).json({
      success: true,
      data: drivers,
    });
  }

  /**
   * Get all drivers location (admin)
   * GET /api/v1/tracking/drivers
   */
  static async getAllDriversLocation(req: Request, res: Response): Promise<void> {
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      throw new AppError(403, 'Admin access required.');
    }

    const { isOnline, limit } = req.query;

    const locations = await TrackingService.getAllDriversLocation({
      isOnline: isOnline === 'true' ? true : isOnline === 'false' ? false : undefined,
      limit: limit ? parseInt(limit as string) : 100,
    });

    res.status(200).json({
      success: true,
      data: locations,
    });
  }

  // Order Tracking

  /**
   * Track an order
   * GET /api/v1/tracking/order/:orderId
   */
  static async trackOrder(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const orderId = req.params.orderId as string; // Casted to resolve string | string[] discrepancy

    // Casted response to 'any' to bypass strict interface checks for runtime vendorId/customerId properties
    const tracking = (await TrackingService.getOrderTracking(orderId)) as any;

    const isVendor = req.user.role === UserRole.VENDOR && tracking.vendorId === req.user.userId;
    const isCustomer =
      (req.user.role === UserRole.CUSTOMER || req.user.role === UserRole.NORMAL_USER) &&
      tracking.customerId === req.user.userId;
    const isDriver = req.user.role === UserRole.DRIVER && tracking.driver?.id === req.user.userId;
    const isAdmin = req.user.role === UserRole.ADMIN;

    if (!isVendor && !isCustomer && !isDriver && !isAdmin) {
      throw new AppError(403, 'You do not have access to this order tracking.');
    }

    res.status(200).json({
      success: true,
      data: tracking,
    });
  }

  /**
   * Get driver location history
   * GET /api/v1/tracking/driver/:driverId/history
   */
  static async getDriverHistory(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const driverId = req.params.driverId as string;
    const { startDate, endDate, limit } = req.query;

    const isAdmin = req.user.role === UserRole.ADMIN;
    const isDispatch = req.user.role === UserRole.DISPATCH;
    const isDriver = req.user.role === UserRole.DRIVER && driverId === req.user.userId;

    if (!isAdmin && !isDispatch && !isDriver) {
      throw new AppError(403, "You do not have access to this driver's history.");
    }

    const history = await TrackingService.getDriverLocationHistory(driverId, {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      limit: limit ? parseInt(limit as string) : 100,
    });

    res.status(200).json({
      success: true,
      data: history,
    });
  }

  /**
   * Get driver daily summary
   * GET /api/v1/tracking/driver/:driverId/summary
   */
  static async getDriverSummary(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const driverId = req.params.driverId as string;
    const { date } = req.query;

    const isAdmin = req.user.role === UserRole.ADMIN;
    const isDriver = req.user.role === UserRole.DRIVER && driverId === req.user.userId;

    if (!isAdmin && !isDriver) {
      throw new AppError(403, "You do not have access to this driver's summary.");
    }

    const summary = await TrackingService.getDriverDailySummary(
      driverId,
      date ? new Date(date as string) : new Date(),
    );

    res.status(200).json({
      success: true,
      data: summary,
    });
  }
}
