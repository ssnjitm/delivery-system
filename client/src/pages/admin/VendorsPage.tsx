import { useAllVendors, useApproveVendor, useRejectVendor, useBulkApproveVendors } from '@/hooks/queries/useAdminQueries'
import { VendorCard } from '@/components/users/VendorCard'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { CheckSquare } from 'lucide-react'
import { useState } from 'react'

export default function VendorsPage() {
  const { data: vendors, isLoading, error, refetch } = useAllVendors()
  const approveVendor = useApproveVendor()
  const rejectVendor = useRejectVendor()
  const bulkApprove = useBulkApproveVendors()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  if (isLoading) return <LoadingSpinner size="lg" className="py-12" />
  if (error) return <ErrorState error={error as Error} onRetry={refetch} />

  const pendingVendors = vendors?.filter((v) => !v.isApproved) || []
  const approvedVendors = vendors?.filter((v) => v.isApproved) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vendors</h1>
        {pendingVendors.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => bulkApprove.mutateAsync(pendingVendors.map((v) => v._id))}>
            <CheckSquare className="mr-2 h-4 w-4" />
            Approve All Pending
          </Button>
        )}
      </div>

      <h2 className="text-lg font-semibold">Pending Approval ({pendingVendors.length})</h2>
      {pendingVendors.length === 0 ? (
        <EmptyState message="No pending vendors" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pendingVendors.map((v) => (
            <VendorCard
              key={v._id}
              vendor={v}
              onApprove={async () => { setLoadingId(v._id); await approveVendor.mutateAsync(v._id); setLoadingId(null) }}
              onReject={async () => { setLoadingId(v._id); await rejectVendor.mutateAsync(v._id); setLoadingId(null) }}
              loading={loadingId === v._id}
            />
          ))}
        </div>
      )}

      <h2 className="text-lg font-semibold">Approved ({approvedVendors.length})</h2>
      {approvedVendors.length === 0 ? (
        <EmptyState message="No approved vendors" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {approvedVendors.map((v) => (
            <VendorCard key={v._id} vendor={v} />
          ))}
        </div>
      )}
    </div>
  )
}
