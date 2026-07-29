import { DataTable } from '@/components/shared/DataTable'
import { OrderStatusBadge } from './OrderStatusBadge'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import type { IOrder } from '@/types/order'

interface OrderTableProps {
  orders: IOrder[]
  onRowClick?: (order: IOrder) => void
  isLoading?: boolean
}

export function OrderTable({ orders, onRowClick, isLoading }: OrderTableProps) {
  const columns = [
    { key: 'orderId', header: 'Order ID', sortable: true },
    { key: 'status', header: 'Status', render: (o: IOrder) => <OrderStatusBadge status={o.status} /> },
    { key: 'pickupLocation', header: 'Pickup', render: (o: IOrder) => o.pickupLocation.address },
    { key: 'deliveryLocation', header: 'Delivery', render: (o: IOrder) => o.deliveryLocation.address },
    { key: 'pricing', header: 'Total', sortable: true, render: (o: IOrder) => formatCurrency(o.pricing.total) },
    { key: 'createdAt', header: 'Date', sortable: true, render: (o: IOrder) => formatDateTime(o.createdAt) },
  ]

  return (
    <DataTable
      columns={columns}
      data={orders}
      keyExtractor={(o) => o._id}
      onRowClick={onRowClick}
      isLoading={isLoading}
    />
  )
}
