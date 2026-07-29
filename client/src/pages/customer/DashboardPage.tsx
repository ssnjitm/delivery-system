import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CustomerDashboardPage() {
  const user = useAuthStore((s) => s.user)
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Active Orders</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">0</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Delivered</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">0</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Spent</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">PKR 0</p></CardContent>
        </Card>
      </div>
    </div>
  )
}
