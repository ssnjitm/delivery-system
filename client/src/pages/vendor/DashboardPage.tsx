import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function VendorDashboardPage() {
  const user = useAuthStore((s) => s.user)
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
      <p className="text-muted-foreground">Welcome, {user?.name}</p>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Orders Today</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">0</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Active Deliveries</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">0</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Revenue</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">PKR 0</p></CardContent></Card>
      </div>
    </div>
  )
}
