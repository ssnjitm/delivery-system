export interface DispatchRequest {
  id: string
  orderId: string
  status: 'PENDING' | 'SEARCHING' | 'ASSIGNED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED'
  assignedDriver?: { id: string; name: string }
  distance?: number
  estimatedEarnings?: number
  score?: number
  expiresAt: string
  createdAt: string
  updatedAt?: string
}



export interface BatchGroup {
  _id: string
  orders: string[]
  driver?: string
  route: {
    origin: [number, number]
    stops: Array<{
      order: string
      location: [number, number]
      type: 'pickup' | 'delivery'
    }>
  }
  totalDistance: number
  totalEarnings: number
  score: number
}

export interface DispatchConfig {
  defaultSearchRadius: number
  maxSearchRadius: number
  maxDriversToNotify: number
  driverResponseTimeout: number
  maxRetryAttempts: number
  batchMaxOrders: number
  batchMaxDetourDistance: number
  scoringWeights?: {
    distance: number
    rating: number
    deliveryHistory: number
    availability: number
  }
}


