import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { Route, Package } from 'lucide-react'
import type { BatchGroup } from '@/types/dispatch'

interface BatchSuggestionsProps {
  suggestions: BatchGroup[]
  onAccept: (groupId: string) => void
  loading?: boolean
}

export function BatchSuggestions({ suggestions, onAccept, loading }: BatchSuggestionsProps) {
  if (!suggestions.length) return null

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Batch Suggestions</h3>
      {suggestions.map((group) => (
        <Card key={group._id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Route className="h-4 w-4" />
              Batch Route
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span>{group.orders.length} orders</span>
            </div>
            <p className="text-sm">
              Total Distance: <span className="font-medium">{group.totalDistance.toFixed(1)} km</span>
            </p>
            <p className="text-sm">
              Total Earnings: <span className="font-semibold">{formatCurrency(group.totalEarnings)}</span>
            </p>
            <div className="space-y-1">
              {group.route.stops.map((stop, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className={`h-2 w-2 rounded-full ${stop.type === 'pickup' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span>{stop.type === 'pickup' ? 'Pickup' : 'Delivery'} - Order {stop.order.slice(0, 8)}</span>
                </div>
              ))}
            </div>
            <Button size="sm" className="w-full" onClick={() => onAccept(group._id)} disabled={loading}>
              Accept Batch
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
