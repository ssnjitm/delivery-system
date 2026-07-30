import { useEffect, useRef } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/axios'
import { connectSocket } from '@/lib/socket'

export function SessionRestorer() {
  const restored = useRef(false)

  useEffect(() => {
    if (restored.current) return
    restored.current = true

    const refreshToken = useAuthStore.getState().refreshToken
    if (!refreshToken) return

    api.post('/auth/refresh', { refreshToken })
      .then((response: any) => {
        const { data } = response
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
