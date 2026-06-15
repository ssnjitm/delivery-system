import { z } from 'zod';
import { registry } from '@/utils/swagger.js';
import { UserRole } from '@/types/enums.js';

// Update Profile Schemas

export const UpdateMyProfileSchema = registry.register(
  'UpdateMyProfileSchema',
  z.object({
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
    email: z.string().email().optional(),
    fullName: z.string().min(2).max(100).optional(),
    businessName: z.string().min(2).max(120).optional(),
    address: z.string().min(4).optional(),
    defaultDeliveryAddress: z.string().optional(),
  })
);

export const DeactivateAccountSchema = registry.register(
  'DeactivateAccountSchema',
  z.object({
    reason: z.string().optional(),
  })
);


// Driver Location Schemas

export const DriverLocationSchema = registry.register(
  'DriverLocationSchema',
  z.object({
    coordinates: z
      .array(z.number())
      .length(2)
      .openapi({ example: [85.3133, 27.7172], description: '[longitude, latitude]' }),
  })
);

export const DriverToggleStatusSchema = registry.register(
  'DriverToggleStatusSchema',
  z.object({
    isOnline: z.boolean().openapi({ example: true }),
  })
);

// Admin Action Schemas

export const AdminRejectSchema = registry.register(
  'AdminRejectSchema',
  z.object({
    reason: z.string().min(5).openapi({ example: 'Invalid document provided' }),
  })
);

export const AdminToggleUserStatusSchema = registry.register(
  'AdminToggleUserStatusSchema',
  z.object({
    isActive: z.boolean(),
    reason: z.string().optional(),
  })
);

// Query Parameter Schemas

export const UserFiltersQuerySchema = z.object({
  isVerified: z.enum(['true', 'false']).optional(),
  isActive: z.enum(['true', 'false']).optional(),
  search: z.string().optional(),
  page: z.string().regex(/^\d+$/).optional().default('1'),
  limit: z.string().regex(/^\d+$/).optional().default('20'),
});

export const NearbyDriversQuerySchema = z.object({
  longitude: z.string().regex(/^-?\d+(\.\d+)?$/),
  latitude: z.string().regex(/^-?\d+(\.\d+)?$/),
  maxDistance: z.string().regex(/^\d+$/).optional().default('5000'),
  limit: z.string().regex(/^\d+$/).optional().default('10'),
});