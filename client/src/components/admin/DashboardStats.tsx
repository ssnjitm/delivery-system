import { StatsCard } from './StatsCard'
import { Users, ShoppingCart, DollarSign, FileCheck, AlertTriangle, Truck } from 'lucide-react'
import type { DashboardStats as DashboardStatsType } from '@/types/admin'
import { formatCurrency } from '@/lib/utils'

interface DashboardStatsProps {
  stats: DashboardStatsType | null
  isLoading?: boolean
}

export function DashboardStats({ stats, isLoading }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Users"
        value={stats?.totalUsers ?? 0}
        icon={Users}
        isLoading={isLoading}
      />
      <StatsCard
        title="Orders Today"
        value={stats?.ordersToday ?? 0}
        icon={ShoppingCart}
        description={`${stats?.ordersPending ?? 0} pending, ${stats?.ordersInTransit ?? 0} in transit`}
        isLoading={isLoading}
      />
      <StatsCard
        title="Revenue Today"
        value={stats?.revenueToday ? formatCurrency(stats.revenueToday) : 'NPR 0'}
        icon={DollarSign}
        description={`Week: ${stats?.revenueWeek ? formatCurrency(stats.revenueWeek) : 'NPR 0'}`}
        isLoading={isLoading}
      />
      <StatsCard
        title="Pending Verifications"
        value={stats?.pendingVerifications ?? 0}
        icon={FileCheck}
        isLoading={isLoading}
      />
      <StatsCard
        title="Total Vendors"
        value={stats?.totalVendors ?? 0}
        icon={Truck}
        isLoading={isLoading}
      />
      <StatsCard
        title="Total Drivers"
        value={stats?.totalDrivers ?? 0}
        icon={Users}
        isLoading={isLoading}
      />
      <StatsCard
        title="Orders Delivered"
        value={stats?.ordersDelivered ?? 0}
        icon={ShoppingCart}
        isLoading={isLoading}
      />
      <StatsCard
        title="Active Disputes"
        value={stats?.activeDisputes ?? 0}
        icon={AlertTriangle}
        isLoading={isLoading}
      />
    </div>
  )
}
