import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

const Dashboard = lazy(() => import('@/pages/vendor/DashboardPage'))
const CreateOrder = lazy(() => import('@/pages/vendor/CreateOrderPage'))
const MyOrders = lazy(() => import('@/pages/vendor/MyOrdersPage'))
const OrderDetail = lazy(() => import('@/pages/vendor/OrderDetailPage'))
const TrackOrder = lazy(() => import('@/pages/vendor/TrackOrderPage'))
const Profile = lazy(() => import('@/pages/vendor/ProfilePage'))

export const vendorRoutes: RouteObject[] = [
  { path: 'dashboard', element: <Dashboard /> },
  { path: 'orders/create', element: <CreateOrder /> },
  { path: 'orders', element: <MyOrders /> },
  { path: 'orders/:id', element: <OrderDetail /> },
  { path: 'orders/:id/track', element: <TrackOrder /> },
  { path: 'profile', element: <Profile /> },
]
