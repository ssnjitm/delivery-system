import { Card } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  isLoading?: boolean
  trend?: number
  className?: string
  accent?: 'brand' | 'success' | 'warning' | 'destructive' | 'info'
}

const accents: Record<NonNullable<StatCardProps['accent']>, string> = {
  brand: 'text-brand-600 dark:text-brand-400 bg-brand-soft',
  success: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/15',
  warning: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/15',
  destructive: 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/15',
  info: 'text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-500/15',
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  isLoading,
  trend,
  className,
  accent = 'brand',
}: StatCardProps) {
  return (
    <Card
      className={cn(
        'group relative overflow-hidden p-5 transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {isLoading ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
          ) : (
            <p className="font-heading text-3xl font-bold tracking-tight">{value}</p>
          )}
          {description && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {trend !== undefined && (
                <span
                  className={cn(
                    'font-semibold',
                    trend > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  )}
                >
                  {trend > 0 ? '+' : ''}
                  {trend}%
                </span>
              )}
              {description}
            </p>
          )}
        </div>
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110',
            accents[accent]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div
        className={cn(
          'pointer-events-none absolute -bottom-10 -right-10 h-28 w-28 rounded-full opacity-[0.08] blur-2xl transition-opacity group-hover:opacity-[0.16]',
          'bg-brand-500'
        )}
      />
    </Card>
  )
}