import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Store, MapPin, Phone } from 'lucide-react'
import type { IVendor } from '@/types/user'

interface VendorCardProps {
  vendor: IVendor
  onApprove?: () => void
  onReject?: () => void
  loading?: boolean
}

export function VendorCard({ vendor, onApprove, onReject, loading }: VendorCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-purple-600" />
            <span className="font-semibold">{vendor.businessName || vendor.name}</span>
          </div>
          <Badge variant={vendor.isApproved ? 'default' : 'secondary'}>
            {vendor.isApproved ? 'Approved' : 'Pending'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {vendor.businessAddress || 'No address'}
        </p>
        <p className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-4 w-4" />
          {vendor.phone}
        </p>
        <p className="text-muted-foreground">Owner: {vendor.name}</p>
        {!vendor.isApproved && (
          <div className="flex gap-2 pt-2">
            {onApprove && <Button size="sm" onClick={onApprove} disabled={loading}>Approve</Button>}
            {onReject && <Button size="sm" variant="outline" onClick={onReject} disabled={loading}>Reject</Button>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
