import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDriverDailySummary } from '@/hooks/queries/useTrackingQueries'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency } from '@/lib/utils'
import { DollarSign, Package, Star } from 'lucide-react'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export default function EarningsPage() {
  const user = useAuthStore((s) => s.user)
  const { data: summary, isLoading } = useDriverDailySummary(user?.id || '')

  if (isLoading) return <LoadingSpinner size="lg" className="py-12" />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Earnings</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Today's Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(Number(summary?.todayEarnings ?? 0))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              Deliveries Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{Number(summary?.todayDeliveries ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-600" />
              Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{(summary?.rating as number)?.toFixed(1) || '0.0'}</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-lg">Weekly Summary</CardTitle></CardHeader>
        <CardContent>
          {summary?.weeklyData ? (
            <div className="text-sm text-muted-foreground">
              Weekly data available in the full report
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No weekly data available yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
