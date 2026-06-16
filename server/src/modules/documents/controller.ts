import { Request, Response } from 'express';
import { AppError } from '@/middlewares/auth.js';
import { UserRole } from '@/types/enums.js';
import { DocumentsService } from './service.js';
import { DocumentType, DocumentStatus, IUploadDocumentPayload } from './types.js';

// Route Parameter Interfaces
interface IdParam {
  id: string;
}

interface UserParam {
  userId: string;
}

export class DocumentsController {
  // User Document Operations

  /**
   * Upload a document
   * POST /api/v1/documents/upload
   */
  static async uploadDocument(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const { type } = req.body;
    const file = req.file;

    if (!file) {
      throw new AppError(400, 'No file uploaded.');
    }

    if (!type || !Object.values(DocumentType).includes(type)) {
      throw new AppError(
        400,
        `Valid document type is required. Allowed: ${Object.values(DocumentType).join(', ')}`,
      );
    }

    const payload: IUploadDocumentPayload = {
      userId: req.user.userId,
      userRole: req.user.role,
      type: type as DocumentType,
      file: {
        originalName: file.originalname,
        buffer: file.buffer,
        mimeType: file.mimetype,
        size: file.size,
      },
      metadata: req.body.metadata ? JSON.parse(req.body.metadata) : undefined,
    };

    const document = await DocumentsService.uploadDocument(payload);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully. Awaiting verification.',
      data: document,
    });
  }

  /**
   * Get my documents
   * GET /api/v1/documents/my
   */
  static async getMyDocuments(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const { type, status } = req.query;
    const documents = await DocumentsService.getUserDocuments({
      userId: req.user.userId,
      type: type as DocumentType,
      status: status as DocumentStatus,
    });

    res.status(200).json({
      success: true,
      data: documents,
    });
  }

  /**
   * Get my verification summary
   * GET /api/v1/documents/verification-summary
   */
  static async getMyVerificationSummary(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const summary = await DocumentsService.getUserVerificationSummary(req.user.userId);

    res.status(200).json({
      success: true,
      data: summary,
    });
  }

  /**
   * Delete a document
   * DELETE /api/v1/documents/:id
   */
  static async deleteDocument(req: Request<IdParam>, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const { id } = req.params;
    await DocumentsService.deleteDocument(id, req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully.',
    });
  }

  // Admin Document Operations

  /**
   * Get pending verifications (admin)
   * GET /api/v1/documents/admin/pending
   */
  static async getPendingVerifications(req: Request, res: Response): Promise<void> {
    const { role, page, limit } = req.query;

    const result = await DocumentsService.getPendingVerifications(
      role as UserRole,
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 20,
    );

    res.status(200).json({
      success: true,
      data: result.documents,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  }

  /**
   * Verify a document (admin)
   * POST /api/v1/documents/admin/:id/verify
   */
  static async verifyDocument(req: Request<IdParam>, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!status || ![DocumentStatus.VERIFIED, DocumentStatus.REJECTED].includes(status)) {
      throw new AppError(
        400,
        `Valid status required. Allowed: ${DocumentStatus.VERIFIED}, ${DocumentStatus.REJECTED}`,
      );
    }

    const document = await DocumentsService.verifyDocument({
      documentId: id,
      status,
      rejectionReason,
      adminId: req.user.userId,
    });

    res.status(200).json({
      success: true,
      message: `Document ${status === DocumentStatus.VERIFIED ? 'verified' : 'rejected'} successfully.`,
      data: document,
    });
  }

  /**
   * Get user's documents (admin)
   * GET /api/v1/documents/admin/users/:userId
   */
  static async getUserDocumentsAdmin(req: Request<UserParam>, res: Response): Promise<void> {
    const { userId } = req.params;
    const { type, status } = req.query;

    const documents = await DocumentsService.getUserDocuments({
      userId,
      type: type as DocumentType,
      status: status as DocumentStatus,
    });

    res.status(200).json({
      success: true,
      data: documents,
    });
  }

  /**
   * Get user verification summary (admin)
   * GET /api/v1/documents/admin/users/:userId/summary
   */
  static async getUserVerificationSummaryAdmin(
    req: Request<UserParam>,
    res: Response,
  ): Promise<void> {
    const { userId } = req.params;

    const summary = await DocumentsService.getUserVerificationSummary(userId);

    res.status(200).json({
      success: true,
      data: summary,
    });
  }
}
