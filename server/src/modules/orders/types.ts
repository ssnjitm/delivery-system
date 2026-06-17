import { Types } from 'mongoose';
import { OrderStatus, PackageType, UserRole } from '@/types/enums.js';

// Order Types

export interface IGeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IAddress {
  street: string;
  area: string;
  city: string;
  landmark?: string;
  coordinates: IGeoLocation;
}

export interface IOrderItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
  notes?: string;
}

export interface IOrder {
  _id: Types.ObjectId;
  orderId: string;
  
  // Order Source
  source: 'VENDOR' | 'NORMAL_USER';
  
  // Parties
  vendorId: Types.ObjectId;
  vendorName: string;
  customerId: Types.ObjectId;
  customerName: string;
  customerPhone: string;
  driverId?: Types.ObjectId;
  driverName?: string;
  
  // Locations
  pickupAddress: IAddress;
  deliveryAddress: IAddress;
  
  // Package Details
  packageType: PackageType;
  packageDescription?: string;
  packageWeight?: number; // in kg
  items: IOrderItem[];
  
  // Pricing
  basePrice: number;
  distanceKm: number;
  perKmRate: number;
  deliveryFee: number;
  extraCharges: {
    peakHour: number;
    packageType: number;
    areaSurcharge: number;
    specialHandling: number;
  };
  totalAmount: number;
  
  // COD
  isCOD: boolean;
  codAmount: number;
  codCollected: boolean;
  codCollectedAt?: Date;
  codSettled: boolean;
  codSettledAt?: Date;
  
  // Status
  status: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    timestamp: Date;
    note?: string;
    updatedBy?: Types.ObjectId;
  }[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  assignedAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  
  // Tracking
  trackingCode?: string;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  
  // Notes
  customerNotes?: string;
  driverNotes?: string;
  specialInstructions?: string;
  
  // Metadata
  metadata: Record<string, unknown>;
}

// Order DTOs

export interface ICreateOrderPayload {
  source: 'VENDOR' | 'NORMAL_USER';
  vendorId: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  pickupAddress: {
    street: string;
    area: string;
    city: string;
    landmark?: string;
    coordinates: [number, number];
  };
  deliveryAddress: {
    street: string;
    area: string;
    city: string;
    landmark?: string;
    coordinates: [number, number];
  };
  packageType: PackageType;
  packageDescription?: string;
  packageWeight?: number;
  items: {
    name: string;
    quantity: number;
    price: number;
    notes?: string;
  }[];
  isCOD: boolean;
  codAmount?: number;
  customerNotes?: string;
  specialInstructions?: string;
}

export interface IOrderStatusUpdatePayload {
  orderId: string;
  status: OrderStatus;
  note?: string;
  coordinates?: [number, number];
}

export interface IOrderResponse {
  id: string;
  orderId: string;
  source: 'VENDOR' | 'NORMAL_USER';
  vendorId: string;       
  vendorName: string;
  customerId: string;      
  customerName: string;
  customerPhone: string;
  driverId?: string;       
  driverName?: string;
  pickupAddress: IAddress;
  deliveryAddress: IAddress;
  packageType: PackageType;
  packageDescription?: string;
  items: IOrderItem[];
  deliveryFee: number;
  totalAmount: number;
  isCOD: boolean;
  codAmount: number;
  codCollected: boolean;   
  status: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    timestamp: Date;
    note?: string;
  }[];
  trackingCode?: string;
  estimatedDeliveryTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}


// Order Filter Types

export interface IOrderFilters {
  vendorId?: string;
  customerId?: string;
  driverId?: string;
  status?: OrderStatus;
  source?: 'VENDOR' | 'NORMAL_USER';
  isCOD?: boolean;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Order Statistics
export interface IOrderStats {
  totalOrders: number;
  byStatus: Record<OrderStatus, number>;
  todayOrders: number;
  weekOrders: number;
  monthOrders: number;
  totalRevenue: number;
  totalCODAmount: number;
  pendingCOD: number;
  averageDeliveryTime: number; // in minutes
  completionRate: number;
}