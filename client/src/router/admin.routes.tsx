import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

const Dashboard = lazy(() => import('@/pages/admin/DashboardPage'))
const Users = lazy(() => import('@/pages/admin/UsersPage'))
const UserDetail = lazy(() => import('@/pages/admin/UserDetailPage'))
const Vendors = lazy(() => import('@/pages/admin/VendorsPage'))
const Drivers = lazy(() => import('@/pages/admin/DriversPage'))
const Orders = lazy(() => import('@/pages/admin/OrdersPage'))
const Disputes = lazy(() => import('@/pages/admin/DisputesPage'))
const DisputeDetail = lazy(() => import('@/pages/admin/DisputeDetailPage'))
const Documents = lazy(() => import('@/pages/admin/DocumentsPage'))
const PricingConfig = lazy(() => import('@/pages/admin/PricingConfigPage'))
const AreaPricing = lazy(() => import('@/pages/admin/AreaPricingPage'))
const Reports = lazy(() => import('@/pages/admin/ReportsPage'))
const AuditLogs = lazy(() => import('@/pages/admin/AuditLogsPage'))
const Settings = lazy(() => import('@/pages/admin/SettingsPage'))

export const adminRoutes: RouteObject[] = [
  { path: 'dashboard', element: <Dashboard /> },
  { path: 'users', element: <Users /> },
  { path: 'users/:id', element: <UserDetail /> },
  { path: 'vendors', element: <Vendors /> },
  { path: 'drivers', element: <Drivers /> },
  { path: 'orders', element: <Orders /> },
  { path: 'disputes', element: <Disputes /> },
  { path: 'disputes/:id', element: <DisputeDetail /> },
  { path: 'documents', element: <Documents /> },
  { path: 'pricing', element: <PricingConfig /> },
  { path: 'area-pricing', element: <AreaPricing /> },
  { path: 'reports', element: <Reports /> },
  { path: 'audit-logs', element: <AuditLogs /> },
  { path: 'settings', element: <Settings /> },
]
