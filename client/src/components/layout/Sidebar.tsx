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
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { UserRole } from '@/types/auth'

interface NavItem {
  label: string
  icon: LucideIcon
  href: string
  roles: UserRole[]
  section?: 'dashboard' | 'operations' | 'admin' | 'account'
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', roles: ['CUSTOMER', 'NORMAL_USER', 'VENDOR', 'DRIVER', 'DISPATCH'], section: 'dashboard' },
  { label: 'Create Order', icon: PlusCircle, href: '/orders/create', roles: ['CUSTOMER', 'NORMAL_USER', 'VENDOR'], section: 'operations' },
  { label: 'My Orders', icon: Package, href: '/orders', roles: ['CUSTOMER', 'NORMAL_USER', 'VENDOR'], section: 'operations' },
  { label: 'Available Orders', icon: ClipboardList, href: '/available', roles: ['DRIVER'], section: 'operations' },
  { label: 'My Deliveries', icon: Truck, href: '/deliveries', roles: ['DRIVER'], section: 'operations' },
  { label: 'Navigate', icon: Route, href: '/navigate', roles: ['DRIVER'], section: 'operations' },
  { label: 'Batch Suggestions', icon: Map, href: '/batch', roles: ['DRIVER'], section: 'operations' },
  { label: 'Earnings', icon: DollarSign, href: '/earnings', roles: ['DRIVER'], section: 'operations' },
  { label: 'Dispatch Queue', icon: ClipboardList, href: '/queue', roles: ['DISPATCH'], section: 'operations' },
  { label: 'Live Map', icon: MapPin, href: '/live-map', roles: ['DISPATCH', 'ADMIN'], section: 'operations' },
  { label: 'Dispatch Config', icon: Settings, href: '/config', roles: ['DISPATCH', 'ADMIN'], section: 'operations' },
  { label: 'Overview', icon: LayoutDashboard, href: '/admin/dashboard', roles: ['ADMIN'], section: 'admin' },
  { label: 'Users', icon: Users, href: '/admin/users', roles: ['ADMIN'], section: 'admin' },
  { label: 'Vendors', icon: Users, href: '/admin/vendors', roles: ['ADMIN'], section: 'admin' },
  { label: 'Drivers', icon: Truck, href: '/admin/drivers', roles: ['ADMIN'], section: 'admin' },
  { label: 'Orders', icon: Package, href: '/admin/orders', roles: ['ADMIN'], section: 'admin' },
  { label: 'Disputes', icon: AlertTriangle, href: '/admin/disputes', roles: ['ADMIN'], section: 'admin' },
  { label: 'Documents', icon: FileText, href: '/admin/documents', roles: ['ADMIN'], section: 'admin' },
  { label: 'Pricing Config', icon: Scale, href: '/admin/pricing', roles: ['ADMIN'], section: 'admin' },
  { label: 'Area Pricing', icon: MapPin, href: '/admin/area-pricing', roles: ['ADMIN'], section: 'admin' },
  { label: 'Reports', icon: BarChart3, href: '/admin/reports', roles: ['ADMIN'], section: 'admin' },
  { label: 'Audit Logs', icon: BookOpen, href: '/admin/audit-logs', roles: ['ADMIN'], section: 'admin' },
  { label: 'Profile', icon: Settings, href: '/profile', roles: ['CUSTOMER', 'NORMAL_USER', 'VENDOR', 'DRIVER', 'DISPATCH', 'ADMIN'], section: 'account' },
]

const sectionLabels: Record<string, string> = {
  dashboard: 'Main',
  operations: 'Operations',
  admin: 'Admin Console',
  account: 'Account',
}

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user } = useAuth()
  const role = user?.role

  const filtered = navItems
    .filter((item) => role && item.roles.includes(role))
    .reduce<Record<string, NavItem[]>>((acc, item) => {
      const section = item.section ?? 'operations'
      ;(acc[section] ??= []).push(item)
      return acc
    }, {})

  const sectionOrder = ['dashboard', 'operations', 'admin', 'account']

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-out lg:static lg:z-auto lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-brand">
            <Truck className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="font-heading text-base font-bold tracking-tight">FastDrop</p>
            <p className="text-[11px] font-medium text-muted-foreground">Delivery Platform</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {sectionOrder
            .filter((key) => filtered[key])
            .map((section) => (
              <div key={section} className="space-y-1">
                <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {sectionLabels[section]}
                </p>
                {filtered[section].map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                        isActive
                          ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-brand'
                          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          className={cn(
                            'h-[18px] w-[18px] transition-colors',
                            isActive ? 'text-white' : 'text-muted-foreground group-hover:text-sidebar-accent-foreground'
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                        {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/90" />}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-3">
          <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 p-4 text-white">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <p className="text-sm font-semibold">On-time Delivery</p>
            </div>
            <p className="mt-1 text-xs text-white/80">99.2% on-time · 4.8 star rating</p>
          </div>
        </div>
      </aside>
    </>
  )
}