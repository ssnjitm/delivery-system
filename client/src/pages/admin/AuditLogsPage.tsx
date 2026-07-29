import { useState } from 'react'
import { useAuditLogs } from '@/hooks/queries/useAdminQueries'
import { AuditLogTable } from '@/components/admin/AuditLogTable'
import { Pagination } from '@/components/shared/Pagination'
import { SearchInput } from '@/components/shared/SearchInput'
import { ErrorState } from '@/components/shared/ErrorState'

export default function AuditLogsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { data, isLoading, error, refetch } = useAuditLogs({ page, limit: 20 })

  if (error) return <ErrorState error={error as Error} onRetry={refetch} />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Audit Logs</h1>
      <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Search logs..." className="w-full sm:w-72" />
      <AuditLogTable logs={data?.data || []} isLoading={isLoading} />
      {data?.pagination && (
        <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onPageChange={setPage} />
      )}
    </div>
  )
}
