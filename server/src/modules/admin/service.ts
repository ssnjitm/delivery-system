import { Types } from 'mongoose';
import { AppError } from '@/middlewares/auth.js';
import { UserRole } from '@/types/enums.js';
import { UserModel, VendorModel, DriverModel } from '../users/model.js';
import { DocumentModel } from '../documents/model.js';
import { DocumentStatus } from '../documents/types.js';
import { AdminAuditLogModel, DisputeModel } from './model.js';
import {
  IAdminAuditLog,
  IDashboardStats,
  IReportFilters,
  IOrderReport,
  IRevenueReport,
  IDriverPerformanceReport,
  IVendorPerformanceReport,
  AdminActionType,
  DisputeStatus,
  DisputeType,
  IDispute,
  IAdminQueryParams,
} from './types.js';

export class AdminService {
  // Dashboard Statistics

  static async getDashboardStats(): Promise<IDashboardStats> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // User Statistics
    const [
      totalUsers,
      totalVendors,
      pendingVendors,
      totalDrivers,
      pendingDrivers,
      onlineDrivers,
      totalCustomers,
      totalNormalUsers,
      pendingDocuments,
      documentsByType,
    ] = await Promise.all([
      UserModel.countDocuments(),
      UserModel.countDocuments({ role: UserRole.VENDOR }),
      UserModel.countDocuments({ role: UserRole.VENDOR, isVerified: false }),
      UserModel.countDocuments({ role: UserRole.DRIVER }),
      UserModel.countDocuments({ role: UserRole.DRIVER, isVerified: false }),
      DriverModel.countDocuments({ isOnline: true, isActive: true, isVerified: true }),
      UserModel.countDocuments({ role: UserRole.CUSTOMER }),
      UserModel.countDocuments({ role: UserRole.NORMAL_USER }),
      DocumentModel.countDocuments({ status: DocumentStatus.PENDING }),
      DocumentModel.aggregate([
        { $match: { status: DocumentStatus.PENDING } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
    ]);

    // Order Statistics (Placeholder - will be implemented when Orders module is ready)
    const totalOrders = {
      today: 0,
      week: 0,
      month: 0,
      total: 0,
    };

    const ordersByStatus = {};

    // Revenue Statistics (Placeholder)
    const revenue = {
      today: 0,
      week: 0,
      month: 0,
      total: 0,
    };

    // Dispute Statistics
    const pendingDisputes = await DisputeModel.countDocuments({
      status: { $in: [DisputeStatus.PENDING, DisputeStatus.UNDER_REVIEW] },
    });

    const disputesByType = await DisputeModel.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    const disputesByTypeMap = disputesByType.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    // Document statistics
    const documentsByTypeMap = documentsByType.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    return {
      totalUsers,
      totalVendors,
      pendingVendors,
      totalDrivers,
      pendingDrivers,
      onlineDrivers,
      totalCustomers,
      totalNormalUsers,
      totalOrders,
      ordersByStatus,
      revenue,
      pendingCODAmount: 0, // Will be implemented with Payments module
      pendingDocuments,
      documentsByType: documentsByTypeMap,
      pendingDisputes,
      disputesByType: disputesByTypeMap,
    };
  }

  // Admin Audit Log

  static async logAdminAction(
    adminId: string,
    adminName: string,
    adminRole: UserRole,
    actionType: AdminActionType,
    targetType: 'user' | 'document' | 'order' | 'dispute' | 'system',
    targetId: string,
    changes?: Record<string, any>,
    reason?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const log = new AdminAuditLogModel({
      adminId: new Types.ObjectId(adminId),
      adminName,
      adminRole,
      actionType,
      targetType,
      targetId: new Types.ObjectId(targetId),
      changes,
      reason,
      ipAddress: ipAddress || 'unknown',
      userAgent: userAgent || 'unknown',
    });

    await log.save();
  }

  static async getAuditLogs(
    filters: {
      adminId?: string;
      actionType?: AdminActionType;
      targetType?: string;
      startDate?: Date;
      endDate?: Date;
    },
    page: number = 1,
    limit: number = 50,
  ): Promise<{ logs: IAdminAuditLog[]; total: number; page: number; limit: number }> {
    const query: any = {};

    if (filters.adminId) query.adminId = new Types.ObjectId(filters.adminId);
    if (filters.actionType) query.actionType = filters.actionType;
    if (filters.targetType) query.targetType = filters.targetType;
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = filters.startDate;
      if (filters.endDate) query.createdAt.$lte = filters.endDate;
    }

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      AdminAuditLogModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AdminAuditLogModel.countDocuments(query),
    ]);

