import { StorageAdapter } from "../database/storage.adapter";
import { StorageRecord } from "../types/storage.types";

export interface QueueMutation extends StorageRecord {
  id: string;
  storeName: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  payload: any;
  timestamp: number;
}

export class OfflineMutationQueue {
  private readonly QUEUE_STORE = "_mutation_queue";

  constructor(private readonly adapter: StorageAdapter) {}

  public async enqueue(storeName: string, action: "CREATE" | "UPDATE" | "DELETE", payload: any): Promise<void> {
    const mutation: QueueMutation = {
      id: crypto.randomUUID(),
      storeName,
      action,
      payload,
      timestamp: Date.now(),
    };
    await this.adapter.save(this.QUEUE_STORE, mutation);
  }

  public async getPending(): Promise<QueueMutation[]> {
    const mutations = await this.adapter.getAll<QueueMutation>(this.QUEUE_STORE);
    return mutations.sort((a, b) => a.timestamp - b.timestamp);
  }

  public async dequeue(id: string): Promise<void> {
    await this.adapter.delete(this.QUEUE_STORE, id);
  }
}
