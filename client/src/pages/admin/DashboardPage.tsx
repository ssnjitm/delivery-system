import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Users</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">0</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Orders Today</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">0</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Revenue Today</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">PKR 0</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Pending Verifications</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">0</p></CardContent></Card>
      </div>
    </div>
  )
}
