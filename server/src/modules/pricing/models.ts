import mongoose, { HydratedDocument, Schema } from 'mongoose';
import {
  IPricingRule,
  IPriceHistory,
  IAreaPricing,
  PricingRuleType,
  PricingRuleStatus,
  PeakHourType,
} from './types.js';
import { PackageType } from '@/types/enums.js';

// Pricing Rule Schema

const PricingRuleSchema = new Schema<IPricingRule>(
  {
    type: {
      type: String,
      enum: Object.values(PricingRuleType),
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(PricingRuleStatus),
      default: PricingRuleStatus.ACTIVE,
      index: true,
    },
    priority: {
      type: Number,
      default: 100,
      min: 1,
      max: 1000,
    },
    conditions: {
      packageTypes: [{
        type: String,
        enum: Object.values(PackageType),
      }],
      peakHourTypes: [{
        type: String,
        enum: Object.values(PeakHourType),
      }],
      areas: [String],
      distanceRange: {
        min: Number,
        max: Number,
      },
      timeRange: {
        start: String,
        end: String,
      },
      dayOfWeek: [Number],
    },
    value: {
      type: {
        type: String,
        enum: ['FIXED', 'PERCENTAGE', 'PER_KM'],
        required: true,
      },
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
      maxAmount: {
        type: Number,
        min: 0,
      },
      minAmount: {
        type: Number,
        min: 0,
      },
    },
    appliesTo: [{
      type: String,
      enum: ['VENDOR', 'CUSTOMER', 'DRIVER', 'ALL'],
    }],
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
  }
);

// Indexes
PricingRuleSchema.index({ type: 1, status: 1, priority: 1 });
PricingRuleSchema.index({ status: 1, 'conditions.packageTypes': 1 });

export const PricingRuleModel = mongoose.model<IPricingRule>('PricingRule', PricingRuleSchema);

// Price History Schema

const PriceHistorySchema = new Schema<IPriceHistory>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    priceBreakdown: {
      basePrice: Number,
      distance: {
        km: Number,
        perKmRate: Number,
        amount: Number,
      },
      packageSurcharge: {
        type: String,
        amount: Number,
      },
      peakHourSurcharge: {
        isPeak: Boolean,
        peakType: String,
        amount: Number,
      },
      areaSurcharge: {
        pickup: Number,
        delivery: Number,
        total: Number,
      },
      specialHandling: Number,
      minimumFee: Number,
      maximumFee: Number,
      total: Number,
      appliedRules: [{
        ruleId: Schema.Types.ObjectId,
        name: String,
        type: String,
        amount: Number,
      }],
    },
    appliedRules: [{
      ruleId: {
        type: Schema.Types.ObjectId,
        ref: 'PricingRule',
      },
      name: String,
      type: {
        type: String,
        enum: Object.values(PricingRuleType),
      },
      amount: Number,
    }],
    total: {
      type: Number,
      required: true,
      min: 0,
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

PriceHistorySchema.index({ orderId: 1, createdAt: -1 });

export const PriceHistoryModel = mongoose.model<IPriceHistory>('PriceHistory', PriceHistorySchema);

// Area Pricing Schema

const AreaPricingSchema = new Schema<IAreaPricing>(
  {
    area: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['PICKUP', 'DELIVERY', 'BOTH'],
      default: 'BOTH',
    },
    surcharge: {
      type: {
        type: String,
        enum: ['FIXED', 'PERCENTAGE'],
        required: true,
      },
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
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

AreaPricingSchema.index({ area: 1, city: 1, type: 1 }, { unique: true });
AreaPricingSchema.index({ city: 1, isActive: 1 });

export const AreaPricingModel = mongoose.model<IAreaPricing>('AreaPricing', AreaPricingSchema);