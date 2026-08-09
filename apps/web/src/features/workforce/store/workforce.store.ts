import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GeoLocation } from "@marg/domain";

export interface OfflineCheckIn {
  id: string;
  responderId: string;
  shiftId: string;
  location: GeoLocation | null;
  timestamp: number;
}

interface WorkforceStore {
  offlineCheckIns: Record<string, OfflineCheckIn>;
  saveOfflineCheckIn: (id: string, checkIn: OfflineCheckIn) => void;
  removeOfflineCheckIn: (id: string) => void;
  clearOfflineCheckIns: () => void;
}

export const useWorkforceStore = create<WorkforceStore>()(
  persist(
    (set) => ({
      offlineCheckIns: {},
      saveOfflineCheckIn: (id, checkIn) =>
        set((state) => ({
          offlineCheckIns: {
            ...state.offlineCheckIns,
            [id]: checkIn,
          },
        })),
      removeOfflineCheckIn: (id) =>
        set((state) => {
          const { [id]: _, ...rest } = state.offlineCheckIns;
          return { offlineCheckIns: rest };
        }),
      clearOfflineCheckIns: () => set({ offlineCheckIns: {} }),
    }),
    {
      name: "marg-workforce-offline",
    }
  )
);
