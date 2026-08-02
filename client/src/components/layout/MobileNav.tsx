import { NavLink } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Package, Truck, ClipboardList, User } from 'lucide-react'

export function MobileNav() {
  const { user } = useAuth()
  const role = user?.role

  const items = [
    { icon: LayoutDashboard, href: '/dashboard', label: 'Home', roles: ['CUSTOMER', 'NORMAL_USER', 'VENDOR', 'DRIVER', 'DISPATCH', 'ADMIN'] },
    { icon: Package, href: '/orders', label: 'Orders', roles: ['CUSTOMER', 'NORMAL_USER', 'VENDOR'] },
    { icon: ClipboardList, href: '/available', label: 'Jobs', roles: ['DRIVER'] },
    { icon: Truck, href: '/deliveries', label: 'Deliveries', roles: ['DRIVER'] },
    { icon: User, href: '/profile', label: 'Profile', roles: ['CUSTOMER', 'NORMAL_USER', 'VENDOR', 'DRIVER', 'DISPATCH', 'ADMIN'] },
  ].filter(item => role && item.roles.includes(role))

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-around h-16 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'group flex flex-col items-center gap-1 px-3 py-1 text-[11px] font-medium transition-colors',
                isActive ? 'text-brand-600 dark:text-brand-400' : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'flex h-8 w-12 items-center justify-center rounded-full transition-colors',
                    isActive && 'bg-brand-soft'
                  )}
                >
                  <item.icon
                    className={cn('h-5 w-5', isActive ? 'text-brand-600 dark:text-brand-400' : '')}
                  />
                </span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}