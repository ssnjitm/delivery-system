import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { registry } from '@/utils/swagger.js';
import { UserRole } from '@/types/enums.js';
import { z } from 'zod';

extendZodWithOpenApi(z);

// ─────────────────────────────────────────────
// Shared primitives
// ─────────────────────────────────────────────

export const cleanPhone = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, { message: 'Must match valid international E.164 phone formats.' })
  .openapi({ example: '+9779800000000' });

export const clearPassword = z
  .string()
  .min(8, { message: 'Password constraints require a minimum of 8 safe characters.' })
  .openapi({ example: 'SecurePass123' });

// ─────────────────────────────────────────────
// Request schemas
// ─────────────────────────────────────────────

export const LoginPayload = registry.register(
  'LoginPayload',
  z.object({
    phone: cleanPhone,
    password: clearPassword,
  }),
);

export const VendorSignupPayload = registry.register(
  'VendorSignupPayload',
  z.object({
    phone: cleanPhone,
    password: clearPassword,
    role: z.literal(UserRole.VENDOR).openapi({ example: UserRole.VENDOR }),
    businessName: z.string().min(2).max(120).openapi({ example: 'Spice House' }),
    ownerName: z.string().min(2).max(120).openapi({ example: 'Ram Bahadur' }),
    address: z.string().min(4).openapi({ example: 'Thamel, Kathmandu' }),
    coordinates: z
      .array(z.number())
      .length(2, { message: 'Coordinates array must map exactly as [longitude, latitude]' })
      .openapi({ example: [85.3133, 27.7172], description: '[longitude, latitude]' }),
    citizenshipDocUrl: z
      .string()
      .url()
      .openapi({ example: 'https://cdn.example.com/docs/citizenship.jpg' }),
  }),
);

export const DriverSignupPayload = registry.register(
  'DriverSignupPayload',
  z.object({
    phone: cleanPhone,
    password: clearPassword,
    role: z.literal(UserRole.DRIVER).openapi({ example: UserRole.DRIVER }),
    fullName: z.string().min(2).max(100).openapi({ example: 'Sagar Tamang' }),
    citizenshipDocUrl: z
      .string()
      .url()
      .openapi({ example: 'https://cdn.example.com/docs/citizenship.jpg' }),
    drivingLicenseUrl: z
      .string()
      .url()
      .openapi({ example: 'https://cdn.example.com/docs/license.jpg' }),
    bikeModel: z.string().min(1).openapi({ example: 'Honda CB 150R' }),
    bluebookUrl: z
      .string()
      .url()
      .openapi({ example: 'https://cdn.example.com/docs/bluebook.jpg' }),
    selfieUrl: z
      .string()
      .url()
      .openapi({ example: 'https://cdn.example.com/photos/selfie.jpg' }),
    emergencyContact: z.object({
      name: z.string().min(2).openapi({ example: 'Bishnu Tamang' }),
      phone: cleanPhone,
    }),
  }),
);

export const ConsumerSignupPayload = registry.register(
  'ConsumerSignupPayload',
  z.object({
    phone: cleanPhone,
    password: clearPassword,
    role: z
      .enum([UserRole.CUSTOMER, UserRole.NORMAL_USER])
      .openapi({ example: UserRole.CUSTOMER }),
    fullName: z.string().min(2).openapi({ example: 'Anjali Shrestha' }),
    selfieUrl: z
      .string()
      .url()
      .openapi({ example: 'https://cdn.example.com/photos/selfie.jpg' }),
    email: z.string().email().optional().openapi({ example: 'anjali@example.com' }),
    defaultDeliveryAddress: z.string().optional().openapi({ example: 'Lazimpat, Kathmandu' }),
  }),
);

// ─────────────────────────────────────────────
// Response schemas
// ─────────────────────────────────────────────

registry.registerComponent('securitySchemes', 'BearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'JWT access token. Header: Authorization: Bearer <token>',
});

export const RegisterSuccessResponse = registry.register(
  'RegisterSuccessResponse',
  z.object({
    success: z.literal(true),
    message: z
      .string()
      .openapi({ example: 'Registration profile saved successfully.' }),
    data: z.object({
      userId: z.string().openapi({ example: '64f1a2b3c4d5e6f7a8b9c0d1' }),
      role: z.nativeEnum(UserRole),
      isVerified: z.boolean(),
    }),
  }),
);

export const LoginSuccessResponse = registry.register(
  'LoginSuccessResponse',
  z.object({
    success: z.literal(true),
    message: z
      .string()
      .openapi({ example: 'Authentication verification completed successfully.' }),
    data: z.object({
      accessToken: z.string().openapi({ example: 'eyJhbGci...' }),
      refreshToken: z.string().openapi({ example: 'eyJhbGci...' }),
      user: z.object({
        id: z.string().openapi({ example: '64f1a2b3c4d5e6f7a8b9c0d1' }),
        role: z.nativeEnum(UserRole),
        phone: z.string().openapi({ example: '+9779800000000' }),
      }),
    }),
  }),
);

export const ErrorResponse = registry.register(
  'ErrorResponse',
  z.object({
    success: z.literal(false),
    message: z
      .string()
      .openapi({ example: 'An account with this phone number is already registered.' }),
  }),
);
