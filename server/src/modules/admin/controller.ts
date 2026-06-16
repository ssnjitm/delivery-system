import { Request, Response } from 'express';
import { AppError } from '@/middlewares/auth.js';
import { UserRole } from '@/types/enums.js';
import { UserService } from '../users/service.js';
import { DocumentsService } from '../documents/service.js';
import { AdminService } from './service.js';
import { DisputeStatus, DisputeType, AdminActionType } from './types.js';

export class AdminController {
  // Dashboard
  static async getDashboardStats(req: Request, res: Response): Promise<void> {
    const stats = await AdminService.getDashboardStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  }

  // User Management (Admin)
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    const { role, isVerified, isActive, search, page, limit } = req.query;

    let result;

    switch (role) {
      case UserRole.VENDOR:
        result = await UserService.getVendors({
          isVerified: isVerified === 'true' ? true : isVerified === 'false' ? false : undefined,
          search: search as string,
          page: page ? parseInt(page as string) : 1,
          limit: limit ? parseInt(limit as string) : 20,
        });
        break;
      case UserRole.DRIVER:
        result = await UserService.getDrivers({
          isVerified: isVerified === 'true' ? true : isVerified === 'false' ? false : undefined,
          isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
          search: search as string,
          page: page ? parseInt(page as string) : 1,
          limit: limit ? parseInt(limit as string) : 20,
        });
        break;
      case UserRole.CUSTOMER:
        result = await UserService.getCustomers({
          search: search as string,
          page: page ? parseInt(page as string) : 1,
          limit: limit ? parseInt(limit as string) : 20,
        });
        break;
      default:
        // If no role specified, return all users (paginated)
        const allUsers = await UserService.getDrivers({
          page: page ? parseInt(page as string) : 1,
          limit: limit ? parseInt(limit as string) : 20,
        });
        result = allUsers;
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  }

  static async getUserDetails(req: Request, res: Response): Promise<void> {
    const userId = req.params.userId as string; // Explicitly cast from req.params
    const user = await UserService.getUserModelById(userId);

    // Get user's documents
    const documents = await DocumentsService.getUserDocuments({ userId });

    res.status(200).json({
      success: true,
      data: {
        user: user.toJSON(),
        documents,
      },
    });
  }

  static async suspendUser(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const userId = req.params.userId as string;
    const { reason } = req.body;

    await UserService.deactivateUser(userId, reason);

    // Log action
    await AdminService.logAdminAction(
      req.user.userId,
      req.user.phone,
      req.user.role,
      AdminActionType.VENDOR_SUSPENDED,
      'user',
      userId,
      { reason },
      reason,
      req.ip || '',
      req.get('user-agent'),
    );

    res.status(200).json({
      success: true,
      message: 'User suspended successfully.',
    });
  }

  static async activateUser(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const userId = req.params.userId as string;

    await UserService.reactivateUser(userId);

    // Log action
    await AdminService.logAdminAction(
      req.user.userId,
      req.user.phone,
      req.user.role,
      AdminActionType.VENDOR_ACTIVATED,
      'user',
      userId,
      {},
      undefined,
      req.ip || '',
      req.get('user-agent'),
    );

    res.status(200).json({
      success: true,
      message: 'User activated successfully.',
    });
  }

  // Admin Audit Logs

