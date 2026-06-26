import { Request, Response } from 'express';
import { AppError } from '@/middlewares/auth.js';
import { UserRole } from '@/types/enums.js';
import { PricingService } from './service.js';
import { IPriceRequest } from './types.js';

export class PricingController {
  
  // ============================================
  // Price Calculation
  // ============================================
  
  /**
   * Calculate delivery price
   * POST /api/v1/pricing/calculate
   */
  static async calculatePrice(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const {
      pickupLocation,
      deliveryLocation,
      packageType,
      packageWeight,
      isPeakHour,
      scheduledTime,
      specialHandling,
    } = req.body;

    if (!pickupLocation || !deliveryLocation || !packageType) {
      throw new AppError(400, 'pickupLocation, deliveryLocation, and packageType are required.');
    }

    const request: IPriceRequest = {
      pickupLocation: {
        coordinates: pickupLocation.coordinates,
        area: pickupLocation.area,
        city: pickupLocation.city,
      },
      deliveryLocation: {
        coordinates: deliveryLocation.coordinates,
        area: deliveryLocation.area,
        city: deliveryLocation.city,
      },
      packageType,
      packageWeight,
      isPeakHour,
      scheduledTime: scheduledTime ? new Date(scheduledTime) : undefined,
      customerType: req.user.role as 'VENDOR' | 'CUSTOMER' | 'NORMAL_USER',
      specialHandling,
    };

    const price = await PricingService.calculatePrice(request);

    res.status(200).json({
      success: true,
      data: price,
    });
  }

  // ============================================
  // Area Pricing Management (Admin)
  // ============================================
  
  /**
   * Create area pricing
   * POST /api/v1/pricing/admin/areas
   */
  static async createAreaPricing(req: Request, res: Response): Promise<void> {
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      throw new AppError(403, 'Admin access required.');
    }

    const areaPricing = await PricingService.createAreaPricing(req.body);

    res.status(201).json({
      success: true,
      message: 'Area pricing created successfully.',
      data: areaPricing,
    });
  }

  /**
   * Update area pricing
   * PUT /api/v1/pricing/admin/areas/:id
   */
  static async updateAreaPricing(req: Request, res: Response): Promise<void> {
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      throw new AppError(403, 'Admin access required.');
    }

    // 👈 Fixed ts(2345) by explicitly casting id as a string
    const id = req.params.id as string; 
    const areaPricing = await PricingService.updateAreaPricing(id, req.body);

    if (!areaPricing) {
      throw new AppError(404, 'Area pricing not found.');
    }

    res.status(200).json({
      success: true,
      message: 'Area pricing updated successfully.',
      data: areaPricing,
    });
  }

  /**
   * Get all area pricing
   * GET /api/v1/pricing/admin/areas
   */
  static async getAllAreaPricing(req: Request, res: Response): Promise<void> {
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      throw new AppError(403, 'Admin access required.');
    }

    const { city, isActive } = req.query;
    const areas = await PricingService.getAllAreaPricing({
      city: city as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    });

    res.status(200).json({
      success: true,
      data: areas,
    });
  }

  // ============================================
  // Configuration (Admin)
  // ============================================
  
  /**
   * Get pricing configuration
   * GET /api/v1/pricing/admin/config
   */
  static async getConfig(req: Request, res: Response): Promise<void> {
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      throw new AppError(403, 'Admin access required.');
    }

    const config = PricingService.getConfig();

    res.status(200).json({
      success: true,
      data: config,
    });
  }

  /**
   * Update pricing configuration
   * PUT /api/v1/pricing/admin/config
   */
  static async updateConfig(req: Request, res: Response): Promise<void> {
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      throw new AppError(403, 'Admin access required.');
    }

    PricingService.setConfig(req.body);

    res.status(200).json({
      success: true,
      message: 'Pricing configuration updated successfully.',
      data: PricingService.getConfig(),
    });
  }
}