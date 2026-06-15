import { Router } from 'express';
import {  requireRole } from '@/middlewares/role-guard.middleware.js';
import { UserRole } from '@/types/enums.js';
import { UserController } from './controller.js';
import { validateBody } from '@/middlewares/validation.js';
import { registry } from '@/utils/swagger.js';
import { z } from 'zod';
import { authenticateToken } from '@/middlewares/auth.js';

const userRoutes = Router();

// Authenticated User Routes (Self)

userRoutes.get('/me', authenticateToken, UserController.getMyProfile);
userRoutes.patch('/me', authenticateToken, UserController.updateMyProfile);
userRoutes.delete('/me', authenticateToken, UserController.deactivateMyAccount);

// Driver Specific Routes

userRoutes.post(
  '/driver/location',
  authenticateToken,
  requireRole(UserRole.DRIVER),
  UserController.updateDriverLocation
);
userRoutes.post(
  '/driver/toggle-status',
  authenticateToken,
  requireRole(UserRole.DRIVER),
  UserController.toggleDriverStatus
);

// Admin Only Routes

// Vendor Management
userRoutes.get(
  '/vendors',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  UserController.getVendors
);
userRoutes.post(
  '/vendors/:id/approve',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  UserController.approveVendor
);
userRoutes.post(
  '/vendors/:id/reject',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  UserController.rejectVendor
);

// Driver Management
userRoutes.get(
  '/drivers',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  UserController.getDrivers
);
userRoutes.get(
  '/drivers/nearby',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.DISPATCH),
  UserController.getNearbyDrivers
);
userRoutes.post(
  '/drivers/:id/verify',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  UserController.verifyDriver
);
userRoutes.post(
  '/drivers/:id/reject',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  UserController.rejectDriver
);

// Customer & User Management
userRoutes.get(
  '/customers',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  UserController.getCustomers
);
userRoutes.get(
  '/normal-users',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  UserController.getNormalUsers
);

// Admin Utilities
userRoutes.get(
  '/stats',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  UserController.getUserStats
);
userRoutes.get(
  '/:id',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  UserController.getUserById
);
userRoutes.patch(
  '/:id/toggle-status',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  UserController.toggleUserStatus
);

// OpenAPI Registration

// Register schemas and routes for Swagger documentation
registry.registerPath({
  method: 'get',
  path: '/users/me',
  tags: ['Users'],
  summary: 'Get current user profile',
  security: [{ BearerAuth: [] }],
  responses: {
    200: { description: 'User profile retrieved' },
    401: { description: 'Unauthorized' },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/users/me',
  tags: ['Users'],
  summary: 'Update current user profile',
  security: [{ BearerAuth: [] }],
  responses: {
    200: { description: 'Profile updated' },
    401: { description: 'Unauthorized' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/users/vendors',
  tags: ['Users'],
  summary: 'Get all vendors (Admin only)',
  security: [{ BearerAuth: [] }],
  responses: {
    200: { description: 'List of vendors' },
    403: { description: 'Forbidden - Admin only' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/users/vendors/{id}/approve',
  tags: ['Users'],
  summary: 'Approve vendor (Admin only)',
  security: [{ BearerAuth: [] }],
  responses: {
    200: { description: 'Vendor approved' },
    404: { description: 'Vendor not found' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/users/drivers',
  tags: ['Users'],
  summary: 'Get all drivers (Admin only)',
  security: [{ BearerAuth: [] }],
  responses: {
    200: { description: 'List of drivers' },
    403: { description: 'Forbidden - Admin only' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/users/drivers/nearby',
  tags: ['Users'],
  summary: 'Get nearby online drivers',
  security: [{ BearerAuth: [] }],
  parameters: [
    { name: 'longitude', in: 'query', required: true, schema: { type: 'number' } },
    { name: 'latitude', in: 'query', required: true, schema: { type: 'number' } },
    { name: 'maxDistance', in: 'query', schema: { type: 'integer', default: 5000 } },
    { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
  ],
  responses: {
    200: { description: 'List of nearby drivers' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/users/drivers/{id}/verify',
  tags: ['Users'],
  summary: 'Verify driver (Admin only)',
  security: [{ BearerAuth: [] }],
  responses: {
    200: { description: 'Driver verified' },
    404: { description: 'Driver not found' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/users/stats',
  tags: ['Users'],
  summary: 'Get user statistics (Admin only)',
  security: [{ BearerAuth: [] }],
  responses: {
    200: { description: 'User statistics' },
    403: { description: 'Forbidden - Admin only' },
  },
});

export default userRoutes;