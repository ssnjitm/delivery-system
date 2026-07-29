import { usePendingVerifications, useVerifyDocument } from '@/hooks/queries/useDocumentQueries'
import { AdminVerificationPanel } from '@/components/documents/AdminVerificationPanel'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorState } from '@/components/shared/ErrorState'

export default function DocumentsPage() {
  const { data: documents, isLoading, error, refetch } = usePendingVerifications()
  const verifyDoc = useVerifyDocument()

  if (isLoading) return <LoadingSpinner size="lg" className="py-12" />
  if (error) return <ErrorState error={error as Error} onRetry={refetch} />

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Document Verifications</h1>
      <AdminVerificationPanel
        documents={documents || []}
        onVerify={(docId, data) => verifyDoc.mutate({ id: docId, data })}
        loading={verifyDoc.isPending}
      />
    </div>
  )
}
