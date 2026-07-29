import { useNavigate } from 'react-router-dom'
import { CreateOrderForm } from '@/components/orders/CreateOrderForm'
import { useCreateOrder } from '@/hooks/queries/useOrderQueries'
import type { CreateOrderPayload } from '@/types/order'

export default function VendorCreateOrderPage() {
  const navigate = useNavigate()
  const createOrder = useCreateOrder()

  const handleSubmit = async (data: CreateOrderPayload) => {
    const result = await createOrder.mutateAsync(data)
    navigate(`/orders/${result.order._id}`)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Create Order</h1>
      <CreateOrderForm onSubmit={handleSubmit} isSubmitting={createOrder.isPending} />
    </div>
  )
}
