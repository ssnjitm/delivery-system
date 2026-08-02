
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { ClipboardList, Truck, MapPin, Layers } from 'lucide-react'

export default function DispatchDashboardPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-700 via-sky-600 to-blue-700 p-8 text-white shadow-float">
        <div className="bg-grid absolute inset-0 opacity-10" />
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <p className="text-sm font-medium text-white/70">Control Room</p>
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">Dispatch Overview</h2>
          <p className="mt-2 max-w-md text-sm text-white/80">
            Monitor the live queue, assign drivers and watch orders in transit.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Pending Orders" value={0} icon={ClipboardList} accent="warning" description="awaiting driver" />
        <StatCard title="Active Drivers" value={0} icon={Truck} accent="success" description="online now" />
        <StatCard title="In Transit" value={0} icon={MapPin} accent="info" description="on the move" />
        <StatCard title="Queue Depth" value={0} icon={Layers} accent="destructive" description="avg wait" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 p-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand-600">
              <ClipboardList className="h-7 w-7" />
            </div>
            <div>
              <p className="font-heading font-semibold">Dispatch Queue</p>
              <p className="mt-1 text-sm text-muted-foreground">Manually assign and batch orders to drivers.</p>
            </div>
            <Link to="/queue">
              <Button variant="gradient" className="mt-2">
                <ClipboardList className="mr-1 h-4 w-4" />
                Open Queue
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 p-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15">
              <Truck className="h-7 w-7" />
            </div>
            <div>
              <p className="font-heading font-semibold">Live Map</p>
              <p className="mt-1 text-sm text-muted-foreground">See every driver and order in real-time.</p>
            </div>
            <Link to="/live-map">
              <Button variant="gradient" className="mt-2">
                <MapPin className="mr-1 h-4 w-4" />
                Open Live Map
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
