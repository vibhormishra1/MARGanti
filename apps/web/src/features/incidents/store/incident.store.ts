import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IncidentStatus, IncidentPriority, GeoLocation } from "@marg/domain";

export interface IncidentDraft {
  id: string;
  title: string;
  description: string;
  location: GeoLocation | null;
  priority: IncidentPriority;
  status: IncidentStatus;
  updatedAt: number;
}

interface IncidentStore {
  drafts: Record<string, IncidentDraft>;
  saveDraft: (id: string, draft: Partial<IncidentDraft>) => void;
  deleteDraft: (id: string) => void;
  clearAllDrafts: () => void;
}

export const useIncidentStore = create<IncidentStore>()(
  persist(
    (set) => ({
      drafts: {},
      saveDraft: (id, draft) =>
        set((state) => {
          const existing = state.drafts[id] || {
            id,
            title: "",
            description: "",
            location: null,
            priority: IncidentPriority.MEDIUM,
            status: IncidentStatus.DRAFT,
            updatedAt: Date.now(),
          };
          return {
            drafts: {
              ...state.drafts,
              [id]: { ...existing, ...draft, updatedAt: Date.now() },
            },
          };
        }),
      deleteDraft: (id) =>
        set((state) => {
          const { [id]: _, ...rest } = state.drafts;
          return { drafts: rest };
        }),
      clearAllDrafts: () => set({ drafts: {} }),
    }),
    {
      name: "marg-incident-drafts", // Persists to localStorage/IndexedDB
    }
  )
);
