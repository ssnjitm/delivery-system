import { useParams, useNavigate } from 'react-router-dom'
import { useDisputeDetail, useUpdateDisputeStatus } from '@/hooks/queries/useAdminQueries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function DisputeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, error, refetch } = useDisputeDetail(id!)
  const updateStatus = useUpdateDisputeStatus()

  if (isLoading) return <LoadingSpinner size="lg" className="py-12" />
  if (error) return <ErrorState error={error as Error} onRetry={refetch} />
  if (!data?.dispute) return <ErrorState message="Dispute not found" />

  const dispute = data.dispute
  const raisedByName = typeof dispute.raisedBy === 'object' ? dispute.raisedBy.name : 'Unknown'
  const orderId = typeof dispute.order === 'object' ? dispute.order.orderId : dispute.order

  const nextStatus: Record<string, string> = {
    OPEN: 'INVESTIGATING',
    INVESTIGATING: 'RESOLVED',
    RESOLVED: 'DISMISSED',
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{dispute.subject}</CardTitle>
            <Badge>{dispute.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">{dispute.description}</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Raised by:</span> {raisedByName}
            </div>
            <div>
              <span className="text-muted-foreground">Order:</span> {orderId}
            </div>
            <div>
              <span className="text-muted-foreground">Date:</span> {formatDate(dispute.createdAt)}
            </div>
            {dispute.resolution && (
              <div className="col-span-2">
                <span className="text-muted-foreground">Resolution:</span> {dispute.resolution}
              </div>
            )}
          </div>
          {dispute.status !== 'DISMISSED' && (
            <Button
              onClick={() => updateStatus.mutate({ disputeId: id!, status: nextStatus[dispute.status] })}
              disabled={updateStatus.isPending}
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Move to {nextStatus[dispute.status]}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
