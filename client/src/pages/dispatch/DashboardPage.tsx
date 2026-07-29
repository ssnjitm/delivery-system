import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DispatchDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dispatch Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Pending Orders</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">0</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Active Drivers</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">0</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">In Transit</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">0</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Queue</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">0</p></CardContent></Card>
      </div>
    </div>
  )
}
