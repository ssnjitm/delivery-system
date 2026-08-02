import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LogIn, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export interface DemoAccount {
  label: string
  phone: string
  password: string
  role: 'CUSTOMER' | 'NORMAL_USER' | 'VENDOR' | 'DRIVER' | 'DISPATCH' | 'ADMIN'
}

const dashboardMap: Record<DemoAccount['role'], string> = {
  CUSTOMER: '/dashboard',
  NORMAL_USER: '/dashboard',
  VENDOR: '/dashboard',
  DRIVER: '/dashboard',
  DISPATCH: '/dashboard',
  ADMIN: '/admin/dashboard',
}

const roleColors: Record<DemoAccount['role'], string> = {
  CUSTOMER: 'bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
  NORMAL_USER: 'bg-slate-100 text-slate-700',
  VENDOR: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  DRIVER: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15',
  DISPATCH: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15',
  ADMIN: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15',
}

export function QuickLogin({ accounts }: { accounts: DemoAccount[] }) {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loadingPhone, setLoadingPhone] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (acc: DemoAccount) => {
    setError(null)
    setLoadingPhone(acc.phone)
    try {
      const res = (await login({ phone: acc.phone, password: acc.password })) as {
        user: { role?: DemoAccount['role'] }
      }
      const role = res?.user?.role ?? acc.role
      const dest = dashboardMap[role] ?? dashboardMap[acc.role] ?? '/dashboard'
      navigate(dest, { replace: true })
    } catch {
      setError(`Couldn't sign in as ${acc.label}. Run npm run seed in the server first.`)
    } finally {
      setLoadingPhone(null)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <LogIn className="h-3.5 w-3.5" />
        One-click demo sign in
      </div>
      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
      )}
      {accounts.map((acc) => (
        <Button
          key={acc.phone}
          variant="ghost"
          size="sm"
          onClick={() => handleLogin(acc)}
          disabled={loadingPhone !== null}
          className="w-full justify-between border border-border bg-card/50 hover:bg-accent"
        >
          <span>{acc.label}</span>
          {loadingPhone === acc.phone ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-600" />
          ) : (
            <span
              className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', roleColors[acc.role])}
            >
              {acc.role}
            </span>
          )}
        </Button>
      ))}
    </div>
  )
}