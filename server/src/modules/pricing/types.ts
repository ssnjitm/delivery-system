import { Types } from 'mongoose';
import { PackageType } from '@/types/enums.js';

// Pricing Types

export enum PricingRuleType {
  BASE_PRICE = 'BASE_PRICE',
  PER_KM_RATE = 'PER_KM_RATE',
  PACKAGE_TYPE_SURCHARGE = 'PACKAGE_TYPE_SURCHARGE',
  PEAK_HOUR_SURCHARGE = 'PEAK_HOUR_SURCHARGE',
  AREA_SURCHARGE = 'AREA_SURCHARGE',
  DISTANCE_BRACKET = 'DISTANCE_BRACKET',
  MINIMUM_FEE = 'MINIMUM_FEE',
  MAXIMUM_FEE = 'MAXIMUM_FEE',
  SPECIAL_HANDLING = 'SPECIAL_HANDLING',
}


export enum PricingRuleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
}

export enum PeakHourType {
  MORNING_PEAK = 'MORNING_PEAK',     // 7-10 AM
  EVENING_PEAK = 'EVENING_PEAK',     // 5-8 PM
  WEEKEND = 'WEEKEND',               // Saturday-Sunday
  HOLIDAY = 'HOLIDAY',               // Public holidays
  NIGHT = 'NIGHT',                   // 10 PM - 6 AM
}

export interface IPricingRule {
  _id: Types.ObjectId;
  type: PricingRuleType;
  name: string;
  description?: string;
  status: PricingRuleStatus;
  priority: number; // Lower number = higher priority
  conditions: {
    packageTypes?: PackageType[];
    peakHourTypes?: PeakHourType[];
    areas?: string[]; // City/area names
    distanceRange?: {
      min: number; // in km
      max: number; // in km
    };
    timeRange?: {
      start: string; // HH:MM format
      end: string; // HH:MM format
    };
    dayOfWeek?: number[]; // 0=Sunday, 1=Monday, etc.
  };
  value: {
    type: 'FIXED' | 'PERCENTAGE' | 'PER_KM';
    amount: number;
    maxAmount?: number;
    minAmount?: number;
  };
  appliesTo: ('VENDOR' | 'CUSTOMER' | 'DRIVER' | 'ALL')[];
  metadata: Record<string, unknown>;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPriceBreakdown {
  basePrice: number;
  distance: {
    km: number;
    perKmRate: number;
    amount: number;
  };
  packageSurcharge: {
    type: PackageType;
    amount: number;
  };
  peakHourSurcharge: {
    isPeak: boolean;
    peakType?: PeakHourType;
    amount: number;
  };
  areaSurcharge: {
    pickup: number;
    delivery: number;
    total: number;
  };
  specialHandling: number;
  minimumFee: number;
  maximumFee: number;
  total: number;
  appliedRules: {
    ruleId: string;
    name: string;
    type: PricingRuleType;
    amount: number;
  }[];
}

export interface IPriceRequest {
  pickupLocation: {
    coordinates: [number, number];
    area: string;
    city: string;
  };
  deliveryLocation: {
    coordinates: [number, number];
    area: string;
    city: string;
  };
  packageType: PackageType;
  packageWeight?: number; // in kg
  isPeakHour?: boolean;
  scheduledTime?: Date; // For future orders
  customerType?: 'VENDOR' | 'CUSTOMER' | 'NORMAL_USER';
  specialHandling?: boolean;
}

export interface IPriceResponse {
  breakdown: IPriceBreakdown;
  total: number;
  currency: string;
  validUntil: Date;
  calculatedAt: Date;
}

// Distance Matrix Types

export interface IDistanceMatrix {
  origin: {
    coordinates: [number, number];
    address: string;
  };
  destination: {
    coordinates: [number, number];
    address: string;
  };
  distance: {
    text: string;
    value: number; // in meters
  };
  duration: {
    text: string;
    value: number; // in seconds
  };
  route: {
    polyline: string;
    waypoints: [number, number][];
  };
}

// Pricing History

export interface IPriceHistory {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  priceBreakdown: IPriceBreakdown;
  appliedRules: {
    ruleId: Types.ObjectId;
    name: string;
    type: PricingRuleType;
    amount: number;
  }[];
  total: number;
  createdAt: Date;
}

// Area Pricing (for area-specific rates)

export interface IAreaPricing {
  _id: Types.ObjectId;
  area: string;
  city: string;
  type: 'PICKUP' | 'DELIVERY' | 'BOTH';
  surcharge: {
    type: 'FIXED' | 'PERCENTAGE';
    amount: number;
  };
  isActive: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// Dynamic Pricing Config

export interface IPricingConfig {
  defaultBasePrice: number;
  defaultPerKmRate: number;
  minimumFee: number;
  maximumFee: number;
  peakHourMultipliers: {
    [key in PeakHourType]?: number;
  };
  packageTypeMultipliers: {
    [key in PackageType]?: number;
  };
  distanceBrackets: {
    min: number;
    max: number;
    rate: number;
  }[];
  specialHandlingFee: number;
  currency: string;
  useDynamicPricing: boolean;
  maxDistanceForDelivery: number; // in km
}

export const DEFAULT_PRICING_CONFIG: IPricingConfig = {
  defaultBasePrice: 50,
  defaultPerKmRate: 15,
  minimumFee: 30,
  maximumFee: 500,
  peakHourMultipliers: {
    [PeakHourType.MORNING_PEAK]: 1.2,
    [PeakHourType.EVENING_PEAK]: 1.3,
    [PeakHourType.NIGHT]: 1.4,
    [PeakHourType.WEEKEND]: 1.1,
    [PeakHourType.HOLIDAY]: 1.5,
  },
  packageTypeMultipliers: {
    [PackageType.STANDARD]: 1.0,
    [PackageType.DOCUMENT]: 0.8,
    [PackageType.PERISHABLE]: 1.3,
    [PackageType.FRAGILE]: 1.2,
    [PackageType.PHARMACY]: 1.1,
  },
  distanceBrackets: [
    { min: 0, max: 2, rate: 15 },
    { min: 2, max: 5, rate: 12 },
    { min: 5, max: 10, rate: 10 },
    { min: 10, max: 20, rate: 8 },
    { min: 20, max: 50, rate: 6 },
  ],
  specialHandlingFee: 50,
  currency: 'NPR',
  useDynamicPricing: true,
  maxDistanceForDelivery: 50,
};