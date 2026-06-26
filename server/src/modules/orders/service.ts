import { Types } from 'mongoose';
import { AppError } from '@/middlewares/auth.js';
import { OrderStatus, PackageType, UserRole } from '@/types/enums.js';
import { UserModel, VendorModel, DriverModel } from '../users/model.js';
import { OrderModel } from './model.js';
import {
  IOrder,
  ICreateOrderPayload,
  IOrderStatusUpdatePayload,
  IOrderResponse,
  IOrderFilters,
  IOrderStats,
} from './types.js';
import { DispatchService } from '../dispatch/service.js';
import { DispatchRequestModel } from '../dispatch/model.js';
import { DispatchStatus } from '../dispatch/types.js';
import { TrackingService } from '../tracking/service.js';
import { PricingService } from '../pricing/service.js';
import { IPriceRequest, IPriceResponse } from '../pricing/types.js';

export class OrdersService {
  // Order Creation
  static async createOrder(payload: ICreateOrderPayload): Promise<IOrderResponse> {
    const {
      source,
      vendorId,
      customerId,
      customerName,
      customerPhone,
      pickupAddress,
      deliveryAddress,
      packageType,
      packageDescription,
      packageWeight,
      items,
      isCOD,
      codAmount,
      customerNotes,
      specialInstructions,
    } = payload;

    // Validate vendor
    const vendor = await VendorModel.findById(vendorId);
    if (!vendor) {
      throw new AppError(404, 'Vendor not found.');
    }
    if (!vendor.isVerified) {
      throw new AppError(403, 'Vendor is not verified.');
    }
    if (!vendor.isActive) {
      throw new AppError(403, 'Vendor account is deactivated.');
    }

    // Validate customer (optional - can be new customer)
    if (customerId) {
      const customer = await UserModel.findById(customerId);
      if (!customer) {
        throw new AppError(404, 'Customer not found.');
      }
    }

    // Calculate price using PricingService
    const priceRequest: IPriceRequest = {
      pickupLocation: {
        coordinates: pickupAddress.coordinates,
        area: pickupAddress.area,
        city: pickupAddress.city,
      },
      deliveryLocation: {
        coordinates: deliveryAddress.coordinates,
        area: deliveryAddress.area,
        city: deliveryAddress.city,
      },
      packageType,
      packageWeight,
      isPeakHour: this.isPeakHour(),
      customerType: source === 'VENDOR' ? 'VENDOR' : 'CUSTOMER',
      specialHandling: this.hasSpecialHandling(items),
    };

    // Calculate price using PricingService
    const priceResult = await PricingService.calculatePrice(priceRequest);

    const {
      basePrice,
      distance,
      packageSurcharge,
      peakHourSurcharge,
      areaSurcharge,
      specialHandling,
      total: totalAmount,
    } = priceResult.breakdown;

    // Create order
    const orderData: Partial<IOrder> = {
      source,
      vendorId: new Types.ObjectId(vendorId),
      vendorName: vendor.businessName,
      customerId: customerId ? new Types.ObjectId(customerId) : new Types.ObjectId(),
      customerName,
      customerPhone,
      pickupAddress: {
        ...pickupAddress,
        coordinates: {
          type: 'Point',
          coordinates: pickupAddress.coordinates,
        },
      },
      deliveryAddress: {
        ...deliveryAddress,
        coordinates: {
          type: 'Point',
          coordinates: deliveryAddress.coordinates,
        },
      },
      packageType,
      packageDescription,
      packageWeight,
      items: items.map((item) => ({
        ...item,
        total: item.price * item.quantity,
      })),
      basePrice,
      distanceKm: distance.km,
      perKmRate: distance.perKmRate,
      deliveryFee: distance.amount,
      extraCharges: {
        peakHour: peakHourSurcharge.amount,
        packageType: packageSurcharge.amount,
        areaSurcharge: areaSurcharge.total,
        specialHandling: specialHandling,
      },
      totalAmount,
      isCOD,
      codAmount: isCOD ? codAmount || totalAmount : 0,
      status: OrderStatus.WAITING_FOR_DRIVER,
      customerNotes,
      specialInstructions,
      metadata: {
        createdBy: source === 'VENDOR' ? 'vendor' : 'normal_user',
        packageType,
        priceBreakdown: priceResult.breakdown,
        priceValidUntil: priceResult.validUntil,
      },
    };

    const order = new OrderModel(orderData);
    await order.save();

    // Store price history
    try {
      await PricingService.savePriceHistory(order._id.toString(), priceResult);
    } catch (error) {
      console.error('Failed to save price history:', error);
    }

    // Trigger Dispatch Engine
    try {
      await DispatchService.findDriverForOrder({
        orderId: order._id.toString(),
      });
      console.log(`✅ Dispatch triggered for order ${order.orderId}`);
    } catch (dispatchError) {
      console.error(`❌ Dispatch error for order ${order.orderId}:`, dispatchError);
    }

    return this.toOrderResponse(order);
  }

