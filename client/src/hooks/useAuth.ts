import { useAuthStore } from '@/store/authStore'
import api from '@/lib/axios'
import { connectSocket, disconnectSocket } from '@/lib/socket'
import { useCallback } from 'react'
import type { LoginPayload, AuthUser, AuthResponse, UserRole } from '@/types/auth'
import type { ApiResponse } from '@/types/api'

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
    async (payload: LoginPayload) => {
      const response = (await api.post('/auth/login', payload)) as unknown as ApiResponse<AuthResponse>
      const { data } = response
      storeLogin(data.accessToken, data.refreshToken, data.user)
      connectSocket(data.accessToken)
      return data
    },
    [storeLogin]
  )

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // silent
    } finally {
      disconnectSocket()
      storeLogout()
    }
  }, [storeLogout])

  const refreshSession = useCallback(async () => {
    const token = useAuthStore.getState().refreshToken
    if (!token) return
    try {
      const response = (await api.post('/auth/refresh', { refreshToken: token })) as unknown as ApiResponse<{
        accessToken: string
      }>
      const { data } = response
      const currentUser = useAuthStore.getState().user
      if (currentUser) {
        storeLogin(data.accessToken, token, currentUser)
        connectSocket(data.accessToken)
      }
    } catch {
      storeLogout()
    }
  }, [storeLogin, storeLogout])

  const fetchProfile = useCallback(async () => {
    try {
      const response = (await api.get('/users/me')) as unknown as ApiResponse<AuthUser>
      const userData = response.data
      setUser(userData)
      return userData
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
