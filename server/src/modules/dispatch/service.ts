import { Types, HydratedDocument } from 'mongoose';
import { AppError } from '@/middlewares/auth.js';
import { OrderStatus, UserRole } from '@/types/enums.js';
import { DriverModel } from '../users/model.js';
import { OrderModel } from '../orders/model.js';
import {
  DispatchRequestModel,
  BatchGroupModel,
  DispatchQueueModel,
} from './model.js';
import {
  IDispatchRequest,
  IDriverMatch,
  IBatchGroup,
  IFindDriverPayload,
  IAcceptOrderPayload,
  IRejectOrderPayload,
  IBatchSuggestionPayload,
  IDispatchResponse,
  IDriverMatchResponse,
  DispatchStatus,
  DEFAULT_DISPATCH_CONFIG,
  IDispatchConfig,
} from './types.js';

export class DispatchService {
  private static config: IDispatchConfig = DEFAULT_DISPATCH_CONFIG;

  // Configuration Management

  static setConfig(config: Partial<IDispatchConfig>): void {
    this.config = { ...this.config, ...config };
  }

  static getConfig(): IDispatchConfig {
    return { ...this.config };
  }

  // Find & Assign Driver

  static async findDriverForOrder(payload: IFindDriverPayload): Promise<IDispatchResponse> {
    const { orderId, searchRadius = this.config.defaultSearchRadius } = payload;

    // Get order details
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new AppError(404, 'Order not found.');
    }

    if (order.status !== OrderStatus.WAITING_FOR_DRIVER) {
      throw new AppError(400, `Order is not waiting for driver (status: ${order.status})`);
    }

    // Check if dispatch request already exists
    const existingRequest = await DispatchRequestModel.findOne({
      orderId: new Types.ObjectId(orderId),
      status: { $in: [DispatchStatus.PENDING, DispatchStatus.SEARCHING, DispatchStatus.ASSIGNED] },
    });

    if (existingRequest) {
      return this.toDispatchResponse(existingRequest);
    }

    // Find nearby drivers
    const pickupCoords = order.pickupAddress.coordinates.coordinates;
    const nearbyDrivers = await this.findNearbyDrivers(pickupCoords, searchRadius);

    if (nearbyDrivers.length === 0) {
      // Queue for retry
      await this.queueForRetry(orderId, 'No drivers found nearby');
      throw new AppError(404, 'No drivers available nearby. Order queued for retry.');
    }

    // Calculate match scores
    const matchedDrivers = await this.calculateMatchScores(nearbyDrivers, order);

    // Create dispatch request
    const dispatchRequest = await this.createDispatchRequest(order, matchedDrivers);

    // Notify drivers (async)
    await this.notifyDrivers(dispatchRequest, matchedDrivers);

