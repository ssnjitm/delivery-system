import { useParams, useNavigate } from 'react-router-dom'
import { OrderDetail } from '@/components/orders/OrderDetail'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { useOrderDetail, useCancelOrder } from '@/hooks/queries/useOrderQueries'
import { CancelOrderDialog } from '@/components/orders/CancelOrderDialog'
import { useState } from 'react'
import { ArrowLeft, MapPin } from 'lucide-react'

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, error, refetch } = useOrderDetail(id!)
  const cancelOrder = useCancelOrder()
  const [cancelOpen, setCancelOpen] = useState(false)

  if (isLoading) return <LoadingSpinner size="lg" className="py-12" />
  if (error) return <ErrorState error={error as Error} onRetry={refetch} />
  if (!data?.order) return <ErrorState message="Order not found" />

  const order = data.order
  const canCancel = ['PENDING', 'WAITING_FOR_DRIVER', 'DRIVER_ASSIGNED'].includes(order.status)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          {['DRIVER_ASSIGNED', 'DRIVER_ARRIVING', 'PICKED_UP', 'ON_THE_WAY', 'NEAR_DESTINATION'].includes(order.status) && (
            <Button variant="outline" onClick={() => navigate(`/orders/${id}/track`)}>
              <MapPin className="mr-2 h-4 w-4" />
              Track
            </Button>
          )}
          {canCancel && (
            <Button variant="destructive" onClick={() => setCancelOpen(true)}>
              Cancel Order
            </Button>
          )}
        </div>
      </div>
      <OrderDetail order={order} />
      <CancelOrderDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onConfirm={async () => {
          await cancelOrder.mutateAsync(id!)
          setCancelOpen(false)
        }}
        loading={cancelOrder.isPending}
      />
    </div>
  )
}
