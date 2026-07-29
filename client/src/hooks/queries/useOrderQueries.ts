import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { IOrder, CreateOrderPayload } from '@/types/order'
import type { PaginationParams, PaginatedResponse } from '@/types/api'

export function useMyOrders(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ['orders', 'my', params],
    queryFn: () => api.get('/orders/my', { params }) as Promise<unknown> as Promise<PaginatedResponse<IOrder>>,
    staleTime: 30_000,
  })
}

export function useOrderDetail(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => api.get(`/orders/${id}`) as Promise<unknown> as Promise<{ order: IOrder }>,
    enabled: !!id,
  })
}

export function useOrderByOrderId(orderId: string) {
  return useQuery({
    queryKey: ['orders', 'order-id', orderId],
    queryFn: () => api.get(`/orders/order-id/${orderId}`) as Promise<unknown> as Promise<{ order: IOrder }>,
    enabled: !!orderId,
  })
}

export function useCreateOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) =>
      api.post('/orders', payload) as Promise<unknown> as Promise<{ order: IOrder }>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/orders/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export function useCancelOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post(`/orders/${id}/cancel`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export function useCollectCOD() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post(`/orders/${id}/collect-cod`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export function useOrderStats() {
  return useQuery({
    queryKey: ['orders', 'stats'],
    queryFn: () => api.get('/orders/stats') as Promise<unknown> as Promise<Record<string, number>>,
    staleTime: 60_000,
  })
}

export function useAllOrders(params: PaginationParams & { status?: string } = {}) {
  return useQuery({
    queryKey: ['orders', 'admin', params],
    queryFn: () => api.get('/orders/admin/all', { params }) as Promise<unknown> as Promise<PaginatedResponse<IOrder>>,
    staleTime: 30_000,
  })
}

export function useDispatchStatus(orderId: string) {
  return useQuery({
    queryKey: ['orders', 'dispatch-status', orderId],
    queryFn: () => api.get(`/orders/${orderId}/dispatch-status`) as Promise<unknown> as Promise<{ status: string; requestId?: string }>,
    enabled: !!orderId,
  })
}

export function usePriceBreakdown(orderId: string) {
  return useQuery({
    queryKey: ['orders', 'price', orderId],
    queryFn: () => api.get(`/orders/${orderId}/price`) as Promise<unknown> as Promise<{ pricing: IOrder['pricing'] }>,
    enabled: !!orderId,
  })
}

export function useAssignDriver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, driverId }: { id: string; driverId: string }) =>
      api.post(`/orders/${id}/assign-driver`, { driverId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
