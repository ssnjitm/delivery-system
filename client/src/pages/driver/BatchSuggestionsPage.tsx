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
  const [orderIds, setOrderIds] = useState('')
  const batchSuggestions = useBatchSuggestions()

  const handleGetSuggestions = () => {
    const ids = orderIds.split(',').map((s) => s.trim()).filter(Boolean)
    if (ids.length >= 2) {
      batchSuggestions.mutate(ids)
    }
  }

  const handleAccept = (_groupId: string) => { void _groupId }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Batch Suggestions</h1>

      <div className="space-y-4">
        <FormItem>
          <Label>Order IDs (comma-separated)</Label>
          <div className="flex gap-2">
            <Input
              value={orderIds}
              onChange={(e) => setOrderIds(e.target.value)}
              placeholder="e.g. id1, id2, id3"
            />
            <Button onClick={handleGetSuggestions} disabled={batchSuggestions.isPending}>
              <Package className="mr-2 h-4 w-4" />
              Suggest
            </Button>
          </div>
        </FormItem>
      </div>

      {batchSuggestions.data && batchSuggestions.data.length > 0 ? (
        <BatchSuggestions
          suggestions={batchSuggestions.data}
          onAccept={handleAccept}
        />
      ) : batchSuggestions.data?.length === 0 ? (
        <EmptyState message="No batch suggestions" description="Try different order combinations" />
      ) : null}
    </div>
  )
}
