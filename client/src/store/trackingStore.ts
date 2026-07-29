import { create } from 'zustand'
import type { DriverLocation } from '@/types/tracking'

interface TrackingState {
  activeSessions: Record<string, DriverLocation>
  updateLocation: (driverId: string, location: DriverLocation) => void
  removeSession: (driverId: string) => void
  clearAll: () => void
}

export const useTrackingStore = create<TrackingState>((set) => ({
  activeSessions: {},
  updateLocation: (driverId, location) =>
    set((state) => ({
      activeSessions: {
        ...state.activeSessions,
        [driverId]: location,
      },
    })),
  removeSession: (driverId) =>
    set((state) => {
      const { [driverId]: removed, ...rest } = state.activeSessions; void removed
      return { activeSessions: rest }
    }),
  clearAll: () => set({ activeSessions: {} }),
}))
