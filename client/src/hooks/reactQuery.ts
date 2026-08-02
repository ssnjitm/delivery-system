import type { PaginatedResponse } from '@/types/api'

// The axios interceptor returns the server envelope: { success, data, meta }.
// The functions below unwrap that envelope into the shape the consuming hooks
// and pages actually expect, so their TypeScript types reflect reality.
//
// - unwrap(value): returns the inner payload (data) directly.
// - unwrapKeyed(value, key): wraps the inner payload as { [key]: data } for
//   hooks/pages that read data?.order / data?.user / data?.config ... .
// - unwrapPaginated(value): maps { data, meta } into PaginatedResponse<T>.
export const unwrap = <T>(envelope: unknown): T => (envelope as { data: T }).data

export const unwrapKeyed =
  <K extends string>(key: K) =>
  <T>(envelope: unknown): Record<K, T> =>
    ({ [key]: (envelope as { data: T }).data }) as Record<K, T>

export const unwrapPaginated = <T>(envelope: unknown): PaginatedResponse<T> => {
  const e = envelope as {
    success: boolean
    data: T[]
    meta?: { total: number; page: number; limit: number; totalPages: number }
  }
  return {
    success: e.success,
    data: e.data ?? [],
    pagination: e.meta || { total: 0, page: 1, limit: 20, totalPages: 1 },
  }
}