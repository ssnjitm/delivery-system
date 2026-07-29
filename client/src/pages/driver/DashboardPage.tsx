import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DriverDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Driver Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Today's Earnings</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">PKR 0</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Deliveries Today</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">0</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Rating</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">0.0</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Status</CardTitle></CardHeader><CardContent><span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">Offline</span></CardContent></Card>
      </div>
    </div>
  )
}
