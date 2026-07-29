import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { UserRole } from '@/types/auth'

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" message="Loading..." />
      </div>
    )
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const dashboardMap: Record<UserRole, string> = {
      CUSTOMER: '/dashboard',
      NORMAL_USER: '/dashboard',
      VENDOR: '/dashboard',
      DRIVER: '/dashboard',
      DISPATCH: '/dashboard',
      ADMIN: '/admin/dashboard',
    }
    return <Navigate to={dashboardMap[user.role] || '/dashboard'} replace />
  }

  return <Outlet />
}
