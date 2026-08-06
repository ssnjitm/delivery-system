import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormItem, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DispatchConfig } from '@/types/dispatch'

const positiveNumber = (msg: string) => z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, msg)

const configSchema = z.object({
  defaultSearchRadius: positiveNumber('Must be >= 0'),
  maxSearchRadius: positiveNumber('Must be >= 0'),
  maxDriversToNotify: positiveNumber('Must be >= 0'),
  driverResponseTimeout: positiveNumber('Must be >= 0'),
  maxRetryAttempts: positiveNumber('Must be >= 0'),
  batchMaxOrders: positiveNumber('Must be >= 0'),
  batchMaxDetourDistance: positiveNumber('Must be >= 0'),
  weightDistance: z.string().refine((v) => !isNaN(Number(v)), 'Required'),
  weightRating: z.string().refine((v) => !isNaN(Number(v)), 'Required'),
  weightDeliveryHistory: z.string().refine((v) => !isNaN(Number(v)), 'Required'),
  weightAvailability: z.string().refine((v) => !isNaN(Number(v)), 'Required'),
})

type ConfigFormData = z.infer<typeof configSchema>

interface DispatchConfigFormProps {
  config: DispatchConfig | null
  onSave: (config: Partial<DispatchConfig>) => Promise<void>
  isSaving?: boolean
}

const toNumber = (v?: number | null) => (v === undefined || v === null ? '' : String(v))

export function DispatchConfigForm({ config, onSave, isSaving }: DispatchConfigFormProps) {
  const form = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    values: config ? {
      defaultSearchRadius: toNumber(config.defaultSearchRadius),
      maxSearchRadius: toNumber(config.maxSearchRadius),
      maxDriversToNotify: toNumber(config.maxDriversToNotify),
      driverResponseTimeout: toNumber(config.driverResponseTimeout),
      maxRetryAttempts: toNumber(config.maxRetryAttempts),
      batchMaxOrders: toNumber(config.batchMaxOrders),
      batchMaxDetourDistance: toNumber(config.batchMaxDetourDistance),
      weightDistance: toNumber(config.scoringWeights?.distance),
      weightRating: toNumber(config.scoringWeights?.rating),
      weightDeliveryHistory: toNumber(config.scoringWeights?.deliveryHistory),
      weightAvailability: toNumber(config.scoringWeights?.availability),
    } : undefined,
  })

  const onSubmit = async (data: ConfigFormData) => {
    await onSave({
      defaultSearchRadius: Number(data.defaultSearchRadius),
      maxSearchRadius: Number(data.maxSearchRadius),
      maxDriversToNotify: Number(data.maxDriversToNotify),
      driverResponseTimeout: Number(data.driverResponseTimeout),
      maxRetryAttempts: Number(data.maxRetryAttempts),
      batchMaxOrders: Number(data.batchMaxOrders),
      batchMaxDetourDistance: Number(data.batchMaxDetourDistance),
      scoringWeights: {
        distance: Number(data.weightDistance),
        rating: Number(data.weightRating),
        deliveryHistory: Number(data.weightDeliveryHistory),
        availability: Number(data.weightAvailability),
      },
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">Search Settings</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormItem>
            <Label>Default Search Radius (m)</Label>
            <Input {...form.register('defaultSearchRadius')} type="number" />
            {form.formState.errors.defaultSearchRadius && <FormMessage>{form.formState.errors.defaultSearchRadius.message}</FormMessage>}
          </FormItem>
          <FormItem>
            <Label>Max Search Radius (m)</Label>
            <Input {...form.register('maxSearchRadius')} type="number" />
            {form.formState.errors.maxSearchRadius && <FormMessage>{form.formState.errors.maxSearchRadius.message}</FormMessage>}
          </FormItem>
          <FormItem>
            <Label>Max Drivers to Notify</Label>
            <Input {...form.register('maxDriversToNotify')} type="number" />
          </FormItem>
          <FormItem>
            <Label>Driver Response Timeout (s)</Label>
            <Input {...form.register('driverResponseTimeout')} type="number" />
          </FormItem>
          <FormItem>
            <Label>Max Retry Attempts</Label>
            <Input {...form.register('maxRetryAttempts')} type="number" />
          </FormItem>
          <FormItem>
            <Label>Max Detour Distance for Batches (m)</Label>
            <Input {...form.register('batchMaxDetourDistance')} type="number" />
          </FormItem>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Batch Settings</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormItem>
            <Label>Max Orders per Batch</Label>
            <Input {...form.register('batchMaxOrders')} type="number" />
          </FormItem>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Scoring Weights</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormItem><Label>Distance</Label><Input {...form.register('weightDistance')} type="number" step="0.01" /></FormItem>
          <FormItem><Label>Rating</Label><Input {...form.register('weightRating')} type="number" step="0.01" /></FormItem>
          <FormItem><Label>Delivery History</Label><Input {...form.register('weightDeliveryHistory')} type="number" step="0.01" /></FormItem>
          <FormItem><Label>Availability</Label><Input {...form.register('weightAvailability')} type="number" step="0.01" /></FormItem>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Configuration'}</Button>
    </form>
  )
}
