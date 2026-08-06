import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormItem, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PricingConfig } from '@/types/pricing'

const numericField = (msg = 'Valid number required') =>
  z.string().refine((v) => !isNaN(Number(v)) && v.trim() !== '', msg)

const schema = z.object({
  currency: z.string().min(1, 'Currency is required'),
  defaultBasePrice: numericField(),
  defaultPerKmRate: numericField(),
  minimumFee: numericField(),
  maximumFee: numericField(),
  specialHandlingFee: numericField(),
  maxDistanceForDelivery: numericField(),
  useDynamicPricing: z.boolean(),
  peakHourMultipliers: z.string().optional(),
  packageTypeMultipliers: z.string().optional(),
  distanceBrackets: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface PricingConfigFormProps {
  config: PricingConfig | null
  onSave: (data: Partial<PricingConfig>) => Promise<void>
  isSaving?: boolean
}

const toNumber = (v?: number | null) => (v === undefined || v === null ? '' : String(v))

const stringifyJSON = (value: unknown) => JSON.stringify(value ?? {}, null, 2)

export function PricingConfigForm({ config, onSave, isSaving }: PricingConfigFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    values: config ? {
      currency: config.currency ?? '',
      defaultBasePrice: toNumber(config.defaultBasePrice),
      defaultPerKmRate: toNumber(config.defaultPerKmRate),
      minimumFee: toNumber(config.minimumFee),
      maximumFee: toNumber(config.maximumFee),
      specialHandlingFee: toNumber(config.specialHandlingFee),
      maxDistanceForDelivery: toNumber(config.maxDistanceForDelivery),
      useDynamicPricing: !!config.useDynamicPricing,
      peakHourMultipliers: stringifyJSON(config.peakHourMultipliers),
      packageTypeMultipliers: stringifyJSON(config.packageTypeMultipliers),
      distanceBrackets: stringifyJSON(config.distanceBrackets),
    } : undefined,
  })

  const handleSubmit = async (data: FormData) => {
    const payload: Partial<PricingConfig> = {
      currency: data.currency,
      defaultBasePrice: Number(data.defaultBasePrice),
      defaultPerKmRate: Number(data.defaultPerKmRate),
      minimumFee: Number(data.minimumFee),
      maximumFee: Number(data.maximumFee),
      specialHandlingFee: Number(data.specialHandlingFee),
      maxDistanceForDelivery: Number(data.maxDistanceForDelivery),
      useDynamicPricing: data.useDynamicPricing,
    }

    for (const [key, raw] of [
      ['peakHourMultipliers', data.peakHourMultipliers],
      ['packageTypeMultipliers', data.packageTypeMultipliers],
      ['distanceBrackets', data.distanceBrackets],
    ] as const) {
      if (raw) {
        try {
          ;(payload as Record<string, unknown>)[key] = JSON.parse(raw)
        } catch {
          // Ignore invalid JSON; keep the previous value untouched.
        }
      }
    }

    await onSave(payload)
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">Currency</CardTitle></CardHeader>
        <CardContent>
          <FormItem>
            <Label>Default Currency</Label>
            <Input {...form.register('currency')} placeholder="NPR" />
            {form.formState.errors.currency && <FormMessage>{form.formState.errors.currency.message}</FormMessage>}
          </FormItem>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Base Pricing</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormItem><Label>Default Base Price</Label><Input {...form.register('defaultBasePrice')} type="number" step="0.01" /></FormItem>
          <FormItem><Label>Default Rate per Km</Label><Input {...form.register('defaultPerKmRate')} type="number" step="0.01" /></FormItem>
          <FormItem><Label>Minimum Fee</Label><Input {...form.register('minimumFee')} type="number" step="0.01" /></FormItem>
          <FormItem><Label>Maximum Fee</Label><Input {...form.register('maximumFee')} type="number" step="0.01" /></FormItem>
          <FormItem><Label>Special Handling Fee</Label><Input {...form.register('specialHandlingFee')} type="number" step="0.01" /></FormItem>
          <FormItem><Label>Max Distance for Delivery (km)</Label><Input {...form.register('maxDistanceForDelivery')} type="number" step="0.01" /></FormItem>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Dynamic Pricing</CardTitle></CardHeader>
        <CardContent>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register('useDynamicPricing')} className="rounded" />
            Enable dynamic pricing
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Advanced (JSON)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <FormItem>
            <Label>Peak Hour Multipliers</Label>
            <Input {...form.register('peakHourMultipliers')} className="font-mono text-xs" />
          </FormItem>
          <FormItem>
            <Label>Package Type Multipliers</Label>
            <Input {...form.register('packageTypeMultipliers')} className="font-mono text-xs" />
          </FormItem>
          <FormItem>
            <Label>Distance Brackets</Label>
            <Input {...form.register('distanceBrackets')} className="font-mono text-xs" />
          </FormItem>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Configuration'}</Button>
    </form>
  )
}
