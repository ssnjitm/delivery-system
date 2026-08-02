import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import { unwrapKeyed } from '@/hooks/reactQuery'
import type { DispatchRequest, BatchGroup, DispatchConfig } from '@/types/dispatch'

export function useFindDriver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (orderId: string) => api.post('/dispatch/find-driver', { orderId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dispatch'] })
    },
  })
}

export function useAcceptDispatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (requestId: string) => api.post(`/dispatch/${requestId}/accept`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dispatch'] })
      qc.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export function useRejectDispatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (requestId: string) => api.post(`/dispatch/${requestId}/reject`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dispatch'] })
    },
  })
}

export function useBatchSuggestions() {
  return useMutation({
    mutationFn: (orderIds: string[]) => api.post('/dispatch/batch/suggest', { orderIds }) as Promise<unknown> as Promise<BatchGroup[]>,
  })
}

export function useDispatchConfig() {
  return useQuery({
    queryKey: ['dispatch', 'config'],
    queryFn: () => api.get('/dispatch/admin/config') as Promise<unknown> as Promise<{ config: DispatchConfig }>,
    staleTime: 60_000,
  })
}

export function useUpdateDispatchConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (config: Partial<DispatchConfig>) => api.put('/dispatch/admin/config', config),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dispatch', 'config'] })
    },
  })
}

export function useProcessRetryQueue() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post('/dispatch/admin/process-queue'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dispatch'] })
    },
  })
}

export function usePendingDispatchRequests() {
  return useQuery({
    queryKey: ['dispatch', 'pending'],
    queryFn: () => api.get('/dispatch/pending') as Promise<unknown> as Promise<DispatchRequest[]>,
    staleTime: 15_000,
  })
}
