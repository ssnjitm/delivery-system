import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { AuthUser } from '@/types/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

type StoreShape = {
  getState: () => {
    accessToken: string | null
    refreshToken: string | null
    user: AuthUser | null
    login: (accessToken: string, refreshToken: string, user: AuthUser) => void
    logout: () => void
  }
}

let store: StoreShape | null = null

export function injectStore(s: StoreShape) {
  store = s
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = store?.getState()?.accessToken
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else if (token) {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  response => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`
          }
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = store?.getState()?.refreshToken
      if (!refreshToken) {
        store?.getState()?.logout()
        isRefreshing = false
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/auth/refresh`,
          { refreshToken }
        )
        const { accessToken } = data.data || data
        const currentUser = store?.getState()?.user
        if (currentUser) {
          store?.getState()?.login(accessToken, refreshToken, currentUser)
        }
        processQueue(null, accessToken)
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
        }
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        store?.getState()?.logout()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    if (error.response?.status === 403) {
      store?.getState()?.logout()
    }

    return Promise.reject(error)
  }
)

export default api
