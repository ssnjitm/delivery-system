import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  side?: 'left' | 'right'
}

function Sheet({ open, onOpenChange, children, side = 'right' }: SheetProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div
        className={cn(
          'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out',
          side === 'left' ? 'left-0 top-0 h-full w-72' : 'right-0 top-0 h-full w-80'
        )}
      >
        {children}
      </div>
    </div>
  )
}

const SheetHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-2 text-center sm:text-left mb-4', className)}
      {...props}
    />
  )
)
SheetHeader.displayName = 'SheetHeader'

const SheetTitle = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('text-lg font-semibold text-foreground', className)}
      {...props}
    />
  )
)
SheetTitle.displayName = 'SheetTitle'

const SheetClose = forwardRef<HTMLButtonElement, HTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2',
        className
      )}
      {...props}
    />
  )
)
SheetClose.displayName = 'SheetClose'

export { Sheet, SheetHeader, SheetTitle, SheetClose }
