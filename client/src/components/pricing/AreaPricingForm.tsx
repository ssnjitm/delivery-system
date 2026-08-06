import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormItem, FormMessage } from '@/components/ui/form'
import type { AreaPricing } from '@/types/pricing'

const schema = z.object({
  area: z.string().min(2, 'Area is required'),
  city: z.string().min(1, 'City is required'),
  type: z.enum(['PICKUP', 'DELIVERY', 'BOTH']),
  surchargeType: z.enum(['FIXED', 'PERCENTAGE']),
  surchargeAmount: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Valid number required'),
})

type FormData = z.infer<typeof schema>

interface AreaPricingFormProps {
  area?: AreaPricing
  onSave: (data: Partial<AreaPricing>) => Promise<void>
  isSaving?: boolean
}

export function AreaPricingForm({ area, onSave, isSaving }: AreaPricingFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    values: area ? {
      area: area.area,
      city: area.city,
      type: area.type,
      surchargeType: area.surcharge?.type ?? 'FIXED',
      surchargeAmount: area.surcharge ? String(area.surcharge.amount) : '',
    } : undefined,
  })

  const handleSubmit = async (data: FormData) => {
    await onSave({
      area: data.area,
      city: data.city,
      type: data.type,
      surcharge: {
        type: data.surchargeType,
        amount: Number(data.surchargeAmount),
      },
    })
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormItem>
          <Label>Area</Label>
          <Input {...form.register('area')} placeholder="Downtown" />
          {form.formState.errors.area && <FormMessage>{form.formState.errors.area.message}</FormMessage>}
        </FormItem>
        <FormItem>
          <Label>City</Label>
          <Input {...form.register('city')} placeholder="Kathmandu" />
          {form.formState.errors.city && <FormMessage>{form.formState.errors.city.message}</FormMessage>}
        </FormItem>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormItem>
          <Label>Applies To</Label>
          <select {...form.register('type')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="PICKUP">Pickup only</option>
            <option value="DELIVERY">Delivery only</option>
            <option value="BOTH">Pickup &amp; Delivery</option>
          </select>
        </FormItem>
        <FormItem>
          <Label>Surcharge Type</Label>
          <select {...form.register('surchargeType')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="FIXED">Fixed amount</option>
            <option value="PERCENTAGE">Percentage</option>
          </select>
        </FormItem>
      </div>
      <FormItem>
        <Label>Surcharge Amount</Label>
        <Input {...form.register('surchargeAmount')} type="number" step="0.01" />
        {form.formState.errors.surchargeAmount && <FormMessage>{form.formState.errors.surchargeAmount.message}</FormMessage>}
      </FormItem>
      <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Area Pricing'}</Button>
    </form>
  )
}
