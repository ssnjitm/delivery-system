import { useDashboardStats } from '@/hooks/queries/useAdminQueries'
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users,
  ShoppingBag,
  DollarSign,
  FileCheck,
  Truck,
  AlertTriangle,
  Store,
  PackageCheck,
  ShieldCheck,
  Activity,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { ErrorState } from '@/components/shared/ErrorState'

export default function AdminDashboardPage() {
  const { data: s, isLoading, error } = useDashboardStats()

  if (error) return <ErrorState message="Could not load the dashboard. Refresh to try again." />

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#b45309] via-brand-700 to-brand-800 p-8 text-white shadow-float">
        <div className="bg-grid absolute inset-0 opacity-10" />
        <div className="absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 right-24 h-40 w-40 rounded-full bg-amber-300/20 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-medium text-white/70">
              <ShieldCheck className="h-4 w-4" />
              Admin Console
            </p>
            <h2 className="font-heading text-2xl font-bold sm:text-3xl">Platform Overview</h2>
            <p className="mt-2 max-w-lg text-sm text-white/80">
              Everything running across your delivery network, at a glance.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-white/70">System status</p>
              <p className="font-semibold flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-300" /> All systems operational
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={s?.totalUsers ?? 0} icon={Users} accent="brand" isLoading={isLoading} />
        <StatCard title="Orders Today" value={s?.ordersToday ?? 0} icon={ShoppingBag} accent="info" isLoading={isLoading} description={`${s?.ordersPending ?? 0} pending`} />
        <StatCard title="Revenue Today" value={s?.revenueToday ? formatCurrency(s.revenueToday) : 'NPR 0'} icon={DollarSign} accent="success" isLoading={isLoading} />
        <StatCard title="Pending Verifications" value={s?.pendingVerifications ?? 0} icon={FileCheck} accent="warning" isLoading={isLoading} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Vendors" value={s?.totalVendors ?? 0} icon={Store} accent="info" isLoading={isLoading} />
        <StatCard title="Total Drivers" value={s?.totalDrivers ?? 0} icon={Truck} accent="brand" isLoading={isLoading} />
        <StatCard title="Orders Delivered" value={s?.ordersDelivered ?? 0} icon={PackageCheck} accent="success" isLoading={isLoading} />
        <StatCard title="Active Disputes" value={s?.activeDisputes ?? 0} icon={AlertTriangle} accent="destructive" isLoading={isLoading} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand-600 dark:text-brand-400">
              <Truck className="h-7 w-7" />
            </div>
            <p className="font-heading font-semibold">Verify & manage drivers</p>
            <Link to="/admin/drivers">
              <Button variant="gradient">Review Drivers</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15">
              <Store className="h-7 w-7" />
            </div>
            <p className="font-heading font-semibold">Approve vendor requests</p>
            <Link to="/admin/vendors">
              <Button variant="gradient">Review Vendors</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-500/15">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <p className="font-heading font-semibold">Track all platform orders</p>
            <Link to="/admin/orders">
              <Button variant="gradient">View Orders</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}