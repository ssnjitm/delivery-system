import { createBrowserRouter } from 'react-router-dom'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { publicRoutes } from './public.routes'
import { customerRoutes } from './customer.routes'
import { vendorRoutes } from './vendor.routes'
import { driverRoutes } from './driver.routes'
import { dispatchRoutes } from './dispatch.routes'
import { adminRoutes } from './admin.routes'

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: publicRoutes,
  },
  {
    element: <ProtectedRoute allowedRoles={['CUSTOMER', 'NORMAL_USER']} />,
    children: [
      {
        element: <AppShell />,
        children: customerRoutes,
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['VENDOR']} />,
    children: [
      {
        element: <AppShell />,
        children: vendorRoutes,
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['DRIVER']} />,
    children: [
      {
        element: <AppShell />,
        children: driverRoutes,
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['DISPATCH']} />,
    children: [
      {
        element: <AppShell />,
        children: dispatchRoutes,
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['ADMIN']} />,
    children: [
      {
        element: <AppShell />,
        children: adminRoutes,
      },
    ],
  },
])
