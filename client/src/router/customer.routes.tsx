import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

const Dashboard = lazy(() => import('@/pages/customer/DashboardPage'))

export const customerRoutes: RouteObject[] = [
  { path: 'dashboard', element: <Dashboard /> },
]
