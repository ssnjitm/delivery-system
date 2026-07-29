import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormItem, FormMessage } from '@/components/ui/form'
import type { PricingRule } from '@/types/pricing'

const ruleSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  basePrice: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Valid number required'),
  pricePerKm: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Valid number required'),
  pricePerKg: z.string().optional(),
  surgeMultiplier: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
})

type RuleFormData = z.infer<typeof ruleSchema>

interface PricingRuleFormProps {
  rule?: PricingRule
  onSave: (data: Partial<PricingRule>) => Promise<void>
  isSaving?: boolean
}

export function PricingRuleForm({ rule, onSave, isSaving }: PricingRuleFormProps) {
  const form = useForm<RuleFormData>({
    resolver: zodResolver(ruleSchema),
    values: rule ? {
      name: rule.name,
      basePrice: String(rule.basePrice),
      pricePerKm: String(rule.pricePerKm),
      pricePerKg: rule.pricePerKg ? String(rule.pricePerKg) : '',
      surgeMultiplier: rule.surgeMultiplier ? String(rule.surgeMultiplier) : '',
      minPrice: rule.minPrice ? String(rule.minPrice) : '',
      maxPrice: rule.maxPrice ? String(rule.maxPrice) : '',
    } : undefined,
  })

  const handleSubmit = async (data: RuleFormData) => {
    await onSave({
      name: data.name,
      basePrice: Number(data.basePrice),
      pricePerKm: Number(data.pricePerKm),
      pricePerKg: data.pricePerKg ? Number(data.pricePerKg) : undefined,
      surgeMultiplier: data.surgeMultiplier ? Number(data.surgeMultiplier) : undefined,
      minPrice: data.minPrice ? Number(data.minPrice) : undefined,
      maxPrice: data.maxPrice ? Number(data.maxPrice) : undefined,
    })
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <FormItem>
        <Label>Rule Name</Label>
        <Input {...form.register('name')} placeholder="Standard Rate" />
        {form.formState.errors.name && <FormMessage>{form.formState.errors.name.message}</FormMessage>}
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
        <FormItem>
          <Label>Price per Kg (optional)</Label>
          <Input {...form.register('pricePerKg')} type="number" step="0.01" />
        </FormItem>
        <FormItem>
          <Label>Surge Multiplier (optional)</Label>
          <Input {...form.register('surgeMultiplier')} type="number" step="0.1" />
        </FormItem>
        <FormItem>
          <Label>Min Price (optional)</Label>
          <Input {...form.register('minPrice')} type="number" step="0.01" />
        </FormItem>
        <FormItem>
          <Label>Max Price (optional)</Label>
          <Input {...form.register('maxPrice')} type="number" step="0.01" />
        </FormItem>
      </div>
      <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Rule'}</Button>
    </form>
  )
}
