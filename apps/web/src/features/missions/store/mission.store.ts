import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Mission, Task, TaskStatus } from "../types";

export interface MissionDraft {
  id: string;
  title: string;
  incidentId: string;
  commanderId: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  objective: {
    description: string;
    successCriteria: string[];
  };
  deadline?: string;
  tasks: Task[];
  updatedAt: number;
}

interface MissionStore {
  drafts: Record<string, MissionDraft>;
  offlineMutations: Array<{
    id: string;
    missionId: string;
    taskId?: string;
    action: "CREATE_MISSION" | "CREATE_TASK" | "COMPLETE_TASK" | "ASSIGN_TASK";
    payload: any;
    timestamp: number;
  }>;
  saveDraft: (id: string, draft: Partial<MissionDraft>) => void;
  deleteDraft: (id: string) => void;
  enqueueMutation: (mutation: Omit<MissionStore["offlineMutations"][number], "id" | "timestamp">) => void;
  dequeueMutation: (id: string) => void;
  clearMutations: () => void;
}

export const useMissionStore = create<MissionStore>()(
  persist(
    (set) => ({
      drafts: {},
      offlineMutations: [],
      saveDraft: (id, draft) =>
        set((state) => {
          const existing = state.drafts[id] || {
            id,
            title: "",
            incidentId: "",
            commanderId: "",
            priority: "MEDIUM",
            objective: { description: "", successCriteria: [] },
            tasks: [],
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
      enqueueMutation: (mutation) =>
        set((state) => ({
          offlineMutations: [
            ...state.offlineMutations,
            {
              ...mutation,
              id: crypto.randomUUID(),
              timestamp: Date.now(),
            },
          ],
        })),
      dequeueMutation: (id) =>
        set((state) => ({
          offlineMutations: state.offlineMutations.filter((m) => m.id !== id),
        })),
      clearMutations: () => set({ offlineMutations: [] }),
    }),
    {
      name: "marg-mission-store",
    }
  )
);
