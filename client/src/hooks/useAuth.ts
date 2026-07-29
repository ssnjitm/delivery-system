import { useAuthStore } from '@/store/authStore'
import api from '@/lib/axios'
import { disconnectSocket } from '@/lib/socket'
import { useCallback } from 'react'
import type { LoginPayload, AuthResponse, AuthUser, UserRole } from '@/types/auth'

export function useAuth() {
  const {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    login: storeLogin,
    logout: storeLogout,
    setUser,
  } = useAuthStore()

  const login = useCallback(
    async (payload: LoginPayload): Promise<AuthResponse> => {
      const response = await api.post('/auth/login', payload) as unknown as AuthResponse
      storeLogin(response.accessToken, response.refreshToken, response.user)
      return response
    },
    [storeLogin]
  )

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch {
    } finally {
      disconnectSocket()
      storeLogout()
    }
  }, [storeLogout])

  const refreshSession = useCallback(async () => {
    if (!refreshToken) return
    try {
      const response = await api.post('/auth/refresh', { refreshToken }) as unknown as AuthResponse
      storeLogin(response.accessToken, response.refreshToken, response.user)
    } catch {
      storeLogout()
    }
  }, [refreshToken, storeLogin, storeLogout])

  const fetchProfile = useCallback(async () => {
    try {
      const response = await api.get('/users/me') as unknown as { user: AuthUser }
      setUser(response.user)
      return response.user
    } catch {
      return null
    }
  }, [setUser])

  const hasRole = useCallback(
    (...roles: UserRole[]) => {
      if (!user) return false
      return roles.includes(user.role)
    },
    [user]
  )

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    login,
    logout,
    refreshSession,
    fetchProfile,
    hasRole,
  }
}
