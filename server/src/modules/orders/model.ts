import mongoose, { HydratedDocument, Schema } from 'mongoose';
import { OrderStatus, PackageType } from '@/types/enums.js';
import { IOrder, IAddress, IGeoLocation, IOrderItem } from './types.js';

// GeoLocation Schema
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

GeoLocationSchema.index({ coordinates: '2dsphere' });

// Address Schema
const AddressSchema = new Schema<IAddress>(
  {
    street: { type: String, required: true, trim: true },
    area: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    landmark: { type: String, trim: true },
    coordinates: { type: GeoLocationSchema, required: true },
  },
  { _id: false }
);

// Order Item Schema
const OrderItemSchema = new Schema<IOrderItem>(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    notes: { type: String, trim: true },
  },
  { _id: false }
);

// Status History Schema
const StatusHistorySchema = new Schema(
  {
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, trim: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

// Main Order Schema
const OrderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      default: () => `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    },
    source: {
      type: String,
      enum: ['VENDOR', 'NORMAL_USER'],
      required: true,
      index: true,
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    vendorName: { type: String, required: true, trim: true },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    driverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    driverName: { type: String, trim: true },
    pickupAddress: { type: AddressSchema, required: true },
    deliveryAddress: { type: AddressSchema, required: true },
    packageType: {
      type: String,
      enum: Object.values(PackageType),
      required: true,
      index: true,
    },
    packageDescription: { type: String, trim: true },
    packageWeight: { type: Number, min: 0 },
    items: { type: [OrderItemSchema], required: true },
    basePrice: { type: Number, required: true, min: 0 },
    distanceKm: { type: Number, required: true, min: 0 },
    perKmRate: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    extraCharges: {
      peakHour: { type: Number, default: 0, min: 0 },
      packageType: { type: Number, default: 0, min: 0 },
      areaSurcharge: { type: Number, default: 0, min: 0 },
      specialHandling: { type: Number, default: 0, min: 0 },
    },
    totalAmount: { type: Number, required: true, min: 0 },
    isCOD: { type: Boolean, default: false, index: true },
    codAmount: { type: Number, default: 0, min: 0 },
    codCollected: { type: Boolean, default: false },
    codCollectedAt: { type: Date },
    codSettled: { type: Boolean, default: false },
    codSettledAt: { type: Date },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.WAITING_FOR_DRIVER,
      required: true,
      index: true,
    },
    statusHistory: { type: [StatusHistorySchema], default: [] },
    assignedAt: { type: Date },
    pickedUpAt: { type: Date },
    deliveredAt: { type: Date },
    trackingCode: { type: String, unique: true, sparse: true },
    estimatedDeliveryTime: { type: Date },
    actualDeliveryTime: { type: Date },
    customerNotes: { type: String, trim: true },
    driverNotes: { type: String, trim: true },
    specialInstructions: { type: String, trim: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
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

// Indexes for Performance
// Compound indexes for common queries
OrderSchema.index({ vendorId: 1, status: 1, createdAt: -1 });
OrderSchema.index({ driverId: 1, status: 1, createdAt: -1 });
OrderSchema.index({ customerId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ isCOD: 1, codSettled: 1 });

// Geospatial indexes
OrderSchema.index({ 'pickupAddress.coordinates': '2dsphere' });
OrderSchema.index({ 'deliveryAddress.coordinates': '2dsphere' });

// Text search indexes
OrderSchema.index({
  orderId: 'text',
  customerName: 'text',
  customerPhone: 'text',
  vendorName: 'text',
});

// Middleware

// Auto-add initial status history on creation
OrderSchema.pre('save', async function (this: HydratedDocument<IOrder>) {
  if (this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      note: 'Order created',
    });
  }
 
});

export const OrderModel = mongoose.model<IOrder>('Order', OrderSchema);