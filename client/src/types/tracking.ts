export interface DriverLocation {
  driverId: string
  driverName?: string
  phone?: string
  location: {
    coordinates: [number, number]
    timestamp?: string
  }
  isOnline: boolean
  speed?: number
  heading?: number
}

export interface TrackingSession {
  orderId: string
  driverId: string
  driverName?: string
  driverPhone?: string
  driverLocation: DriverLocation
  route: Array<{ lat: number; lng: number }>
  estimatedArrival?: string
  estimatedDistance?: number
}

export interface OrderTracking {
  orderId: string
  orderStatus: string
  driver: {
    id: string
    name: string
    phone: string
    location: {
      coordinates: [number, number]
      timestamp?: string
    }
    speed?: number
    heading?: number
  }
  pickupLocation: { coordinates: [number, number]; address: string }
  deliveryLocation: { coordinates: [number, number]; address: string }
  estimatedArrivalTime?: string
  estimatedTimeRemaining?: number
  distanceToDestination?: number
  status: 'PENDING' | 'ACTIVE' | 'NEAR_PICKUP' | 'NEAR_DELIVERY' | 'COMPLETED'
  path: Array<{ coordinates: [number, number]; timestamp?: string }>
  waypoints: Array<{ location: [number, number]; type: 'PICKUP' | 'DELIVERY'; reached: boolean }>
}

export interface Geofence {
  type: 'pickup' | 'delivery'
  center: [number, number]
  radius: number
  triggered: boolean
  triggeredAt?: string
}
