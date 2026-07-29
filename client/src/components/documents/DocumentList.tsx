import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FilePreview } from '@/components/shared/FilePreview'
import { VerificationBadge } from './VerificationBadge'
import { formatDate } from '@/lib/utils'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Document } from '@/types/document'

interface DocumentListProps {
  documents: Document[]
  onDelete?: (id: string) => void
  loading?: boolean
}

export function DocumentList({ documents, onDelete, loading }: DocumentListProps) {
  if (!documents.length) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          No documents uploaded yet
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <Card key={doc._id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{doc.fileName}</CardTitle>
              <VerificationBadge status={doc.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <FilePreview url={doc.url} fileName={doc.fileName} />
            <p className="text-xs text-muted-foreground">
              Uploaded {formatDate(doc.createdAt)}
              {doc.verifiedAt && ` • Verified ${formatDate(doc.verifiedAt)}`}
            </p>
            {doc.adminNote && (
              <p className="text-sm text-muted-foreground">Note: {doc.adminNote}</p>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(doc._id)}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
