import { OrderModel } from '../model.js';
import { OrderStatus } from '@/types/enums.js';
import { DispatchStatus } from '@/modules/dispatch/types.js'; 
import { DispatchRequestModel } from '@/modules/dispatch/model.js';

export class DispatchStatusService {
  
  /**
   * Get dispatch status for an order
   */
  static async getDispatchStatus(orderId: string): Promise<{
    orderStatus: OrderStatus;
    dispatchStatus: string | null;
    assignedDriver: string | null;
    estimatedEarnings: number | null;
    expiresAt: Date | null;
    notifiedDrivers: number;
    rejectedDrivers: number;
    searchRadius: number | null;
    attemptCount: number | null;
  }> {
    const [order, dispatchRequest] = await Promise.all([
      OrderModel.findById(orderId),
      DispatchRequestModel.findOne({
        orderId: orderId,
        // 🌟 Replaced raw string array with valid Enum values
        status: { 
          $in: [
            DispatchStatus.PENDING, 
            DispatchStatus.SEARCHING, 
            DispatchStatus.ASSIGNED, 
            DispatchStatus.ACCEPTED
          ] 
        },
      }).sort({ createdAt: -1 }),
    ]);

    if (!order) {
      throw new Error('Order not found');
    }

    return {
      orderStatus: order.status,
      dispatchStatus: dispatchRequest?.status || null,
      assignedDriver: dispatchRequest?.assignedDriverId 
        ? dispatchRequest.assignedDriverId.toString() 
        : null,
      estimatedEarnings: dispatchRequest?.estimatedEarnings || null,
      expiresAt: dispatchRequest?.expiresAt || null,
      notifiedDrivers: dispatchRequest?.notifiedDrivers?.length || 0,
      rejectedDrivers: dispatchRequest?.rejectedDrivers?.length || 0,
      searchRadius: dispatchRequest?.searchRadius || null,
      attemptCount: dispatchRequest?.attemptCount || null,
    };
  }
  
  /**
   * Check if order is in dispatch process
   */
  static async isInDispatch(orderId: string): Promise<boolean> {
    const count = await DispatchRequestModel.countDocuments({
      orderId: orderId,
      // 🌟 Replaced raw string array with valid Enum values
      status: { 
        $in: [
          DispatchStatus.PENDING, 
          DispatchStatus.SEARCHING
        ] 
      },
    });
    return count > 0;
  }
  
  /**
   * Get all active dispatch requests for an order
   */
  static async getActiveDispatchRequests(orderId: string): Promise<any[]> {
    return DispatchRequestModel.find({
      orderId: orderId,
      // 🌟 Replaced raw string array with valid Enum values
      status: { 
        $in: [
          DispatchStatus.PENDING, 
          DispatchStatus.SEARCHING, 
          DispatchStatus.ASSIGNED, 
          DispatchStatus.ACCEPTED
        ] 
      },
    }).sort({ createdAt: -1 }).lean();
  }
}