export interface LoginPayload {
  phone: string
  password: string
}

export interface RegisterPayload {
  phone: string
  password: string
  name: string
  email?: string
}

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

export type UserRole = 'CUSTOMER' | 'NORMAL_USER' | 'VENDOR' | 'DRIVER' | 'DISPATCH' | 'ADMIN'
