import { Router } from 'express';
import { authenticateToken } from '@/middlewares/auth.js';
import { UserRole } from '@/types/enums.js';
import { AdminController } from './controller.js';
import { validateBody } from '@/middlewares/validation.js';
import { registry } from '@/utils/swagger.js';
import { z } from 'zod';
import { requireRole } from '@/middlewares/role-guard.middleware.js';

const adminRoutes = Router();

// All admin routes require authentication and admin role
adminRoutes.use(authenticateToken);
adminRoutes.use(requireRole(UserRole.ADMIN));

// Dashboard
adminRoutes.get('/dashboard/stats', AdminController.getDashboardStats);

// User Management
adminRoutes.get('/users', AdminController.getAllUsers);
adminRoutes.get('/users/:userId', AdminController.getUserDetails);
adminRoutes.post('/users/:userId/suspend', AdminController.suspendUser);
adminRoutes.post('/users/:userId/activate', AdminController.activateUser);

// Audit Logs
adminRoutes.get('/audit-logs', AdminController.getAuditLogs);

// Dispute Management
adminRoutes.get('/disputes', AdminController.getDisputes);
adminRoutes.get('/disputes/:disputeId', AdminController.getDisputeById);
adminRoutes.post('/disputes/:disputeId/assign', AdminController.assignDispute);
adminRoutes.patch('/disputes/:disputeId/status', AdminController.updateDisputeStatus);

// Reports
adminRoutes.get('/reports/orders', AdminController.getOrderReport);
adminRoutes.get('/reports/revenue', AdminController.getRevenueReport);
adminRoutes.get('/reports/drivers', AdminController.getDriverPerformanceReport);
adminRoutes.get('/reports/vendors', AdminController.getVendorPerformanceReport);

// Bulk Operations
adminRoutes.post('/bulk/approve-vendors', AdminController.bulkApproveVendors);
adminRoutes.post('/bulk/verify-drivers', AdminController.bulkVerifyDrivers);

// Search
adminRoutes.get('/search/users', AdminController.searchUsers);

// OpenAPI Registration
registry.registerPath({
  method: 'get',
  path: '/admin/dashboard/stats',
  tags: ['Admin'],
  summary: 'Get dashboard statistics',
  security: [{ BearerAuth: [] }],
  responses: {
    200: { description: 'Dashboard statistics retrieved' },
    403: { description: 'Forbidden - Admin only' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/admin/users',
  tags: ['Admin'],
  summary: 'Get all users with filters',
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: 'role',
      in: 'query',
      schema: { type: 'string', enum: ['vendor', 'driver', 'customer'] },
    },
    { name: 'isVerified', in: 'query', schema: { type: 'boolean' } },
    { name: 'search', in: 'query', schema: { type: 'string' } },
    { name: 'page', in: 'query', schema: { type: 'integer' } },
    { name: 'limit', in: 'query', schema: { type: 'integer' } },
  ],
  responses: {
    200: { description: 'List of users' },
    403: { description: 'Forbidden' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/admin/audit-logs',
  tags: ['Admin'],
  summary: 'Get admin audit logs',
  security: [{ BearerAuth: [] }],
  parameters: [
    { name: 'actionType', in: 'query', schema: { type: 'string' } },
    { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
    { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
    { name: 'page', in: 'query', schema: { type: 'integer' } },
  ],
  responses: {
    200: { description: 'Audit logs retrieved' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/admin/disputes',
  tags: ['Admin'],
  summary: 'Get all disputes',
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: 'status',
      in: 'query',
      schema: { type: 'string', enum: ['pending', 'under_review', 'resolved', 'escalated'] },
    },
    { name: 'type', in: 'query', schema: { type: 'string' } },
    { name: 'page', in: 'query', schema: { type: 'integer' } },
  ],
  responses: {
    200: { description: 'List of disputes' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/admin/reports/orders',
  tags: ['Admin'],
  summary: 'Generate order report',
  security: [{ BearerAuth: [] }],
  parameters: [
    { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
    { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
    { name: 'vendorId', in: 'query', schema: { type: 'string' } },
    { name: 'driverId', in: 'query', schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'Order report generated' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/admin/bulk/approve-vendors',
  tags: ['Admin'],
  summary: 'Bulk approve vendors',
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            vendorIds: z.array(z.string()),
          }),
        },
      },
    },
  },
  responses: {
    200: { description: 'Vendors approved' },
    400: { description: 'Invalid request' },
  },
});

export default adminRoutes;
