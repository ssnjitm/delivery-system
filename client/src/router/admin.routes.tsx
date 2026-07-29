import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

const Dashboard = lazy(() => import('@/pages/admin/DashboardPage'))

export const adminRoutes: RouteObject[] = [
  { path: 'dashboard', element: <Dashboard /> },
]
