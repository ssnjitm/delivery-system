import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useAllDriversLocation } from '@/hooks/queries/useTrackingQueries'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { DriverLocation } from '@/types/tracking'
import 'leaflet/dist/leaflet.css'

function lat(d: DriverLocation): number {
  return d.location?.coordinates?.[1] ?? 0
}

function lng(d: DriverLocation): number {
  return d.location?.coordinates?.[0] ?? 0
}

export default function LiveMapPage() {
  const { data: drivers, isLoading, refetch } = useAllDriversLocation()

  if (isLoading) return <LoadingSpinner size="lg" className="py-12" />

  const list: DriverLocation[] = Array.isArray(drivers) ? (drivers as DriverLocation[]) : []
  const center: [number, number] = list.length ? [lat(list[0]), lng(list[0])] : [27.7172, 85.324]

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
              {list.map((driver) => (
                <Marker key={driver.driverId} position={[lat(driver), lng(driver)]}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-medium">{driver.driverName || `Driver ${driver.driverId?.slice(0, 8)}`}</p>
                      <p className="text-muted-foreground">
                        Status: {driver.isOnline ? 'Online' : 'Offline'}
                      </p>
                      {typeof driver.speed !== 'undefined' && (
                        <p className="text-muted-foreground">Speed: {driver.speed.toFixed(1)} m/s</p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Active Drivers ({list.length})</CardTitle></CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active driver locations to display.</p>
          ) : (
            <div className="space-y-2">
              {list.map((driver) => (
                <div key={driver.driverId} className="flex items-center justify-between rounded-md border p-2">
                  <span className="text-sm font-medium">
                    {driver.driverName || `Driver ${driver.driverId?.slice(0, 8)}`}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {lat(driver).toFixed(4)}, {lng(driver).toFixed(4)}
                    </span>
                    <Badge variant={driver.isOnline ? 'default' : 'secondary'}>
                      {driver.isOnline ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
