import { Types } from 'mongoose';

// Tracking Types
export interface IGeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IDriverLocation {
  _id: Types.ObjectId;
  driverId: Types.ObjectId;
  driverName: string;
  phone: string;
  location: IGeoLocation;
  accuracy: number; // in meters
  altitude: number; // in meters
  speed: number; // in m/s
  heading: number; // degrees from north
  timestamp: Date;
  isOnline: boolean;
  isActive: boolean;
  batteryLevel?: number;
  deviceInfo?: {
    platform: string;
    osVersion: string;
    appVersion: string;
  };
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITrackingSession {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  driverId: Types.ObjectId;
  customerId?: Types.ObjectId;
  vendorId?: Types.ObjectId;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'EXPIRED';
  startLocation: IGeoLocation;
  currentLocation: IGeoLocation;
  destinationLocation: IGeoLocation;
  waypoints: {
    location: IGeoLocation;
    timestamp: Date;
    type: 'PICKUP' | 'DELIVERY' | 'WAYPOINT';
  }[];
  path: IGeoLocation[];
  distanceTraveled: number; // in meters
  estimatedTimeRemaining: number; // in minutes
  estimatedArrivalTime: Date;
  lastUpdateAt: Date;
  expiresAt: Date;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGeofence {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  type: 'PICKUP' | 'DELIVERY';
  location: IGeoLocation;
  radius: number; // in meters
  triggerEvents: {
    entered: boolean;
    exited: boolean;
    enteredAt?: Date;
    exitedAt?: Date;
    notified: boolean;
  };
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
// Location History (for analytics)
export interface IDriverLocationHistory {
  _id: Types.ObjectId;
  driverId: Types.ObjectId;
  date: Date;
  locations: {
    location: IGeoLocation;
    timestamp: Date;
    speed: number;
    heading: number;
  }[];
  summary: {
    totalDistance: number;
    activeHours: number;
    averageSpeed: number;
    maxSpeed: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
// DTOs & Payloads
export interface IUpdateLocationPayload {
  driverId: string;
  coordinates: [number, number];
  accuracy?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  batteryLevel?: number;
  deviceInfo?: {
    platform: string;
    osVersion: string;
    appVersion: string;
  };
}
export interface ITrackingResponse {
  driverId: string;
  driverName: string;
  phone: string;
  location: {
    coordinates: [number, number];
    timestamp: Date;
  };
  isOnline: boolean;
  speed: number;
  heading: number;
}

export interface IOrderTrackingResponse {
  orderId: string;
  orderStatus: string;
  driver: {
    id: string;
    name: string;
    phone: string;
    location: {
      coordinates: [number, number];
      timestamp: Date;
    };
    speed: number;
    heading: number;
  };
  pickupLocation: {
    coordinates: [number, number];
    address: string;
  };
  deliveryLocation: {
    coordinates: [number, number];
    address: string;
  };
  estimatedArrivalTime: Date;
  estimatedTimeRemaining: number; // in minutes
  distanceToDestination: number; // in meters
  status: 'PENDING' | 'ACTIVE' | 'NEAR_PICKUP' | 'NEAR_DELIVERY' | 'COMPLETED';
  path: {
    coordinates: [number, number];
    timestamp: Date;
  }[];
  waypoints: {
    location: [number, number];
    type: 'PICKUP' | 'DELIVERY';
    reached: boolean;
  }[];
}

export interface IGeofenceEventPayload {
  orderId: string;
  driverId: string;
  type: 'PICKUP' | 'DELIVERY';
  event: 'ENTERED' | 'EXITED';
  coordinates: [number, number];
  timestamp: Date;
}
// Query Filters

export interface INearbyDriversQuery {
  coordinates: [number, number];
  radius?: number; // in meters
  limit?: number;
  isOnline?: boolean;
}

export interface IDriverLocationFilters {
  driverId?: string;
  isOnline?: boolean;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export interface ITrackingSessionFilters {
  orderId?: string;
  driverId?: string;
  customerId?: string;
  vendorId?: string;
  status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'EXPIRED';
  startDate?: Date;
  endDate?: Date;
}

// WebSocket Message Types
export interface IWebSocketMessage {
  type: 'LOCATION_UPDATE' | 'TRACKING_UPDATE' | 'GEOFENCE_TRIGGERED' | 'DRIVER_STATUS_CHANGE';
  timestamp: Date;
  data: Record<string, unknown>;
}

export interface ILocationUpdateMessage extends IWebSocketMessage {
  type: 'LOCATION_UPDATE';
  data: {
    driverId: string;
    location: {
      coordinates: [number, number];
      timestamp: Date;
    };
    speed: number;
    heading: number;
  };
}

export interface ITrackingUpdateMessage extends IWebSocketMessage {
  type: 'TRACKING_UPDATE';
  data: {
    orderId: string;
    driverId: string;
    estimatedArrivalTime: Date;
    estimatedTimeRemaining: number;
    distanceToDestination: number;
  };
}

export interface IGeofenceTriggerMessage extends IWebSocketMessage {
  type: 'GEOFENCE_TRIGGERED';
  data: {
    orderId: string;
    type: 'PICKUP' | 'DELIVERY';
    event: 'ENTERED' | 'EXITED';
    coordinates: [number, number];
  };
}