import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { cn } from '@/lib/utils'
import type { DriverLocation } from '@/types/tracking'
import 'leaflet/dist/leaflet.css'

interface NearbyDriversMapProps {
  drivers: DriverLocation[]
  height?: string
  className?: string
}

export function NearbyDriversMap({ drivers, height = '400px', className }: NearbyDriversMapProps) {
  if (!drivers.length) {
    return (
      <div className={cn('flex items-center justify-center rounded-md border', className)} style={{ height }}>
        <p className="text-sm text-muted-foreground">No drivers nearby</p>
      </div>
    )
  }

  const center: [number, number] = [drivers[0].lat, drivers[0].lng]

  return (
    <div className={cn('rounded-md overflow-hidden border', className)} style={{ height }}>
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {drivers.map((driver) => (
          <Marker key={driver.driverId} position={[driver.lat, driver.lng]}>
            <Popup>
              <div className="text-sm">
                <p>Driver {driver.driverId.slice(0, 8)}</p>
                {driver.status && <p className="text-muted-foreground">{driver.status}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
