import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

const LandingPage = lazy(() => import('@/pages/public/LandingPage'))
const LoginPage = lazy(() => import('@/pages/public/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/public/RegisterPage'))
const RegisterVendorPage = lazy(() => import('@/pages/public/RegisterVendorPage'))
const RegisterDriverPage = lazy(() => import('@/pages/public/RegisterDriverPage'))
const RegisterCustomerPage = lazy(() => import('@/pages/public/RegisterCustomerPage'))
const NotFoundPage = lazy(() => import('@/pages/public/NotFoundPage'))

export const publicRoutes: RouteObject[] = [
  { index: true, element: <LandingPage /> },
  { path: 'login', element: <LoginPage /> },
  { path: 'register', element: <RegisterPage /> },
  { path: 'register/vendor', element: <RegisterVendorPage /> },
  { path: 'register/driver', element: <RegisterDriverPage /> },
  { path: 'register/customer', element: <RegisterCustomerPage /> },
  { path: '*', element: <NotFoundPage /> },
]
