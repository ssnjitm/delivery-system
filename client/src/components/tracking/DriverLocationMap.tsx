import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { cn } from '@/lib/utils'
import type { DriverLocation } from '@/types/tracking'
import 'leaflet/dist/leaflet.css'

interface DriverLocationMapProps {
  driver: DriverLocation
  height?: string
  className?: string
}

export function DriverLocationMap({ driver, height = '400px', className }: DriverLocationMapProps) {
  const position: [number, number] = [driver.lat, driver.lng]

  return (
    <div className={cn('rounded-md overflow-hidden border', className)} style={{ height }}>
      <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            <div className="text-sm">
              <p className="font-medium">Driver Location</p>
              <p className="text-muted-foreground">
                {driver.lat.toFixed(4)}, {driver.lng.toFixed(4)}
              </p>
              {driver.speed && <p>Speed: {driver.speed.toFixed(1)} km/h</p>}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
