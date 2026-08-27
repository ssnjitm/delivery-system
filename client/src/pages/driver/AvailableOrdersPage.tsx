import { useState } from 'react'
import { useAcceptDispatch, useRejectDispatch, usePendingDispatchRequests } from '@/hooks/queries/useDispatchQueries'
import { DispatchRequestCard } from '@/components/dispatch/DispatchRequestCard'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { useNavigate } from 'react-router-dom'

export default function AvailableOrdersPage() {
  const navigate = useNavigate()
  const { data: requests, isLoading, error, refetch } = usePendingDispatchRequests()
  const acceptDispatch = useAcceptDispatch()
  const rejectDispatch = useRejectDispatch()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleAccept = async (requestId: string) => {
    setLoadingId(requestId)
    try {
      await acceptDispatch.mutateAsync(requestId)
      navigate('/deliveries')
    } finally {
      setLoadingId(null)
    }
  }

  const handleReject = async (requestId: string) => {
    setLoadingId(requestId)
    try {
      await rejectDispatch.mutateAsync(requestId)
    } finally {
      setLoadingId(null)
    }
  }

  if (isLoading) return <LoadingSpinner size="lg" className="py-12" />
  if (error) return <ErrorState error={error as Error} onRetry={refetch} />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Available Orders</h1>
      {!requests?.length ? (
        <EmptyState message="No available orders" description="Check back later for new dispatch requests" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {requests.map((req) => (
            <DispatchRequestCard
              key={req.id}
              request={req}
              onAccept={() => handleAccept(req.id)}
              onReject={() => handleReject(req.id)}
              loading={loadingId === req.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
