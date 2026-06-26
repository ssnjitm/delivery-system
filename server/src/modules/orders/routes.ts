import { Router, Request, Response } from 'express';
import { authenticateToken, AppError } from '@/middlewares/auth.js';
import { UserRole } from '@/types/enums.js';
import { OrdersController } from './controller.js';
import { validateBody } from '@/middlewares/validation.js';
import { registry } from '@/utils/swagger.js';
import { z } from 'zod';
import { requireRole } from '@/middlewares/role-guard.middleware.js';
import { DispatchStatusService } from './integration/dispatch-status.service.js';
import { OrdersService } from './service.js';

const orderRoutes = Router();

// Create Order Schemas
const CreateOrderSchema = z.object({
  vendorId: z.string().optional(),
  customerId: z.string().optional(),
  customerName: z.string().min(2),
  customerPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  pickupAddress: z.object({
    street: z.string(),
    area: z.string(),
    city: z.string(),
    landmark: z.string().optional(),
    coordinates: z.array(z.number()).length(2),
  }),
  deliveryAddress: z.object({
    street: z.string(),
    area: z.string(),
    city: z.string(),
    landmark: z.string().optional(),
    coordinates: z.array(z.number()).length(2),
  }),
  packageType: z.enum(['STANDARD', 'DOCUMENT', 'PERISHABLE', 'FRAGILE', 'PHARMACY']),
  packageDescription: z.string().optional(),
  packageWeight: z.number().optional(),
  items: z.array(z.object({
    name: z.string(),
    quantity: z.number().positive(),
    price: z.number().positive(),
    notes: z.string().optional(),
  })),
  isCOD: z.boolean(),
  codAmount: z.number().optional(),
  customerNotes: z.string().optional(),
  specialInstructions: z.string().optional(),
});

const UpdateStatusSchema = z.object({
  status: z.enum([
    'WAITING_FOR_DRIVER',
    'DRIVER_ASSIGNED',
    'DRIVER_ARRIVING',
    'PICKED_UP',
    'ON_THE_WAY',
    'NEAR_DESTINATION',
    'DELIVERED',
    'COD_COLLECTED',
    'CANCELLED',
  ]),
  note: z.string().optional(),
  coordinates: z.array(z.number()).length(2).optional(),
});

const AssignDriverSchema = z.object({
  driverId: z.string(),
});

const CancelOrderSchema = z.object({
  reason: z.string().min(5),
});

// Routes

// Order Creation
orderRoutes.post(
  '/',
  authenticateToken,
  validateBody(CreateOrderSchema),
  OrdersController.createOrder
);

// Order Retrieval
orderRoutes.get(
  '/my',
  authenticateToken,
  OrdersController.getMyOrders
);

orderRoutes.get(
  '/:id',
  authenticateToken,
  OrdersController.getOrder
);

orderRoutes.get(
  '/order-id/:orderId',
  authenticateToken,
  OrdersController.getOrderByOrderId
);

// 🆕 Dispatch Status Endpoint
orderRoutes.get(
  '/:id/dispatch-status',
  authenticateToken,
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }
    
    const { id } = req.params;
    
    // Check if user has access to this order
    const order = await OrdersService.getOrderById(id);
    
    const isVendor = req.user.role === UserRole.VENDOR && 
                     order.vendorId === req.user.userId;
    const isDriver = req.user.role === UserRole.DRIVER && 
                     order.driverId === req.user.userId;
    const isCustomer = (req.user.role === UserRole.CUSTOMER || req.user.role === UserRole.NORMAL_USER) && 
                       order.customerId === req.user.userId;
    const isAdmin = req.user.role === UserRole.ADMIN;
    const isDispatch = req.user.role === UserRole.DISPATCH;
    
    if (!isVendor && !isDriver && !isCustomer && !isAdmin && !isDispatch) {
      throw new AppError(403, 'You do not have access to this order.');
    }
    
    const status = await DispatchStatusService.getDispatchStatus(id);
    
    res.status(200).json({
      success: true,
      data: status,
    });
  }
);

// Order Status Management
orderRoutes.patch(
  '/:id/status',
  authenticateToken,
  validateBody(UpdateStatusSchema),
  OrdersController.updateOrderStatus
);

orderRoutes.post(
  '/:id/assign-driver',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  validateBody(AssignDriverSchema),
  OrdersController.assignDriver
);

orderRoutes.post(
  '/:id/collect-cod',
  authenticateToken,
  requireRole(UserRole.DRIVER),
  OrdersController.collectCOD
);

orderRoutes.post(
  '/:id/cancel',
  authenticateToken,
  validateBody(CancelOrderSchema),
  OrdersController.cancelOrder
);

// Order Statistics
orderRoutes.get(
  '/stats',
  authenticateToken,
  OrdersController.getOrderStats
);

// Admin Routes
orderRoutes.get(
  '/admin/all',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  OrdersController.getAllOrders
);

// OpenAPI Registration
registry.registerPath({
  method: 'post',
  path: '/orders',
  tags: ['Orders'],
  summary: 'Create a new order',
  description: 'Create a delivery order from vendor or normal user - automatically triggers dispatch',
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateOrderSchema,
        },
      },
    },
  },
  responses: {
    201: { description: 'Order created successfully - dispatch triggered' },
    400: { description: 'Invalid input' },
    401: { description: 'Unauthorized' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/orders/my',
  tags: ['Orders'],
  summary: 'Get my orders',
  description: 'Get orders for the authenticated user based on role',
  security: [{ BearerAuth: [] }],
  parameters: [
    { name: 'status', in: 'query', schema: { type: 'string' } },
    { name: 'page', in: 'query', schema: { type: 'integer' } },
    { name: 'limit', in: 'query', schema: { type: 'integer' } },
  ],
  responses: {
    200: { description: 'Orders retrieved' },
    401: { description: 'Unauthorized' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/orders/{id}/dispatch-status',
  tags: ['Orders', 'Dispatch'],
  summary: 'Get dispatch status for an order',
  description: 'Get the current dispatch status including driver search progress',
  security: [{ BearerAuth: [] }],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
  responses: {
    200: { description: 'Dispatch status retrieved' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/orders/{id}/status',
  tags: ['Orders'],
  summary: 'Update order status',
  description: 'Update the status of an order (driver or admin)',
  security: [{ BearerAuth: [] }],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: UpdateStatusSchema,
        },
      },
    },
  },
  responses: {
    200: { description: 'Status updated' },
    400: { description: 'Invalid transition' },
    401: { description: 'Unauthorized' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/orders/{id}/assign-driver',
  tags: ['Orders'],
  summary: 'Assign driver to order (Admin only)',
  security: [{ BearerAuth: [] }],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: AssignDriverSchema,
        },
      },
    },
  },
  responses: {
    200: { description: 'Driver assigned' },
    403: { description: 'Forbidden - Admin only' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/orders/{id}/collect-cod',
  tags: ['Orders'],
  summary: 'Collect COD payment (Driver only)',
  security: [{ BearerAuth: [] }],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
  responses: {
    200: { description: 'COD collected' },
    403: { description: 'Forbidden - Driver only' },
  },
});

export default orderRoutes;