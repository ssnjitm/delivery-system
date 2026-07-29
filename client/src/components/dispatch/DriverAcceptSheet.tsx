import { Sheet, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { DispatchRequestCard } from './DispatchRequestCard'
import type { DispatchRequest } from '@/types/dispatch'

interface DriverAcceptSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  request: DispatchRequest | null
  onAccept: () => void
  onReject: () => void
  loading?: boolean
}

export function DriverAcceptSheet({ open, onOpenChange, request, onAccept, onReject, loading }: DriverAcceptSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetHeader>
          <SheetTitle>New Dispatch Request</SheetTitle>
          <p className="text-sm text-muted-foreground">A new delivery is available for you</p>
        </SheetHeader>
        <div className="mt-4">
          {request && (
            <DispatchRequestCard
              request={request}
              onAccept={onAccept}
              onReject={onReject}
              loading={loading}
            />
          )}
        </div>
    </Sheet>
  )
}
