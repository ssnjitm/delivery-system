import { useEffect, useRef } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/axios'
import { connectSocket } from '@/lib/socket'
import type { ApiResponse } from '@/types/api'

export function SessionRestorer() {
  const restored = useRef(false)

  useEffect(() => {
    if (restored.current) return
    restored.current = true

    const refreshToken = useAuthStore.getState().refreshToken
    if (!refreshToken) return

    api.post('/auth/refresh', { refreshToken })
      .then((res) => {
        const { data } = res as unknown as ApiResponse<{ accessToken: string }>
        const currentUser = useAuthStore.getState().user
        if (currentUser) {
          useAuthStore.getState().login(data.accessToken, refreshToken, currentUser)
          connectSocket(data.accessToken)
        }
      })
      .catch(() => {
        useAuthStore.getState().logout()
      })
  }, [])

  return <Outlet />
}
