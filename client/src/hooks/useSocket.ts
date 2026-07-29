import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { connectSocket, disconnectSocket } from '@/lib/socket'

export function useSocket() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      const socket = connectSocket(accessToken)
      return () => {
        socket.disconnect()
      }
    } else {
      disconnectSocket()
    }
  }, [isAuthenticated, accessToken])
}
