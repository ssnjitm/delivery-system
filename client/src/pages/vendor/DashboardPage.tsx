import { useAuthStore } from '@/store/authStore'

import { StatCard } from '@/components/shared/StatCard'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { Package, Truck, Wallet, Star, PlusCircle, Store } from 'lucide-react'

export default function VendorDashboardPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-brand-600 to-brand-700 p-8 text-white shadow-float">
        <div className="bg-grid absolute inset-0 opacity-10" />
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white">
              <Store className="h-7 w-7" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold">{user?.name ?? 'Store'}</h2>
              <p className="text-sm text-white/70">Business headquarters</p>
            </div>
          </div>
          <Link to="/orders/create">
            <Button variant="secondary" size="lg" className="bg-white text-brand-700 hover:bg-white/90">
              <PlusCircle className="mr-1 h-4 w-4" />
              New Order
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Orders Today" value={0} icon={Package} accent="brand" description="submitted" />
        <StatCard title="Active Deliveries" value={0} icon={Truck} accent="warning" description="in transit" />
        <StatCard title="Revenue" value="PKR 0" icon={Wallet} accent="success" description="lifetime" />
        <StatCard title="Store Rating" value="0.0" icon={Star} accent="info" description="from customers" />
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand-600">
            <Package className="h-7 w-7" />
          </div>
          <div>
            <p className="font-heading font-semibold">No orders yet today</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a delivery order to get products moving to customers.
            </p>
          </div>
          <Link to="/orders/create">
            <Button variant="gradient" className="mt-2">
              Create an order
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
