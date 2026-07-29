import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

const Dashboard = lazy(() => import('@/pages/customer/DashboardPage'))
const CreateOrder = lazy(() => import('@/pages/customer/CreateOrderPage'))
const MyOrders = lazy(() => import('@/pages/customer/MyOrdersPage'))
const OrderDetail = lazy(() => import('@/pages/customer/OrderDetailPage'))
const TrackOrder = lazy(() => import('@/pages/customer/TrackOrderPage'))
const Profile = lazy(() => import('@/pages/customer/ProfilePage'))

export const customerRoutes: RouteObject[] = [
  { path: 'dashboard', element: <Dashboard /> },
  { path: 'orders/create', element: <CreateOrder /> },
  { path: 'orders', element: <MyOrders /> },
  { path: 'orders/:id', element: <OrderDetail /> },
  { path: 'orders/:id/track', element: <TrackOrder /> },
  { path: 'profile', element: <Profile /> },
]
