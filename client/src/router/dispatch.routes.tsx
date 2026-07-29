import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

const Dashboard = lazy(() => import('@/pages/dispatch/DashboardPage'))
const Queue = lazy(() => import('@/pages/dispatch/QueuePage'))
const Config = lazy(() => import('@/pages/dispatch/DispatchConfigPage'))
const LiveMap = lazy(() => import('@/pages/dispatch/LiveMapPage'))

export const dispatchRoutes: RouteObject[] = [
  { path: 'dashboard', element: <Dashboard /> },
  { path: 'queue', element: <Queue /> },
  { path: 'config', element: <Config /> },
  { path: 'live-map', element: <LiveMap /> },
]
