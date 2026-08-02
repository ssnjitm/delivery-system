import type { PaginatedResponse } from '@/types/api'

// The axios interceptor returns the server envelope: { success, data, meta }.
// - unwrap(): returns the inner payload for list/object endpoints (data).
// - unwrapPaginated(): maps the envelope { data, meta } into the client
//   PaginatedResponse<T> shape the pages expect ({ data, pagination }).
export const unwrap = <T>(envelope: unknown): T => (envelope as { data: T }).data

export const unwrapPaginated = <T>(envelope: unknown): PaginatedResponse<T> => {
  const e = envelope as { success: boolean; data: T[]; meta?: { total: number; page: number; limit: number; totalPages: number } }
  return {
    success: e.success,
    data: e.data ?? [],
    pagination: e.meta || {
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 1,
    },
  }
}