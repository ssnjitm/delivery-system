import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import { unwrap, unwrapPaginated } from '@/hooks/reactQuery'
import type { DashboardStats, AuditLog, Dispute, ReportData } from '@/types/admin'
import type { IUser, IVendor, IDriver, ICustomer, INormalUser } from '@/types/user'
import type { PaginationParams, PaginatedResponse } from '@/types/api'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: () => api.get('/admin/dashboard/stats') as Promise<unknown> as Promise<DashboardStats>,
    staleTime: 60_000,
  })
}

export function useAdminUsers(params: PaginationParams & { search?: string; role?: string } = {}) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => api.get('/admin/users', { params }).then(unwrapPaginated) as Promise<unknown> as Promise<PaginatedResponse<IUser>>,
    staleTime: 30_000,
  })
}

export function useAdminUserDetail(userId: string) {
  return useQuery({
    queryKey: ['admin', 'users', userId],
    queryFn: () => api.get(`/admin/users/${userId}`) as Promise<unknown> as Promise<{ user: IUser }>,
    enabled: !!userId,
  })
}

export function useSuspendUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => api.post(`/admin/users/${userId}/suspend`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useActivateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => api.post(`/admin/users/${userId}/activate`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useAuditLogs(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', params],
    queryFn: () => api.get('/admin/audit-logs', { params }).then(unwrapPaginated) as Promise<unknown> as Promise<PaginatedResponse<AuditLog>>,
    staleTime: 30_000,
  })
}

export function useDisputes(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ['admin', 'disputes', params],
    queryFn: () => api.get('/admin/disputes', { params }).then(unwrapPaginated) as Promise<unknown> as Promise<PaginatedResponse<Dispute>>,
    staleTime: 30_000,
  })
}

export function useDisputeDetail(disputeId: string) {
  return useQuery({
    queryKey: ['admin', 'disputes', disputeId],
    queryFn: () => api.get(`/admin/disputes/${disputeId}`) as Promise<unknown> as Promise<{ dispute: Dispute }>,
    enabled: !!disputeId,
  })
}

export function useAssignDispute() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ disputeId, adminId }: { disputeId: string; adminId: string }) =>
      api.post(`/admin/disputes/${disputeId}/assign`, { adminId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'disputes'] })
    },
  })
}

export function useUpdateDisputeStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ disputeId, status }: { disputeId: string; status: string }) =>
      api.patch(`/admin/disputes/${disputeId}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'disputes'] })
    },
  })
}

export function useOrderReport(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ['admin', 'reports', 'orders', params],
    queryFn: () => api.get('/admin/reports/orders', { params }) as Promise<unknown> as Promise<ReportData>,
  })
}

export function useRevenueReport(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ['admin', 'reports', 'revenue', params],
    queryFn: () => api.get('/admin/reports/revenue', { params }) as Promise<unknown> as Promise<ReportData>,
  })
}

export function useDriverPerformance(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ['admin', 'reports', 'drivers', params],
    queryFn: () => api.get('/admin/reports/drivers', { params }) as Promise<unknown> as Promise<ReportData>,
  })
}

export function useVendorPerformance(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ['admin', 'reports', 'vendors', params],
    queryFn: () => api.get('/admin/reports/vendors', { params }) as Promise<unknown> as Promise<ReportData>,
  })
}

export function useBulkApproveVendors() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vendorIds: string[]) => api.post('/admin/bulk/approve-vendors', { vendorIds }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] })
    },
  })
}

export function useBulkVerifyDrivers() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (driverIds: string[]) => api.post('/admin/bulk/verify-drivers', { driverIds }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] })
    },
  })
}

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ['admin', 'search', query],
    queryFn: () => api.get('/admin/search/users', { params: { q: query } }) as Promise<unknown> as Promise<IUser[]>,
    enabled: query.length >= 2,
  })
}

export function useAllVendors() {
  return useQuery({
    queryKey: ['users', 'vendors'],
    queryFn: () => api.get('/users/vendors').then(unwrap) as Promise<unknown> as Promise<IVendor[]>,
    staleTime: 30_000,
  })
}

export function useApproveVendor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post(`/users/vendors/${id}/approve`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users', 'vendors'] })
    },
  })
}

export function useRejectVendor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post(`/users/vendors/${id}/reject`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users', 'vendors'] })
    },
  })
}

export function useAllDrivers() {
  return useQuery({
    queryKey: ['users', 'drivers'],
    queryFn: () => api.get('/users/drivers').then(unwrap) as Promise<unknown> as Promise<IDriver[]>,
    staleTime: 30_000,
  })
}

export function useVerifyDriver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post(`/users/drivers/${id}/verify`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users', 'drivers'] })
    },
  })
}

export function useRejectDriver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post(`/users/drivers/${id}/reject`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users', 'drivers'] })
    },
  })
}

export function useAllCustomers() {
  return useQuery({
    queryKey: ['users', 'customers'],
    queryFn: () => api.get('/users/customers').then(unwrap) as Promise<unknown> as Promise<ICustomer[]>,
    staleTime: 30_000,
  })
}

export function useAllNormalUsers() {
  return useQuery({
    queryKey: ['users', 'normal-users'],
    queryFn: () => api.get('/users/normal-users').then(unwrap) as Promise<unknown> as Promise<INormalUser[]>,
    staleTime: 30_000,
  })
}

export function useUserStats() {
  return useQuery({
    queryKey: ['users', 'stats'],
    queryFn: () => api.get('/users/stats') as Promise<unknown> as Promise<Record<string, number>>,
    staleTime: 60_000,
  })
}

export function useToggleUserStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.patch(`/users/${id}/toggle-status`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
