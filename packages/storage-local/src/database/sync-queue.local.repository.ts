import { SyncQueue, SyncQueueRepository, SyncConflict, SyncConflictRepository, Result, ResultFactory, DomainError } from "@marg/domain";

export class SyncQueueLocalRepository implements SyncQueueRepository {
  private queue: SyncQueue | null = null;

  async getGlobalQueue(): Promise<SyncQueue> {
    if (!this.queue) {
      const qRes = SyncQueue.create("global-sync-queue");
      if (qRes.isSuccess) {
        this.queue = qRes.getValue();
      }
    }
    return this.queue as SyncQueue;
  }

  async exists(id: string): Promise<boolean> {
    const q = await this.getGlobalQueue();
    return q.id === id;
  }

  async findById(id: string): Promise<SyncQueue | null> {
    const q = await this.getGlobalQueue();
    return q.id === id ? q : null;
  }

  async save(entity: SyncQueue): Promise<void> {
    this.queue = entity;
  }

  async delete(id: string): Promise<void> {
    if (this.queue?.id === id) {
      this.queue = null;
    }
  }
}

export class SyncConflictLocalRepository implements SyncConflictRepository {
  private conflicts: Map<string, SyncConflict> = new Map();

  async findUnresolved(): Promise<SyncConflict[]> {
    return Array.from(this.conflicts.values()).filter(c => !c.resolutionStrategy);
  }

  async exists(id: string): Promise<boolean> {
    return this.conflicts.has(id);
  }

  async findById(id: string): Promise<SyncConflict | null> {
    return this.conflicts.get(id) || null;
  }

  async save(entity: SyncConflict): Promise<void> {
    this.conflicts.set(entity.id, entity);
  }

  async delete(id: string): Promise<void> {
    this.conflicts.delete(id);
  }
}
