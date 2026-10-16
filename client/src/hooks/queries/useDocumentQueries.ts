import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import { unwrap } from '@/hooks/reactQuery'
import type { Document, VerificationRequest } from '@/types/document'

export interface PublicUploadResult {
  url: string
  fileName: string
  type: string
}

export function useUploadPublicDocument() {
  return useMutation({
    mutationFn: async ({ file, type }: { file: File; type: string }): Promise<PublicUploadResult> => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      const response = (await api.post('/documents/upload-public', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })) as unknown as { data: PublicUploadResult }
      return response.data
    },
  })
}

export function useUploadDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) =>
      api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }) as Promise<unknown> as Promise<{ document: Document }>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

export function useMyDocuments() {
  return useQuery({
    queryKey: ['documents', 'my'],
    queryFn: () => api.get('/documents/my').then(unwrap) as Promise<unknown> as Promise<Document[]>,
    staleTime: 30_000,
  })
}

export function useVerificationSummary() {
  return useQuery({
    queryKey: ['documents', 'verification-summary'],
    queryFn: () => api.get('/documents/verification-summary') as Promise<unknown> as Promise<{
      total: number
      pending: number
      verified: number
      rejected: number
    }>,
    staleTime: 30_000,
  })
}

export function useDeleteDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/documents/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

export function usePendingVerifications() {
  return useQuery({
    queryKey: ['documents', 'admin', 'pending'],
    queryFn: () => api.get('/documents/admin/pending').then(unwrap) as Promise<unknown> as Promise<Document[]>,
    staleTime: 30_000,
  })
}

export function useVerifyDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VerificationRequest }) =>
      api.post(`/documents/admin/${id}/verify`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

export function useUserDocuments(userId: string) {
  return useQuery({
    queryKey: ['documents', 'admin', 'users', userId],
    queryFn: () => api.get(`/documents/admin/users/${userId}`).then(unwrap) as Promise<unknown> as Promise<Document[]>,
    enabled: !!userId,
  })
}

export function useUserVerificationSummary(userId: string) {
  return useQuery({
    queryKey: ['documents', 'admin', 'users', userId, 'summary'],
    queryFn: () => api.get(`/documents/admin/users/${userId}/summary`) as Promise<unknown> as Promise<{
      allVerified: boolean
      pending: number
      verified: number
      rejected: number
    }>,
    enabled: !!userId,
  })
}
