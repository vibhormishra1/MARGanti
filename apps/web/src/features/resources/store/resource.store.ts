import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ResourceQuantity } from "@marg/domain";

export interface OfflineAllocation {
  id: string;
  incidentId: string;
  inventoryItemId: string;
  quantity: ResourceQuantity;
  assignedTo: string;
  timestamp: number;
}

interface ResourceStore {
  offlineAllocations: Record<string, OfflineAllocation>;
  saveOfflineAllocation: (id: string, allocation: OfflineAllocation) => void;
  removeOfflineAllocation: (id: string) => void;
  clearOfflineAllocations: () => void;
}

export const useResourceStore = create<ResourceStore>()(
  persist(
    (set) => ({
      offlineAllocations: {},
      saveOfflineAllocation: (id, allocation) =>
        set((state) => ({
          offlineAllocations: {
            ...state.offlineAllocations,
            [id]: allocation,
          },
        })),
      removeOfflineAllocation: (id) =>
        set((state) => {
          const { [id]: _, ...rest } = state.offlineAllocations;
          return { offlineAllocations: rest };
        }),
      clearOfflineAllocations: () => set({ offlineAllocations: {} }),
    }),
    {
      name: "marg-resource-offline",
    }
  )
);
