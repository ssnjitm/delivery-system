import { DataTable } from '@/components/shared/DataTable'
import { formatDateTime } from '@/lib/utils'
import type { AuditLog } from '@/types/admin'

interface AuditLogTableProps {
  logs: AuditLog[]
  isLoading?: boolean
}

export function AuditLogTable({ logs, isLoading }: AuditLogTableProps) {
  const columns = [
    { key: 'action', header: 'Action', sortable: true },
    {
      key: 'admin',
      header: 'Admin',
      render: (log: AuditLog) => (typeof log.admin === 'object' ? log.admin.name : log.admin),
    },
    { key: 'targetModel', header: 'Target Type', sortable: true },
    { key: 'target', header: 'Target ID' },
    { key: 'details', header: 'Details', render: (log: AuditLog) => log.details || '-' },
    { key: 'createdAt', header: 'Timestamp', sortable: true, render: (log: AuditLog) => formatDateTime(log.createdAt) },
  ]

  return (
    <DataTable
      columns={columns}
      data={logs}
      keyExtractor={(l) => l._id}
      isLoading={isLoading}
    />
  )
}
