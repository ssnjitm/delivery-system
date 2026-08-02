import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/store/uiStore'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { getInitials } from '@/lib/utils'
import { Menu, Bell, LogOut, User, Moon, Sun, ChevronDown, Command } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrator',
  DISPATCH: 'Dispatch Operator',
  DRIVER: 'Delivery Driver',
  VENDOR: 'Vendor',
  CUSTOMER: 'Customer',
  NORMAL_USER: 'Member',
}

export function Topbar() {
  const { user, logout } = useAuth()
  const { toggleSidebar, theme, setTheme } = useUIStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    setDropdownOpen(false)
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/90 px-4 backdrop-blur-xl lg:px-6">
      <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
        <Menu className="h-5 w-5" />
      </Button>

      {user && (
        <div className="hidden items-center gap-2 rounded-lg bg-secondary/60 px-3 py-1.5 sm:flex">
          <Command className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            {roleLabels[user.role] ?? user.role}
          </span>
        </div>
      )}

      <div className="flex-1" />

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className="text-muted-foreground hover:text-foreground"
      >
        {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </Button>

      <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
        <Bell className="h-5 w-5" />
        <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-brand-500 ring-2 ring-card" />
      </Button>

      <div className="h-6 w-px bg-border" />

      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2.5 rounded-xl px-1.5 py-1 transition-colors hover:bg-accent"
        >
          <Avatar className="h-9 w-9 ring-2 ring-brand-500/30">
            <AvatarFallback className="bg-gradient-to-br from-brand-500 to-brand-600 font-semibold text-white">
              {user?.name ? getInitials(user.name) : '?'}
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left leading-tight sm:block">
            <p className="text-sm font-semibold">{user?.name ?? 'Guest'}</p>
            <p className="text-xs text-muted-foreground">{roleLabels[user?.role ?? ''] ?? user?.role}</p>
          </div>
          <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
        </button>

        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
            <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-popover p-1.5 shadow-float animate-scale-in">
              <div className="border-b border-border px-3 py-2.5">
                <p className="truncate text-sm font-semibold">{user?.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.phone}</p>
              </div>
              <NavLink
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="mt-1 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm hover:bg-accent"
              >
                <User className="h-4 w-4" />
                Profile
              </NavLink>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="flex w-full items-center justify-start gap-2 rounded-lg px-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}