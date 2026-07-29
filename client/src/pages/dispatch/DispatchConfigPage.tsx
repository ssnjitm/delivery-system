import { useDispatchConfig, useUpdateDispatchConfig } from '@/hooks/queries/useDispatchQueries'
import { DispatchConfigForm } from '@/components/dispatch/DispatchConfigForm'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorState } from '@/components/shared/ErrorState'

export default function DispatchConfigPage() {
  const { data, isLoading, error, refetch } = useDispatchConfig()
  const updateConfig = useUpdateDispatchConfig()

  if (isLoading) return <LoadingSpinner size="lg" className="py-12" />
  if (error) return <ErrorState error={error as Error} onRetry={refetch} />

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Dispatch Configuration</h1>
      <DispatchConfigForm
        config={data?.config || null}
        onSave={async (config) => { await updateConfig.mutateAsync(config) }}
        isSaving={updateConfig.isPending}
      />
    </div>
  )
}
