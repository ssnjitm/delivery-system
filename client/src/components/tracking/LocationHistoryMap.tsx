import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet'
import { cn } from '@/lib/utils'
import type { DriverLocation } from '@/types/tracking'
import 'leaflet/dist/leaflet.css'

interface LocationHistoryMapProps {
  locations: DriverLocation[]
  height?: string
  className?: string
}

export function LocationHistoryMap({ locations, height = '400px', className }: LocationHistoryMapProps) {
  if (!locations.length) {
    return (
      <div className={cn('flex items-center justify-center rounded-md border', className)} style={{ height }}>
        <p className="text-sm text-muted-foreground">No location history available</p>
      </div>
    )
  }

  const points: [number, number][] = locations
    .map((l) => l.location?.coordinates as [number, number] | undefined)
    .filter((c): c is [number, number] => Boolean(c))
    .map((c) => [c[1], c[0]])
  if (!points.length) {
    return (
      <div className={cn('flex items-center justify-center rounded-md border', className)} style={{ height }}>
        <p className="text-sm text-muted-foreground">No location history available</p>
      </div>
    )
  }
  const center = points[0]
  const lastPoint = points[points.length - 1]

  return (
    <div className={cn('rounded-md overflow-hidden border', className)} style={{ height }}>
      <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline positions={points} color="#3b82f6" />
        <Marker position={lastPoint} />
      </MapContainer>
    </div>
  )
}
