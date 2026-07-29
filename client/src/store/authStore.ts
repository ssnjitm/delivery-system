import { create } from 'zustand'
import type { AuthUser } from '@/types/auth'

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login: (accessToken: string, refreshToken: string, user: AuthUser) => void
  logout: () => void
  setUser: (user: AuthUser) => void
  setAccessToken: (token: string) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  login: (accessToken, refreshToken, user) =>
    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
    }),
  logout: () =>
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    }),
  setUser: (user) => set({ user }),
  setAccessToken: (token) => set({ accessToken: token }),
}))
