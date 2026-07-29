import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckSquare } from 'lucide-react'

interface BulkActionsProps {
  onApproveVendors: (ids: string[]) => Promise<void>
  onVerifyDrivers: (ids: string[]) => Promise<void>
  loading?: boolean
}

export function BulkActions({ onApproveVendors, onVerifyDrivers, loading }: BulkActionsProps) {
  const [selectedIds, setSelectedIds] = useState('')

  const ids = selectedIds.split(',').map((s) => s.trim()).filter(Boolean)

  return (
    <Card>
      <CardHeader><CardTitle className="text-lg flex items-center gap-2"><CheckSquare className="h-5 w-5" /> Bulk Actions</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <textarea
          className="w-full rounded-md border p-2 text-sm"
          rows={3}
          placeholder="Enter comma-separated IDs..."
          value={selectedIds}
          onChange={(e) => setSelectedIds(e.target.value)}
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onApproveVendors(ids)}
            disabled={!ids.length || loading}
          >
            Approve Vendors
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onVerifyDrivers(ids)}
            disabled={!ids.length || loading}
          >
            Verify Drivers
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
