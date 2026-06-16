import { Types } from 'mongoose';
import { AppError } from '@/middlewares/auth.js';
import { UserRole } from '@/types/enums.js';
import { UserModel } from '../users/model.js';
import { DocumentModel, VerificationRequestModel } from './model.js';
import { StorageService } from './storage.service.js';
import {
  IDocument,
  IUploadDocumentPayload,
  IDocumentResponse,
  IVerifyDocumentPayload,
  IGetUserDocumentsQuery,
  DocumentStatus,
  DocumentType,
  getRequiredDocumentsByRole,
  DOCUMENT_CONFIG,
} from './types.js';

export class DocumentsService {
  // ============================================
  // Document Upload & Management
  // ============================================

  /**
   * Upload a document for a user
   */
  static async uploadDocument(payload: IUploadDocumentPayload): Promise<IDocumentResponse> {
    const { userId, userRole, type, file, metadata } = payload;

    // Validate file against document type configuration
    const config = DOCUMENT_CONFIG[type];
    if (!config) {
      throw new AppError(400, `Invalid document type: ${type}`);
    }

    // Check file size
    if (file.size > config.maxFileSize) {
      throw new AppError(400, `File too large. Max size: ${config.maxFileSize / 1024 / 1024}MB`);
    }

    // Check mime type
    if (!config.allowedMimeTypes.includes(file.mimeType)) {
      throw new AppError(400, `Invalid file type. Allowed: ${config.allowedMimeTypes.join(', ')}`);
    }

    // Check if user already has a pending document of this type
    const existingPending = await DocumentModel.findOne({
      userId: new Types.ObjectId(userId),
      type,
      status: DocumentStatus.PENDING,
    });

    if (existingPending) {
      throw new AppError(
        400,
        `You already have a pending ${type} document. Please wait for verification.`,
      );
    }

    // Check if user already has a verified document of this type
    const existingVerified = await DocumentModel.findOne({
      userId: new Types.ObjectId(userId),
      type,
      status: DocumentStatus.VERIFIED,
    });

    if (existingVerified) {
      throw new AppError(
        400,
        `You already have a verified ${type} document. Contact admin to update.`,
      );
    }

    // Upload file to storage
    const { fileName, fileUrl, provider } = await StorageService.uploadDocument(
      userId,
      file,
      undefined, // Will use default provider from env
    );

    // Create document record
    const document = new DocumentModel({
      userId: new Types.ObjectId(userId),
      userRole,
      type,
      originalName: file.originalName,
      fileName,
      fileUrl,
      fileSize: file.size,
      mimeType: file.mimeType,
      storageProvider: provider,
      status: DocumentStatus.PENDING,
      metadata: metadata || {},
    });

    await document.save();

    return this.toDocumentResponse(document);
  }

  /**
   * Get user's documents
   */
  static async getUserDocuments(query: IGetUserDocumentsQuery): Promise<IDocumentResponse[]> {
    const { userId, type, status } = query;

    const filter: any = { userId: new Types.ObjectId(userId) };
    if (type) filter.type = type;
    if (status) filter.status = status;

    const documents = await DocumentModel.find(filter).sort({ createdAt: -1 });
    return documents.map((doc) => this.toDocumentResponse(doc));
  }

  /**
   * Get document by ID
   */
  static async getDocumentById(documentId: string): Promise<IDocument> {
    const document = await DocumentModel.findById(documentId);
    if (!document) {
      throw new AppError(404, 'Document not found.');
    }
    return document;
  }

  /**
   * Delete document (only if pending or rejected)
   */
  static async deleteDocument(documentId: string, userId: string): Promise<void> {
    const document = await DocumentModel.findById(documentId);

    if (!document) {
      throw new AppError(404, 'Document not found.');
    }

    if (document.userId.toString() !== userId) {
      throw new AppError(403, 'You can only delete your own documents.');
    }

    if (document.status === DocumentStatus.VERIFIED) {
      throw new AppError(400, 'Cannot delete a verified document. Contact admin.');
    }

    // Delete from storage
    await StorageService.deleteDocument(document.fileName, document.storageProvider);

    // Delete from database
    await DocumentModel.deleteOne({ _id: documentId });
  }

  // ============================================
  // Document Verification (Admin)
  // ============================================

