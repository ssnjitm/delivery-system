import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import { unwrapKeyed } from '@/hooks/reactQuery'
import type { IUser } from '@/types/user'

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get('/users/me').then(unwrapKeyed('user')) as Promise<unknown> as Promise<{ user: IUser }>,
    staleTime: 30_000,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<IUser>) =>
      api.patch('/users/me', data) as Promise<unknown> as Promise<{ user: IUser }>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
