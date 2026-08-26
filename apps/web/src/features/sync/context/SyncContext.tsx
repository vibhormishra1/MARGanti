"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { SyncOperation, SyncConflict } from "@marg/domain";
import { SyncQueueLocalRepository, SyncConflictLocalRepository } from "@marg/storage-local";

class MockSyncAdapter {
  constructor(private queueRepo: any, private conflictRepo: any) {}
  async pullUpdates() {}
  async pushOperations() {}
  async enqueueMutation(op: SyncOperation) {
    await this.queueRepo.enqueue(op);
  }
}

interface SyncContextValue {
  isOnline: boolean;
  isSyncing: boolean;
  pendingOperations: SyncOperation[];
  conflicts: SyncConflict[];
  setOnlineStatus: (status: boolean) => void;
  triggerSync: () => Promise<void>;
  enqueueMutation: (op: SyncOperation) => Promise<void>;
  resolveConflict: (conflictId: string, strategy: "KEEP_LOCAL" | "KEEP_REMOTE" | "MANUAL_MERGE", mergedPayload?: any) => Promise<void>;
}

const SyncContext = createContext<SyncContextValue | undefined>(undefined);

// Instantiate local singleton adapters
const queueRepo = new SyncQueueLocalRepository();
const conflictRepo = new SyncConflictLocalRepository();
const syncAdapter = new MockSyncAdapter(queueRepo, conflictRepo);

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingOperations, setPendingOperations] = useState<SyncOperation[]>([]);
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);

  const refreshState = async () => {
    const queue = await queueRepo.getGlobalQueue();
    setPendingOperations(queue.operations);
    const unresolved = await conflictRepo.findUnresolved();
    setConflicts(unresolved);
  };

  useEffect(() => {
    refreshState();
  }, []);

  // Background worker loop


  const setOnlineStatus = (status: boolean) => {
    setIsOnline(status);
    if (status) triggerSync(); // Immediate sync on reconnect
  };

  const triggerSync = useCallback(async () => {
    if (!isOnline || isSyncing) return;
    setIsSyncing(true);
    try {
      await syncAdapter.pullUpdates();
      await syncAdapter.pushOperations();
      await refreshState();
    } catch (e) {
      console.error("Sync failed", e);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOnline) {
      interval = setInterval(() => {
        triggerSync();
      }, 5000); // Poll every 5s if online
    }
    return () => clearInterval(interval);
  }, [isOnline, triggerSync]);

  const enqueueMutation = async (op: SyncOperation) => {
    await syncAdapter.enqueueMutation(op);
    await refreshState();
    if (isOnline) {
      triggerSync();
    }
  };

  const resolveConflict = async (conflictId: string, strategy: "KEEP_LOCAL" | "KEEP_REMOTE" | "MANUAL_MERGE", mergedPayload?: any) => {
    const conflict = await conflictRepo.findById(conflictId);
    if (conflict) {
      conflict.resolve(strategy, mergedPayload);
      await conflictRepo.save(conflict);
      
      // If kept local or merged, we need to enqueue a new update operation
      if (strategy === "KEEP_LOCAL" || strategy === "MANUAL_MERGE") {
        const newOpRes = SyncOperation.create({
          id: crypto.randomUUID(),
          entityId: conflict.entityId,
          entityType: conflict.entityType,
          operation: "UPDATE",
          payload: strategy === "MANUAL_MERGE" ? mergedPayload : conflict.localPayload,
          timestamp: new Date()
        });
        if (newOpRes.isSuccess) {
          await enqueueMutation(newOpRes.getValue());
        }
      }
      await refreshState();
    }
  };

  return (
    <SyncContext.Provider value={{
      isOnline,
      isSyncing,
      pendingOperations,
      conflicts,
      setOnlineStatus,
      triggerSync,
      enqueueMutation,
      resolveConflict
    }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error("useSync must be used within a SyncProvider");
  }
  return context;
};
