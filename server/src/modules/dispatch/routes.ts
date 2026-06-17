import { Router } from 'express';
import { authenticateToken } from '@/middlewares/auth.js';
import { requireRole } from '@/middlewares/role-guard.middleware.js';
import { UserRole } from '@/types/enums.js';
import { DispatchController } from './controller.js';
import { validateBody } from '@/middlewares/validation.js';
import { registry } from '@/utils/swagger.js';
import { z } from 'zod';

const dispatchRoutes = Router();

// Validation Schemas

const FindDriverSchema = z.object({
  orderId: z.string(),
  searchRadius: z.number().optional(),
});

const AcceptOrderSchema = z.object({
  dispatchRequestId: z.string(),
});

const RejectOrderSchema = z.object({
  reason: z.string().optional(),
});

const BatchSuggestionSchema = z.object({
  currentOrderId: z.string(),
  maxOrders: z.number().min(1).max(5).optional(),
  maxDetourDistance: z.number().optional(),
});

const UpdateConfigSchema = z.object({
  defaultSearchRadius: z.number().optional(),
  maxSearchRadius: z.number().optional(),
  maxDriversToNotify: z.number().optional(),
  driverResponseTimeout: z.number().optional(),
  maxRetryAttempts: z.number().optional(),
  batchMaxOrders: z.number().optional(),
  batchMaxDetourDistance: z.number().optional(),
});


// Routes

// Admin/Dispatch - Trigger driver search
dispatchRoutes.post(
  '/find-driver',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.DISPATCH),
  validateBody(FindDriverSchema),
  DispatchController.findDriver
);

// Driver - Accept/Reject order
dispatchRoutes.post(
  '/:dispatchRequestId/accept',
  authenticateToken,
  requireRole(UserRole.DRIVER),
  DispatchController.acceptOrder
);

dispatchRoutes.post(
  '/:dispatchRequestId/reject',
  authenticateToken,
  requireRole(UserRole.DRIVER),
  validateBody(RejectOrderSchema),
  DispatchController.rejectOrder
);

// Driver - Batch suggestions
dispatchRoutes.post(
  '/batch/suggest',
  authenticateToken,
  requireRole(UserRole.DRIVER),
  validateBody(BatchSuggestionSchema),
  DispatchController.suggestBatch
);

// Get dispatch status
dispatchRoutes.get(
  '/:orderId/status',
  authenticateToken,
  DispatchController.getDispatchStatus
);

// Admin - Queue management
dispatchRoutes.post(
  '/admin/process-queue',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  DispatchController.processQueue
);

// Admin - Configuration
dispatchRoutes.get(
  '/admin/config',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  DispatchController.getDispatchConfig
);

dispatchRoutes.put(
  '/admin/config',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  validateBody(UpdateConfigSchema),
  DispatchController.updateDispatchConfig
);

// OpenAPI Registration

registry.registerPath({
  method: 'post',
  path: '/dispatch/find-driver',
  tags: ['Dispatch'],
  summary: 'Find and assign driver to order',
  description: 'Trigger dispatch engine to find a driver for an order',
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: FindDriverSchema,
        },
      },
    },
  },
  responses: {
    200: { description: 'Driver search initiated' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden - Admin only' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/dispatch/{dispatchRequestId}/accept',
  tags: ['Dispatch'],
  summary: 'Accept order (Driver)',
  description: 'Driver accepts a dispatch request',
  security: [{ BearerAuth: [] }],
  parameters: [{ name: 'dispatchRequestId', in: 'path', required: true, schema: { type: 'string' } }],
  responses: {
    200: { description: 'Order accepted' },
    400: { description: 'Invalid request' },
    403: { description: 'Forbidden - Driver only' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/dispatch/{dispatchRequestId}/reject',
  tags: ['Dispatch'],
  summary: 'Reject order (Driver)',
  description: 'Driver rejects a dispatch request',
  security: [{ BearerAuth: [] }],
  parameters: [{ name: 'dispatchRequestId', in: 'path', required: true, schema: { type: 'string' } }],
  responses: {
    200: { description: 'Order rejected' },
    403: { description: 'Forbidden - Driver only' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/dispatch/batch/suggest',
  tags: ['Dispatch'],
  summary: 'Get batch suggestions (Driver)',
  description: 'Get suggestions for batching orders together',
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: BatchSuggestionSchema,
        },
      },
    },
  },
  responses: {
    200: { description: 'Batch suggestions' },
    403: { description: 'Forbidden - Driver only' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/dispatch/{orderId}/status',
  tags: ['Dispatch'],
  summary: 'Get dispatch status',
  description: 'Get current dispatch status for an order',
  security: [{ BearerAuth: [] }],
  parameters: [{ name: 'orderId', in: 'path', required: true, schema: { type: 'string' } }],
  responses: {
    200: { description: 'Dispatch status' },
    401: { description: 'Unauthorized' },
  },
});

export default dispatchRoutes;