import { useState } from 'react'
import { useBatchSuggestions } from '@/hooks/queries/useDispatchQueries'
import { BatchSuggestions } from '@/components/dispatch/BatchSuggestions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormItem } from '@/components/ui/form'
import { Package } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'

export default function BatchSuggestionsPage() {
  const [orderId, setOrderId] = useState('')
  const batchSuggestions = useBatchSuggestions()
  const result = batchSuggestions.data

  const handleGetSuggestions = () => {
    const id = orderId.trim()
    if (id) {
      batchSuggestions.mutate(id)
    }
  }

  const handleAccept = (_groupId: string) => { void _groupId }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Batch Suggestions</h1>

      <div className="space-y-4">
        <FormItem>
          <Label>Current Order ID</Label>
          <div className="flex gap-2">
            <Input
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. ORD-..."
            />
            <Button onClick={handleGetSuggestions} disabled={batchSuggestions.isPending}>
              <Package className="mr-2 h-4 w-4" />
              Suggest
            </Button>
          </div>
        </FormItem>
      </div>

      {result ? (
        <BatchSuggestions
          suggestions={[result]}
          onAccept={handleAccept}
        />
      ) : batchSuggestions.isSuccess && !result ? (
        <EmptyState message="No batch suggestions" description="Try a different order" />
      ) : null}
    </div>
  )
}
