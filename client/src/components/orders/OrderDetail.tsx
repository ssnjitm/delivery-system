import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OrderStatusBadge } from './OrderStatusBadge'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { MapPin, Package, User, Phone, Clock } from 'lucide-react'
import type { IOrder } from '@/types/order'

interface OrderDetailProps {
  order: IOrder
}

export function OrderDetail({ order }: OrderDetailProps) {
  const customerName = typeof order.customer === 'object' ? order.customer.name : 'N/A'
  const driverName = typeof order.driver === 'object' ? order.driver.name : undefined
  const driverPhone = typeof order.driver === 'object' ? order.driver.phone : undefined

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Order #{order.orderId}</CardTitle>
            <OrderStatusBadge status={order.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Pickup Location</h4>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                <span>{order.pickupLocation.address}</span>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Delivery Location</h4>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <span>{order.deliveryLocation.address}</span>
              </div>
            </div>
          </div>

          {order.packageDetails.description && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground">Package Details</h4>
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4" />
                {order.packageDetails.description}
                {order.packageDetails.weight && <span>({order.packageDetails.weight} kg)</span>}
              </div>
            </div>
          )}

          <div className="space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground">Items</h4>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-3 py-2 text-left">Item</th>
                    <th className="px-3 py-2 text-right">Qty</th>
                    <th className="px-3 py-2 text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="px-3 py-2">{item.name}</td>
                      <td className="px-3 py-2 text-right">{item.quantity}</td>
                      <td className="px-3 py-2 text-right">{item.price ? formatCurrency(item.price) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Customer</h4>
              <div className="mt-1 flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                {customerName}
              </div>
            </div>
            {driverName && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Driver</h4>
                <div className="mt-1 space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {driverName}
                  </div>
                  {driverPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {driverPhone}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground">Pricing</h4>
            <div className="rounded-md border p-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Base Price</span>
                <span>{formatCurrency(order.pricing.basePrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Distance</span>
                <span>{formatCurrency(order.pricing.distancePrice)}</span>
              </div>
              {order.pricing.weightPrice && (
                <div className="flex justify-between">
                  <span>Weight</span>
                  <span>{formatCurrency(order.pricing.weightPrice)}</span>
                </div>
              )}
              {order.pricing.discount && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.pricing.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold border-t pt-1">
                <span>Total</span>
                <span>{formatCurrency(order.pricing.total)}</span>
              </div>
            </div>
          </div>

          {order.isCOD && (
            <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
              Cash on Delivery: {formatCurrency(order.codAmount || 0)}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {order.statusHistory.map((entry, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  {i < order.statusHistory.length - 1 && <div className="w-px flex-1 bg-border" />}
                </div>
                <div className="pb-3">
                  <div className="flex items-center gap-2">
                    <OrderStatusBadge status={entry.status} />
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDateTime(entry.timestamp)}
                    </span>
                  </div>
                  {entry.note && <p className="mt-1 text-sm text-muted-foreground">{entry.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
