import { useParams, useNavigate } from 'react-router-dom'
import { useOrderDetail } from '@/hooks/queries/useOrderQueries'
import { useTrackOrder } from '@/hooks/queries/useTrackingQueries'
import { OrderTrackingMap } from '@/components/tracking/OrderTrackingMap'
import { TrackingTimeline } from '@/components/tracking/TrackingTimeline'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Clock, Navigation } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function VendorTrackOrderPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: orderData, isLoading: orderLoading, error: orderError } = useOrderDetail(id!)
  const { data: trackingData } = useTrackOrder(id!)

  if (orderLoading) return <LoadingSpinner size="lg" className="py-12" />
  if (orderError) return <ErrorState error={orderError as Error} />
  if (!orderData?.order) return <ErrorState message="Order not found" />

  const order = orderData.order

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <h1 className="text-2xl font-bold">Track Order #{order.orderId}</h1>
      <OrderTrackingMap order={order} driverLocation={trackingData?.driver || null} height="400px" />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Status Timeline</CardTitle></CardHeader>
          <CardContent><TrackingTimeline currentStatus={order.status} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Delivery Info</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{trackingData?.estimatedArrivalTime ? `ETA: ${new Date(trackingData.estimatedArrivalTime).toLocaleTimeString()}` : 'Calculating ETA...'}</span>
            </div>
            {trackingData && trackingData.distanceToDestination != null && (
              <div className="flex items-center gap-2 text-sm">
                <Navigation className="h-4 w-4 text-muted-foreground" />
                <span>{(trackingData.distanceToDestination / 1000).toFixed(1)} km</span>
              </div>
            )}
            <div className="text-sm">
              <p className="text-muted-foreground">Total: {formatCurrency(order.pricing.total)}</p>
              {order.isCOD && <p className="text-yellow-600">COD: {formatCurrency(order.codAmount || 0)}</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
