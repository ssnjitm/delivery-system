export type UserRole = 'CUSTOMER' | 'NORMAL_USER' | 'VENDOR' | 'DRIVER' | 'DISPATCH' | 'ADMIN'

export interface LoginPayload {
  phone: string
  password: string
}

export interface ConsumerSignupPayload {
  phone: string
  password: string
  role: 'CUSTOMER' | 'NORMAL_USER'
  fullName: string
  selfieUrl: string
  email?: string
  defaultDeliveryAddress?: string
}

export interface VendorSignupPayload {
  phone: string
  password: string
  role: 'VENDOR'
  businessName: string
  ownerName: string
  address: string
  coordinates: [number, number]
  citizenshipDocUrl: string
}

export interface DriverSignupPayload {
  phone: string
  password: string
  role: 'DRIVER'
  fullName: string
  citizenshipDocUrl: string
  drivingLicenseUrl: string
  bikeModel: string
  bluebookUrl: string
  selfieUrl: string
  emergencyContact: { name: string; phone: string }
}

export type RegisterPayload = ConsumerSignupPayload | VendorSignupPayload | DriverSignupPayload

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export interface AuthUser {
  id: string
  phone: string
  name: string
  email?: string
  role: UserRole
  isActive: boolean
  isVerified: boolean
}
