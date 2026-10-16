import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import { unwrap, unwrapKeyed } from '@/hooks/reactQuery'
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
    mutationFn: (currentOrderId: string) =>
      api.post('/dispatch/batch/suggest', { currentOrderId }).then((envelope) => {
        const group = unwrap<RawBatchGroup | null>(envelope)
        if (!group) return null
        const waypoints = group.route?.waypoints ?? []
        const mapped: BatchGroup = {
          _id: group.id,
          orders: group.orderIdsDisplay ?? [],
          route: {
            origin: (waypoints[0]?.location?.coordinates ?? [0, 0]) as [number, number],
            stops: waypoints.map((w) => ({
              order: String(w.orderId),
              location: (w.location?.coordinates ?? [0, 0]) as [number, number],
              type: w.type === 'PICKUP' ? 'pickup' : 'delivery',
            })),
          },
          totalDistance: (group.route?.totalDistance ?? 0) / 1000,
          totalEarnings: 0,
          score: 0,
        }
        return mapped
      }),
  })
}

interface RawBatchGroup {
  id: string
  orderIdsDisplay?: string[]
  route?: {
    waypoints?: Array<{
      orderId: string
      type: 'PICKUP' | 'DELIVERY'
      location?: { coordinates?: [number, number] }
    }>
    totalDistance?: number
  }
}

export function useDispatchConfig() {
  return useQuery({
    queryKey: ['dispatch', 'config'],
    queryFn: () => api.get('/dispatch/admin/config').then(unwrapKeyed('config')) as Promise<unknown> as Promise<{ config: DispatchConfig }>,
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
    queryFn: () => api.get('/dispatch/admin/pending').then(unwrap) as Promise<unknown> as Promise<DispatchRequest[]>,
    staleTime: 15_000,
  })
}

export function useDriverPendingDispatchRequests() {
  return useQuery({
    queryKey: ['dispatch', 'driver', 'pending'],
    queryFn: () => api.get('/dispatch/driver/pending').then(unwrap) as Promise<unknown> as Promise<DispatchRequest[]>,
    staleTime: 15_000,
    refetchInterval: 20_000,
  })
}
