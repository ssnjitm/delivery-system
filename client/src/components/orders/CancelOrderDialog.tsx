import { ConfirmDialog } from '@/components/shared/ConfirmDialog'

interface CancelOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  loading?: boolean
}

export function CancelOrderDialog({ open, onOpenChange, onConfirm, loading }: CancelOrderDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Cancel Order"
      description="Are you sure you want to cancel this order? This action cannot be undone."
      confirmLabel="Cancel Order"
      variant="destructive"
      onConfirm={onConfirm}
      loading={loading}
    />
  )
}
