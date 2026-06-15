import { Types } from 'mongoose';
import { UserRole } from '@/types/enums.js';

// Base User Types

export interface IGeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IUserBase {
  _id: Types.ObjectId;
  phone: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  refreshToken?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Role-Specific User Types

// Vendor Specific Fields
export interface IVendorUser extends IUserBase {
  role: UserRole.VENDOR;
  businessName: string;
  ownerName: string;
  address: string;
  pickupLocation: IGeoLocation;
  citizenshipDocUrl: string;
  businessLogoUrl?: string;
  rating?: number;
  totalDeliveries?: number;
  rejectionReason?: string;
}

// Driver Specific Fields
export interface IDriverUser extends IUserBase {
  role: UserRole.DRIVER;
  fullName: string;
  citizenshipDocUrl: string;
  drivingLicenseUrl: string;
  bikeModel: string;
  bluebookUrl: string;
  selfieUrl: string;
  emergencyContact: {
    name: string;
    phone: string;
  };
  isOnline: boolean;
  currentLocation?: IGeoLocation;
  lastLocationUpdate?: Date;
  rating?: number;
  totalDeliveries?: number;
  rejectionReason?: string;
}

// Customer Specific Fields
export interface ICustomerUser extends IUserBase {
  role: UserRole.CUSTOMER;
  fullName: string;
  selfieUrl: string;
  email?: string;
  defaultDeliveryAddress?: string;
}

// Normal User Specific Fields
export interface INormalUser extends IUserBase {
  role: UserRole.NORMAL_USER;
  fullName: string;
  selfieUrl: string;
  email?: string;
}

// Union Type & Type Guards

export type IUser = IVendorUser | IDriverUser | ICustomerUser | INormalUser;

export type IUserDocument = IUser & {
  _id: Types.ObjectId;
  save(): Promise<IUserDocument>;
  toJSON(): Record<string, unknown>;
};

export type UserModelType = {
  _id: Types.ObjectId;
  role: UserRole;
  phone: string;
  isActive: boolean;
  isVerified: boolean;
};

// Type Guards
export const isVendor = (user: IUser): user is IVendorUser => user.role === UserRole.VENDOR;
export const isDriver = (user: IUser): user is IDriverUser => user.role === UserRole.DRIVER;
export const isCustomer = (user: IUser): user is ICustomerUser => user.role === UserRole.CUSTOMER;
export const isNormalUser = (user: IUser): user is INormalUser => user.role === UserRole.NORMAL_USER;

// DTOs (Data Transfer Objects)

export interface IUserResponse {
  id: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  profile: Record<string, unknown>;
  createdAt: Date;
}

export interface IUpdateUserProfile {
  phone?: string;
  email?: string;
  defaultDeliveryAddress?: string;
  fullName?: string;
  businessName?: string;
  address?: string;
}

export interface IDriverLocationUpdate {
  driverId: string;
  coordinates: [number, number];
}

// Query Filters

export interface IUserFilters {
  role?: UserRole;
  isActive?: boolean;
  isVerified?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface INearbyDriversQuery {
  coordinates: [number, number];
  maxDistance?: number; 
  limit?: number;
}