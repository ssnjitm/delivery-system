import { Types } from 'mongoose';
import { AppError } from '@/middlewares/auth.js';
import { UserRole, OrderStatus } from '@/types/enums.js';
import { DriverModel } from '../users/model.js';
import { OrderModel } from '../orders/model.js';
import {
  DriverLocationModel,
  TrackingSessionModel,
  GeofenceModel,
  DriverLocationHistoryModel,
} from './model.js';
import {
  IUpdateLocationPayload,
  ITrackingResponse,
  IOrderTrackingResponse,
  INearbyDriversQuery,
  IDriverLocationFilters,
  ITrackingSessionFilters,
  IGeofenceEventPayload,
  IGeoLocation,
} from './types.js';

export class TrackingService {
  // Driver Location Management

  /**
   * Update driver's current location
   * Called from Flutter app via WebSocket or HTTP
   */
  static async updateDriverLocation(payload: IUpdateLocationPayload): Promise<ITrackingResponse> {
    const {
      driverId,
      coordinates,
      accuracy = 10,
      altitude = 0,
      speed = 0,
      heading = 0,
      batteryLevel,
      deviceInfo,
    } = payload;

    // Validate driver
    const driver = await DriverModel.findById(driverId);
    if (!driver) {
      throw new AppError(404, 'Driver not found.');
    }

    if (!driver.isActive) {
      throw new AppError(403, 'Driver account is deactivated.');
    }

    // Update driver's online status if not already online
    if (!driver.isOnline) {
      driver.isOnline = true;
      await driver.save();
    }

    // Update or create driver location
    const locationData = {
      driverId: new Types.ObjectId(driverId),
      driverName: driver.fullName,
      phone: driver.phone,
      location: {
        type: 'Point' as const,
        coordinates,
      },
      accuracy,
      altitude,
      speed,
      heading,
      timestamp: new Date(),
      isOnline: true,
      isActive: true,
      batteryLevel,
      deviceInfo,
    };

    const updatedLocation = await DriverLocationModel.findOneAndUpdate(
      { driverId: new Types.ObjectId(driverId) },
      locationData,
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );

    // Save to history (for analytics)
    await this.saveLocationHistory(driverId, coordinates, speed, heading);

    // Update any active tracking sessions
    await this.updateTrackingSessions(driverId, coordinates);

    // Check geofences
    await this.checkGeofences(driverId, coordinates);

    return this.toTrackingResponse(updatedLocation);
  }

  /**
   * Get driver's current location
   */
  static async getDriverLocation(driverId: string): Promise<ITrackingResponse> {
    const location = await DriverLocationModel.findOne({
      driverId: new Types.ObjectId(driverId),
    });

    if (!location) {
      throw new AppError(404, 'Driver location not found.');
    }

    return this.toTrackingResponse(location);
  }

