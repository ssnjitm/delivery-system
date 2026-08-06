import { useState } from 'react'
import { useAreaPricing, useCreateAreaPricing, useUpdateAreaPricing } from '@/hooks/queries/usePricingQueries'
import { AreaPricingForm } from '@/components/pricing/AreaPricingForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { Plus, Pencil } from 'lucide-react'
import type { AreaPricing } from '@/types/pricing'

const formatSurcharge = (area: AreaPricing) =>
  area.surcharge?.type === 'PERCENTAGE'
    ? `${area.surcharge.amount}%`
    : `${area.surcharge?.amount ?? 0} (fixed)`

export default function AreaPricingPage() {
  const { data: areas, isLoading, error, refetch } = useAreaPricing()
  const createArea = useCreateAreaPricing()
  const updateArea = useUpdateAreaPricing()
  const [editing, setEditing] = useState<AreaPricing | null>(null)
  const [showForm, setShowForm] = useState(false)

  if (isLoading) return <LoadingSpinner size="lg" className="py-12" />
  if (error) return <ErrorState error={error as Error} onRetry={refetch} />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Area Pricing</h1>
        <Button variant="outline" size="sm" onClick={() => { setEditing(null); setShowForm(!showForm) }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Area
        </Button>
      </div>

      {showForm && (
        <AreaPricingForm
          area={editing || undefined}
          onSave={async (data) => {
            if (editing) {
              await updateArea.mutateAsync({ id: editing._id, data })
            } else {
              await createArea.mutateAsync(data as Omit<AreaPricing, '_id'>)
            }
            setShowForm(false)
            setEditing(null)
          }}
          isSaving={createArea.isPending || updateArea.isPending}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(areas ?? []).map((area) => (
          <Card key={area._id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{area.area}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => { setEditing(area); setShowForm(true) }}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p>City: {area.city}</p>
              <p>Surcharge: {formatSurcharge(area)}</p>
              <p className="text-xs text-muted-foreground">
                {area.type === 'PICKUP' ? 'Pickup only' : area.type === 'DELIVERY' ? 'Delivery only' : 'Pickup & Delivery'}
                {' · '}
                {area.isActive ? 'Active' : 'Inactive'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
