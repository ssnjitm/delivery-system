import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Navigation } from 'lucide-react'
import { useNearbyDrivers } from '@/hooks/queries/useTrackingQueries'

interface DriverSearchPanelProps {
  onAssign: (driverId: string) => void
}

export function DriverSearchPanel({ onAssign }: DriverSearchPanelProps) {
  const [radius, setRadius] = useState('5')
  const { data: nearbyDrivers, isLoading } = useNearbyDrivers({
    radius: Number(radius) * 1000,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Find Driver</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Label htmlFor="radius">Search Radius (km)</Label>
            <Input
              id="radius"
              type="number"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              placeholder="5"
            />
          </div>
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Searching for drivers...</p>}

        {nearbyDrivers && nearbyDrivers.length === 0 && (
          <p className="text-sm text-muted-foreground">No drivers found nearby</p>
        )}

        {nearbyDrivers?.map((driver) => (
          <div key={driver.driverId} className="flex items-center justify-between rounded-md border p-3">
            <div>
              <p className="text-sm font-medium">Driver {driver.driverId.slice(0, 8)}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Navigation className="h-3 w-3" />
                {driver.lat.toFixed(4)}, {driver.lng.toFixed(4)}
              </p>
            </div>
            <Button size="sm" onClick={() => onAssign(driver.driverId)}>
              Assign
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
