import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormItem } from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCalculatePrice } from '@/hooks/queries/usePricingQueries'
import { PriceBreakdown } from '../orders/PriceBreakdown'

export function PriceCalculator() {
  const [pickupLat, setPickupLat] = useState('')
  const [pickupLng, setPickupLng] = useState('')
  const [deliveryLat, setDeliveryLat] = useState('')
  const [deliveryLng, setDeliveryLng] = useState('')
  const [weight, setWeight] = useState('')
  const calculatePrice = useCalculatePrice()

  const handleCalculate = () => {
    calculatePrice.mutate({
      pickup: [Number(pickupLng), Number(pickupLat)],
      delivery: [Number(deliveryLng), Number(deliveryLat)],
      weight: weight ? Number(weight) : undefined,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Price Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormItem>
            <Label>Pickup Lat</Label>
            <Input value={pickupLat} onChange={(e) => setPickupLat(e.target.value)} placeholder="27.7172" />
          </FormItem>
          <FormItem>
            <Label>Pickup Lng</Label>
            <Input value={pickupLng} onChange={(e) => setPickupLng(e.target.value)} placeholder="85.3240" />
          </FormItem>
          <FormItem>
            <Label>Delivery Lat</Label>
            <Input value={deliveryLat} onChange={(e) => setDeliveryLat(e.target.value)} placeholder="27.7172" />
          </FormItem>
          <FormItem>
            <Label>Delivery Lng</Label>
            <Input value={deliveryLng} onChange={(e) => setDeliveryLng(e.target.value)} placeholder="85.3240" />
          </FormItem>
        </div>
        <FormItem>
          <Label>Weight (kg, optional)</Label>
          <Input value={weight} onChange={(e) => setWeight(e.target.value)} type="number" step="0.1" />
        </FormItem>
        <Button onClick={handleCalculate} disabled={calculatePrice.isPending} className="w-full">
          {calculatePrice.isPending ? 'Calculating...' : 'Calculate Price'}
        </Button>
        {calculatePrice.data && <PriceBreakdown pricing={calculatePrice.data} />}
      </CardContent>
    </Card>
  )
}
