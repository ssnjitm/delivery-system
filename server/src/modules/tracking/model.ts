import mongoose, { HydratedDocument, Schema } from 'mongoose';
import {
  IDriverLocation,
  ITrackingSession,
  IGeofence,
  IDriverLocationHistory,
  IGeoLocation,
} from './types.js';

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
  { _id: false },
);

GeoLocationSchema.index({ coordinates: '2dsphere' });

// Driver Location Schema

const DriverLocationSchema = new Schema<IDriverLocation>(
  {
    driverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    driverName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    location: {
      type: GeoLocationSchema,
      required: true,
      index: '2dsphere',
    },
    accuracy: {
      type: Number,
      default: 10,
    },
    altitude: {
      type: Number,
      default: 0,
    },
    speed: {
      type: Number,
      default: 0,
    },
    heading: {
      type: Number,
      default: 0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    isOnline: {
      type: Boolean,
      default: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    batteryLevel: {
      type: Number,
      min: 0,
      max: 100,
    },
    deviceInfo: {
      platform: String,
      osVersion: String,
      appVersion: String,
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
  },
);

// Indexes
DriverLocationSchema.index({ isOnline: 1, isActive: 1 });
DriverLocationSchema.index({ driverId: 1, timestamp: -1 });

export const DriverLocationModel = mongoose.model<IDriverLocation>(
  'DriverLocation',
  DriverLocationSchema,
);

// Tracking Session Schema

const TrackingSessionSchema = new Schema<ITrackingSession>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    driverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PAUSED', 'COMPLETED', 'EXPIRED'],
      default: 'ACTIVE',
      index: true,
    },
    startLocation: {
      type: GeoLocationSchema,
      required: true,
    },
    currentLocation: {
      type: GeoLocationSchema,
      required: true,
    },
    destinationLocation: {
      type: GeoLocationSchema,
      required: true,
    },
    waypoints: [
      {
        location: GeoLocationSchema,
        timestamp: Date,
        type: {
          type: String,
          enum: ['PICKUP', 'DELIVERY', 'WAYPOINT'],
        },
      },
    ],
    path: [GeoLocationSchema],
    distanceTraveled: {
      type: Number,
      default: 0,
    },
    estimatedTimeRemaining: {
      type: Number,
      default: 0,
    },
    estimatedArrivalTime: Date,
    lastUpdateAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
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
  },
);

TrackingSessionSchema.index({ orderId: 1, driverId: 1 });
TrackingSessionSchema.index({ status: 1, expiresAt: 1 });
TrackingSessionSchema.index({ 'currentLocation.coordinates': '2dsphere' });

export const TrackingSessionModel = mongoose.model<ITrackingSession>(
  'TrackingSession',
  TrackingSessionSchema,
);

// Geofence Schema

const GeofenceSchema = new Schema<IGeofence>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['PICKUP', 'DELIVERY'],
      required: true,
    },
    location: {
      type: GeoLocationSchema,
      required: true,
      index: '2dsphere',
    },
    radius: {
      type: Number,
      default: 50, // 50 meters
      min: 10,
      max: 500,
    },
    triggerEvents: {
      entered: {
        type: Boolean,
        default: false,
      },
      exited: {
        type: Boolean,
        default: false,
      },
      enteredAt: Date,
      exitedAt: Date,
      notified: {
        type: Boolean,
        default: false,
      },
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
  },
);

GeofenceSchema.index({ orderId: 1, type: 1 });
GeofenceSchema.index({ 'triggerEvents.entered': 1, 'triggerEvents.exited': 1 });

export const GeofenceModel = mongoose.model<IGeofence>('Geofence', GeofenceSchema);

// Driver Location History Schema
const DriverLocationHistorySchema = new Schema<IDriverLocationHistory>(
  {
    driverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    locations: [
      {
        location: GeoLocationSchema,
        timestamp: Date,
        speed: Number,
        heading: Number,
      },
    ],
    summary: {
      totalDistance: {
        type: Number,
        default: 0,
      },
      activeHours: {
        type: Number,
        default: 0,
      },
      averageSpeed: {
        type: Number,
        default: 0,
      },
      maxSpeed: {
        type: Number,
        default: 0,
      },
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

DriverLocationHistorySchema.index({ driverId: 1, date: -1 });

export const DriverLocationHistoryModel = mongoose.model<IDriverLocationHistory>(
  'DriverLocationHistory',
  DriverLocationHistorySchema,
);
