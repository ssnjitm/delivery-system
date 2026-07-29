import { Check, Clock, Loader2 } from 'lucide-react'
import { ORDER_STATUS_SEQUENCE } from '@/lib/constants'
import { ORDER_STATUS_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types/order'

interface TrackingTimelineProps {
  currentStatus: OrderStatus
  className?: string
}

export function TrackingTimeline({ currentStatus, className }: TrackingTimelineProps) {
  const currentIndex = ORDER_STATUS_SEQUENCE.indexOf(currentStatus)

  const visibleStatuses = ORDER_STATUS_SEQUENCE.slice(
    0,
    ORDER_STATUS_SEQUENCE.indexOf(currentStatus) + 2
  )

  return (
    <div className={cn('space-y-3', className)}>
      {visibleStatuses.map((status, i) => {
        const isCompleted = i <= currentIndex
        const isCurrent = i === currentIndex
        const isPending = i > currentIndex

        return (
          <div key={status} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full',
                  isCompleted && 'bg-green-100 text-green-700',
                  isCurrent && 'bg-primary text-primary-foreground',
                  isPending && 'bg-muted text-muted-foreground'
                )}
              >
                {isCompleted && !isCurrent ? <Check className="h-3 w-3" /> : null}
                {isCurrent && <Loader2 className="h-3 w-3 animate-spin" />}
                {isPending && <Clock className="h-3 w-3" />}
              </div>
              {i < visibleStatuses.length - 1 && (
                <div
                  className={cn(
                    'mt-1 h-8 w-px',
                    isCompleted && !isCurrent ? 'bg-green-300' : 'bg-border'
                  )}
                />
              )}
            </div>
            <div className="pb-4">
              <p
                className={cn(
                  'text-sm font-medium',
                  isCurrent && 'text-primary',
                  isCompleted && !isCurrent && 'text-green-700',
                  isPending && 'text-muted-foreground'
                )}
              >
                {ORDER_STATUS_LABELS[status]}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
