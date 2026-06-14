import { validateBody } from '@/middlewares/validation.js';
import { registry } from '@/utils/swagger.js';
import { Router } from 'express';
import { AuthController } from './controller.js';
import {
  ConsumerSignupPayload,
  DriverSignupPayload,
  ErrorResponse,
  LoginPayload,
  LoginSuccessResponse,
  RegisterSuccessResponse,
  VendorSignupPayload,
} from './validation.js';
import { authenticateToken } from '@/middlewares/auth.js';
import z from 'zod';

const authRoutes = Router();

// ─────────────────────────────────────────────
// Routes + OpenAPI path registrations
// ─────────────────────────────────────────────

authRoutes.post('/login', validateBody(LoginPayload), AuthController.login);
registry.registerPath({
  method: 'post',
  path: '/auth/login',
  tags: ['Auth'],
  summary: 'Login with phone + password',
  description: 'Returns JWT access and refresh tokens on success.',
  request: { body: { content: { 'application/json': { schema: LoginPayload } }, required: true } },
  responses: {
    200: { description: 'Login successful', content: { 'application/json': { schema: LoginSuccessResponse } } },
    401: { description: 'Invalid credentials', content: { 'application/json': { schema: ErrorResponse } } },
    403: { description: 'Account suspended', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

authRoutes.post('/logout', authenticateToken, AuthController.logout);
registry.registerPath({
  method: 'post',
  path: '/auth/logout',
  tags: ['Auth'],
  summary: 'Logout user',
  description: 'Invalidates the refresh token. Requires authentication.',
  security: [{ BearerAuth: [] }],
  responses: {
    200: { description: 'Logged out successfully' },
    401: { description: 'Authentication required' }
  }
});


// ─────────────────────────────────────────────

authRoutes.post('/register/vendor', validateBody(VendorSignupPayload), AuthController.register);
registry.registerPath({
  method: 'post',
  path: '/auth/register/vendor',
  tags: ['Auth'],
  summary: 'Register a vendor',
  description: 'Creates a vendor account. Starts unverified — requires manual admin approval.',
  request: { body: { content: { 'application/json': { schema: VendorSignupPayload } }, required: true } },
  responses: {
    201: { description: 'Registered', content: { 'application/json': { schema: RegisterSuccessResponse } } },
    400: { description: 'Validation error / phone taken', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

// ─────────────────────────────────────────────

authRoutes.post('/register/driver', validateBody(DriverSignupPayload), AuthController.register);
registry.registerPath({
  method: 'post',
  path: '/auth/register/driver',
  tags: ['Auth'],
  summary: 'Register a driver',
  description: 'Creates a driver account. Starts unverified — pending background document check.',
  request: { body: { content: { 'application/json': { schema: DriverSignupPayload } }, required: true } },
  responses: {
    201: { description: 'Registered', content: { 'application/json': { schema: RegisterSuccessResponse } } },
    400: { description: 'Validation error / phone taken', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

// ─────────────────────────────────────────────

authRoutes.post('/register/customer', validateBody(ConsumerSignupPayload), AuthController.register);
authRoutes.post('/register/user', validateBody(ConsumerSignupPayload), AuthController.register);
registry.registerPath({
  method: 'post',
  path: '/auth/register/customer',
  tags: ['Auth'],
  summary: 'Register a customer',
  description: 'Creates a customer account. Instantly verified and active.',
  request: { body: { content: { 'application/json': { schema: ConsumerSignupPayload } }, required: true } },
  responses: {
    201: { description: 'Registered', content: { 'application/json': { schema: RegisterSuccessResponse } } },
    400: { description: 'Validation error / phone taken', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/register/user',
  tags: ['Auth'],
  summary: 'Register a normal user',
  description: 'Same payload as customer. Instantly active.',
  request: { body: { content: { 'application/json': { schema: ConsumerSignupPayload } }, required: true } },
  responses: {
    201: { description: 'Registered', content: { 'application/json': { schema: RegisterSuccessResponse } } },
    400: { description: 'Validation error / phone taken', content: { 'application/json': { schema: ErrorResponse } } },
  },
});



authRoutes.post('/refresh', AuthController.refreshToken);
registry.registerPath({
  method: 'post',
  path: '/auth/refresh',
  tags: ['Auth'],
  summary: 'Refresh access token',
  description: 'Get a new access token using a valid refresh token.',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            refreshToken: z.string()
          })
        }
      },
      required: true
    }
  },
  responses: {
    200: { description: 'New access token generated' },
    401: { description: 'Refresh token missing' },
    403: { description: 'Invalid or expired refresh token' }
  }
});


export default authRoutes;
