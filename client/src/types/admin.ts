export interface DashboardStats {
  totalUsers: number
  totalVendors: number
  totalDrivers: number
  totalCustomers: number
  ordersToday: number
  ordersPending: number
  ordersInTransit: number
  ordersDelivered: number
  revenueToday: number
  revenueWeek: number
  revenueMonth: number
  pendingVerifications: number
  activeDisputes: number
}

export interface AuditLog {
  _id: string
  action: string
  admin: string | { _id: string; name: string }
  target: string
  targetModel: string
  details?: string
  ip?: string
  createdAt: string
}

export interface Dispute {
  _id: string
  order: string | { _id: string; orderId: string }
  raisedBy: string | { _id: string; name: string; role: string }
  assignedTo?: string | { _id: string; name: string }
  subject: string
  description: string
  status: DisputeStatus
  resolution?: string
  resolvedAt?: string
  createdAt: string
  updatedAt: string
}

export type DisputeStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED'

export interface ReportData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    color?: string
  }>
}