    return { logs, total, page, limit };
  }

  // Dispute Management

  static async createDispute(disputeData: Partial<IDispute>): Promise<IDispute> {
    const dispute = new DisputeModel({
      ...disputeData,
      disputeId: `DSP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    });

    await dispute.save();
    return dispute;
  }

  static async getDisputes(
    filters: {
      status?: DisputeStatus;
      type?: DisputeType;
      assignedTo?: string;
    },
    page: number = 1,
    limit: number = 20,
  ): Promise<{ disputes: IDispute[]; total: number; page: number; limit: number }> {
    const query: any = {};
    if (filters.status) query.status = filters.status;
    if (filters.type) query.type = filters.type;
    if (filters.assignedTo) query.assignedTo = new Types.ObjectId(filters.assignedTo);

    const skip = (page - 1) * limit;
    const [disputes, total] = await Promise.all([
      DisputeModel.find(query)
        .populate('raisedBy', 'phone role')
        .populate('against', 'phone role')
        .populate('assignedTo', 'phone role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DisputeModel.countDocuments(query),
    ]);

    return { disputes, total, page, limit };
  }

  static async getDisputeById(disputeId: string): Promise<IDispute> {
    const dispute = await DisputeModel.findById(disputeId)
      .populate('raisedBy', 'phone role')
      .populate('against', 'phone role')
      .populate('assignedTo', 'phone role')
      .populate('resolvedBy', 'phone role');

    if (!dispute) {
      throw new AppError(404, 'Dispute not found.');
    }

    return dispute;
  }

  static async updateDisputeStatus(
    disputeId: string,
    status: DisputeStatus,
    resolution?: string,
    adminId?: string,
  ): Promise<IDispute> {
    const dispute = await DisputeModel.findById(disputeId);
    if (!dispute) {
      throw new AppError(404, 'Dispute not found.');
    }

    dispute.status = status;
    if (resolution) dispute.resolution = resolution;

    if (status === DisputeStatus.RESOLVED) {
      dispute.resolvedBy = adminId ? new Types.ObjectId(adminId) : undefined;
      dispute.resolvedAt = new Date();
    }

    await dispute.save();
    return dispute;
  }

  static async assignDispute(disputeId: string, adminId: string): Promise<IDispute> {
    const dispute = await DisputeModel.findById(disputeId);
    if (!dispute) {
      throw new AppError(404, 'Dispute not found.');
    }

    dispute.assignedTo = new Types.ObjectId(adminId);
    dispute.status = DisputeStatus.UNDER_REVIEW;
    await dispute.save();

    return dispute;
  }

  // Report Generation

  static async generateOrderReport(filters: IReportFilters): Promise<{
    orders: IOrderReport[];
    total: number;
    summary: {
      totalOrders: number;
      totalRevenue: number;
      averageOrderValue: number;
      completionRate: number;
    };
  }> {
    // This will be implemented when Orders module is ready
    // Placeholder return
    return {
      orders: [],
      total: 0,
      summary: {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        completionRate: 0,
      },
    };
  }

  static async generateRevenueReport(filters: IReportFilters): Promise<{
    report: IRevenueReport[];
    total: {
      totalDeliveries: number;
      totalRevenue: number;
      platformCommission: number;
      driverPayout: number;
    };
  }> {
    // This will be implemented when Orders and Payments modules are ready
    // Placeholder return
    return {
      report: [],
      total: {
        totalDeliveries: 0,
        totalRevenue: 0,
        platformCommission: 0,
        driverPayout: 0,
      },
    };
  }

  static async generateDriverPerformanceReport(
    filters: IReportFilters,
  ): Promise<{ drivers: IDriverPerformanceReport[]; total: number }> {
    const drivers = await DriverModel.find({ isVerified: true })
      .select('fullName _id totalDeliveries rating')
      .lean();

    const report = drivers.map((driver) => ({
      driverId: driver._id.toString(),
      driverName: driver.fullName,
      totalDeliveries: driver.totalDeliveries || 0,
      completedDeliveries: driver.totalDeliveries || 0,
      cancelledDeliveries: 0,
      averageRating: driver.rating || 0,
      totalEarnings: 0,
      onlineHours: 0,
      acceptanceRate: 100,
    }));

    return { drivers: report, total: report.length };
  }

  static async generateVendorPerformanceReport(
    filters: IReportFilters,
  ): Promise<{ vendors: IVendorPerformanceReport[]; total: number }> {
    const vendors = await VendorModel.find().select('businessName _id totalDeliveries').lean();

    const report = vendors.map((vendor) => ({
      vendorId: vendor._id.toString(),
      businessName: vendor.businessName,
      totalOrders: vendor.totalDeliveries || 0,
      completedOrders: vendor.totalDeliveries || 0,
      cancelledOrders: 0,
      totalCODCollected: 0,
      totalCODSettled: 0,
      averageOrderValue: 0,
    }));

    return { vendors: report, total: report.length };
  }

  // Bulk Operations

  static async bulkApproveVendors(vendorIds: string[], adminId: string): Promise<number> {
    const result = await VendorModel.updateMany(
      { _id: { $in: vendorIds.map((id) => new Types.ObjectId(id)) }, isVerified: false },
      { isVerified: true },
    );

    // Log each approval
    for (const vendorId of vendorIds) {
      await this.logAdminAction(
        adminId,
        'System', // Will be replaced with actual admin name
        UserRole.ADMIN,
        AdminActionType.VENDOR_APPROVED,
        'user',
        vendorId,
        { bulkApproved: true },
      );
    }

    return result.modifiedCount;
  }

  static async bulkVerifyDrivers(driverIds: string[], adminId: string): Promise<number> {
    const result = await DriverModel.updateMany(
      { _id: { $in: driverIds.map((id) => new Types.ObjectId(id)) }, isVerified: false },
      { isVerified: true },
    );

    // Log each verification
    for (const driverId of driverIds) {
      await this.logAdminAction(
        adminId,
        'System',
        UserRole.ADMIN,
        AdminActionType.DRIVER_VERIFIED,
        'user',
        driverId,
        { bulkVerified: true },
      );
    }

    return result.modifiedCount;
  }

  // Search & Filter Helpers

  static async searchUsers(query: string, role?: UserRole, limit: number = 20): Promise<any[]> {
    const searchQuery: any = {
      $or: [{ phone: { $regex: query, $options: 'i' } }],
    };

    // Add role-specific search fields
    if (role === UserRole.VENDOR) {
      searchQuery.$or.push(
        { businessName: { $regex: query, $options: 'i' } },
        { ownerName: { $regex: query, $options: 'i' } },
      );
    } else if (role === UserRole.DRIVER) {
      searchQuery.$or.push({ fullName: { $regex: query, $options: 'i' } });
    } else {
      searchQuery.$or.push({ fullName: { $regex: query, $options: 'i' } });
    }

    if (role) searchQuery.role = role;

    const users = await UserModel.find(searchQuery).limit(limit).lean();
    return users;
  }
}
