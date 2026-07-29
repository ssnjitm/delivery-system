import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

const Dashboard = lazy(() => import('@/pages/dispatch/DashboardPage'))

export const dispatchRoutes: RouteObject[] = [
  { path: 'dashboard', element: <Dashboard /> },
]
