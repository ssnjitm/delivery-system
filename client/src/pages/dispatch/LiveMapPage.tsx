import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useAllDriversLocation } from '@/hooks/queries/useTrackingQueries'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import 'leaflet/dist/leaflet.css'

export default function LiveMapPage() {
  const { data: drivers, isLoading, refetch } = useAllDriversLocation()

  if (isLoading) return <LoadingSpinner size="lg" className="py-12" />

  const center: [number, number] = drivers?.length ? [drivers[0].lat, drivers[0].lng] : [27.7172, 85.324]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Live Map</h1>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Driver Locations</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="h-[600px] rounded-md overflow-hidden">
            <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {drivers?.map((driver) => (
                <Marker key={driver.driverId} position={[driver.lat, driver.lng]}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-medium">Driver {driver.driverId.slice(0, 8)}</p>
                      <p className="text-muted-foreground">Status: {driver.status}</p>
                      {driver.speed && <p className="text-muted-foreground">Speed: {driver.speed.toFixed(1)} km/h</p>}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Active Drivers ({drivers?.length || 0})</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {drivers?.map((driver) => (
              <div key={driver.driverId} className="flex items-center justify-between rounded-md border p-2">
                <span className="text-sm font-medium">Driver {driver.driverId.slice(0, 8)}</span>
                <span className="text-xs text-muted-foreground">
                  {driver.lat.toFixed(4)}, {driver.lng.toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
