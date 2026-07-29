export interface Document {
  _id: string
  userId: string
  type: DocumentType
  url: string
  fileName: string
  mimeType: string
  status: VerificationStatus
  adminNote?: string
  verifiedBy?: string
  verifiedAt?: string
  createdAt: string
  updatedAt: string
}

export type DocumentType = 'ID_PROOF' | 'DRIVING_LICENSE' | 'VEHICLE_REGISTRATION' | 'BUSINESS_LICENSE' | 'PROFILE_PHOTO' | 'OTHER'

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'

export interface VerificationRequest {
  documentId: string
  status: VerificationStatus
  adminNote?: string
}
