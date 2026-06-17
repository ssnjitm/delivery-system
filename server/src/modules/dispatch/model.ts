import mongoose, { HydratedDocument, Schema } from 'mongoose';
import { DispatchStatus } from './types.js';
import { IDispatchRequest, IBatchGroup, IDispatchQueue } from './types.js';

// Dispatch Request Schema

const DispatchRequestSchema = new Schema<IDispatchRequest>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    orderIdDisplay: {
      type: String,
      required: true,
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    vendorName: {
      type: String,
      required: true,
    },
    pickupLocation: {
      coordinates: {
        type: [Number],
        required: true,
        index: '2dsphere',
      },
      address: {
        type: String,
        required: true,
      },
    },
    deliveryLocation: {
      coordinates: {
        type: [Number],
        required: true,
        index: '2dsphere',
      },
      address: {
        type: String,
        required: true,
      },
    },
    packageType: {
      type: String,
      required: true,
    },
    codAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    estimatedEarnings: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(DispatchStatus),
      default: DispatchStatus.PENDING,
      index: true,
    },
    assignedDriverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    rejectedDrivers: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    notifiedDrivers: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    searchRadius: {
      type: Number,
      default: 5000,
    },
    maxAttempts: {
      type: Number,
      default: 3,
    },
    attemptCount: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    assignedAt: Date,
    acceptedAt: Date,
    completedAt: Date,
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
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
  }
);

// Indexes
DispatchRequestSchema.index({ status: 1, expiresAt: 1 });
DispatchRequestSchema.index({ orderId: 1, status: 1 });
DispatchRequestSchema.index({ assignedDriverId: 1, status: 1 });

export const DispatchRequestModel = mongoose.model<IDispatchRequest>(
  'DispatchRequest',
  DispatchRequestSchema
);

// Batch Group Schema
const BatchGroupSchema = new Schema<IBatchGroup>(
  {
    driverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderIds: [{
      type: Schema.Types.ObjectId,
      ref: 'Order',
    }],
    orderIdsDisplay: [String],
    route: {
      waypoints: [{
        orderId: {
          type: Schema.Types.ObjectId,
          ref: 'Order',
        },
        type: {
          type: String,
          enum: ['PICKUP', 'DELIVERY'],
        },
        location: {
          coordinates: [Number],
          address: String,
        },
        sequence: Number,
      }],
      totalDistance: Number,
      estimatedDuration: Number,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'],
      default: 'PENDING',
      index: true,
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
  }
);

BatchGroupSchema.index({ driverId: 1, status: 1 });
BatchGroupSchema.index({ 'route.waypoints.orderId': 1 });

export const BatchGroupModel = mongoose.model<IBatchGroup>(
  'BatchGroup',
  BatchGroupSchema
);

// Dispatch Queue Schema
const DispatchQueueSchema = new Schema<IDispatchQueue>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true,
      index: true,
    },
    priority: {
      type: Number,
      default: 5,
      min: 1,
      max: 10,
    },
    batchable: {
      type: Boolean,
      default: true,
    },
    batchGroupId: {
      type: Schema.Types.ObjectId,
      ref: 'BatchGroup',
    },
    status: {
      type: String,
      enum: ['QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'QUEUED',
      index: true,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    maxRetries: {
      type: Number,
      default: 3,
    },
    nextRetryAt: Date,
    errorMessage: String,
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
  }
);

DispatchQueueSchema.index({ status: 1, priority: -1 });
DispatchQueueSchema.index({ nextRetryAt: 1 });

export const DispatchQueueModel = mongoose.model<IDispatchQueue>(
  'DispatchQueue',
  DispatchQueueSchema
);