import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/axios'
import { unwrap } from '@/hooks/reactQuery'
import type { DriverLocation, OrderTracking } from '@/types/tracking'
import type { PaginationParams } from '@/types/api'

export function useUpdateLocation() {
  return useMutation({
    mutationFn: (location: { coordinates: [number, number] }) =>
      api.post('/tracking/location', location),
  })
}

export function useDriverLocation(driverId: string) {
  return useQuery({
    queryKey: ['tracking', 'driver', driverId],
    queryFn: () => api.get(`/tracking/driver/${driverId}`).then(unwrap) as Promise<unknown> as Promise<DriverLocation>,
    enabled: !!driverId,
    refetchInterval: 10_000,
  })
}

export function useDriverLocationHistory(driverId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: ['tracking', 'driver', driverId, 'history', params],
    queryFn: () => api.get(`/tracking/driver/${driverId}/history`, { params }).then(unwrap) as Promise<unknown> as Promise<DriverLocation[]>,
    enabled: !!driverId,
  })
}

export function useDriverDailySummary(driverId: string) {
  return useQuery({
    queryKey: ['tracking', 'driver', driverId, 'summary'],
    queryFn: () => api.get(`/tracking/driver/${driverId}/summary`).then(unwrap) as Promise<unknown> as Promise<Record<string, unknown>>,
    enabled: !!driverId,
  })
}

export function useNearbyDrivers(params?: { lat?: number; lng?: number; radius?: number }) {
  return useQuery({
    queryKey: ['tracking', 'nearby', params],
    queryFn: () => api.get('/tracking/nearby', { params }).then(unwrap) as Promise<unknown> as Promise<DriverLocation[]>,
    staleTime: 15_000,
  })
}

export function useTrackOrder(orderId: string) {
  return useQuery({
    queryKey: ['tracking', 'order', orderId],
    queryFn: () => api.get(`/tracking/order/${orderId}`).then(unwrap) as Promise<unknown> as Promise<OrderTracking>,
    enabled: !!orderId,
    refetchInterval: 10_000,
  })
}

export function useAllDriversLocation() {
  return useQuery({
    queryKey: ['tracking', 'drivers'],
    queryFn: () => api.get('/tracking/drivers').then(unwrap) as Promise<unknown> as Promise<DriverLocation[]>,
    staleTime: 15_000,
  })
}
