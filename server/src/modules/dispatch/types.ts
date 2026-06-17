import { Types } from 'mongoose';
import { OrderStatus, UserRole } from '@/types/enums.js';

// Dispatch Types
export enum DispatchStatus {
  PENDING = 'PENDING',
  SEARCHING = 'SEARCHING',
  ASSIGNED = 'ASSIGNED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}


export interface IDispatchRequest {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  orderIdDisplay: string;
  vendorId: Types.ObjectId;
  vendorName: string;
  pickupLocation: {
    coordinates: [number, number];
    address: string;
  };
  deliveryLocation: {
    coordinates: [number, number];
    address: string;
  };
  packageType: string;
  codAmount: number;
  estimatedEarnings: number;
  status: DispatchStatus;
  assignedDriverId?: Types.ObjectId;
  rejectedDrivers: Types.ObjectId[];
  notifiedDrivers: Types.ObjectId[];
  searchRadius: number; // in meters
  maxAttempts: number;
  attemptCount: number;
  expiresAt: Date;
  assignedAt?: Date;
  acceptedAt?: Date;
  completedAt?: Date;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDriverMatch {
  driverId: Types.ObjectId;
  driverName: string;
  phone: string;
  rating: number;
  totalDeliveries: number;
  distance: number; // in meters
  estimatedArrivalTime: number; // in minutes
  currentLocation: {
    coordinates: [number, number];
    lastUpdate: Date;
  };
  score: number; // Calculated match score
}

export interface IBatchGroup {
  _id: Types.ObjectId;
  driverId: Types.ObjectId;
  orderIds: Types.ObjectId[];
  orderIdsDisplay: string[];
  route: {
    waypoints: {
      orderId: Types.ObjectId;
      type: 'PICKUP' | 'DELIVERY';
      location: {
        coordinates: [number, number];
        address: string;
      };
      sequence: number;
    }[];
    totalDistance: number;
    estimatedDuration: number;
  };
  status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: Date;
  updatedAt: Date;
}


export interface IDispatchQueue {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  priority: number; // 1-10, higher = more urgent
  batchable: boolean;
  batchGroupId?: Types.ObjectId;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  retryCount: number;
  maxRetries: number;
  nextRetryAt?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs & Payloads
export interface IFindDriverPayload {
  orderId: string;
  searchRadius?: number; // in meters
  maxDrivers?: number;
}

export interface IAcceptOrderPayload {
  dispatchRequestId: string;
  driverId: string;
}

export interface IRejectOrderPayload {
  dispatchRequestId: string;
  driverId: string;
  reason?: string;
}

export interface IBatchSuggestionPayload {
  driverId: string;
  currentOrderId: string;
  maxOrders?: number;
  maxDetourDistance?: number; // in meters
}

export interface IDispatchResponse {
  id: string;
  orderId: string;
  status: DispatchStatus;
  assignedDriver?: {
    id: string;
    name: string;
  };
  estimatedEarnings: number;
  expiresAt: Date;
  createdAt: Date;
}

export interface IDriverMatchResponse {
  driverId: string;
  driverName: string;
  rating: number;
  distance: number;
  estimatedArrivalTime: number;
  matchScore: number;
}

// Dispatch Configuration
export interface IDispatchConfig {
  defaultSearchRadius: number; // 5000 meters
  maxSearchRadius: number; // 20000 meters
  maxDriversToNotify: number; // 5
  driverResponseTimeout: number; // 60 seconds
  maxRetryAttempts: number; // 3
  batchMaxOrders: number; // 4
  batchMaxDetourDistance: number; // 3000 meters
  scoringWeights: {
    distance: number; // 0.4
    rating: number; // 0.2
    deliveryHistory: number; // 0.2
    availability: number; // 0.2
  };
}

export const DEFAULT_DISPATCH_CONFIG: IDispatchConfig = {
  defaultSearchRadius: 5000,
  maxSearchRadius: 20000,
  maxDriversToNotify: 5,
  driverResponseTimeout: 60,
  maxRetryAttempts: 3,
  batchMaxOrders: 4,
  batchMaxDetourDistance: 3000,
  scoringWeights: {
    distance: 0.4,
    rating: 0.2,
    deliveryHistory: 0.2,
    availability: 0.2,
  },
};