import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Wifi, WifiOff } from 'lucide-react'

interface DriverStatusToggleProps {
  isOnline: boolean
  onToggle: () => void
  loading?: boolean
}

export function DriverStatusToggle({ isOnline, onToggle, loading }: DriverStatusToggleProps) {
  return (
    <Button
      variant={isOnline ? 'default' : 'outline'}
      size="lg"
      onClick={onToggle}
      disabled={loading}
      className={cn(
        'w-full gap-2',
        isOnline && 'bg-green-600 hover:bg-green-700'
      )}
    >
      {isOnline ? (
        <>
          <Wifi className="h-5 w-5" />
          Online
        </>
      ) : (
        <>
          <WifiOff className="h-5 w-5" />
          Offline
        </>
      )}
    </Button>
  )
}
