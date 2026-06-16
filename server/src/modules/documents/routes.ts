import { Router } from 'express';
import multer from 'multer';
import { authenticateToken } from '@/middlewares/auth.js';
import { UserRole } from '@/types/enums.js';
import { DocumentsController } from './controller.js';
import { validateBody } from '@/middlewares/validation.js';
import { registry } from '@/utils/swagger.js';
import { z } from 'zod';
import { requireRole } from '@/middlewares/role-guard.middleware.js';

const documentRoutes = Router();

// Configure multer for memory storage (we'll handle file saving in service)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

// ============================================
// User Routes
// ============================================

documentRoutes.post(
  '/upload',
  authenticateToken,
  upload.single('file'),
  DocumentsController.uploadDocument,
);

documentRoutes.get('/my', authenticateToken, DocumentsController.getMyDocuments);

documentRoutes.get(
  '/verification-summary',
  authenticateToken,
  DocumentsController.getMyVerificationSummary,
);

documentRoutes.delete('/:id', authenticateToken, (req, res, next) =>
  DocumentsController.deleteDocument(req as any, res).catch(next),
);

// ============================================
// Admin Routes
// ============================================

documentRoutes.get(
  '/admin/pending',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  DocumentsController.getPendingVerifications,
);

documentRoutes.post(
  '/admin/:id/verify',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  validateBody(
    z.object({
      status: z.enum([UserRole.VENDOR, UserRole.DRIVER]),
      rejectionReason: z.string().optional(),
    }),
  ),
  (req, res, next) => DocumentsController.verifyDocument(req as any, res).catch(next),
);

documentRoutes.get(
  '/admin/users/:userId',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  (req, res, next) => DocumentsController.getUserDocumentsAdmin(req as any, res).catch(next),
);

documentRoutes.get(
  '/admin/users/:userId/summary',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  (req, res, next) =>
    DocumentsController.getUserVerificationSummaryAdmin(req as any, res).catch(next),
);

// ============================================
// OpenAPI Registration
// ============================================

registry.registerPath({
  method: 'post',
  path: '/documents/upload',
  tags: ['Documents'],
  summary: 'Upload a document',
  description: 'Upload a document for verification (citizenship, license, selfie, etc.)',
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: z.object({
            file: z.any(),
            type: z.enum([
              'citizenship',
              'driving_license',
              'bluebook',
              'selfie',
              'business_logo',
              'business_photo',
            ]),
          }),
        },
      },
    },
  },
  responses: {
    201: { description: 'Document uploaded successfully' },
    400: { description: 'Invalid file or document type' },
    401: { description: 'Unauthorized' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/documents/my',
  tags: ['Documents'],
  summary: 'Get my documents',
  security: [{ BearerAuth: [] }],
  responses: {
    200: { description: 'List of user documents' },
    401: { description: 'Unauthorized' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/documents/verification-summary',
  tags: ['Documents'],
  summary: 'Get my verification status',
  security: [{ BearerAuth: [] }],
  responses: {
    200: { description: 'Verification summary' },
    401: { description: 'Unauthorized' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/documents/admin/pending',
  tags: ['Documents'],
  summary: 'Get pending verifications (Admin only)',
  security: [{ BearerAuth: [] }],
  responses: {
    200: { description: 'List of pending documents' },
    403: { description: 'Forbidden - Admin only' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/documents/admin/{id}/verify',
  tags: ['Documents'],
  summary: 'Verify or reject a document (Admin only)',
  security: [{ BearerAuth: [] }],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            status: z.enum(['verified', 'rejected']),
            rejectionReason: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: { description: 'Document verified/rejected' },
    404: { description: 'Document not found' },
  },
});

export default documentRoutes;
