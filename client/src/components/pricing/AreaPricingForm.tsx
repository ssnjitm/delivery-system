import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormItem, FormMessage } from '@/components/ui/form'
import type { AreaPricing } from '@/types/pricing'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  basePrice: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Valid number required'),
  pricePerKm: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Valid number required'),
  coordinates: z.string().min(4, 'Coordinates required (comma-separated pairs)'),
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
      name: area.name,
      basePrice: String(area.basePrice),
      pricePerKm: String(area.pricePerKm),
      coordinates: JSON.stringify(area.area.coordinates),
    } : undefined,
  })

  const handleSubmit = async (data: FormData) => {
    let parsedCoords: number[][][]
    try {
      parsedCoords = JSON.parse(data.coordinates)
    } catch {
      return
    }
    await onSave({
      name: data.name,
      basePrice: Number(data.basePrice),
      pricePerKm: Number(data.pricePerKm),
      area: {
        type: 'Polygon',
        coordinates: parsedCoords,
      },
    })
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <FormItem>
        <Label>Area Name</Label>
        <Input {...form.register('name')} placeholder="Downtown" />
      </FormItem>
      <div className="grid grid-cols-2 gap-4">
        <FormItem>
          <Label>Base Price</Label>
          <Input {...form.register('basePrice')} type="number" step="0.01" />
        </FormItem>
        <FormItem>
          <Label>Price per Km</Label>
          <Input {...form.register('pricePerKm')} type="number" step="0.01" />
        </FormItem>
      </div>
      <FormItem>
        <Label>
          Polygon Coordinates (JSON format: [[[lng,lat],[lng,lat],...]])
        </Label>
        <Input {...form.register('coordinates')} placeholder='[[[85.3,27.7],[85.32,27.72],[85.33,27.71]]]' />
        {form.formState.errors.coordinates && <FormMessage>{form.formState.errors.coordinates.message}</FormMessage>}
      </FormItem>
      <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Area Pricing'}</Button>
    </form>
  )
}