  static async getAuditLogs(req: Request, res: Response): Promise<void> {
    const { adminId, actionType, targetType, startDate, endDate, page, limit } = req.query;

    const result = await AdminService.getAuditLogs(
      {
        adminId: adminId as string,
        actionType: actionType as AdminActionType,
        targetType: targetType as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      },
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 50,
    );

    res.status(200).json({
      success: true,
      data: result.logs,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  }

  // Dispute Management

  static async getDisputes(req: Request, res: Response): Promise<void> {
    const { status, type, assignedTo, page, limit } = req.query;

    const result = await AdminService.getDisputes(
      {
        status: status as DisputeStatus,
        type: type as DisputeType,
        assignedTo: assignedTo as string,
      },
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 20,
    );

    res.status(200).json({
      success: true,
      data: result.disputes,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  }

  static async getDisputeById(req: Request, res: Response): Promise<void> {
    const disputeId = req.params.disputeId as string;
    const dispute = await AdminService.getDisputeById(disputeId);

    res.status(200).json({
      success: true,
      data: dispute,
    });
  }

  static async updateDisputeStatus(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const disputeId = req.params.disputeId as string;
    const { status, resolution } = req.body;

    const dispute = await AdminService.updateDisputeStatus(
      disputeId,
      status,
      resolution,
      req.user.userId,
    );

    // Log action
    await AdminService.logAdminAction(
      req.user.userId,
      req.user.phone,
      req.user.role,
      AdminActionType.DISPUTE_RESOLVED,
      'dispute',
      disputeId,
      { status, resolution },
      resolution,
      req.ip || '',
      req.get('user-agent'),
    );

    res.status(200).json({
      success: true,
      message: 'Dispute status updated successfully.',
      data: dispute,
    });
  }

  static async assignDispute(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const disputeId = req.params.disputeId as string;

    const dispute = await AdminService.assignDispute(disputeId, req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Dispute assigned to you successfully.',
      data: dispute,
    });
  }

  // Reports

  static async getOrderReport(req: Request, res: Response): Promise<void> {
    const { startDate, endDate, vendorId, driverId, status, page, limit } = req.query;

    const report = await AdminService.generateOrderReport({
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      vendorId: vendorId as string,
      driverId: driverId as string,
      status: status as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 50,
    });

    res.status(200).json({
      success: true,
      data: report,
    });
  }

  static async getRevenueReport(req: Request, res: Response): Promise<void> {
    const { startDate, endDate } = req.query;

    const report = await AdminService.generateRevenueReport({
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    res.status(200).json({
      success: true,
      data: report,
    });
  }

  static async getDriverPerformanceReport(req: Request, res: Response): Promise<void> {
    const { startDate, endDate, page, limit } = req.query;

    const report = await AdminService.generateDriverPerformanceReport({
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 50,
    });

    res.status(200).json({
      success: true,
      data: report,
    });
  }

  static async getVendorPerformanceReport(req: Request, res: Response): Promise<void> {
    const { startDate, endDate, page, limit } = req.query;

    const report = await AdminService.generateVendorPerformanceReport({
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 50,
    });

    res.status(200).json({
      success: true,
      data: report,
    });
  }

  // Bulk Operations

  static async bulkApproveVendors(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const { vendorIds } = req.body;

    if (!vendorIds || !Array.isArray(vendorIds) || vendorIds.length === 0) {
      throw new AppError(400, 'vendorIds array is required.');
    }

    const count = await AdminService.bulkApproveVendors(vendorIds, req.user.userId);

    res.status(200).json({
      success: true,
      message: `${count} vendors approved successfully.`,
      data: { approvedCount: count },
    });
  }

  static async bulkVerifyDrivers(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const { driverIds } = req.body;

    if (!driverIds || !Array.isArray(driverIds) || driverIds.length === 0) {
      throw new AppError(400, 'driverIds array is required.');
    }

    const count = await AdminService.bulkVerifyDrivers(driverIds, req.user.userId);

    res.status(200).json({
      success: true,
      message: `${count} drivers verified successfully.`,
      data: { verifiedCount: count },
    });
  }

  // Search

  static async searchUsers(req: Request, res: Response): Promise<void> {
    const { q, role, limit } = req.query;

    if (!q || typeof q !== 'string' || q.length < 2) {
      throw new AppError(400, 'Search query must be at least 2 characters.');
    }

    const users = await AdminService.searchUsers(
      q,
      role as UserRole,
      limit ? parseInt(limit as string) : 20,
    );

    res.status(200).json({
      success: true,
      data: users,
    });
  }
}
