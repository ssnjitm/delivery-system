import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { OrderStatusBadge } from './OrderStatusBadge'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { MapPin, Package } from 'lucide-react'
import type { IOrder } from '@/types/order'

interface OrderCardProps {
  order: IOrder
  onClick?: () => void
}

export function OrderCard({ order, onClick }: OrderCardProps) {
  return (
    <Card className={onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-mono text-muted-foreground">#{order.orderId}</span>
          <OrderStatusBadge status={order.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
          <span className="text-muted-foreground">{order.pickupLocation.address}</span>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <span className="text-muted-foreground">{order.deliveryLocation.address}</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
          </div>
          <span className="font-semibold">{formatCurrency(order.pricing.total)}</span>
        </div>
        <p className="text-xs text-muted-foreground">{formatDateTime(order.createdAt)}</p>
      </CardContent>
    </Card>
  )
}
