import { Types } from 'mongoose';
import { UserRole } from '@/types/enums.js';
import { DocumentStatus } from '../documents/types.js';

// Admin Action Types
export enum AdminActionType {
  // Vendor Actions
  VENDOR_APPROVED = 'vendor_approved',
  VENDOR_REJECTED = 'vendor_rejected',
  VENDOR_SUSPENDED = 'vendor_suspended',
  VENDOR_ACTIVATED = 'vendor_activated',

  // Driver Actions
  DRIVER_VERIFIED = 'driver_verified',
  DRIVER_REJECTED = 'driver_rejected',
  DRIVER_SUSPENDED = 'driver_suspended',
  DRIVER_ACTIVATED = 'driver_activated',

  // Document ActionsA
  DOCUMENT_VERIFIED = 'document_verified',
  DOCUMENT_REJECTED = 'document_reAected',

  // Order Actions (for future)
  ORDER_CANCELLED = 'order_cancelled',
  ORDER_REFUNDED = 'order_refunded',

  // Dispute Actions
  DISPUTE_RESOLVED = 'dispute_resolved',
  DISPUTE_ESCALATED = 'dispute_escalated',

  // System Actions
  PRICE_RULE_CREATED = 'price_rule_created',
  PRICE_RULE_UPDATED = 'price_rule_updated',
  PRICE_RULE_DELETED = 'price_rule_deleted',
}

export enum DisputeStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated',
}

export enum DisputeType {
  VENDOR_DRIVER = 'vendor_driver',
  CUSTOMER_DRIVER = 'customer_driver',
  COD_MISMATCH = 'cod_mismatch',
  DAMAGED_ITEM = 'damaged_item',
  LATE_DELIVERY = 'late_delivery',
  OTHER = 'other',
}

// Admin Audit Log Interface

export interface IAdminAuditLog {
  _id: Types.ObjectId;
  adminId: Types.ObjectId;
  adminName: string;
  adminRole: UserRole;
  actionType: AdminActionType;
  targetType: 'user' | 'document' | 'order' | 'dispute' | 'system';
  targetId: Types.ObjectId;
  changes?: Record<string, any>;
  reason?: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

// Dispute Interface

export interface IDispute {
  _id: Types.ObjectId;
  disputeId: string;
  type: DisputeType;
  orderId: Types.ObjectId;
  raisedBy: Types.ObjectId;
  raisedByRole: UserRole;
  against: Types.ObjectId;
  againstRole: UserRole;
  title: string;
  description: string;
  evidenceUrls: string[];
  status: DisputeStatus;
  assignedTo?: Types.ObjectId;
  resolution?: string;
  resolvedBy?: Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Dashboard Stats Interfaces

export interface IDashboardStats {
  // User Statistics
  totalUsers: number;
  totalVendors: number;
  pendingVendors: number;
  totalDrivers: number;
  pendingDrivers: number;
  onlineDrivers: number;
  totalCustomers: number;
  totalNormalUsers: number;

  // Order Statistics
  totalOrders: {
    today: number;
    week: number;
    month: number;
    total: number;
  };
  ordersByStatus: Record<string, number>;

  // Revenue Statistics
  revenue: {
    today: number;
    week: number;
    month: number;
    total: number;
  };
  pendingCODAmount: number;

  // Document Statistics
  pendingDocuments: number;
  documentsByType: Record<string, number>;

  // Dispute Statistics
  pendingDisputes: number;
  disputesByType: Record<string, number>;
}

// Report Types

export interface IReportFilters {
  startDate?: Date;
  endDate?: Date;
  vendorId?: string;
  driverId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface IOrderReport {
  orderId: string;
  createdAt: Date;
  vendorName: string;
  driverName?: string;
  customerName: string;
  pickupLocation: string;
  deliveryLocation: string;
  distance: number;
  deliveryFee: number;
  codAmount: number;
  status: string;
  completedAt?: Date;
  deliveryTime?: number; // in minutes
}

export interface IRevenueReport {
  date: Date;
  totalDeliveries: number;
  totalRevenue: number;
  platformCommission: number;
  driverPayout: number;
  codCollected: number;
  codSettled: number;
}

export interface IDriverPerformanceReport {
  driverId: string;
  driverName: string;
  totalDeliveries: number;
  completedDeliveries: number;
  cancelledDeliveries: number;
  averageRating: number;
  totalEarnings: number;
  onlineHours: number;
  acceptanceRate: number;
}

export interface IVendorPerformanceReport {
  vendorId: string;
  businessName: string;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalCODCollected: number;
  totalCODSettled: number;
  averageOrderValue: number;
}

// Query Parameters

export interface IAdminQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: UserRole;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
