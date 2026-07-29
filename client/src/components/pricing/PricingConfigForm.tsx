import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormItem } from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PricingConfig } from '@/types/pricing'

const schema = z.object({
  defaultCurrency: z.string().min(1),
  surgeThreshold: z.string(),
  surgeMultiplier: z.string(),
  firstOrderDiscount: z.string(),
  referralDiscount: z.string(),
  bulkDiscount: z.string(),
})

type FormData = z.infer<typeof schema>

interface PricingConfigFormProps {
  config: PricingConfig | null
  onSave: (data: Partial<PricingConfig>) => Promise<void>
  isSaving?: boolean
}

export function PricingConfigForm({ config, onSave, isSaving }: PricingConfigFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    values: config ? {
      defaultCurrency: config.defaultCurrency,
      surgeThreshold: String(config.surgeThreshold),
      surgeMultiplier: String(config.surgeMultiplier),
      firstOrderDiscount: String(config.discountPercentages.firstOrder),
      referralDiscount: String(config.discountPercentages.referral),
      bulkDiscount: String(config.discountPercentages.bulk),
    } : undefined,
  })

  const handleSubmit = async (data: FormData) => {
    await onSave({
      defaultCurrency: data.defaultCurrency,
      surgeThreshold: Number(data.surgeThreshold),
      surgeMultiplier: Number(data.surgeMultiplier),
      discountPercentages: {
        firstOrder: Number(data.firstOrderDiscount),
        referral: Number(data.referralDiscount),
        bulk: Number(data.bulkDiscount),
      },
    })
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">Currency</CardTitle></CardHeader>
        <CardContent>
          <FormItem>
            <Label>Default Currency</Label>
            <Input {...form.register('defaultCurrency')} placeholder="PKR" />
          </FormItem>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Surge Pricing</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormItem><Label>Surge Threshold</Label><Input {...form.register('surgeThreshold')} type="number" /></FormItem>
          <FormItem><Label>Surge Multiplier</Label><Input {...form.register('surgeMultiplier')} type="number" step="0.1" /></FormItem>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Discounts (%)</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <FormItem><Label>First Order</Label><Input {...form.register('firstOrderDiscount')} type="number" /></FormItem>
          <FormItem><Label>Referral</Label><Input {...form.register('referralDiscount')} type="number" /></FormItem>
          <FormItem><Label>Bulk</Label><Input {...form.register('bulkDiscount')} type="number" /></FormItem>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Configuration'}</Button>
    </form>
  )
}
