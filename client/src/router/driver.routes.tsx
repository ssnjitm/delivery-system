import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

const Dashboard = lazy(() => import('@/pages/driver/DashboardPage'))
const AvailableOrders = lazy(() => import('@/pages/driver/AvailableOrdersPage'))
const MyDeliveries = lazy(() => import('@/pages/driver/MyDeliveriesPage'))
const DeliveryDetail = lazy(() => import('@/pages/driver/DeliveryDetailPage'))
const Navigate = lazy(() => import('@/pages/driver/NavigatePage'))
const Earnings = lazy(() => import('@/pages/driver/EarningsPage'))
const BatchSuggestions = lazy(() => import('@/pages/driver/BatchSuggestionsPage'))
const Profile = lazy(() => import('@/pages/driver/ProfilePage'))

export const driverRoutes: RouteObject[] = [
  { path: 'dashboard', element: <Dashboard /> },
  { path: 'available', element: <AvailableOrders /> },
  { path: 'deliveries', element: <MyDeliveries /> },
  { path: 'deliveries/:id', element: <DeliveryDetail /> },
  { path: 'deliveries/:id/navigate', element: <Navigate /> },
  { path: 'earnings', element: <Earnings /> },
  { path: 'batch', element: <BatchSuggestions /> },
  { path: 'profile', element: <Profile /> },
]
