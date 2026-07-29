import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OrderTable } from '@/components/orders/OrderTable'
import { SearchInput } from '@/components/shared/SearchInput'
import { StatusFilter } from '@/components/shared/StatusFilter'
import { Pagination } from '@/components/shared/Pagination'
import { useMyOrders } from '@/hooks/queries/useOrderQueries'
import { ORDER_STATUS_LABELS } from '@/lib/constants'
import type { OrderStatus } from '@/types/order'

const statusOptions = [
  { value: 'all' as const, label: 'All' },
  ...Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value: value as OrderStatus | 'all', label })),
]

export default function MyOrdersPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<OrderStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const { data, isLoading } = useMyOrders({ page, limit: 10 })

  const orders = data?.data || []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Orders</h1>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder="Search orders..." className="w-full sm:w-72" />
      </div>
      <StatusFilter options={statusOptions} value={status} onChange={(v) => { setStatus(v); setPage(1) }} />
      <OrderTable
        orders={orders}
        onRowClick={(order) => navigate(`/orders/${order._id}`)}
        isLoading={isLoading}
      />
      {data?.pagination && (
        <Pagination
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
