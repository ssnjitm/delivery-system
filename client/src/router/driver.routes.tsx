import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

const Dashboard = lazy(() => import('@/pages/driver/DashboardPage'))

export const driverRoutes: RouteObject[] = [
  { path: 'dashboard', element: <Dashboard /> },
]
