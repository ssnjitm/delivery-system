import { Router } from 'express';
import { authenticateToken } from '@/middlewares/auth.js';
import { requireRole } from '@/middlewares/role-guard.middleware.js';
import { UserRole } from '@/types/enums.js';
import { PricingController } from './controller.js';
import { validateBody } from '@/middlewares/validation.js';
import { registry } from '@/utils/swagger.js';
import { z } from 'zod';

const pricingRoutes = Router();

// ============================================
// Validation Schemas
// ============================================

const CalculatePriceSchema = z.object({
  pickupLocation: z.object({
    coordinates: z.array(z.number()).length(2),
    area: z.string(),
    city: z.string(),
  }),
  deliveryLocation: z.object({
    coordinates: z.array(z.number()).length(2),
    area: z.string(),
    city: z.string(),
  }),
  packageType: z.enum(['STANDARD', 'DOCUMENT', 'PERISHABLE', 'FRAGILE', 'PHARMACY']),
  packageWeight: z.number().optional(),
  isPeakHour: z.boolean().optional(),
  scheduledTime: z.string().datetime().optional(),
  specialHandling: z.boolean().optional(),
});

const CreateAreaPricingSchema = z.object({
  area: z.string(),
  city: z.string(),
  type: z.enum(['PICKUP', 'DELIVERY', 'BOTH']),
  surcharge: z.object({
    type: z.enum(['FIXED', 'PERCENTAGE']),
    amount: z.number().positive(),
  }),
});

// ============================================
// Public Routes
// ============================================

pricingRoutes.post(
  '/calculate',
  authenticateToken,
  validateBody(CalculatePriceSchema),
  PricingController.calculatePrice
);

// ============================================
// Admin Routes
// ============================================

pricingRoutes.get(
  '/admin/config',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  PricingController.getConfig
);

pricingRoutes.put(
  '/admin/config',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  PricingController.updateConfig
);

pricingRoutes.get(
  '/admin/areas',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  PricingController.getAllAreaPricing
);

pricingRoutes.post(
  '/admin/areas',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  validateBody(CreateAreaPricingSchema),
  PricingController.createAreaPricing
);

pricingRoutes.put(
  '/admin/areas/:id',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  validateBody(CreateAreaPricingSchema.partial()),
  PricingController.updateAreaPricing
);

// ============================================
// OpenAPI Registration
// ============================================

registry.registerPath({
  method: 'post',
  path: '/pricing/calculate',
  tags: ['Pricing'],
  summary: 'Calculate delivery price',
  description: 'Calculate delivery price based on distance, package type, and other factors',
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CalculatePriceSchema,
        },
      },
    },
  },
  responses: {
    200: { description: 'Price calculated successfully' },
    400: { description: 'Invalid request' },
    401: { description: 'Unauthorized' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/pricing/admin/config',
  tags: ['Pricing'],
  summary: 'Get pricing configuration (Admin only)',
  security: [{ BearerAuth: [] }],
  responses: {
    200: { description: 'Configuration retrieved' },
    403: { description: 'Forbidden - Admin only' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/pricing/admin/areas',
  tags: ['Pricing'],
  summary: 'Create area pricing (Admin only)',
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateAreaPricingSchema,
        },
      },
    },
  },
  responses: {
    201: { description: 'Area pricing created' },
    403: { description: 'Forbidden - Admin only' },
  },
});

export default pricingRoutes;