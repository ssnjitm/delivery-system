import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import { cn } from '@/lib/utils'
import 'leaflet/dist/leaflet.css'

interface MapPickerProps {
  position: [number, number] | null
  onChange: (pos: [number, number]) => void
  height?: string
  className?: string
}

function ClickHandler({ onChange }: { onChange: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      onChange([e.latlng.lat, e.latlng.lng])
    },
  })
  return null
}

function SetViewOnMount({ position }: { position: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(position, map.getZoom())
  }, [position, map])
  return null
}

export function MapPicker({ position, onChange, height = '300px', className }: MapPickerProps) {
  const defaultPos: [number, number] = position || [27.7172, 85.324]

  return (
    <div className={cn('rounded-md overflow-hidden border', className)} style={{ height }}>
      <MapContainer
        center={defaultPos}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onChange={onChange} />
        {position && <Marker position={position} />}
        <SetViewOnMount position={defaultPos} />
      </MapContainer>
    </div>
  )
}
