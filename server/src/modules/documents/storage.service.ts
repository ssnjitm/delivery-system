import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { AppError } from '@/middlewares/auth.js';
import { env } from '@/config/env.js';
import { DocumentStorageProvider } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'documents');

// Ensure upload directory exists
const ensureUploadDir = async () => {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
};

// Generate unique filename
const generateFileName = (userId: string, originalName: string): string => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalName);
  const sanitizedName = path
    .basename(originalName, extension)
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 50);

  return `${userId}_${timestamp}_${random}_${sanitizedName}${extension}`;
};

// ============================================
// Local Storage Implementation
// ============================================

export class LocalStorageService {
  static async uploadFile(
    userId: string,
    file: { buffer: Buffer; originalName: string; mimeType: string },
  ): Promise<{ fileName: string; fileUrl: string }> {
    await ensureUploadDir();

    const fileName = generateFileName(userId, file.originalName);
    const filePath = path.join(UPLOAD_DIR, fileName);

    // Save file to disk
    await fs.writeFile(filePath, file.buffer);

    // Generate URL (relative path for API access)
    const fileUrl = `/uploads/documents/${fileName}`;

    return { fileName, fileUrl };
  }

  static async deleteFile(fileName: string): Promise<void> {
    const filePath = path.join(UPLOAD_DIR, fileName);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error(`Failed to delete file: ${fileName}`, error);
      // Don't throw - file might not exist
    }
  }

  static async getFileBuffer(fileName: string): Promise<Buffer> {
    const filePath = path.join(UPLOAD_DIR, fileName);
    return await fs.readFile(filePath);
  }
}

// ============================================
// Storage Factory (supports multiple providers)
// ============================================

export class StorageService {
  static async uploadDocument(
    userId: string,
    file: { buffer: Buffer; originalName: string; mimeType: string },
    provider: DocumentStorageProvider = DocumentStorageProvider.LOCAL,
  ): Promise<{ fileName: string; fileUrl: string; provider: DocumentStorageProvider }> {
    switch (provider) {
      case DocumentStorageProvider.LOCAL:
        const { fileName, fileUrl } = await LocalStorageService.uploadFile(userId, file);
        return { fileName, fileUrl, provider: DocumentStorageProvider.LOCAL };

      case DocumentStorageProvider.S3:
        // TODO: Implement S3 upload
        throw new AppError(501, 'S3 storage not yet implemented');

      case DocumentStorageProvider.CLOUDINARY:
        // TODO: Implement Cloudinary upload
        throw new AppError(501, 'Cloudinary storage not yet implemented');

      default:
        throw new AppError(400, 'Unsupported storage provider');
    }
  }

  static async deleteDocument(fileName: string, provider: DocumentStorageProvider): Promise<void> {
    switch (provider) {
      case DocumentStorageProvider.LOCAL:
        await LocalStorageService.deleteFile(fileName);
        break;
      case DocumentStorageProvider.S3:
        // TODO: Implement S3 delete
        break;
      case DocumentStorageProvider.CLOUDINARY:
        // TODO: Implement Cloudinary delete
        break;
    }
  }

  static async getDocumentBuffer(
    fileName: string,
    provider: DocumentStorageProvider,
  ): Promise<Buffer> {
    switch (provider) {
      case DocumentStorageProvider.LOCAL:
        return await LocalStorageService.getFileBuffer(fileName);
      case DocumentStorageProvider.S3:
        // TODO: Implement S3 get
        throw new AppError(501, 'S3 retrieval not yet implemented');
      case DocumentStorageProvider.CLOUDINARY:
        // TODO: Implement Cloudinary get
        throw new AppError(501, 'Cloudinary retrieval not yet implemented');
      default:
        throw new AppError(400, 'Unsupported storage provider');
    }
  }
}
