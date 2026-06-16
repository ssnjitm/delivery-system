import mongoose, { Schema } from 'mongoose';
import { IAdminAuditLog, IDispute, AdminActionType, DisputeStatus, DisputeType } from './types.js';

// ============================================
// Admin Audit Log Schema
// ============================================

const AdminAuditLogSchema = new Schema<IAdminAuditLog>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    adminName: {
      type: String,
      required: true,
    },
    adminRole: {
      type: String,
      required: true,
    },
    actionType: {
      type: String,
      enum: Object.values(AdminActionType),
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ['user', 'document', 'order', 'dispute', 'system'],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    changes: {
      type: Schema.Types.Mixed,
      default: {},
    },
    reason: {
      type: String,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: Record<string, any>) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Index for efficient querying
AdminAuditLogSchema.index({ createdAt: -1 });
AdminAuditLogSchema.index({ adminId: 1, createdAt: -1 });
AdminAuditLogSchema.index({ targetType: 1, targetId: 1 });

export const AdminAuditLogModel = mongoose.model<IAdminAuditLog>(
  'AdminAuditLog',
  AdminAuditLogSchema,
);

// ============================================
// Dispute Schema
// ============================================

const DisputeSchema = new Schema<IDispute>(
  {
    disputeId: {
      type: String,
      required: true,
      unique: true,
      default: () => `DSP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    },
    type: {
      type: String,
      enum: Object.values(DisputeType),
      required: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    raisedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    raisedByRole: {
      type: String,
      required: true,
    },
    against: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    againstRole: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    evidenceUrls: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: Object.values(DisputeStatus),
      default: DisputeStatus.PENDING,
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    resolution: {
      type: String,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: Record<string, any>) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

DisputeSchema.index({ status: 1, createdAt: -1 });
DisputeSchema.index({ raisedBy: 1, status: 1 });
DisputeSchema.index({ assignedTo: 1, status: 1 });

export const DisputeModel = mongoose.model<IDispute>('Dispute', DisputeSchema);
