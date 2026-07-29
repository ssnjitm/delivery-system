import type { OrderStatus } from '@/types/order'
import type { UserRole } from '@/types/auth'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  REGISTER_VENDOR: '/register/vendor',
  REGISTER_DRIVER: '/register/driver',
  REGISTER_CUSTOMER: '/register/customer',
  CUSTOMER_DASHBOARD: '/dashboard',
  VENDOR_DASHBOARD: '/dashboard',
  DRIVER_DASHBOARD: '/dashboard',
  DISPATCH_DASHBOARD: '/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
  CREATE_ORDER: '/orders/create',
  MY_ORDERS: '/orders',
  ORDER_DETAIL: (id: string) => `/orders/${id}`,
  TRACK_ORDER: (id: string) => `/orders/${id}/track`,
  PROFILE: '/profile',
  AVAILABLE_ORDERS: '/available',
  MY_DELIVERIES: '/deliveries',
  DELIVERY_DETAIL: (id: string) => `/deliveries/${id}`,
  NAVIGATE: (id: string) => `/deliveries/${id}/navigate`,
  BATCH_SUGGESTIONS: '/batch',
  EARNINGS: '/earnings',
  DISPATCH_QUEUE: '/queue',
  DISPATCH_CONFIG: '/config',
  LIVE_MAP: '/live-map',
  ADMIN_USERS: '/admin/users',
  ADMIN_USER_DETAIL: (id: string) => `/admin/users/${id}`,
  ADMIN_VENDORS: '/admin/vendors',
  ADMIN_DRIVERS: '/admin/drivers',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_DISPUTES: '/admin/disputes',
  ADMIN_DISPUTE_DETAIL: (id: string) => `/admin/disputes/${id}`,
  ADMIN_DOCUMENTS: '/admin/documents',
  ADMIN_PRICING: '/admin/pricing',
  ADMIN_AREA_PRICING: '/admin/area-pricing',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_AUDIT_LOGS: '/admin/audit-logs',
  ADMIN_SETTINGS: '/admin/settings',
} as const

export const ROLE_LABELS: Record<UserRole, string> = {
  CUSTOMER: 'Customer',
  NORMAL_USER: 'User',
  VENDOR: 'Vendor',
  DRIVER: 'Driver',
  DISPATCH: 'Dispatch',
  ADMIN: 'Admin',
}

export const ROLE_COLORS: Record<UserRole, string> = {
  CUSTOMER: 'bg-blue-100 text-blue-800',
  NORMAL_USER: 'bg-gray-100 text-gray-800',
  VENDOR: 'bg-purple-100 text-purple-800',
  DRIVER: 'bg-green-100 text-green-800',
  DISPATCH: 'bg-orange-100 text-orange-800',
  ADMIN: 'bg-red-100 text-red-800',
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  WAITING_FOR_DRIVER: 'Waiting for Driver',
  DRIVER_ASSIGNED: 'Driver Assigned',
  DRIVER_ARRIVING: 'Driver Arriving',
  PICKED_UP: 'Picked Up',
  ON_THE_WAY: 'On the Way',
  NEAR_DESTINATION: 'Near Destination',
  DELIVERED: 'Delivered',
  COD_COLLECTED: 'COD Collected',
  CANCELLED: 'Cancelled',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  WAITING_FOR_DRIVER: 'bg-orange-100 text-orange-800',
  DRIVER_ASSIGNED: 'bg-blue-100 text-blue-800',
  DRIVER_ARRIVING: 'bg-indigo-100 text-indigo-800',
  PICKED_UP: 'bg-cyan-100 text-cyan-800',
  ON_THE_WAY: 'bg-teal-100 text-teal-800',
  NEAR_DESTINATION: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  COD_COLLECTED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export const DRIVER_STATUS_LABELS = {
  ONLINE: 'Online',
  OFFLINE: 'Offline',
  BUSY: 'Busy',
} as const

export const VEHICLE_TYPES = [
  'BICYCLE',
  'MOTORCYCLE',
  'CAR',
  'VAN',
  'TRUCK',
] as const

export const PACKAGE_TYPES = [
  'DOCUMENT',
  'PARCEL',
  'FOOD',
  'GROCERY',
  'ELECTRONICS',
  'FURNITURE',
  'OTHER',
] as const

export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  'PENDING',
  'WAITING_FOR_DRIVER',
  'DRIVER_ASSIGNED',
  'DRIVER_ARRIVING',
  'PICKED_UP',
  'ON_THE_WAY',
  'NEAR_DESTINATION',
  'DELIVERED',
  'COD_COLLECTED',
]
