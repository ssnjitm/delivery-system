import { NavLink } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Package, Truck, ClipboardList, User } from 'lucide-react'

export function MobileNav() {
  const { user } = useAuth()
  const role = user?.role

  const items = [
    { icon: LayoutDashboard, href: '/dashboard', label: 'Dashboard', roles: ['CUSTOMER', 'NORMAL_USER', 'VENDOR', 'DRIVER', 'DISPATCH', 'ADMIN'] },
    { icon: Package, href: '/orders', label: 'Orders', roles: ['CUSTOMER', 'NORMAL_USER', 'VENDOR'] },
    { icon: ClipboardList, href: '/available', label: 'Available', roles: ['DRIVER'] },
    { icon: Truck, href: '/deliveries', label: 'Deliveries', roles: ['DRIVER'] },
    { icon: User, href: '/profile', label: 'Profile', roles: ['CUSTOMER', 'NORMAL_USER', 'VENDOR', 'DRIVER', 'DISPATCH', 'ADMIN'] },
  ].filter(item => role && item.roles.includes(role))

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background lg:hidden">
      <div className="flex items-center justify-around h-14">
        {items.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
