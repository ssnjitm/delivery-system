import { UserRole } from '@/types/enums.js';
import mongoose, { Schema, Document } from 'mongoose';

//  Define GeoJSON Location Schema Helper
const PointSchema = new Schema({
  type: { type: String, enum: ['Point'], default: 'Point', required: true },
  coordinates: { type: [Number], required: true } // [longitude, latitude]
}, { _id: false });

//  Base User Document Interface
export interface IUserBase extends Document {
  phone: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  refreshToken?: string; 
  createdAt: Date;
  updatedAt: Date;
}

const BaseUserSchema = new Schema<IUserBase>({
  phone: { type: String, required: true, unique: true, index: true, trim: true },
  password: { type: String, required: false },
  role: { type: String, enum: Object.values(UserRole), required: true },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  refreshToken: { type: String, required: false } 
}, { 
  timestamps: true, 
  discriminatorKey: 'role'
});

export const UserModel = mongoose.model<IUserBase>('User', BaseUserSchema);

// VENDOR DISCRIMINATOR SCHEMA
export interface IVendorUser extends IUserBase {
  businessName: string;
  ownerName: string;
  address: string;
  pickupLocation: { type: string; coordinates: [number, number] }; // GeoJSON
  citizenshipDocUrl: string;
  logoUrl?: string;
}

const VendorSchema = new Schema<IVendorUser>({
  businessName: { type: String, required: true, trim: true },
  ownerName: { type: String, required: true, trim: true },
  address: { type: String, required: true },
  pickupLocation: { type: PointSchema, required: true } // PRD: Permanent pickup point
}, { _id: false });

// Apply 2dsphere index to permit swift proximity querying
VendorSchema.index({ pickupLocation: '2dsphere' });

export const VendorModel = UserModel.discriminator<IVendorUser>(UserRole.VENDOR, VendorSchema);

// CUSTOMER & NORMAL USER DISCRIMINATOR SCHEMA
export interface ICustomerUser extends IUserBase {
  fullName: string;
  selfieUrl: string; // PRD: Identity verification selfie
  email?: string;
  defaultDeliveryAddress?: string;
}

const CustomerSchema = new Schema<ICustomerUser>({
  fullName: { type: String, required: true, trim: true },
  selfieUrl: { type: String, required: true },
  email: { type: String, required: false, lowercase: true, trim: true },
  defaultDeliveryAddress: { type: String, required: false }
}, { _id: false });

export const CustomerModel = UserModel.discriminator<ICustomerUser>(UserRole.CUSTOMER, CustomerSchema);
export const NormalUserModel = UserModel.discriminator<ICustomerUser>(UserRole.NORMAL_USER, CustomerSchema);

// DRIVER DISCRIMINATOR SCHEMA
export interface IDriverUser extends IUserBase {
  fullName: string;
  citizenshipDocUrl: string;
  drivingLicenseUrl: string;
  bikeModel: string;
  bluebookUrl: string;
  selfieUrl: string;
  emergencyContact: { name: string; phone: string };
  isOnline: boolean;
  walletBalance: number;
}

const DriverSchema = new Schema<IDriverUser>({
  fullName: { type: String, required: true, trim: true },
  citizenshipDocUrl: { type: String, required: true },
  drivingLicenseUrl: { type: String, required: true },
  bikeModel: { type: String, required: true },
  bluebookUrl: { type: String, required: true },
  selfieUrl: { type: String, required: true },
  emergencyContact: {
    name: { type: String, required: true },
    phone: { type: String, required: true }
  },
  isOnline: { type: Boolean, default: false, index: true },
  walletBalance: { type: Number, default: 0 }
}, { _id: false });

export const DriverModel = UserModel.discriminator<IDriverUser>(UserRole.DRIVER, DriverSchema);