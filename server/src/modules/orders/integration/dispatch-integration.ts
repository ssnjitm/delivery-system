import { OrderModel } from '../model.js';
import { OrderStatus } from '@/types/enums.js';
import { Types } from 'mongoose';

/**
 * Handle dispatch events from the Dispatch module
 * This is called by the Dispatch module when drivers accept/reject orders
 */
export class DispatchIntegration {
  
  /**
   * Called when a driver accepts an order through dispatch
   */
  static async handleDriverAccepted(orderId: string, driverId: string): Promise<void> {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // Update order with driver
    const { DriverModel } = await import('../../users/model.js');
    const driver = await DriverModel.findById(driverId);
    
    if (driver) {
      order.driverId = new Types.ObjectId(driverId);
      order.driverName = driver.fullName;
      order.status = OrderStatus.DRIVER_ASSIGNED;
      order.assignedAt = new Date();
      order.statusHistory.push({
        status: OrderStatus.DRIVER_ASSIGNED,
        timestamp: new Date(),
        note: `Driver ${driver.fullName} accepted through dispatch`,
        updatedBy: new Types.ObjectId(driverId),
      });
      
      await order.save();
      console.log(`✅ Order ${order.orderId} assigned to driver ${driver.fullName} via dispatch`);
    }
  }
  
  /**
   * Called when a driver rejects an order through dispatch
   */
  static async handleDriverRejected(orderId: string, driverId: string, reason?: string): Promise<void> {
    // Just log for now - dispatch will find another driver
    console.log(`⚠️ Driver ${driverId} rejected order ${orderId}: ${reason || 'No reason provided'}`);
    
    // Could track rejection metrics for driver performance
    // await DriverRejectionModel.create({ orderId, driverId, reason });
  }
  
  /**
   * Called when dispatch fails to find a driver
   */
  static async handleDispatchFailed(orderId: string, reason: string): Promise<void> {
    console.log(`❌ Dispatch failed for order ${orderId}: ${reason}`);
    
    // Could send notification to admin or vendor
    // await NotificationService.notifyVendorNoDriver(orderId);
    // await NotificationService.notifyAdminDispatchFailed(orderId, reason);
  }
  
  /**
   * Called when dispatch expires (no driver found within timeout)
   */
  static async handleDispatchExpired(orderId: string): Promise<void> {
    console.log(`⏰ Dispatch expired for order ${orderId}`);
    
    // Could add to retry queue or notify vendor
    // await NotificationService.notifyVendorDispatchExpired(orderId);
  }
  
  /**
   * Called when a driver is assigned to an order (manual or automatic)
   */
  static async handleDriverAssigned(orderId: string, driverId: string): Promise<void> {
    console.log(`👤 Driver ${driverId} assigned to order ${orderId}`);
    // Could send notifications
  }
}