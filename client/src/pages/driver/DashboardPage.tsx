import { useAuthStore } from '@/store/authStore'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { Wallet, PackageCheck, Star, ClipboardList, Radar } from 'lucide-react'

export default function DriverDashboardPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        eyebrow="Driver Console"
        title={`Good to see you, ${user?.name?.split(' ')[0] ?? 'driver'}`}
        description="Track your trips, earnings and availability in real-time."
      />

      {/* Availability toggle */}
      <Card className="overflow-hidden">
        <CardContent className="flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-500/15">
              <Radar className="h-6 w-6" />
            </div>
            <div>
              <p className="font-heading font-semibold">Delivery status</p>
              <p className="text-sm text-muted-foreground">Set your availability to receive dispatch requests</p>
            </div>
          </div>
          <Button variant="outline" className="bg-secondary text-secondary-foreground" disabled>
            Offline
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Today's Earnings" value="PKR 0" icon={Wallet} accent="success" description="gross" />
        <StatCard title="Deliveries Today" value={0} icon={PackageCheck} accent="brand" description="completed trips" />
        <StatCard title="Rating" value="0.0" icon={Star} accent="warning" description="avg rating" />
        <StatCard title="Available Jobs" value={0} icon={ClipboardList} accent="info" description="nearby offers" />
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand-600">
            <ClipboardList className="h-7 w-7" />
          </div>
          <div>
            <p className="font-heading font-semibold">No available jobs right now</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Go online and browse the available orders pool.
            </p>
          </div>
          <Link to="/available">
            <Button variant="gradient" className="mt-2">
              Browse Available Orders
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}