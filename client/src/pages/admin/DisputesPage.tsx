import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDisputes } from '@/hooks/queries/useAdminQueries'
import { DisputeCard } from '@/components/admin/DisputeCard'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'

export default function DisputesPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const { data, isLoading, error, refetch } = useDisputes({ page, limit: 20 })

  if (isLoading) return <LoadingSpinner size="lg" className="py-12" />
  if (error) return <ErrorState error={error as Error} onRetry={refetch} />

  const disputes = data?.data || []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Disputes</h1>
      {!disputes.length ? (
        <EmptyState message="No disputes" description="All clear!" />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {disputes.map((dispute) => (
              <DisputeCard
                key={dispute._id}
                dispute={dispute}
                onClick={() => navigate(`/admin/disputes/${dispute._id}`)}
              />
            ))}
          </div>
          {data?.pagination && (
            <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  )
}
