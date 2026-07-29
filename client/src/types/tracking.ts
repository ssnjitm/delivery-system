export interface DriverLocation {
  driverId: string
  lat: number
  lng: number
  status: 'ONLINE' | 'OFFLINE' | 'BUSY'
  heading?: number
  speed?: number
  updatedAt: string
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

export interface Geofence {
  type: 'pickup' | 'delivery'
  center: [number, number]
  radius: number
  triggered: boolean
  triggeredAt?: string
}
