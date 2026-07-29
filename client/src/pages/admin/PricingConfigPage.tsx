import { usePricingConfig, useUpdatePricingConfig } from '@/hooks/queries/usePricingQueries'
import { PricingConfigForm } from '@/components/pricing/PricingConfigForm'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorState } from '@/components/shared/ErrorState'

export default function PricingConfigPage() {
  const { data, isLoading, error, refetch } = usePricingConfig()
  const updateConfig = useUpdatePricingConfig()

  if (isLoading) return <LoadingSpinner size="lg" className="py-12" />
  if (error) return <ErrorState error={error as Error} onRetry={refetch} />

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Pricing Configuration</h1>
      <PricingConfigForm
        config={data?.config || null}
        onSave={async (config) => { await updateConfig.mutateAsync(config) }}
        isSaving={updateConfig.isPending}
      />
    </div>
  )
}
