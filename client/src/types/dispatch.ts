export interface DispatchRequest {
  _id: string
  order: string
  driver?: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED'
  distance?: number
  estimatedEarnings?: number
  score?: number
  expiresAt: string
  createdAt: string
  updatedAt: string
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


