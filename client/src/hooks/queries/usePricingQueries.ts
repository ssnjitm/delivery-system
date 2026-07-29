import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { AreaPricing, PricingConfig, PriceBreakdown } from '@/types/pricing'

export function useCalculatePrice() {
  return useMutation({
    mutationFn: (data: { pickup: [number, number]; delivery: [number, number]; weight?: number }) =>
      api.post('/pricing/calculate', data) as Promise<unknown> as Promise<PriceBreakdown>,
  })
}

export function usePricingConfig() {
  return useQuery({
    queryKey: ['pricing', 'config'],
    queryFn: () => api.get('/pricing/admin/config') as Promise<unknown> as Promise<{ config: PricingConfig }>,
    staleTime: 60_000,
  })
}

export function useUpdatePricingConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (config: Partial<PricingConfig>) => api.put('/pricing/admin/config', config),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pricing', 'config'] })
    },
  })
}

export function useAreaPricing() {
  return useQuery({
    queryKey: ['pricing', 'areas'],
    queryFn: () => api.get('/pricing/admin/areas') as Promise<unknown> as Promise<AreaPricing[]>,
    staleTime: 60_000,
  })
}

export function useCreateAreaPricing() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<AreaPricing, '_id'>) => api.post('/pricing/admin/areas', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pricing', 'areas'] })
    },
  })
}

export function useUpdateAreaPricing() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AreaPricing> }) =>
      api.put(`/pricing/admin/areas/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pricing', 'areas'] })
    },
  })
}