  /**
   * Verify or reject a document (admin)
   */
  static async verifyDocument(payload: IVerifyDocumentPayload): Promise<IDocumentResponse> {
    const { documentId, status, rejectionReason, adminId } = payload;

    const document = await DocumentModel.findById(documentId);
    if (!document) {
      throw new AppError(404, 'Document not found.');
    }

    if (document.status !== DocumentStatus.PENDING) {
      throw new AppError(400, `Document is already ${document.status}.`);
    }

    if (status === DocumentStatus.REJECTED && !rejectionReason) {
      throw new AppError(400, 'Rejection reason is required when rejecting a document.');
    }

    document.status = status;
    document.rejectionReason = rejectionReason;
    document.verifiedBy = new Types.ObjectId(adminId);
    document.verifiedAt = new Date();

    await document.save();

    // After document verification, check if user has all required documents
    await this.checkUserVerificationStatus(document.userId.toString());

    return this.toDocumentResponse(document);
  }

  /**
   * Check if user has all required documents and update verification status
   */
  static async checkUserVerificationStatus(userId: string): Promise<boolean> {
    const user = await UserModel.findById(userId);
    if (!user) {
      return false;
    }

    const requiredDocs = getRequiredDocumentsByRole(user.role);
    if (requiredDocs.length === 0) {
      return true; // No documents required
    }

    // Get all verified documents for this user
    const verifiedDocs = await DocumentModel.find({
      userId: new Types.ObjectId(userId),
      status: DocumentStatus.VERIFIED,
      type: { $in: requiredDocs },
    });

    const verifiedDocTypes = new Set(verifiedDocs.map((doc) => doc.type));
    const hasAllDocuments = requiredDocs.every((docType) => verifiedDocTypes.has(docType));

    // If user has all required documents and is not yet verified, update user
    if (hasAllDocuments && !user.isVerified) {
      user.isVerified = true;
      await user.save();

      // Create verification request record if needed
      await this.createOrUpdateVerificationRequest(userId, DocumentStatus.VERIFIED);
    }

    return hasAllDocuments;
  }

  /**
   * Get pending verification requests for admin
   */
  static async getPendingVerifications(
    role?: UserRole,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ documents: IDocument[]; total: number; page: number; limit: number }> {
    const filter: any = { status: DocumentStatus.PENDING };
    if (role) filter.userRole = role;

    const skip = (page - 1) * limit;
    const [documents, total] = await Promise.all([
      DocumentModel.find(filter)
        .populate('userId', 'phone role')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: 1 })
        .lean(),
      DocumentModel.countDocuments(filter),
    ]);

    return { documents, total, page, limit };
  }

  /**
   * Get user's verification summary
   */
  static async getUserVerificationSummary(userId: string): Promise<{
    isVerified: boolean;
    requiredDocuments: DocumentType[];
    documents: {
      type: DocumentType;
      status: DocumentStatus;
      fileUrl?: string;
      rejectionReason?: string;
      verifiedAt?: Date;
    }[];
  }> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError(404, 'User not found.');
    }

    const requiredDocs = getRequiredDocumentsByRole(user.role);
    const documents = await DocumentModel.find({ userId: new Types.ObjectId(userId) });

    const documentMap = new Map(documents.map((doc) => [doc.type, doc]));

    const documentStatuses = requiredDocs.map((docType) => {
      const doc = documentMap.get(docType);
      return {
        type: docType,
        status: doc?.status || DocumentStatus.PENDING,
        fileUrl: doc?.fileUrl,
        rejectionReason: doc?.rejectionReason,
        verifiedAt: doc?.verifiedAt,
      };
    });

    return {
      isVerified: user.isVerified,
      requiredDocuments: requiredDocs,
      documents: documentStatuses,
    };
  }

  // ============================================
  // Verification Request Management
  // ============================================

  /**
   * Create or update verification request
   */
  static async createOrUpdateVerificationRequest(
    userId: string,
    status: DocumentStatus,
  ): Promise<void> {
    const documents = await DocumentModel.find({
      userId: new Types.ObjectId(userId),
      status: { $in: [DocumentStatus.VERIFIED, DocumentStatus.REJECTED] },
    });

    let verificationRequest = await VerificationRequestModel.findOne({
      userId: new Types.ObjectId(userId),
      status: DocumentStatus.PENDING,
    });

    if (!verificationRequest) {
      verificationRequest = new VerificationRequestModel({
        userId: new Types.ObjectId(userId),
        role: (await UserModel.findById(userId))?.role,
        documentIds: documents.map((doc) => doc._id),
        status,
      });
    } else {
      verificationRequest.documentIds = documents.map((doc) => doc._id);
      verificationRequest.status = status;
    }

    await verificationRequest.save();
  }

  // ============================================
  // Helpers
  // ============================================

  private static toDocumentResponse(doc: IDocument): IDocumentResponse {
    return {
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      type: doc.type,
      fileUrl: doc.fileUrl,
      status: doc.status,
      rejectionReason: doc.rejectionReason,
      verifiedAt: doc.verifiedAt,
      createdAt: doc.createdAt,
    };
  }
}
