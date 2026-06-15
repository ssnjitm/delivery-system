import mongoose, { Schema, Types } from 'mongoose';
import { UserRole } from '@/types/enums.js';
import {
  IUserBase,
  IVendorUser,
  IDriverUser,
  ICustomerUser,
  INormalUser,
  IGeoLocation,
} from '../../types/user.types.js';

// ============================================
// Geospatial Schema
// ============================================

const GeoLocationSchema = new Schema<IGeoLocation>(
  {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (coords: number[]) => coords.length === 2,
        message: 'Coordinates must be [longitude, latitude]',
      },
    },
  },
  { _id: false }
);

// Create 2dsphere index for geospatial queries
GeoLocationSchema.index({ coordinates: '2dsphere' });

// ============================================
// Base User Schema
// ============================================

const UserBaseSchema = new Schema<IUserBase>(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    password: {
      type: String,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    discriminatorKey: 'role', // MongoDB discriminator key
    toJSON: {
      // Typing ret as Record<string, any> resolves ts(2790) for the delete operator
      transform: (_, ret: Record<string, any>) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.refreshToken;
        return ret;
      },
    },
  }
);

// Compound indexes for common queries
UserBaseSchema.index({ role: 1, isActive: 1, isVerified: 1 });
UserBaseSchema.index({ phone: 1, role: 1 });

export const UserModel = mongoose.model<IUserBase>('User', UserBaseSchema);

// ============================================
// Vendor Discriminator
// ============================================

const VendorSchema = new Schema<IVendorUser>(
  {
    businessName: { type: String, required: true, trim: true, index: true },
    ownerName: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    pickupLocation: { type: GeoLocationSchema, required: true },
    citizenshipDocUrl: { type: String, required: true },
    businessLogoUrl: { type: String },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalDeliveries: { type: Number, default: 0 },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

VendorSchema.index({ rating: -1, totalDeliveries: -1 });
VendorSchema.index({ pickupLocation: '2dsphere' });

export const VendorModel = UserModel.discriminator<IVendorUser>(
  UserRole.VENDOR,
  VendorSchema
);

// ============================================
// Driver Discriminator
// ============================================

const DriverSchema = new Schema<IDriverUser>(
  {
    fullName: { type: String, required: true, trim: true },
    citizenshipDocUrl: { type: String, required: true },
    drivingLicenseUrl: { type: String, required: true },
    bikeModel: { type: String, required: true },
    bluebookUrl: { type: String, required: true },
    selfieUrl: { type: String, required: true },
    emergencyContact: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
    },
    isOnline: { type: Boolean, default: false, index: true },
    currentLocation: { type: GeoLocationSchema },
    lastLocationUpdate: { type: Date },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalDeliveries: { type: Number, default: 0 },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

DriverSchema.index({ isOnline: 1, currentLocation: '2dsphere' });
DriverSchema.index({ rating: -1, totalDeliveries: -1 });

export const DriverModel = UserModel.discriminator<IDriverUser>(
  UserRole.DRIVER,
  DriverSchema
);

// ============================================
// Customer Discriminator
// ============================================

const CustomerSchema = new Schema<ICustomerUser>(
  {
    fullName: { type: String, required: true, trim: true },
    selfieUrl: { type: String, required: true },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
      match: /^\S+@\S+\.\S+$/,
    },
    defaultDeliveryAddress: { type: String, trim: true },
  },
  { timestamps: true }
);

CustomerSchema.index({ email: 1 }, { sparse: true });

export const CustomerModel = UserModel.discriminator<ICustomerUser>(
  UserRole.CUSTOMER,
  CustomerSchema
);

// ============================================
// Normal User Discriminator
// ============================================

const NormalUserSchema = new Schema<INormalUser>(
  {
    fullName: { type: String, required: true, trim: true },
    selfieUrl: { type: String, required: true },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
      match: /^\S+@\S+\.\S+$/,
    },
  },
  { timestamps: true }
);

NormalUserSchema.index({ email: 1 }, { sparse: true });

export const NormalUserModel = UserModel.discriminator<INormalUser>(
  UserRole.NORMAL_USER,
  NormalUserSchema
);