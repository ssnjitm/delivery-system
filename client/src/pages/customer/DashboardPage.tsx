import { useAuthStore } from '@/store/authStore'

import { StatCard } from '@/components/shared/StatCard'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { Package, PackageCheck, Wallet, PlusCircle, Activity, ArrowUpRight } from 'lucide-react'

export default function CustomerDashboardPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-amber-400 p-8 text-white shadow-float">
        <div className="bg-grid absolute inset-0 opacity-10" />
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white/70">Welcome back</p>
            <h2 className="font-heading text-2xl font-bold sm:text-3xl">
              {user?.name?.split(' ')[0] ?? 'there'} 👋
            </h2>
            <p className="mt-2 max-w-md text-sm text-white/80">
              Ready to send a package? Create an order in seconds and track it live.
            </p>
          </div>
          <Link to="/orders/create">
            <Button variant="secondary" size="lg" className="bg-white text-brand-700 hover:bg-white/90">
              <PlusCircle className="mr-1 h-4 w-4" />
              Create Order
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Orders" value={0} icon={Package} accent="brand" description="tracking now" />
        <StatCard title="Delivered" value={0} icon={PackageCheck} accent="success" description="all time" />
        <StatCard title="Total Spent" value="PKR 0" icon={Wallet} accent="info" description="lifetime" />
        <StatCard title="Active Trips" value={0} icon={Activity} accent="warning" description="in motion" />
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand-600">
            <Activity className="h-7 w-7" />
          </div>
          <div>
            <p className="font-heading font-semibold">No active deliveries</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first order and watch it come to life on the live map.
            </p>
          </div>
          <Link to="/orders/create">
            <Button variant="gradient" className="mt-2">
              Create your first order
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
