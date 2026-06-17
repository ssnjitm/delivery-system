import { Request, Response } from 'express';
import { AppError } from '@/middlewares/auth.js';
import { UserRole } from '@/types/enums.js';
import { DispatchService } from './service.js';
import { IFindDriverPayload, IAcceptOrderPayload, IRejectOrderPayload } from './types.js';

export class DispatchController {
  
  // Find & Assign Driver
  
  static async findDriver(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }
    
    // Only admin or dispatch can manually trigger
    if (![UserRole.ADMIN, UserRole.DISPATCH].includes(req.user.role)) {
      throw new AppError(403, 'Only admin and dispatch can trigger driver search.');
    }
    
    const { orderId, searchRadius } = req.body;
    
    if (!orderId) {
      throw new AppError(400, 'orderId is required.');
    }
    
    const payload: IFindDriverPayload = {
      orderId: String(orderId),
      searchRadius: searchRadius ? Number(searchRadius) : undefined,
    };
    
    const result = await DispatchService.findDriverForOrder(payload);
    
    res.status(200).json({
      success: true,
      message: 'Driver search initiated.',
      data: result,
    });
  }
  
  // Driver Response
  
  static async acceptOrder(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }
    
    if (req.user.role !== UserRole.DRIVER) {
      throw new AppError(403, 'Only drivers can accept orders.');
    }
    
    const { dispatchRequestId } = req.params;
    
    const payload: IAcceptOrderPayload = {
      // Forcing the type safely using String() conversion
      dispatchRequestId: String(dispatchRequestId),
      driverId: req.user.userId,
    };
    
    const result = await DispatchService.acceptOrder(payload);
    
    res.status(200).json({
      success: true,
      message: 'Order accepted successfully.',
      data: result,
    });
  }
  
  static async rejectOrder(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }
    
    if (req.user.role !== UserRole.DRIVER) {
      throw new AppError(403, 'Only drivers can reject orders.');
    }
    
    const { dispatchRequestId } = req.params;
    const { reason } = req.body;
    
    const payload: IRejectOrderPayload = {
      // Forcing the type safely using String() conversion
      dispatchRequestId: String(dispatchRequestId),
      driverId: req.user.userId,
      reason: reason ? String(reason) : undefined,
    };
    
    await DispatchService.rejectOrder(payload);
    
    res.status(200).json({
      success: true,
      message: 'Order rejected.',
    });
  }
  
  // Batch Management
  
  static async suggestBatch(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }
    
    if (req.user.role !== UserRole.DRIVER) {
      throw new AppError(403, 'Only drivers can get batch suggestions.');
    }
    
    const { currentOrderId, maxOrders, maxDetourDistance } = req.body;
    
    if (!currentOrderId) {
      throw new AppError(400, 'currentOrderId is required.');
    }
    
    const result = await DispatchService.suggestBatch({
      driverId: req.user.userId,
      currentOrderId: String(currentOrderId),
      maxOrders: maxOrders ? Number(maxOrders) : undefined,
      maxDetourDistance: maxDetourDistance ? Number(maxDetourDistance) : undefined,
    });
    
    res.status(200).json({
      success: true,
      data: result,
    });
  }
  
  // Dispatch Status
  
  static async getDispatchStatus(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }
    
    const { orderId } = req.params;
    
    res.status(200).json({
      success: true,
      data: {
        orderId: String(orderId),
        status: 'SEARCHING',
        message: 'Dispatch status endpoint - implement full logic',
      },
    });
  }
  
  // Queue Management (Admin only)
  
  static async processQueue(req: Request, res: Response): Promise<void> {
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      throw new AppError(403, 'Admin access required.');
    }
    
    await DispatchService.processQueue();
    
    res.status(200).json({
      success: true,
      message: 'Queue processed successfully.',
    });
  }
  
  static async getDispatchConfig(req: Request, res: Response): Promise<void> {
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      throw new AppError(403, 'Admin access required.');
    }
    
    const config = DispatchService.getConfig();
    
    res.status(200).json({
      success: true,
      data: config,
    });
  }
  
  static async updateDispatchConfig(req: Request, res: Response): Promise<void> {
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      throw new AppError(403, 'Admin access required.');
    }
    
    const config = req.body;
    DispatchService.setConfig(config);
    
    res.status(200).json({
      success: true,
      message: 'Dispatch configuration updated.',
      data: DispatchService.getConfig(),
    });
  }
}