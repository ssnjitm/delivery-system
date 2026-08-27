import { useParams, useNavigate } from 'react-router-dom'
import { useOrderDetail } from '@/hooks/queries/useOrderQueries'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useUpdateLocation } from '@/hooks/queries/useTrackingQueries'
import { OrderTrackingMap } from '@/components/tracking/OrderTrackingMap'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Navigation, MapPin } from 'lucide-react'
import { useEffect } from 'react'

export default function NavigatePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, error } = useOrderDetail(id!)
  const { latitude, longitude, startWatching, stopWatching } = useGeolocation()
  const updateLocation = useUpdateLocation()

  useEffect(() => {
    startWatching()
    return () => stopWatching()
  }, [startWatching, stopWatching])

  useEffect(() => {
    if (latitude && longitude) {
      const interval = setInterval(() => {
        updateLocation.mutate({ coordinates: [longitude, latitude] })
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [latitude, longitude, updateLocation])

  if (isLoading) return <LoadingSpinner size="lg" className="py-12" />
  if (error) return <ErrorState error={error as Error} />
  if (!data?.order) return <ErrorState message="Delivery not found" />

  const order = data.order

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <h1 className="text-2xl font-bold">Navigate</h1>

      <OrderTrackingMap order={order} height="500px" />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Your Location</CardTitle></CardHeader>
          <CardContent>
            {latitude && longitude ? (
              <p className="text-sm">
                <MapPin className="inline h-4 w-4 mr-1" />
                {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Acquiring location...</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Button
              size="sm"
              className="w-full"
              onClick={() => {
                const url = `https://www.google.com/maps/dir/?api=1&destination=${order.deliveryLocation.coordinates[1]},${order.deliveryLocation.coordinates[0]}`
                window.open(url, '_blank')
              }}
            >
              <Navigation className="mr-2 h-4 w-4" />
              Open in Google Maps
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
