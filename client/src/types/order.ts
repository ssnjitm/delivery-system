export type OrderStatus =
  | 'PENDING'
  | 'WAITING_FOR_DRIVER'
  | 'DRIVER_ASSIGNED'
  | 'DRIVER_ARRIVING'
  | 'PICKED_UP'
  | 'ON_THE_WAY'
  | 'NEAR_DESTINATION'
  | 'DELIVERED'
  | 'COD_COLLECTED'
  | 'CANCELLED'

export interface IOrder {
  _id: string
  orderId: string
  customer: string | { _id: string; name: string; phone: string }
  vendor?: string | { _id: string; name: string; businessName?: string }
  driver?: string | { _id: string; name: string; phone: string }
  pickupLocation: {
    address: string
    coordinates: [number, number]
  }
  deliveryLocation: {
    address: string
    coordinates: [number, number]
  }
  packageDetails: {
    weight?: number
    description?: string
    packageType?: string
  }
  items: OrderItem[]
  status: OrderStatus
  pricing: {
    basePrice: number
    distancePrice: number
    weightPrice?: number
    surgeMultiplier?: number
    discount?: number
    total: number
    currency: string
  }
  isCOD: boolean
  codAmount?: number
  statusHistory: StatusHistoryEntry[]
  estimatedDistance?: number
  estimatedDuration?: number
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  name: string
  quantity: number
  price?: number
}

export interface StatusHistoryEntry {
  status: OrderStatus
  timestamp: string
  updatedBy?: string
  note?: string
}

export interface CreateOrderPayload {
  pickupLocation: {
    address: string
    coordinates: [number, number]
  }
  deliveryLocation: {
    address: string
    coordinates: [number, number]
  }
  packageDetails: {
    weight?: number
    description?: string
    packageType?: string
  }
  items: OrderItem[]
  isCOD: boolean
  codAmount?: number
}