    return this.toDispatchResponse(dispatchRequest);
  }

  static async findNearbyDrivers(
    coordinates: [number, number],
    radius: number
  ): Promise<IDriverMatch[]> {
    const drivers = await DriverModel.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: coordinates,
          },
          distanceField: 'distance',
          maxDistance: radius,
          spherical: true,
        },
      },
      {
        $match: {
          isOnline: true,
          isActive: true,
          isVerified: true,
        },
      },
      {
        $project: {
          _id: 1,
          fullName: 1,
          phone: 1,
          rating: 1,
          totalDeliveries: 1,
          distance: 1,
          currentLocation: 1,
          lastLocationUpdate: 1,
        },
      },
      {
        $limit: this.config.maxDriversToNotify * 2,
      },
    ]);

    return drivers.map((driver) => ({
      driverId: driver._id,
      driverName: driver.fullName,
      phone: driver.phone,
      rating: driver.rating || 0,
      totalDeliveries: driver.totalDeliveries || 0,
      distance: driver.distance,
      estimatedArrivalTime: Math.ceil(driver.distance / 200), // Rough estimate: 200m/min
      currentLocation: {
        coordinates: driver.currentLocation.coordinates,
        lastUpdate: driver.lastLocationUpdate || new Date(),
      },
      score: 0, // Will be calculated
    }));
  }

  static async calculateMatchScores(
    drivers: IDriverMatch[],
    order: any
  ): Promise<IDriverMatch[]> {
    const weights = this.config.scoringWeights;

    // Find max values for normalization
    const maxDistance = Math.max(...drivers.map((d) => d.distance), 1);
    const maxRating = 5;
    const maxDeliveries = Math.max(...drivers.map((d) => d.totalDeliveries), 1);

    return drivers.map((driver) => {
      // Normalize scores (0-1)
      const distanceScore = 1 - (driver.distance / maxDistance);
      const ratingScore = driver.rating / maxRating;
      const historyScore = Math.min(driver.totalDeliveries / maxDeliveries, 1);
      const availabilityScore = driver.currentLocation.lastUpdate
        ? Math.min(1, (Date.now() - driver.currentLocation.lastUpdate.getTime()) / (5 * 60 * 1000))
        : 0.5;

      // Calculate weighted score
      const score =
        distanceScore * weights.distance +
        ratingScore * weights.rating +
        historyScore * weights.deliveryHistory +
        availabilityScore * weights.availability;

      return {
        ...driver,
        score: Math.round(score * 100) / 100,
      };
    });
  }

  // Changed return type from Promise<IDispatchRequest> to Mongoose's HydratedDocument wrapper
  static async createDispatchRequest(
    order: any,
    matchedDrivers: IDriverMatch[]
  ): Promise<HydratedDocument<IDispatchRequest>> {
    const dispatchRequest = new DispatchRequestModel({
      orderId: order._id,
      orderIdDisplay: order.orderId,
      vendorId: order.vendorId,
      vendorName: order.vendorName,
      pickupLocation: {
        coordinates: order.pickupAddress.coordinates.coordinates,
        address: `${order.pickupAddress.street}, ${order.pickupAddress.area}`,
      },
      deliveryLocation: {
        coordinates: order.deliveryAddress.coordinates.coordinates,
        address: `${order.deliveryAddress.street}, ${order.deliveryAddress.area}`,
      },
      packageType: order.packageType,
      codAmount: order.codAmount || 0,
      estimatedEarnings: Math.max(order.deliveryFee * 0.7, 50), // 70% to driver
      status: DispatchStatus.SEARCHING,
      searchRadius: this.config.defaultSearchRadius,
      maxAttempts: this.config.maxRetryAttempts,
      attemptCount: 1,
      expiresAt: new Date(Date.now() + this.config.driverResponseTimeout * 1000),
      notifiedDrivers: matchedDrivers.map((d) => d.driverId),
    });

    await dispatchRequest.save();
    return dispatchRequest;
  }

  // ============================================
  // Driver Response Handling
  // ============================================

  static async acceptOrder(payload: IAcceptOrderPayload): Promise<IDispatchResponse> {
    const { dispatchRequestId, driverId } = payload;

    const dispatchRequest = await DispatchRequestModel.findById(dispatchRequestId);
    if (!dispatchRequest) {
      throw new AppError(404, 'Dispatch request not found.');
    }

    if (dispatchRequest.status !== DispatchStatus.SEARCHING) {
      throw new AppError(400, `Cannot accept order with status: ${dispatchRequest.status}`);
    }

    if (dispatchRequest.expiresAt < new Date()) {
      dispatchRequest.status = DispatchStatus.EXPIRED;
      await dispatchRequest.save();
      throw new AppError(400, 'This dispatch request has expired.');
    }

    // Check if driver was notified
    const driverIdObj = new Types.ObjectId(driverId);
    if (!dispatchRequest.notifiedDrivers.some((id) => id.equals(driverIdObj))) {
      throw new AppError(403, 'You were not notified for this order.');
    }

    // Check if driver already rejected
    if (dispatchRequest.rejectedDrivers.some((id) => id.equals(driverIdObj))) {
      throw new AppError(403, 'You have already rejected this order.');
    }

    // Assign driver
    dispatchRequest.status = DispatchStatus.ACCEPTED;
    dispatchRequest.assignedDriverId = driverIdObj;
    dispatchRequest.assignedAt = new Date();
    dispatchRequest.acceptedAt = new Date();
    await dispatchRequest.save();

    // Update order
    const order = await OrderModel.findById(dispatchRequest.orderId);
    if (order) {
      await OrdersService.assignDriver(order._id.toString(), driverId);
    }

    // Clean up other dispatch requests for this order
    await DispatchRequestModel.updateMany(
      {
        orderId: dispatchRequest.orderId,
        _id: { $ne: dispatchRequest._id },
        status: DispatchStatus.SEARCHING,
      },
      { status: DispatchStatus.CANCELLED }
    );

    // Remove from queue
    await DispatchQueueModel.deleteOne({ orderId: dispatchRequest.orderId });

    return this.toDispatchResponse(dispatchRequest);
  }

  static async rejectOrder(payload: IRejectOrderPayload): Promise<void> {
    const { dispatchRequestId, driverId, reason } = payload;

    const dispatchRequest = await DispatchRequestModel.findById(dispatchRequestId);
    if (!dispatchRequest) {
      throw new AppError(404, 'Dispatch request not found.');
    }

    if (dispatchRequest.status !== DispatchStatus.SEARCHING) {
      throw new AppError(400, `Cannot reject order with status: ${dispatchRequest.status}`);
    }

    const driverIdObj = new Types.ObjectId(driverId);
    if (!dispatchRequest.rejectedDrivers.some((id) => id.equals(driverIdObj))) {
      dispatchRequest.rejectedDrivers.push(driverIdObj);
    }

    await dispatchRequest.save();

    // Check if we need to notify more drivers
    await this.findMoreDrivers(dispatchRequest);
  }

  // Changed argument type from pure IDispatchRequest to HydratedDocument<IDispatchRequest>
  static async findMoreDrivers(dispatchRequest: HydratedDocument<IDispatchRequest>): Promise<void> {
    const rejectedCount = dispatchRequest.rejectedDrivers.length;
    const notifiedCount = dispatchRequest.notifiedDrivers.length;

    // If all notified drivers rejected, try to find more
    if (rejectedCount >= notifiedCount) {
      dispatchRequest.attemptCount += 1;

      if (dispatchRequest.attemptCount >= dispatchRequest.maxAttempts) {
        dispatchRequest.status = DispatchStatus.EXPIRED;
        await dispatchRequest.save();

        // Queue for retry
        await this.queueForRetry(
          dispatchRequest.orderId.toString(),
          'All drivers rejected the order'
        );
        return;
      }

      // Increase search radius
      const newRadius = Math.min(
        dispatchRequest.searchRadius * 1.5,
        this.config.maxSearchRadius
      );
      dispatchRequest.searchRadius = newRadius;

      // Find more drivers
      const pickupCoords = dispatchRequest.pickupLocation.coordinates;
      const order = await OrderModel.findById(dispatchRequest.orderId);
      const moreDrivers = await this.findNearbyDrivers(pickupCoords, newRadius);

      // Filter out already notified drivers
      const notifiedIds = new Set(
        dispatchRequest.notifiedDrivers.map((id) => id.toString())
      );
      const newDrivers = moreDrivers.filter(
        (d) => !notifiedIds.has(d.driverId.toString())
      );

      if (newDrivers.length === 0) {
        dispatchRequest.status = DispatchStatus.EXPIRED;
        await dispatchRequest.save();
        await this.queueForRetry(
          dispatchRequest.orderId.toString(),
          'No additional drivers found'
        );
        return;
      }

      // Calculate scores and notify
      const scoredDrivers = await this.calculateMatchScores(newDrivers, order);
      dispatchRequest.notifiedDrivers.push(
        ...scoredDrivers.map((d) => d.driverId)
      );
      dispatchRequest.expiresAt = new Date(
        Date.now() + this.config.driverResponseTimeout * 1000
      );
      await dispatchRequest.save();

      await this.notifyDrivers(dispatchRequest, scoredDrivers);
    }
  }

  // Batch Optimization

  static async suggestBatch(payload: IBatchSuggestionPayload): Promise<IBatchGroup | null> {
    const { driverId, currentOrderId, maxOrders = this.config.batchMaxOrders, maxDetourDistance = this.config.batchMaxDetourDistance } = payload;

    // Get current order
    const currentOrder = await OrderModel.findById(currentOrderId);
    if (!currentOrder) {
      throw new AppError(404, 'Order not found.');
    }

    // Find batchable orders
    const batchableOrders = await OrderModel.find({
      _id: { $ne: new Types.ObjectId(currentOrderId) },
      status: OrderStatus.WAITING_FOR_DRIVER,
      'pickupAddress.coordinates': {
        $near: {
          $geometry: currentOrder.pickupAddress.coordinates,
          $maxDistance: maxDetourDistance,
        },
      },
    })
      .limit(maxOrders - 1)
      .lean();

    if (batchableOrders.length === 0) {
      return null;
    }

    // Create batch group
    const allOrders = [currentOrder, ...batchableOrders];
    const waypoints = this.optimizeRoute(allOrders);

    const batchGroup = new BatchGroupModel({
      driverId: new Types.ObjectId(driverId),
      orderIds: allOrders.map((o) => o._id),
      orderIdsDisplay: allOrders.map((o) => o.orderId),
      route: waypoints,
      status: 'PENDING',
    });

    await batchGroup.save();

    // Update queue entries
    for (const order of allOrders) {
      await DispatchQueueModel.findOneAndUpdate(
        { orderId: order._id },
        { batchGroupId: batchGroup._id, batchable: true }
      );
    }

    return batchGroup;
  }

  static optimizeRoute(orders: any[]): {
    waypoints: any[];
    totalDistance: number;
    estimatedDuration: number;
  } {
    // Simple route optimization using nearest neighbor
    const waypoints = [];
    const visited = new Set();

    // Start with first order's pickup
    let currentLocation = orders[0].pickupAddress.coordinates.coordinates;
    waypoints.push({
      orderId: orders[0]._id,
      type: 'PICKUP',
      location: {
        coordinates: currentLocation,
        address: `${orders[0].pickupAddress.street}, ${orders[0].pickupAddress.area}`,
      },
      sequence: 0,
    });

    visited.add(orders[0]._id.toString());

    // For each order, alternate pickup and delivery
    let sequence = 1;
    let totalDistance = 0;

    // Process remaining orders
    while (visited.size < orders.length * 2) {
      let nearest = null;
      let nearestDist = Infinity;

      for (const order of orders) {
        const orderId = order._id.toString();

        // Check pickup if not visited
        if (!visited.has(`${orderId}-pickup`)) {
          const dist = this.calculateDistance(
            currentLocation,
            order.pickupAddress.coordinates.coordinates
          );
          if (dist < nearestDist) {
            nearest = { order, type: 'PICKUP', id: `${orderId}-pickup` };
            nearestDist = dist;
          }
        }

        // Check delivery if not visited
        if (!visited.has(`${orderId}-delivery`)) {
          const dist = this.calculateDistance(
            currentLocation,
            order.deliveryAddress.coordinates.coordinates
          );
          if (dist < nearestDist) {
            nearest = { order, type: 'DELIVERY', id: `${orderId}-delivery` };
            nearestDist = dist;
          }
        }
      }

      if (!nearest) break;

      const { order, type, id } = nearest;
      const location = type === 'PICKUP'
        ? order.pickupAddress.coordinates.coordinates
        : order.deliveryAddress.coordinates.coordinates;

      waypoints.push({
        orderId: order._id,
        type,
        location: {
          coordinates: location,
          address: type === 'PICKUP'
            ? `${order.pickupAddress.street}, ${order.pickupAddress.area}`
            : `${order.deliveryAddress.street}, ${order.deliveryAddress.area}`,
        },
        sequence,
      });

      totalDistance += nearestDist;
      currentLocation = location;
      visited.add(id);
      sequence++;
    }

    const estimatedDuration = Math.ceil(totalDistance / 200); // 200m/min average speed

    return {
      waypoints,
      totalDistance,
      estimatedDuration,
    };
  }

  static calculateDistance(
    coord1: [number, number],
    coord2: [number, number]
  ): number {
    const R = 6371000; // Earth's radius in meters
    const lat1 = coord1[1] * Math.PI / 180;
    const lat2 = coord2[1] * Math.PI / 180;
    const dLat = (coord2[1] - coord1[1]) * Math.PI / 180;
    const dLon = (coord2[0] - coord1[0]) * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  // ============================================
  // Queue Management
  // ============================================

  static async queueForRetry(orderId: string, errorMessage: string): Promise<void> {
    await DispatchQueueModel.findOneAndUpdate(
      { orderId: new Types.ObjectId(orderId) },
      {
        $inc: { retryCount: 1 },
        status: 'QUEUED',
        errorMessage,
        nextRetryAt: new Date(Date.now() + this.getRetryDelay(1)),
      },
      { upsert: true }
    );
  }

  static getRetryDelay(retryCount: number): number {
    // Exponential backoff: 1min, 5min, 15min
    const delays = [60000, 300000, 900000];
    return delays[Math.min(retryCount - 1, delays.length - 1)] || 900000;
  }

  static async processQueue(): Promise<void> {
    const queuedItems = await DispatchQueueModel.find({
      status: 'QUEUED',
      nextRetryAt: { $lte: new Date() },
    })
      .sort({ priority: -1, createdAt: 1 })
      .limit(10);

    for (const item of queuedItems) {
      try {
        // Try to find driver again
        await this.findDriverForOrder({
          orderId: item.orderId.toString(),
          searchRadius: Math.min(
            this.config.defaultSearchRadius * (1 + item.retryCount * 0.5),
            this.config.maxSearchRadius
          ),
        });

        item.status = 'COMPLETED';
        await item.save();
      } catch (error) {
        item.retryCount += 1;
        if (item.retryCount >= item.maxRetries) {
          item.status = 'FAILED';
          item.errorMessage = error instanceof Error ? error.message : 'Unknown error';
        } else {
          item.nextRetryAt = new Date(Date.now() + this.getRetryDelay(item.retryCount));
        }
        await item.save();
      }
    }
  }

  // Driver Notifications (Placeholder)

  static async notifyDrivers(
    dispatchRequest: IDispatchRequest,
    drivers: IDriverMatch[]
  ): Promise<void> {
    // TODO: Implement notifications
    // This will be implemented when Notifications module is ready
    console.log(`📢 Notifying ${drivers.length} drivers for order ${dispatchRequest.orderIdDisplay}`);

    for (const driver of drivers) {
      console.log(`  → Driver: ${driver.driverName} (${driver.driverId})`);
      console.log(`    Distance: ${Math.round(driver.distance)}m`);
      console.log(`    Score: ${driver.score}`);
    }
  }

  // Helper Methods

  private static toDispatchResponse(request: any): IDispatchResponse {
    return {
      id: request._id.toString(),
      orderId: request.orderIdDisplay,
      status: request.status,
      assignedDriver: request.assignedDriverId ? {
        id: request.assignedDriverId.toString(),
        name: '', // Would need to fetch driver name
      } : undefined,
      estimatedEarnings: request.estimatedEarnings,
      expiresAt: request.expiresAt,
      createdAt: request.createdAt,
    };
  }
}

// Import for OrdersService integration (circular dependency handled)
import { OrdersService } from '../orders/service.js';