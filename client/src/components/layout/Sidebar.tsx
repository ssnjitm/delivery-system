import { NavLink } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Truck,
  MapPin,
  Users,
  Settings,
  FileText,
  BarChart3,
  ClipboardList,
  DollarSign,
  Map,
  Route,
  Scale,
  AlertTriangle,
  BookOpen,
  type LucideIcon,
} from 'lucide-react'
import type { UserRole } from '@/types/auth'

interface NavItem {
  label: string
  icon: LucideIcon
  href: string
  roles: UserRole[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', roles: ['CUSTOMER', 'NORMAL_USER', 'VENDOR', 'DRIVER', 'DISPATCH'] },
  { label: 'Create Order', icon: PlusCircle, href: '/orders/create', roles: ['CUSTOMER', 'NORMAL_USER', 'VENDOR'] },
  { label: 'My Orders', icon: Package, href: '/orders', roles: ['CUSTOMER', 'NORMAL_USER', 'VENDOR'] },
  { label: 'Available Orders', icon: ClipboardList, href: '/available', roles: ['DRIVER'] },
  { label: 'My Deliveries', icon: Truck, href: '/deliveries', roles: ['DRIVER'] },
  { label: 'Navigate', icon: Route, href: '/navigate', roles: ['DRIVER'] },
  { label: 'Batch Suggestions', icon: Map, href: '/batch', roles: ['DRIVER'] },
  { label: 'Earnings', icon: DollarSign, href: '/earnings', roles: ['DRIVER'] },
  { label: 'Dispatch Queue', icon: ClipboardList, href: '/queue', roles: ['DISPATCH'] },
  { label: 'Live Map', icon: MapPin, href: '/live-map', roles: ['DISPATCH', 'ADMIN'] },
  { label: 'Dispatch Config', icon: Settings, href: '/config', roles: ['DISPATCH', 'ADMIN'] },
  { label: 'Admin Dashboard', icon: LayoutDashboard, href: '/admin/dashboard', roles: ['ADMIN'] },
  { label: 'Users', icon: Users, href: '/admin/users', roles: ['ADMIN'] },
  { label: 'Vendors', icon: Users, href: '/admin/vendors', roles: ['ADMIN'] },
  { label: 'Drivers', icon: Truck, href: '/admin/drivers', roles: ['ADMIN'] },
  { label: 'Orders', icon: Package, href: '/admin/orders', roles: ['ADMIN'] },
  { label: 'Disputes', icon: AlertTriangle, href: '/admin/disputes', roles: ['ADMIN'] },
  { label: 'Documents', icon: FileText, href: '/admin/documents', roles: ['ADMIN'] },
  { label: 'Pricing Config', icon: Scale, href: '/admin/pricing', roles: ['ADMIN'] },
  { label: 'Area Pricing', icon: MapPin, href: '/admin/area-pricing', roles: ['ADMIN'] },
  { label: 'Reports', icon: BarChart3, href: '/admin/reports', roles: ['ADMIN'] },
  { label: 'Audit Logs', icon: BookOpen, href: '/admin/audit-logs', roles: ['ADMIN'] },
  { label: 'Profile', icon: Settings, href: '/profile', roles: ['CUSTOMER', 'NORMAL_USER', 'VENDOR', 'DRIVER', 'DISPATCH', 'ADMIN'] },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user } = useAuth()
  const role = user?.role

  const filteredItems = navItems.filter(
    (item) => role && item.roles.includes(role)
  )

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 bg-sidebar border-r transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-14 items-center border-b px-6">
          <span className="text-lg font-bold text-sidebar-foreground">Delivery System</span>
        </div>
        <nav className="overflow-y-auto p-4 space-y-1 h-[calc(100%-3.5rem)]">
          {filteredItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
