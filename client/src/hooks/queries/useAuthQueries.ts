import { useMutation } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { LoginPayload, AuthResponse, ConsumerSignupPayload, VendorSignupPayload, DriverSignupPayload } from '@/types/auth'

type SignupPayload = ConsumerSignupPayload | VendorSignupPayload | DriverSignupPayload

export function useLoginMutation() {
  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      api.post('/auth/login', payload) as Promise<unknown> as Promise<AuthResponse>,
  })
}

export function useRegisterMutation(_role: 'vendor' | 'driver' | 'customer') {
  return useMutation({
    mutationFn: (payload: SignupPayload) =>
      api.post(`/auth/register/${_role}`, payload) as Promise<unknown> as Promise<{
        success: boolean
        message: string
        data: { userId: string; role: string; isVerified: boolean }
      }>,
  })
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: () => api.post('/auth/logout'),
  })
}
