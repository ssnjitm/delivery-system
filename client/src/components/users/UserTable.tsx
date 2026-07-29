import { DataTable } from '@/components/shared/DataTable'
import { Badge } from '@/components/ui/badge'
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import type { IUser } from '@/types/user'

interface UserTableProps {
  users: IUser[]
  onRowClick?: (user: IUser) => void
  isLoading?: boolean
}

export function UserTable({ users, onRowClick, isLoading }: UserTableProps) {
  const columns = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'phone', header: 'Phone', sortable: true },
    { key: 'email', header: 'Email', render: (u: IUser) => u.email || '-' },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (u: IUser) => (
        <Badge className={ROLE_COLORS[u.role]}>{ROLE_LABELS[u.role]}</Badge>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (u: IUser) => (
        <span className={u.isActive ? 'text-green-600' : 'text-red-600'}>
          {u.isActive ? 'Active' : 'Suspended'}
        </span>
      ),
    },
    { key: 'createdAt', header: 'Joined', sortable: true, render: (u: IUser) => formatDate(u.createdAt) },
  ]

  return (
    <DataTable
      columns={columns}
      data={users}
      keyExtractor={(u) => u._id}
      onRowClick={onRowClick}
      isLoading={isLoading}
    />
  )
}
