import { useMutation } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { LoginPayload, RegisterPayload, AuthResponse } from '@/types/auth'

export function useLoginMutation() {
  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      api.post('/auth/login', payload) as Promise<unknown> as Promise<AuthResponse>,
  })
}

export function useRegisterMutation(role: 'vendor' | 'driver' | 'customer') {
  return useMutation({
    mutationFn: (payload: RegisterPayload) =>
      api.post(`/auth/register/${role}`, payload) as Promise<unknown> as Promise<AuthResponse>,
  })
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: () => api.post('/auth/logout'),
  })
}
