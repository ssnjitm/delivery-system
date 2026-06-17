import { Request, Response } from 'express';
import { AppError } from '@/middlewares/auth.js';
import { UserRole, OrderStatus } from '@/types/enums.js';
import { OrdersService } from './service.js';
import { ICreateOrderPayload } from './types.js';

export class OrdersController {
  // Order Creation
  static async createOrder(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    // Only vendors and normal users can create orders
    if (![UserRole.VENDOR, UserRole.NORMAL_USER].includes(req.user.role)) {
      throw new AppError(403, 'Only vendors and normal users can create orders.');
    }

    const payload: ICreateOrderPayload = {
      ...req.body,
      source: req.user.role === UserRole.VENDOR ? 'VENDOR' : 'NORMAL_USER',
      vendorId: req.body.vendorId || req.user.userId, // If vendor creating, use their ID
    };

    const order = await OrdersService.createOrder(payload);

    res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      data: order,
    });
  }

  // Order Retrieval

  static async getOrder(req: Request<{ id: string }>, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const { id } = req.params;
    const order = await OrdersService.getOrderById(id);

    // Check access permissions using the string IDs from response
    const isVendor = req.user.role === UserRole.VENDOR && order.vendorId === req.user.userId;
    const isDriver = req.user.role === UserRole.DRIVER && order.driverId === req.user.userId;
    const isCustomer =
      (req.user.role === UserRole.CUSTOMER || req.user.role === UserRole.NORMAL_USER) &&
      order.customerId === req.user.userId;
    const isAdmin = req.user.role === UserRole.ADMIN;

    if (!isVendor && !isDriver && !isCustomer && !isAdmin) {
      throw new AppError(403, 'You do not have access to this order.');
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  }

  static async getOrderByOrderId(req: Request<{ orderId: string }>, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const { orderId } = req.params;
    const order = await OrdersService.getOrderByOrderId(orderId);

    // Check access permissions (same as above)
    const isVendor = req.user.role === UserRole.VENDOR && order.vendorId === req.user.userId;
    const isDriver = req.user.role === UserRole.DRIVER && order.driverId === req.user.userId;
    const isCustomer =
      (req.user.role === UserRole.CUSTOMER || req.user.role === UserRole.NORMAL_USER) &&
      order.customerId === req.user.userId;
    const isAdmin = req.user.role === UserRole.ADMIN;

    if (!isVendor && !isDriver && !isCustomer && !isAdmin) {
      throw new AppError(403, 'You do not have access to this order.');
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  }

  static async getMyOrders(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const { status, page, limit, startDate, endDate } = req.query;
    const userId = req.user.userId;
    const role = req.user.role;

    let result;

    switch (role) {
      case UserRole.VENDOR:
        result = await OrdersService.getVendorOrders(userId, {
          status: status as OrderStatus,
          page: page ? parseInt(page as string) : 1,
          limit: limit ? parseInt(limit as string) : 20,
          startDate: startDate ? new Date(startDate as string) : undefined,
          endDate: endDate ? new Date(endDate as string) : undefined,
        });
        break;

      case UserRole.DRIVER:
        result = await OrdersService.getDriverOrders(userId, {
          status: status as OrderStatus,
          page: page ? parseInt(page as string) : 1,
          limit: limit ? parseInt(limit as string) : 20,
          startDate: startDate ? new Date(startDate as string) : undefined,
          endDate: endDate ? new Date(endDate as string) : undefined,
        });
        break;

      case UserRole.CUSTOMER:
      case UserRole.NORMAL_USER:
        result = await OrdersService.getCustomerOrders(userId, {
          status: status as OrderStatus,
          page: page ? parseInt(page as string) : 1,
          limit: limit ? parseInt(limit as string) : 20,
          startDate: startDate ? new Date(startDate as string) : undefined,
          endDate: endDate ? new Date(endDate as string) : undefined,
        });
        break;

      default:
        throw new AppError(403, 'You do not have orders to view.');
    }

    res.status(200).json({
      success: true,
      data: result.orders,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  }

  static async getAllOrders(req: Request, res: Response): Promise<void> {
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      throw new AppError(403, 'Admin access required.');
    }

    const { status, source, isCOD, search, page, limit, startDate, endDate } = req.query;

    const result = await OrdersService.getOrders({
      status: status as OrderStatus,
      source: source as 'VENDOR' | 'NORMAL_USER',
      isCOD: isCOD === 'true' ? true : isCOD === 'false' ? false : undefined,
      search: search as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    res.status(200).json({
      success: true,
      data: result.orders,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  }

  // Order Status Management

  static async updateOrderStatus(req: Request<{ id: string }>, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const { id } = req.params;
    const { status, note, coordinates } = req.body;

    // Check if user has permission to update this order
    const order = await OrdersService.getOrderById(id);

    const isDriver = req.user.role === UserRole.DRIVER && order.driverId === req.user.userId;
    const isAdmin = req.user.role === UserRole.ADMIN;

    if (!isDriver && !isAdmin) {
      throw new AppError(403, 'Only drivers and admins can update order status.');
    }

    const updatedOrder = await OrdersService.updateOrderStatus({
      orderId: id,
      status,
      note,
      coordinates,
    });

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: updatedOrder,
    });
  }

  static async assignDriver(req: Request<{ id: string }>, res: Response): Promise<void> {
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      throw new AppError(403, 'Admin access required.');
    }

    const { id } = req.params;
    const { driverId } = req.body;

    if (!driverId) {
      throw new AppError(400, 'driverId is required.');
    }

    const order = await OrdersService.assignDriver(id, driverId);

    res.status(200).json({
      success: true,
      message: 'Driver assigned successfully.',
      data: order,
    });
  }

  static async collectCOD(req: Request<{ id: string }>, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    if (req.user.role !== UserRole.DRIVER) {
      throw new AppError(403, 'Only drivers can collect COD.');
    }

    const { id } = req.params;
    const order = await OrdersService.collectCOD(id, req.user.userId);

    res.status(200).json({
      success: true,
      message: 'COD collected successfully.',
      data: order,
    });
  }

  static async cancelOrder(req: Request<{ id: string }>, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      throw new AppError(400, 'Cancellation reason is required.');
    }

    const order = await OrdersService.cancelOrder(id, reason, req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully.',
      data: order,
    });
  }

  // Order Statistics

  static async getOrderStats(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const { vendorId, driverId, startDate, endDate } = req.query;

    let stats;

    if (req.user.role === UserRole.ADMIN) {
      // Admin can see all stats
      stats = await OrdersService.getOrderStats(
        vendorId as string,
        driverId as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
      );
    } else if (req.user.role === UserRole.VENDOR) {
      stats = await OrdersService.getOrderStats(req.user.userId);
    } else if (req.user.role === UserRole.DRIVER) {
      stats = await OrdersService.getOrderStats(undefined, req.user.userId);
    } else {
      throw new AppError(403, 'You do not have access to order statistics.');
    }

    res.status(200).json({
      success: true,
      data: stats,
    });
  }
}
