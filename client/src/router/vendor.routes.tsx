import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

const Dashboard = lazy(() => import('@/pages/vendor/DashboardPage'))

export const vendorRoutes: RouteObject[] = [
  { path: 'dashboard', element: <Dashboard /> },
]
