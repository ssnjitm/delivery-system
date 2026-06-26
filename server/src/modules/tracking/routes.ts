import { Router } from 'express';
import { authenticateToken } from '@/middlewares/auth.js';
import { requireRole } from '@/middlewares/role-guard.middleware.js';
import { UserRole } from '@/types/enums.js';
import { TrackingController } from './controller.js';
import { validateBody } from '@/middlewares/validation.js';
import { registry } from '@/utils/swagger.js';
import { z } from 'zod';

const trackingRoutes = Router();

// Validation Schemas

const UpdateLocationSchema = z.object({
  coordinates: z.array(z.number()).length(2),
  accuracy: z.number().optional(),
  altitude: z.number().optional(),
  speed: z.number().optional(),
  heading: z.number().optional(),
  batteryLevel: z.number().min(0).max(100).optional(),
  deviceInfo: z.object({
    platform: z.string().optional(),
    osVersion: z.string().optional(),
    appVersion: z.string().optional(),
  }).optional(),
});

// Routes

// Driver location updates
trackingRoutes.post(
  '/location',
  authenticateToken,
  requireRole(UserRole.DRIVER),
  validateBody(UpdateLocationSchema),
  TrackingController.updateLocation
);

trackingRoutes.get(
  '/driver/:driverId',
  authenticateToken,
  TrackingController.getDriverLocation
);

trackingRoutes.get(
  '/driver/:driverId/history',
  authenticateToken,
  TrackingController.getDriverHistory
);

trackingRoutes.get(
  '/driver/:driverId/summary',
  authenticateToken,
  TrackingController.getDriverSummary
);

// Nearby drivers
trackingRoutes.get(
  '/nearby',
  authenticateToken,
  TrackingController.getNearbyDrivers
);

// Order tracking
trackingRoutes.get(
  '/order/:orderId',
  authenticateToken,
  TrackingController.trackOrder
);

// Admin - All drivers
trackingRoutes.get(
  '/drivers',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  TrackingController.getAllDriversLocation
);

// OpenAPI Registration

registry.registerPath({
  method: 'post',
  path: '/tracking/location',
  tags: ['Tracking'],
  summary: 'Update driver location',
  description: 'Update driver\'s current GPS location (called from Flutter app)',
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: UpdateLocationSchema,
        },
      },
    },
  },
  responses: {
    200: { description: 'Location updated' },
    400: { description: 'Invalid coordinates' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden - Driver only' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/tracking/driver/{driverId}',
  tags: ['Tracking'],
  summary: 'Get driver location',
  security: [{ BearerAuth: [] }],
  parameters: [{ name: 'driverId', in: 'path', required: true, schema: { type: 'string' } }],
  responses: {
    200: { description: 'Driver location retrieved' },
    401: { description: 'Unauthorized' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/tracking/nearby',
  tags: ['Tracking'],
  summary: 'Get nearby drivers',
  security: [{ BearerAuth: [] }],
  parameters: [
    { name: 'longitude', in: 'query', required: true, schema: { type: 'number' } },
    { name: 'latitude', in: 'query', required: true, schema: { type: 'number' } },
    { name: 'radius', in: 'query', schema: { type: 'integer', default: 5000 } },
    { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
  ],
  responses: {
    200: { description: 'Nearby drivers retrieved' },
    401: { description: 'Unauthorized' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/tracking/order/{orderId}',
  tags: ['Tracking'],
  summary: 'Track an order',
  description: 'Get real-time tracking information for an order',
  security: [{ BearerAuth: [] }],
  parameters: [{ name: 'orderId', in: 'path', required: true, schema: { type: 'string' } }],
  responses: {
    200: { description: 'Order tracking retrieved' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/tracking/driver/{driverId}/history',
  tags: ['Tracking'],
  summary: 'Get driver location history',
  security: [{ BearerAuth: [] }],
  parameters: [
    { name: 'driverId', in: 'path', required: true, schema: { type: 'string' } },
    { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
    { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
    { name: 'limit', in: 'query', schema: { type: 'integer', default: 100 } },
  ],
  responses: {
    200: { description: 'Location history retrieved' },
    401: { description: 'Unauthorized' },
  },
});

export default trackingRoutes;