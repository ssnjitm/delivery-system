import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserTable } from '@/components/users/UserTable'
import { SearchInput } from '@/components/shared/SearchInput'
import { Pagination } from '@/components/shared/Pagination'
import { useAdminUsers } from '@/hooks/queries/useAdminQueries'
import { ErrorState } from '@/components/shared/ErrorState'

export default function UsersPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { data, isLoading, error, refetch } = useAdminUsers({ page, limit: 20, search })

  if (error) return <ErrorState error={error as Error} onRetry={refetch} />

  const users = data?.data || []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Users</h1>
      <div className="flex items-center gap-4">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Search users..." className="w-full sm:w-72" />
      </div>
      <UserTable users={users} onRowClick={(user) => navigate(`/admin/users/${user._id}`)} isLoading={isLoading} />
      {data?.pagination && (
        <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onPageChange={setPage} />
      )}
    </div>
  )
}
