import { Button } from '@/components/ui/button'
import { useProcessRetryQueue } from '@/hooks/queries/useDispatchQueries'
import { usePendingDispatchRequests } from '@/hooks/queries/useDispatchQueries'
import { DispatchRequestCard } from '@/components/dispatch/DispatchRequestCard'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { RefreshCw } from 'lucide-react'

export default function QueuePage() {
  const { data: requests, isLoading, refetch } = usePendingDispatchRequests()
  const processQueue = useProcessRetryQueue()

  if (isLoading) return <LoadingSpinner size="lg" className="py-12" />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dispatch Queue</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => processQueue.mutate()} disabled={processQueue.isPending}>
            Process Retry Queue
          </Button>
        </div>
      </div>

      {!requests?.length ? (
        <EmptyState message="Queue is empty" description="No pending dispatch requests" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {requests.map((req) => (
            <DispatchRequestCard key={req._id} request={req} />
          ))}
        </div>
      )}
    </div>
  )
}
