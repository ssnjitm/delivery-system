import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { FilePreview } from '@/components/shared/FilePreview'
import type { Document, VerificationRequest } from '@/types/document'

interface AdminVerificationPanelProps {
  documents: Document[]
  onVerify: (docId: string, data: VerificationRequest) => void
  loading?: boolean
}

export function AdminVerificationPanel({ documents, onVerify, loading }: AdminVerificationPanelProps) {
  const [notes, setNotes] = useState<Record<string, string>>({})

  const pendingDocs = documents.filter((d) => d.status === 'PENDING')

  if (!pendingDocs.length) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          No pending verifications
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {pendingDocs.map((doc) => (
        <Card key={doc._id}>
          <CardHeader>
            <CardTitle className="text-sm">{doc.fileName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FilePreview url={doc.url} fileName={doc.fileName} />
            <Textarea
              placeholder="Admin notes..."
              value={notes[doc._id] || ''}
              onChange={(e) => setNotes((prev) => ({ ...prev, [doc._id]: e.target.value }))}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => onVerify(doc._id, { documentId: doc._id, status: 'VERIFIED', adminNote: notes[doc._id] })}
                disabled={loading}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onVerify(doc._id, { documentId: doc._id, status: 'REJECTED', adminNote: notes[doc._id] })}
                disabled={loading}
              >
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
