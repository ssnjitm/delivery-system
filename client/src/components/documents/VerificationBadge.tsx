import { cn } from '@/lib/utils'
import type { VerificationStatus } from '@/types/document'

interface VerificationBadgeProps {
  status: VerificationStatus
  className?: string
}

export function VerificationBadge({ status, className }: VerificationBadgeProps) {
  const styles: Record<VerificationStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    VERIFIED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
  }

  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', styles[status], className)}>
      {status}
    </span>
  )
}