  /**
   * Get nearby online drivers
   */
  static async getNearbyDrivers(query: INearbyDriversQuery): Promise<ITrackingResponse[]> {
    const {
      coordinates,
      radius = 5000, // 5km default
      limit = 20,
      isOnline = true,
    } = query;

    const drivers = await DriverLocationModel.find({
      isOnline,
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates,
          },
          $maxDistance: radius,
        },
      },
    })
      .limit(limit)
      .lean();

    return drivers.map((driver) => this.toTrackingResponse(driver));
  }

  /**
   * Get driver location history
   */
  static async getDriverLocationHistory(
    driverId: string,
    filters: IDriverLocationFilters,
  ): Promise<any[]> {
    const { startDate, endDate, limit = 100 } = filters;

    const query: any = { driverId: new Types.ObjectId(driverId) };
    if (startDate) query.timestamp = { $gte: startDate };
    if (endDate) query.timestamp = { ...query.timestamp, $lte: endDate };

    const history = await DriverLocationModel.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return history;
  }

  /**
   * Get all drivers location (admin)
   */
  static async getAllDriversLocation(
    filters: IDriverLocationFilters,
  ): Promise<ITrackingResponse[]> {
    const { isOnline, isActive = true, limit = 100 } = filters;

    const query: any = { isActive };
    if (isOnline !== undefined) query.isOnline = isOnline;

    const locations = await DriverLocationModel.find(query)
      .limit(limit)
      .sort({ isOnline: -1, timestamp: -1 })
      .lean();

    return locations.map((location) => this.toTrackingResponse(location));
  }

  // Order Tracking

  /**
   * Get order tracking information
   */
  static async getOrderTracking(orderId: string): Promise<IOrderTrackingResponse> {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new AppError(404, 'Order not found.');
    }

    if (!order.driverId) {
      throw new AppError(404, 'No driver assigned to this order.');
    }

    // Get driver location
    const driverLocation = await DriverLocationModel.findOne({
      driverId: order.driverId,
    });

    if (!driverLocation) {
      throw new AppError(404, 'Driver location not available.');
    }

    // Get tracking session
    const session = await TrackingSessionModel.findOne({
      orderId: new Types.ObjectId(orderId),
      status: 'ACTIVE',
    });

    // Calculate distance to destination
    const distance = this.calculateDistance(
      driverLocation.location.coordinates,
      order.deliveryAddress.coordinates.coordinates,
    );

    // Calculate ETA (rough estimate)
    const speed = driverLocation.speed || 5; // m/s
    const etaMinutes = distance > 0 ? Math.ceil(distance / (speed * 60)) : 0;

    return {
      orderId: order.orderId,
      orderStatus: order.status,
      driver: {
        id: driverLocation.driverId.toString(),
        name: driverLocation.driverName,
        phone: driverLocation.phone,
        location: {
          coordinates: driverLocation.location.coordinates,
          timestamp: driverLocation.timestamp,
        },
        speed: driverLocation.speed,
        heading: driverLocation.heading,
      },
      pickupLocation: {
        coordinates: order.pickupAddress.coordinates.coordinates,
        address: `${order.pickupAddress.street}, ${order.pickupAddress.area}`,
      },
      deliveryLocation: {
        coordinates: order.deliveryAddress.coordinates.coordinates,
        address: `${order.deliveryAddress.street}, ${order.deliveryAddress.area}`,
      },
      estimatedArrivalTime:
        session?.estimatedArrivalTime || new Date(Date.now() + etaMinutes * 60000),
      estimatedTimeRemaining: etaMinutes,
      distanceToDestination: Math.round(distance),
      status: this.determineTrackingStatus(order, distance),
      path:
        session?.path?.map((p) => ({
          coordinates: p.coordinates,
          timestamp: session.lastUpdateAt || new Date(),
        })) || [],
      waypoints: [
        {
          location: order.pickupAddress.coordinates.coordinates,
          type: 'PICKUP',
          reached: order.status !== OrderStatus.WAITING_FOR_DRIVER,
        },
        {
          location: order.deliveryAddress.coordinates.coordinates,
          type: 'DELIVERY',
          reached:
            order.status === OrderStatus.DELIVERED || order.status === OrderStatus.COD_COLLECTED,
        },
      ],
    };
  }

  // Tracking Sessions

  /**
   * Create tracking session for an order
   */
  static async createTrackingSession(orderId: string, driverId: string): Promise<void> {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new AppError(404, 'Order not found.');
    }

    const session = new TrackingSessionModel({
      orderId: new Types.ObjectId(orderId),
      driverId: new Types.ObjectId(driverId),
      customerId: order.customerId,
      vendorId: order.vendorId,
      status: 'ACTIVE',
      startLocation: order.pickupAddress.coordinates,
      currentLocation: order.pickupAddress.coordinates,
      destinationLocation: order.deliveryAddress.coordinates,
      waypoints: [
        {
          location: order.pickupAddress.coordinates,
          timestamp: new Date(),
          type: 'PICKUP',
        },
        {
          location: order.deliveryAddress.coordinates,
          timestamp: new Date(),
          type: 'DELIVERY',
        },
      ],
      path: [order.pickupAddress.coordinates],
      estimatedArrivalTime: new Date(Date.now() + 30 * 60000), // 30 min default
      lastUpdateAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    await session.save();
  }

  /**
   * Update tracking sessions with new location
   */
  static async updateTrackingSessions(
    driverId: string,
    coordinates: [number, number],
  ): Promise<void> {
    const sessions = await TrackingSessionModel.find({
      driverId: new Types.ObjectId(driverId),
      status: 'ACTIVE',
    });

    for (const session of sessions) {
      const newLocation: IGeoLocation = {
        type: 'Point',
        coordinates,
      };

      // Calculate distance traveled
      const lastLocation = session.currentLocation;
      const distance = this.calculateDistance(lastLocation.coordinates, coordinates);

      session.distanceTraveled += distance;
      session.currentLocation = newLocation;
      session.path.push(newLocation);
      session.lastUpdateAt = new Date();

      // Calculate ETA to destination
      const distToDest = this.calculateDistance(
        coordinates,
        session.destinationLocation.coordinates,
      );
      const estimatedSpeed = 5; // m/s (average)
      const etaMinutes = Math.ceil(distToDest / (estimatedSpeed * 60));
      session.estimatedTimeRemaining = etaMinutes;
      session.estimatedArrivalTime = new Date(Date.now() + etaMinutes * 60000);

      await session.save();
    }
  }

  /**
   * Complete tracking session
   */
  static async completeTrackingSession(orderId: string): Promise<void> {
    await TrackingSessionModel.findOneAndUpdate(
      { orderId: new Types.ObjectId(orderId) },
      { status: 'COMPLETED' },
    );
  }

  // Geofencing

  /**
   * Create geofences for an order
   */
  static async createGeofences(orderId: string): Promise<void> {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new AppError(404, 'Order not found.');
    }

    // Pickup geofence
    await GeofenceModel.create({
      orderId: new Types.ObjectId(orderId),
      type: 'PICKUP',
      location: order.pickupAddress.coordinates,
      radius: 50, // 50 meters
    });

    // Delivery geofence
    await GeofenceModel.create({
      orderId: new Types.ObjectId(orderId),
      type: 'DELIVERY',
      location: order.deliveryAddress.coordinates,
      radius: 50,
    });
  }

  /**
   * Check geofences for driver location
   */
  static async checkGeofences(driverId: string, coordinates: [number, number]): Promise<void> {
    // Find active geofences for orders assigned to this driver
    const geofences = await GeofenceModel.find({
      orderId: {
        $in: await this.getDriverOrderIds(driverId),
      },
    }).lean();

    for (const geofence of geofences) {
      const distance = this.calculateDistance(coordinates, geofence.location.coordinates);

      const isInside = distance <= geofence.radius;

      if (isInside && !geofence.triggerEvents.entered) {
        // Driver entered geofence
        await this.handleGeofenceEvent({
          orderId: geofence.orderId.toString(),
          driverId,
          type: geofence.type,
          event: 'ENTERED',
          coordinates,
          timestamp: new Date(),
        });
      } else if (!isInside && geofence.triggerEvents.entered && !geofence.triggerEvents.exited) {
        // Driver exited geofence
        await this.handleGeofenceEvent({
          orderId: geofence.orderId.toString(),
          driverId,
          type: geofence.type,
          event: 'EXITED',
          coordinates,
          timestamp: new Date(),
        });
      }
    }
  }

  /**
   * Handle geofence events
   */
  static async handleGeofenceEvent(event: IGeofenceEventPayload): Promise<void> {
    const { orderId, type, event: eventType, coordinates } = event;

    // Update geofence
    await GeofenceModel.findOneAndUpdate(
      { orderId: new Types.ObjectId(orderId), type },
      {
        $set: {
          [`triggerEvents.${eventType.toLowerCase()}`]: true,
          [`triggerEvents.${eventType.toLowerCase()}At`]: new Date(),
          'triggerEvents.notified': true,
        },
      },
    );

    // Update order status if needed
    if (eventType === 'ENTERED') {
      const order = await OrderModel.findById(orderId);
      if (order) {
        if (type === 'PICKUP' && order.status === OrderStatus.DRIVER_ARRIVING) {
          order.status = OrderStatus.DRIVER_ARRIVING;
          await order.save();
        } else if (type === 'DELIVERY' && order.status === OrderStatus.ON_THE_WAY) {
          order.status = OrderStatus.NEAR_DESTINATION;
          await order.save();
        }
      }
    }

    // TODO: Send WebSocket notification
    // await this.sendGeofenceNotification(event);
  }

  // Location History (Analytics)

  /**
   * Save location to history
   */
  static async saveLocationHistory(
    driverId: string,
    coordinates: [number, number],
    speed: number,
    heading: number,
  ): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await DriverLocationHistoryModel.findOneAndUpdate(
      {
        driverId: new Types.ObjectId(driverId),
        date: today,
      },
      {
        $push: {
          locations: {
            location: {
              type: 'Point',
              coordinates,
            },
            timestamp: new Date(),
            speed,
            heading,
          },
        },
        $inc: {
          'summary.totalDistance': 1, // Will be calculated separately
        },
      },
      { upsert: true },
    );
  }

  /**
   * Get driver daily summary
   */
  static async getDriverDailySummary(driverId: string, date: Date): Promise<any> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const history = await DriverLocationHistoryModel.findOne({
      driverId: new Types.ObjectId(driverId),
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    return (
      history?.summary || {
        totalDistance: 0,
        activeHours: 0,
        averageSpeed: 0,
        maxSpeed: 0,
      }
    );
  }

  // Helper Methods

  static async getDriverOrderIds(driverId: string): Promise<Types.ObjectId[]> {
    const orders = await OrderModel.find({
      driverId: new Types.ObjectId(driverId),
      status: {
        $in: [
          OrderStatus.DRIVER_ASSIGNED,
          OrderStatus.DRIVER_ARRIVING,
          OrderStatus.PICKED_UP,
          OrderStatus.ON_THE_WAY,
          OrderStatus.NEAR_DESTINATION,
        ],
      },
    }).select('_id');

    return orders.map((order) => order._id);
  }

  static calculateDistance(coord1: [number, number], coord2: [number, number]): number {
    const R = 6371000; // Earth's radius in meters
    const lat1 = (coord1[1] * Math.PI) / 180;
    const lat2 = (coord2[1] * Math.PI) / 180;
    const dLat = ((coord2[1] - coord1[1]) * Math.PI) / 180;
    const dLon = ((coord2[0] - coord1[0]) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private static determineTrackingStatus(
    order: any,
    distanceToDestination: number,
  ): 'PENDING' | 'ACTIVE' | 'NEAR_PICKUP' | 'NEAR_DELIVERY' | 'COMPLETED' {
    if (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.COD_COLLECTED) {
      return 'COMPLETED';
    }

    if (order.status === OrderStatus.WAITING_FOR_DRIVER) {
      return 'PENDING';
    }

    if (distanceToDestination < 100) {
      // 100 meters
      return 'NEAR_DELIVERY';
    }

    if (order.status === OrderStatus.DRIVER_ARRIVING) {
      return 'NEAR_PICKUP';
    }

    return 'ACTIVE';
  }

  private static toTrackingResponse(location: any): ITrackingResponse {
    return {
      driverId: location.driverId.toString(),
      driverName: location.driverName,
      phone: location.phone,
      location: {
        coordinates: location.location.coordinates,
        timestamp: location.timestamp,
      },
      isOnline: location.isOnline,
      speed: location.speed || 0,
      heading: location.heading || 0,
    };
  }
}
