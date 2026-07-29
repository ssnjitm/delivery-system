import { formatCurrency } from '@/lib/utils'
import type { PriceBreakdown as PriceBreakdownType } from '@/types/pricing'

interface PriceBreakdownProps {
  pricing: PriceBreakdownType
}

export function PriceBreakdown({ pricing }: PriceBreakdownProps) {
  return (
    <div className="rounded-md border p-4 space-y-2 text-sm">
      <h4 className="font-semibold mb-2">Price Breakdown</h4>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Base Price</span>
        <span>{formatCurrency(pricing.basePrice)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Distance</span>
        <span>{formatCurrency(pricing.distancePrice)}</span>
      </div>
      {pricing.weightPrice && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Weight</span>
          <span>{formatCurrency(pricing.weightPrice)}</span>
        </div>
      )}
      {pricing.surgeMultiplier && pricing.surgeMultiplier > 1 && (
        <div className="flex justify-between text-orange-600">
          <span>Surge ({pricing.surgeMultiplier}x)</span>
          <span>Active</span>
        </div>
      )}
      {pricing.discount && (
        <div className="flex justify-between text-green-600">
          <span>Discount</span>
          <span>-{formatCurrency(pricing.discount)}</span>
        </div>
      )}
      <div className="flex justify-between font-semibold border-t pt-2">
        <span>Total</span>
        <span>{formatCurrency(pricing.total)}</span>
      </div>
    </div>
  )
}
