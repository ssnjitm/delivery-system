import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormItem } from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DispatchConfig } from '@/types/dispatch'

const configSchema = z.object({
  maxSearchRadius: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Must be > 0'),
  maxWaitTime: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Must be > 0'),
  retryDelay: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Must be > 0'),
  maxRetries: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Must be >= 0'),
  maxBatchOrders: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Must be > 0'),
  weightDistance: z.string().refine((v) => !isNaN(Number(v)), 'Required'),
  weightRating: z.string().refine((v) => !isNaN(Number(v)), 'Required'),
  weightEarnings: z.string().refine((v) => !isNaN(Number(v)), 'Required'),
  weightWorkload: z.string().refine((v) => !isNaN(Number(v)), 'Required'),
  batchEnabled: z.boolean(),
})

type ConfigFormData = z.infer<typeof configSchema>

interface DispatchConfigFormProps {
  config: DispatchConfig | null
  onSave: (config: Partial<DispatchConfig>) => Promise<void>
  isSaving?: boolean
}

export function DispatchConfigForm({ config, onSave, isSaving }: DispatchConfigFormProps) {
  const form = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    values: config ? {
      maxSearchRadius: String(config.maxSearchRadius),
      maxWaitTime: String(config.maxWaitTime),
      retryDelay: String(config.retryDelay),
      maxRetries: String(config.maxRetries),
      maxBatchOrders: String(config.maxBatchOrders),
      weightDistance: String(config.scoringWeights.distance),
      weightRating: String(config.scoringWeights.rating),
      weightEarnings: String(config.scoringWeights.earnings),
      weightWorkload: String(config.scoringWeights.workload),
      batchEnabled: config.batchEnabled,
    } : undefined,
  })

  const onSubmit = async (data: ConfigFormData) => {
    await onSave({
      maxSearchRadius: Number(data.maxSearchRadius),
      maxWaitTime: Number(data.maxWaitTime),
      retryDelay: Number(data.retryDelay),
      maxRetries: Number(data.maxRetries),
      maxBatchOrders: Number(data.maxBatchOrders),
      scoringWeights: {
        distance: Number(data.weightDistance),
        rating: Number(data.weightRating),
        earnings: Number(data.weightEarnings),
        workload: Number(data.weightWorkload),
      },
      batchEnabled: data.batchEnabled,
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">Search Settings</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormItem><Label>Max Search Radius (km)</Label><Input {...form.register('maxSearchRadius')} /></FormItem>
          <FormItem><Label>Max Wait Time (s)</Label><Input {...form.register('maxWaitTime')} /></FormItem>
          <FormItem><Label>Retry Delay (s)</Label><Input {...form.register('retryDelay')} /></FormItem>
          <FormItem><Label>Max Retries</Label><Input {...form.register('maxRetries')} /></FormItem>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Scoring Weights</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormItem><Label>Distance</Label><Input {...form.register('weightDistance')} /></FormItem>
          <FormItem><Label>Rating</Label><Input {...form.register('weightRating')} /></FormItem>
          <FormItem><Label>Earnings</Label><Input {...form.register('weightEarnings')} /></FormItem>
          <FormItem><Label>Workload</Label><Input {...form.register('weightWorkload')} /></FormItem>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Batch Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register('batchEnabled')} className="rounded" />
            Enable Batch Orders
          </label>
          <FormItem><Label>Max Batch Orders</Label><Input {...form.register('maxBatchOrders')} /></FormItem>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Configuration'}</Button>
    </form>
  )
}
