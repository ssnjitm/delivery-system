import { cn } from '@/lib/utils'

interface StatusFilterProps<T extends string> {
  options: Array<{ value: T | 'all'; label: string }>
  value: T | 'all'
  onChange: (value: T | 'all') => void
  className?: string
}

export function StatusFilter<T extends string>({ options, value, onChange, className }: StatusFilterProps<T>) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium transition-colors',
            value === option.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
