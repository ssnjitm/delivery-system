import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { AlertTriangle } from 'lucide-react'
import type { Dispute } from '@/types/admin'

interface DisputeCardProps {
  dispute: Dispute
  onClick?: () => void
}

export function DisputeCard({ dispute, onClick }: DisputeCardProps) {
  const statusColors: Record<string, string> = {
    OPEN: 'bg-red-100 text-red-800',
    INVESTIGATING: 'bg-yellow-100 text-yellow-800',
    RESOLVED: 'bg-green-100 text-green-800',
    DISMISSED: 'bg-gray-100 text-gray-800',
  }

  return (
    <Card className={onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span className="font-semibold">{dispute.subject}</span>
          </div>
          <Badge className={statusColors[dispute.status]}>{dispute.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <p className="text-muted-foreground">{dispute.description.slice(0, 100)}...</p>
        <p>Order: {typeof dispute.order === 'object' ? dispute.order.orderId : dispute.order}</p>
        <p className="text-xs text-muted-foreground">Raised {formatDate(dispute.createdAt)}</p>
      </CardContent>
    </Card>
  )
}
