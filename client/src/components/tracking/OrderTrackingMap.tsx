import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import type { DriverLocation } from '@/types/tracking'
import type { IOrder } from '@/types/order'
import 'leaflet/dist/leaflet.css'

interface OrderTrackingMapProps {
  order: IOrder
  driverLocation?: DriverLocation | null
  height?: string
  className?: string
}

export function OrderTrackingMap({ order, driverLocation, height = '400px', className }: OrderTrackingMapProps) {
  const pickupPos: [number, number] = [order.pickupLocation.coordinates[1], order.pickupLocation.coordinates[0]]
  const deliveryPos: [number, number] = [order.deliveryLocation.coordinates[1], order.deliveryLocation.coordinates[0]]

  const center: [number, number] = [
    (pickupPos[0] + deliveryPos[0]) / 2,
    (pickupPos[1] + deliveryPos[1]) / 2,
  ]

  const routePoints: [number, number][] = []
  if (driverLocation) {
    routePoints.push([driverLocation.lat, driverLocation.lng])
  }
  routePoints.push(deliveryPos)

  return (
    <div className={cn('rounded-md overflow-hidden border', className)} style={{ height }}>
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={pickupPos}>
          <Popup>
            <div className="text-sm">
              <p className="font-medium text-green-600">Pickup</p>
              <p>{order.pickupLocation.address}</p>
            </div>
          </Popup>
        </Marker>
        <Marker position={deliveryPos}>
          <Popup>
            <div className="text-sm">
              <p className="font-medium text-red-600">Delivery</p>
              <p>{order.deliveryLocation.address}</p>
              <p>{formatCurrency(order.pricing.total)}</p>
            </div>
          </Popup>
        </Marker>
        {driverLocation && (
          <Marker position={[driverLocation.lat, driverLocation.lng]}>
            <Popup>
              <div className="text-sm">
                <p className="font-medium">Driver</p>
                {driverLocation.speed && <p>Speed: {driverLocation.speed.toFixed(1)} km/h</p>}
              </div>
            </Popup>
          </Marker>
        )}
        {routePoints.length > 1 && (
          <Polyline positions={routePoints} color="#3b82f6" />
        )}
      </MapContainer>
    </div>
  )
}
