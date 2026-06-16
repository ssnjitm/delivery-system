import { Types } from 'mongoose';
import { UserRole } from '../../types/enums.js';

// Document Types & Enums

export enum DocumentType {
  // Vendor Documents
  CITIZENSHIP = 'citizenship',
  BUSINESS_LOGO = 'business_logo',
  BUSINESS_PHOTO = 'business_photo',

  // Driver Documents
  DRIVING_LICENSE = 'driving_license',
  BLUEBOOK = 'bluebook',
  SELFIE = 'selfie',

  // General
  PROFILE_PHOTO = 'profile_photo',
  CONTRACT = 'contract',
}

export enum DocumentStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum DocumentStorageProvider {
  LOCAL = 'local',
  S3 = 's3',
  CLOUDINARY = 'cloudinary',
}

// Document Interface
export interface IDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  userRole: UserRole;
  type: DocumentType;
  originalName: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  storageProvider: DocumentStorageProvider;
  status: DocumentStatus;
  rejectionReason?: string;
  verifiedBy?: Types.ObjectId;
  verifiedAt?: Date;
  expiresAt?: Date; // For documents that need renewal (license)
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// Verification Request Interface
export interface IVerificationRequest {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  role: UserRole;
  documentIds: Types.ObjectId[];
  status: DocumentStatus;
  adminNotes?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs & Payloads
export interface IUploadDocumentPayload {
  userId: string;
  userRole: UserRole;
  type: DocumentType;
  file: {
    originalName: string;
    buffer: Buffer;
    mimeType: string;
    size: number;
  };
  metadata?: Record<string, unknown>;
}

export interface IDocumentResponse {
  id: string;
  userId: string;
  type: DocumentType;
  fileUrl: string;
  status: DocumentStatus;
  rejectionReason?: string;
  verifiedAt?: Date;
  createdAt: Date;
}

export interface IVerifyDocumentPayload {
  documentId: string;
  status: DocumentStatus.VERIFIED | DocumentStatus.REJECTED;
  rejectionReason?: string;
  adminId: string;
}

export interface IGetUserDocumentsQuery {
  userId: string;
  type?: DocumentType;
  status?: DocumentStatus;
}

export interface IDocumentUploadConfig {
  maxFileSize: number; // in bytes
  allowedMimeTypes: string[];
  allowedTypes: DocumentType[];
}

// Role-Specific Document Requirements
export const VENDOR_REQUIRED_DOCUMENTS: DocumentType[] = [
  DocumentType.CITIZENSHIP,
  DocumentType.BUSINESS_PHOTO,
];

export const DRIVER_REQUIRED_DOCUMENTS: DocumentType[] = [
  DocumentType.CITIZENSHIP,
  DocumentType.DRIVING_LICENSE,
  DocumentType.BLUEBOOK,
  DocumentType.SELFIE,
];

export const CUSTOMER_REQUIRED_DOCUMENTS: DocumentType[] = [DocumentType.SELFIE];

export const NORMAL_USER_REQUIRED_DOCUMENTS: DocumentType[] = [DocumentType.SELFIE];

export const getRequiredDocumentsByRole = (role: UserRole): DocumentType[] => {
  switch (role) {
    case UserRole.VENDOR:
      return VENDOR_REQUIRED_DOCUMENTS;
    case UserRole.DRIVER:
      return DRIVER_REQUIRED_DOCUMENTS;
    case UserRole.CUSTOMER:
      return CUSTOMER_REQUIRED_DOCUMENTS;
    case UserRole.NORMAL_USER:
      return NORMAL_USER_REQUIRED_DOCUMENTS;
    default:
      return [];
  }
};

// Document Configuration by Type
export const DOCUMENT_CONFIG: Record<DocumentType, IDocumentUploadConfig> = {
  [DocumentType.CITIZENSHIP]: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    allowedTypes: [DocumentType.CITIZENSHIP],
  },
  [DocumentType.DRIVING_LICENSE]: {
    maxFileSize: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    allowedTypes: [DocumentType.DRIVING_LICENSE],
  },
  [DocumentType.BLUEBOOK]: {
    maxFileSize: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    allowedTypes: [DocumentType.BLUEBOOK],
  },
  [DocumentType.SELFIE]: {
    maxFileSize: 2 * 1024 * 1024, // 2MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg'],
    allowedTypes: [DocumentType.SELFIE],
  },
  [DocumentType.BUSINESS_LOGO]: {
    maxFileSize: 2 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml'],
    allowedTypes: [DocumentType.BUSINESS_LOGO],
  },
  [DocumentType.BUSINESS_PHOTO]: {
    maxFileSize: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg'],
    allowedTypes: [DocumentType.BUSINESS_PHOTO],
  },
  [DocumentType.PROFILE_PHOTO]: {
    maxFileSize: 2 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg'],
    allowedTypes: [DocumentType.PROFILE_PHOTO],
  },
  [DocumentType.CONTRACT]: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['application/pdf'],
    allowedTypes: [DocumentType.CONTRACT],
  },
};
