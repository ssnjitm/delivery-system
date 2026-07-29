import { useAllDrivers, useVerifyDriver, useRejectDriver, useBulkVerifyDrivers } from '@/hooks/queries/useAdminQueries'
import { DriverCard } from '@/components/users/DriverCard'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { CheckSquare } from 'lucide-react'
import { useState } from 'react'

export default function DriversPage() {
  const { data: drivers, isLoading, error, refetch } = useAllDrivers()
  const verifyDriver = useVerifyDriver()
  const rejectDriver = useRejectDriver()
  const bulkVerify = useBulkVerifyDrivers()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  if (isLoading) return <LoadingSpinner size="lg" className="py-12" />
  if (error) return <ErrorState error={error as Error} onRetry={refetch} />

  const pendingDrivers = drivers?.filter((d) => !d.isVerified) || []
  const verifiedDrivers = drivers?.filter((d) => d.isVerified) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Drivers</h1>
        {pendingDrivers.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => bulkVerify.mutateAsync(pendingDrivers.map((d) => d._id))}>
            <CheckSquare className="mr-2 h-4 w-4" />
            Verify All Pending
          </Button>
        )}
      </div>

      <h2 className="text-lg font-semibold">Pending Verification ({pendingDrivers.length})</h2>
      {pendingDrivers.length === 0 ? (
        <EmptyState message="No pending drivers" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pendingDrivers.map((d) => (
            <DriverCard
              key={d._id}
              driver={d}
              onVerify={async () => { setLoadingId(d._id); await verifyDriver.mutateAsync(d._id); setLoadingId(null) }}
              onReject={async () => { setLoadingId(d._id); await rejectDriver.mutateAsync(d._id); setLoadingId(null) }}
              loading={loadingId === d._id}
            />
          ))}
        </div>
      )}

      <h2 className="text-lg font-semibold">Verified ({verifiedDrivers.length})</h2>
      {verifiedDrivers.length === 0 ? (
        <EmptyState message="No verified drivers" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {verifiedDrivers.map((d) => (
            <DriverCard key={d._id} driver={d} />
          ))}
        </div>
      )}
    </div>
  )
}
