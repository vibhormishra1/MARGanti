import { StorageAdapter } from "../database/storage.adapter";
import { StorageRecord, StorageQuery } from "../types/storage.types";
import { StorageError, TransactionError } from "../errors/storage.error";

export class MemoryAdapter implements StorageAdapter {
  private stores: Map<string, Map<string, StorageRecord>> = new Map();

  async connect(): Promise<void> {
    // Memory adapter is always connected
  }

  async disconnect(): Promise<void> {
    this.stores.clear();
  }

  private getStore(storeName: string): Map<string, StorageRecord> {
    if (!this.stores.has(storeName)) {
      this.stores.set(storeName, new Map());
    }
    return this.stores.get(storeName)!;
  }

  async get<T extends StorageRecord>(storeName: string, id: string): Promise<T | null> {
    const store = this.getStore(storeName);
    const record = store.get(id);
    return record ? (JSON.parse(JSON.stringify(record)) as T) : null;
  }

  async getAll<T extends StorageRecord>(storeName: string): Promise<T[]> {
    const store = this.getStore(storeName);
    return Array.from(store.values()).map(r => JSON.parse(JSON.stringify(r)) as T);
  }

  async query<T extends StorageRecord>(query: StorageQuery): Promise<T[]> {
    const store = this.getStore(query.storeName);
    let results = Array.from(store.values());

    if (query.key) {
      results = results.filter(r => r.id === query.key);
    } else if (query.indexName && query.indexValue !== undefined) {
      results = results.filter(r => r[query.indexName!] === query.indexValue);
    }

    if (query.limit && query.limit > 0) {
      results = results.slice(0, query.limit);
    }

    return results.map(r => JSON.parse(JSON.stringify(r)) as T);
  }

  async save<T extends StorageRecord>(storeName: string, record: T): Promise<void> {
    if (!record.id) throw new StorageError("Record must have an id");
    const store = this.getStore(storeName);
    store.set(record.id, JSON.parse(JSON.stringify(record)));
  }

  async delete(storeName: string, id: string): Promise<void> {
    const store = this.getStore(storeName);
    store.delete(id);
  }

  async transaction<T>(stores: string[], mode: "readonly" | "readwrite", callback: () => Promise<T>): Promise<T> {
    try {
      // In-memory simplistic transaction (no rollback mechanism in this naive implementation)
      return await callback();
    } catch (error: any) {
      throw new TransactionError(`Transaction failed: ${error.message}`);
    }
  }
}
