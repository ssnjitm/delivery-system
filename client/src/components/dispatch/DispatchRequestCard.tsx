import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Clock, MapPin } from 'lucide-react'
import type { DispatchRequest } from '@/types/dispatch'

interface DispatchRequestCardProps {
  request: DispatchRequest
  onAccept?: () => void
  onReject?: () => void
  loading?: boolean
}

export function DispatchRequestCard({ request, onAccept, onReject, loading }: DispatchRequestCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-mono text-muted-foreground">Request #{request._id.slice(0, 8)}</span>
          <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
            {request.status}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {request.distance && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{request.distance.toFixed(1)} km</span>
          </div>
        )}
        {request.estimatedEarnings && (
          <p className="text-sm">
            Estimated Earnings: <span className="font-semibold">{formatCurrency(request.estimatedEarnings)}</span>
          </p>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          Expires: {formatDateTime(request.expiresAt)}
        </div>
        <div className="flex gap-2">
          {onAccept && (
            <Button size="sm" className="flex-1" onClick={onAccept} disabled={loading}>
              Accept
            </Button>
          )}
          {onReject && (
            <Button size="sm" variant="outline" className="flex-1" onClick={onReject} disabled={loading}>
              Reject
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
