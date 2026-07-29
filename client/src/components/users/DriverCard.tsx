import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { User, Truck, Phone, Star } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { IDriver } from '@/types/user'

interface DriverCardProps {
  driver: IDriver
  onVerify?: () => void
  onReject?: () => void
  loading?: boolean
}

export function DriverCard({ driver, onVerify, onReject, loading }: DriverCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-green-600" />
            <span className="font-semibold">{driver.name}</span>
          </div>
          <Badge variant={driver.isVerified ? 'default' : 'secondary'}>
            {driver.isVerified ? 'Verified' : 'Pending'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-4 w-4" />
          {driver.phone}
        </p>
        {driver.vehicleType && (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Truck className="h-4 w-4" />
            {driver.vehicleType}
          </p>
        )}
        <div className="flex gap-4">
          {driver.rating && (
            <p className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" />
              {driver.rating.toFixed(1)}
            </p>
          )}
          {driver.totalDeliveries !== undefined && (
            <p className="text-muted-foreground">{driver.totalDeliveries} deliveries</p>
          )}
          {driver.earnings !== undefined && (
            <p className="text-muted-foreground">{formatCurrency(driver.earnings)}</p>
          )}
        </div>
        {!driver.isVerified && (
          <div className="flex gap-2 pt-2">
            {onVerify && <Button size="sm" onClick={onVerify} disabled={loading}>Verify</Button>}
            {onReject && <Button size="sm" variant="outline" onClick={onReject} disabled={loading}>Reject</Button>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
