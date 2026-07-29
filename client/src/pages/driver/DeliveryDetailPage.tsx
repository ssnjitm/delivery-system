import { useParams, useNavigate } from 'react-router-dom'
import { OrderDetail } from '@/components/orders/OrderDetail'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { useOrderDetail, useUpdateOrderStatus, useCollectCOD } from '@/hooks/queries/useOrderQueries'
import { ArrowLeft, Navigation, CheckCircle2, DollarSign } from 'lucide-react'

const statusActions: Array<{ from: string[]; next: string; label: string; icon: typeof CheckCircle2 }> = [
  { from: ['DRIVER_ASSIGNED'], next: 'DRIVER_ARRIVING', label: 'Arrived at Pickup', icon: CheckCircle2 },
  { from: ['DRIVER_ARRIVING'], next: 'PICKED_UP', label: 'Mark Picked Up', icon: CheckCircle2 },
  { from: ['ON_THE_WAY'], next: 'NEAR_DESTINATION', label: 'Near Destination', icon: Navigation },
  { from: ['NEAR_DESTINATION'], next: 'DELIVERED', label: 'Mark Delivered', icon: CheckCircle2 },
]

export default function DeliveryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, error, refetch } = useOrderDetail(id!)
  const updateStatus = useUpdateOrderStatus()
  const collectCOD = useCollectCOD()

  if (isLoading) return <LoadingSpinner size="lg" className="py-12" />
  if (error) return <ErrorState error={error as Error} onRetry={refetch} />
  if (!data?.order) return <ErrorState message="Delivery not found" />

  const order = data.order

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button variant="outline" onClick={() => navigate(`/deliveries/${id}/navigate`)}>
          <Navigation className="mr-2 h-4 w-4" />
          Navigate
        </Button>
      </div>

      <OrderDetail order={order} />

      <div className="space-y-3">
        {statusActions
          .filter((action) => action.from.includes(order.status))
          .map((action) => (
            <Button
              key={action.next}
              className="w-full"
              onClick={() => updateStatus.mutate({ id: id!, status: action.next })}
              disabled={updateStatus.isPending}
            >
              <action.icon className="mr-2 h-4 w-4" />
              {updateStatus.isPending ? 'Updating...' : action.label}
            </Button>
          ))}

        {order.status === 'DELIVERED' && order.isCOD && !order.statusHistory.some((h) => h.status === 'COD_COLLECTED') && (
          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={() => collectCOD.mutate(id!)}
            disabled={collectCOD.isPending}
          >
            <DollarSign className="mr-2 h-4 w-4" />
            {collectCOD.isPending ? 'Collecting...' : `Collect COD (PKR ${order.codAmount || 0})`}
          </Button>
        )}
      </div>
    </div>
  )
}
