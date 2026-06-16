import mongoose, { Schema, Types } from 'mongoose';
import {
  IDocument,
  IVerificationRequest,
  DocumentType,
  DocumentStatus,
  DocumentStorageProvider,
} from './types.js';

// Document Schema

const DocumentSchema = new Schema<IDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userRole: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(DocumentType),
      required: true,
      index: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
      unique: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    storageProvider: {
      type: String,
      enum: Object.values(DocumentStorageProvider),
      default: DocumentStorageProvider.LOCAL,
    },
    status: {
      type: String,
      enum: Object.values(DocumentStatus),
      default: DocumentStatus.PENDING,
      index: true,
    },
    rejectionReason: {
      type: String,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: Record<string, any>) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Compound indexes for efficient queries
DocumentSchema.index({ userId: 1, type: 1 });
DocumentSchema.index({ userId: 1, status: 1 });
DocumentSchema.index({ status: 1, createdAt: 1 });
DocumentSchema.index({ userRole: 1, status: 1 });

// Ensure one user doesn't have multiple pending documents of same type
DocumentSchema.index(
  { userId: 1, type: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: DocumentStatus.PENDING },
  },
);

export const DocumentModel = mongoose.model<IDocument>('Document', DocumentSchema);

// Verification Request Schema

const VerificationRequestSchema = new Schema<IVerificationRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
    },
    documentIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Document',
        required: true,
      },
    ],
    status: {
      type: String,
      enum: Object.values(DocumentStatus),
      default: DocumentStatus.PENDING,
      index: true,
    },
    adminNotes: {
      type: String,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: Record<string, any>) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

VerificationRequestSchema.index({ userId: 1, status: 1 });
VerificationRequestSchema.index({ status: 1, createdAt: 1 });

export const VerificationRequestModel = mongoose.model<IVerificationRequest>(
  'VerificationRequest',
  VerificationRequestSchema,
);
