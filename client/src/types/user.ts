import type { UserRole } from './auth'

export interface IUser {
  _id: string
  phone: string
  name: string
  email?: string
  role: UserRole
  isActive: boolean
  isVerified: boolean
  isOnline?: boolean
  currentLocation?: {
    type: 'Point'
    coordinates: [number, number]
  }
  createdAt: string
  updatedAt: string
}

export interface IVendor extends IUser {
  role: 'VENDOR'
  businessName?: string
  businessAddress?: string
  isApproved: boolean
}

export interface IDriver extends IUser {
  role: 'DRIVER'
  vehicleType?: string
  vehicleNumber?: string
  isVerified: boolean
  isAvailable: boolean
  earnings?: number
  totalDeliveries?: number
  rating?: number
}

export interface ICustomer extends IUser {
  role: 'CUSTOMER'
  defaultAddress?: string
}

export interface INormalUser extends IUser {
  role: 'NORMAL_USER'
}
