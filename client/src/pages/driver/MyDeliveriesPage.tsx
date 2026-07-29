import { useNavigate } from 'react-router-dom'
import { OrderTable } from '@/components/orders/OrderTable'
import { useMyOrders } from '@/hooks/queries/useOrderQueries'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'

export default function MyDeliveriesPage() {
  const navigate = useNavigate()
  const { data, isLoading, error, refetch } = useMyOrders({ limit: 50 })

  if (isLoading) return <LoadingSpinner size="lg" className="py-12" />
  if (error) return <ErrorState error={error as Error} onRetry={refetch} />

  const orders = data?.data || []

  if (!orders.length) {
    return <EmptyState message="No deliveries yet" description="Accept orders to see them here" />
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Deliveries</h1>
      <OrderTable orders={orders} onRowClick={(order) => navigate(`/deliveries/${order._id}`)} />
    </div>
  )
}