  // Order Retrieval
  static async getOrderById(orderId: string): Promise<IOrderResponse> {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new AppError(404, 'Order not found.');
    }
    return this.toOrderResponse(order);
  }

  static async getOrderByOrderId(orderId: string): Promise<IOrderResponse> {
    const order = await OrderModel.findOne({ orderId });
    if (!order) {
      throw new AppError(404, 'Order not found.');
    }
    return this.toOrderResponse(order);
  }

  static async getOrders(filters: IOrderFilters): Promise<{
    orders: IOrderResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      vendorId,
      customerId,
      driverId,
      status,
      source,
      isCOD,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const query: any = {};

    if (vendorId) query.vendorId = new Types.ObjectId(vendorId);
    if (customerId) query.customerId = new Types.ObjectId(customerId);
    if (driverId) query.driverId = new Types.ObjectId(driverId);
    if (status) query.status = status;
    if (source) query.source = source;
    if (isCOD !== undefined) query.isCOD = isCOD;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [orders, total] = await Promise.all([
      OrderModel.find(query).sort(sort).skip(skip).limit(limit).lean(),
      OrderModel.countDocuments(query),
    ]);

    return {
      orders: orders.map((order) => this.toOrderResponse(order)),
      total,
      page,
      limit,
    };
  }

  static async getVendorOrders(
    vendorId: string,
    filters: Omit<IOrderFilters, 'vendorId'>,
  ): Promise<{ orders: IOrderResponse[]; total: number; page: number; limit: number }> {
    return this.getOrders({ ...filters, vendorId });
  }

  static async getDriverOrders(
    driverId: string,
    filters: Omit<IOrderFilters, 'driverId'>,
  ): Promise<{ orders: IOrderResponse[]; total: number; page: number; limit: number }> {
    return this.getOrders({ ...filters, driverId });
  }

  static async getCustomerOrders(
    customerId: string,
    filters: Omit<IOrderFilters, 'customerId'>,
  ): Promise<{ orders: IOrderResponse[]; total: number; page: number; limit: number }> {
    return this.getOrders({ ...filters, customerId });
  }

  // Order Status Management
  static async updateOrderStatus(payload: IOrderStatusUpdatePayload): Promise<IOrderResponse> {
    const { orderId, status, note, coordinates } = payload;

    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new AppError(404, 'Order not found.');
    }

    // Validate status transition
    this.validateStatusTransition(order.status, status);

    // Update order
    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note,
    });

    // Update specific timestamps based on status
    switch (status) {
      case OrderStatus.DRIVER_ASSIGNED:
        order.assignedAt = new Date();
        break;
      case OrderStatus.PICKED_UP:
        order.pickedUpAt = new Date();
        break;
      case OrderStatus.DELIVERED:
        order.deliveredAt = new Date();
        order.actualDeliveryTime = new Date();
        break;
      case OrderStatus.COD_COLLECTED:
        order.codCollected = true;
        order.codCollectedAt = new Date();
        break;
    }

    await order.save();

    return this.toOrderResponse(order);
  }

  static async assignDriver(orderId: string, driverId: string): Promise<IOrderResponse> {
    const [order, driver] = await Promise.all([
      OrderModel.findById(orderId),
      DriverModel.findById(driverId),
    ]);

    if (!order) {
      throw new AppError(404, 'Order not found.');
    }

    if (!driver) {
      throw new AppError(404, 'Driver not found.');
    }

    if (!driver.isVerified || !driver.isActive) {
      throw new AppError(403, 'Driver is not available.');
    }

    if (order.status !== OrderStatus.WAITING_FOR_DRIVER) {
      throw new AppError(400, `Cannot assign driver to order with status: ${order.status}`);
    }

    order.driverId = new Types.ObjectId(driverId);
    order.driverName = driver.fullName;
    order.status = OrderStatus.DRIVER_ASSIGNED;
    order.assignedAt = new Date();
    order.statusHistory.push({
      status: OrderStatus.DRIVER_ASSIGNED,
      timestamp: new Date(),
      note: `Driver ${driver.fullName} assigned`,
      updatedBy: new Types.ObjectId(driverId),
    });

    await order.save();
    try {
      await TrackingService.createTrackingSession(orderId, driverId);
      await TrackingService.createGeofences(orderId);
    } catch (error) {
      console.error('Failed to create tracking session:', error);
    }

    // Clean up dispatch requests
    try {
      await DispatchRequestModel.updateMany(
        {
          orderId: order._id,
          status: { $in: [DispatchStatus.PENDING, DispatchStatus.SEARCHING] },
        },
        { status: DispatchStatus.ASSIGNED },
      );
      console.log(`✅ Dispatch requests marked as ASSIGNED for order ${order.orderId}`);
    } catch (error) {
      console.error('Failed to update dispatch status:', error);
    }

    return this.toOrderResponse(order);
  }

  static async collectCOD(orderId: string, driverId: string): Promise<IOrderResponse> {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new AppError(404, 'Order not found.');
    }

    if (!order.isCOD) {
      throw new AppError(400, 'This order is not a COD order.');
    }

    if (order.codCollected) {
      throw new AppError(400, 'COD has already been collected for this order.');
    }

    if (order.driverId?.toString() !== driverId) {
      throw new AppError(403, 'You are not assigned to this order.');
    }

    if (order.status !== OrderStatus.DELIVERED) {
      throw new AppError(400, `Cannot collect COD when order is in status: ${order.status}`);
    }

    order.codCollected = true;
    order.codCollectedAt = new Date();
    order.status = OrderStatus.COD_COLLECTED;
    order.statusHistory.push({
      status: OrderStatus.COD_COLLECTED,
      timestamp: new Date(),
      note: `COD of Rs. ${order.codAmount} collected`,
      updatedBy: new Types.ObjectId(driverId),
    });

    await order.save();

    return this.toOrderResponse(order);
  }

  // Order Cancellation
  static async cancelOrder(
    orderId: string,
    reason: string,
    cancelledBy: string,
  ): Promise<IOrderResponse> {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new AppError(404, 'Order not found.');
    }

    const cancellableStatuses = [
      OrderStatus.WAITING_FOR_DRIVER,
      OrderStatus.DRIVER_ASSIGNED,
      OrderStatus.DRIVER_ARRIVING,
    ];

    if (!cancellableStatuses.includes(order.status)) {
      throw new AppError(400, `Cannot cancel order in status: ${order.status}`);
    }

    order.status = OrderStatus.CANCELLED;
    order.statusHistory.push({
      status: OrderStatus.CANCELLED,
      timestamp: new Date(),
      note: `Cancelled: ${reason}`,
      updatedBy: new Types.ObjectId(cancelledBy),
    });

    await order.save();

    // Clean up dispatch requests
    try {
      await DispatchRequestModel.updateMany(
        {
          orderId: order._id,
          status: { $in: [DispatchStatus.PENDING, DispatchStatus.SEARCHING] },
        },
        { status: DispatchStatus.CANCELLED },
      );
      console.log(`✅ Dispatch requests cancelled for order ${order.orderId}`);
    } catch (error) {
      console.error('Failed to cancel dispatch requests:', error);
    }

    return this.toOrderResponse(order);
  }

  // Order Statistics
  static async getOrderStats(
    vendorId?: string,
    driverId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<IOrderStats> {
    const query: any = {};
    if (vendorId) query.vendorId = new Types.ObjectId(vendorId);
    if (driverId) query.driverId = new Types.ObjectId(driverId);
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalOrders,
      byStatus,
      todayOrders,
      weekOrders,
      monthOrders,
      revenueData,
      codData,
      deliveryTimes,
    ] = await Promise.all([
      OrderModel.countDocuments(query),
      OrderModel.aggregate([{ $match: query }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      OrderModel.countDocuments({ ...query, createdAt: { $gte: today } }),
      OrderModel.countDocuments({ ...query, createdAt: { $gte: weekAgo } }),
      OrderModel.countDocuments({ ...query, createdAt: { $gte: monthAgo } }),
      OrderModel.aggregate([
        {
          $match: { ...query, status: { $in: [OrderStatus.DELIVERED, OrderStatus.COD_COLLECTED] } },
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      OrderModel.aggregate([
        { $match: { ...query, isCOD: true, codCollected: true } },
        { $group: { _id: null, total: { $sum: '$codAmount' } } },
      ]),
      OrderModel.aggregate([
        {
          $match: {
            ...query,
            status: OrderStatus.DELIVERED,
            actualDeliveryTime: { $exists: true },
            assignedAt: { $exists: true },
          },
        },
        {
          $project: {
            deliveryTime: {
              $divide: [{ $subtract: ['$actualDeliveryTime', '$assignedAt'] }, 60000],
            },
          },
        },
        { $group: { _id: null, avg: { $avg: '$deliveryTime' } } },
      ]),
    ]);

    const statusMap: Record<OrderStatus, number> = {} as Record<OrderStatus, number>;
    Object.values(OrderStatus).forEach((status) => {
      statusMap[status] = 0;
    });
    byStatus.forEach((item: any) => {
      statusMap[item._id as OrderStatus] = item.count;
    });

    const totalRevenue = revenueData[0]?.total || 0;
    const pendingCOD = codData[0]?.total || 0;

    const completed = statusMap[OrderStatus.DELIVERED] + statusMap[OrderStatus.COD_COLLECTED];
    const cancelled = statusMap[OrderStatus.CANCELLED];
    const totalNonCancelled = totalOrders - cancelled;
    const completionRate = totalNonCancelled > 0 ? (completed / totalNonCancelled) * 100 : 0;

    return {
      totalOrders,
      byStatus: statusMap,
      todayOrders,
      weekOrders,
      monthOrders,
      totalRevenue,
      totalCODAmount: pendingCOD,
      pendingCOD,
      averageDeliveryTime: Math.round(deliveryTimes[0]?.avg || 0),
      completionRate: Math.round(completionRate * 100) / 100,
    };
  }

  // ============================================
  // PRICING INTEGRATION METHODS
  // ============================================

  /**
   * Check if current time is peak hour
   */
  private static isPeakHour(): boolean {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    // Weekends
    if (day === 0 || day === 6) {
      return true;
    }

    // Morning peak: 7-10 AM
    if (hour >= 7 && hour <= 10) {
      return true;
    }

    // Evening peak: 5-8 PM
    if (hour >= 17 && hour <= 20) {
      return true;
    }

    // Night: 10 PM - 6 AM
    if (hour >= 22 || hour <= 6) {
      return true;
    }

    return false;
  }

  /**
   * Check if order requires special handling
   */
  private static hasSpecialHandling(items: any[]): boolean {
    return items.some(item => 
      item.notes?.toLowerCase().includes('fragile') ||
      item.notes?.toLowerCase().includes('handle with care') ||
      item.notes?.toLowerCase().includes('special')
    );
  }

  /**
   * Recalculate price for existing order
   */
  static async recalculatePrice(orderId: string): Promise<IPriceResponse> {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new AppError(404, 'Order not found.');
    }

    const priceRequest: IPriceRequest = {
      pickupLocation: {
        coordinates: order.pickupAddress.coordinates.coordinates as [number, number],
        area: order.pickupAddress.area,
        city: order.pickupAddress.city,
      },
      deliveryLocation: {
        coordinates: order.deliveryAddress.coordinates.coordinates as [number, number],
        area: order.deliveryAddress.area,
        city: order.deliveryAddress.city,
      },
      packageType: order.packageType,
      packageWeight: order.packageWeight,
      isPeakHour: this.isPeakHour(),
      customerType: order.source === 'VENDOR' ? 'VENDOR' : 'CUSTOMER',
      specialHandling: this.hasSpecialHandling(order.items),
    };

    return await PricingService.calculatePrice(priceRequest);
  }

  /**
   * Update order with recalculated price
   */
  static async updateOrderPrice(orderId: string): Promise<IOrderResponse> {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new AppError(404, 'Order not found.');
    }

    // Only allow price recalculation for orders that haven't been picked up
    const allowedStatuses = [
      OrderStatus.WAITING_FOR_DRIVER,
      OrderStatus.DRIVER_ASSIGNED,
    ];

    if (!allowedStatuses.includes(order.status)) {
      throw new AppError(400, `Cannot recalculate price for order with status: ${order.status}`);
    }

    // Recalculate price
    const priceResult = await this.recalculatePrice(orderId);

    const { distance, packageSurcharge, peakHourSurcharge, areaSurcharge, specialHandling } = 
      priceResult.breakdown;

    // Update order with new pricing
    order.basePrice = priceResult.breakdown.basePrice;
    order.distanceKm = distance.km;
    order.perKmRate = distance.perKmRate;
    order.deliveryFee = distance.amount;
    order.extraCharges = {
      peakHour: peakHourSurcharge.amount,
      packageType: packageSurcharge.amount,
      areaSurcharge: areaSurcharge.total,
      specialHandling: specialHandling,
    };
    order.totalAmount = priceResult.total;
    
    if (order.isCOD) {
      order.codAmount = priceResult.total;
    }

    order.metadata = {
      ...order.metadata,
      priceBreakdown: priceResult.breakdown,
      priceValidUntil: priceResult.validUntil,
      priceRecalculatedAt: new Date(),
    };

    await order.save();

    // Save updated price history
    try {
      await PricingService.savePriceHistory(order._id.toString(), priceResult);
    } catch (error) {
      console.error('Failed to save price history:', error);
    }

    return this.toOrderResponse(order);
  }

  /**
   * Get price breakdown for an order
   */
  static async getOrderPriceBreakdown(orderId: string): Promise<{
    breakdown: any;
    total: number;
    calculatedAt: Date;
    validUntil: Date | null;
  }> {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new AppError(404, 'Order not found.');
    }

    // Type guard to check if metadata has priceBreakdown
    const hasPriceBreakdown = (
      metadata: any
    ): metadata is { priceBreakdown: any; priceValidUntil?: Date } => {
      return (
        metadata &&
        typeof metadata === 'object' &&
        'priceBreakdown' in metadata &&
        metadata.priceBreakdown !== null &&
        metadata.priceBreakdown !== undefined
      );
    };

    // Check if price breakdown exists in metadata
    if (hasPriceBreakdown(order.metadata)) {
      return {
        breakdown: order.metadata.priceBreakdown,
        total: order.totalAmount,
        calculatedAt: order.metadata.priceBreakdown?.calculatedAt || order.createdAt,
        validUntil: order.metadata.priceValidUntil || null,
      };
    }

    // If no breakdown stored, calculate it
    const priceResult = await this.recalculatePrice(orderId);
    return {
      breakdown: priceResult.breakdown,
      total: priceResult.total,
      calculatedAt: priceResult.calculatedAt,
      validUntil: priceResult.validUntil,
    };
  }

  // Helper Methods
  private static validateStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
  ): void {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.WAITING_FOR_DRIVER]: [OrderStatus.DRIVER_ASSIGNED, OrderStatus.CANCELLED],
      [OrderStatus.DRIVER_ASSIGNED]: [OrderStatus.DRIVER_ARRIVING, OrderStatus.CANCELLED],
      [OrderStatus.DRIVER_ARRIVING]: [OrderStatus.PICKED_UP, OrderStatus.CANCELLED],
      [OrderStatus.PICKED_UP]: [OrderStatus.ON_THE_WAY],
      [OrderStatus.ON_THE_WAY]: [OrderStatus.NEAR_DESTINATION],
      [OrderStatus.NEAR_DESTINATION]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [OrderStatus.COD_COLLECTED],
      [OrderStatus.COD_COLLECTED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    const allowed = transitions[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new AppError(400, `Invalid status transition from ${currentStatus} to ${newStatus}`);
    }
  }

  private static toOrderResponse(order: any): IOrderResponse {
    return {
      id: order.id || order._id.toString(),
      orderId: order.orderId,
      source: order.source,
      vendorId: order.vendorId?.toString() || order.vendorId,
      vendorName: order.vendorName,
      customerId: order.customerId?.toString() || order.customerId,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      driverId: order.driverId?.toString() || order.driverId,
      driverName: order.driverName,
      pickupAddress: order.pickupAddress,
      deliveryAddress: order.deliveryAddress,
      packageType: order.packageType,
      packageDescription: order.packageDescription,
      items: order.items,
      deliveryFee: order.deliveryFee,
      totalAmount: order.totalAmount,
      isCOD: order.isCOD,
      codAmount: order.codAmount,
      codCollected: order.codCollected || false,
      status: order.status,
      statusHistory: order.statusHistory.map((h: any) => ({
        status: h.status,
        timestamp: h.timestamp,
        note: h.note,
      })),
      trackingCode: order.trackingCode,
      estimatedDeliveryTime: order.estimatedDeliveryTime,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}