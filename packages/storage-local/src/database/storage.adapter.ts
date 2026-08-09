import { StorageRecord, StorageQuery } from "../types/storage.types";

export interface StorageAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  get<T extends StorageRecord>(storeName: string, id: string): Promise<T | null>;
  getAll<T extends StorageRecord>(storeName: string): Promise<T[]>;
  query<T extends StorageRecord>(query: StorageQuery): Promise<T[]>;
  save<T extends StorageRecord>(storeName: string, record: T): Promise<void>;
  delete(storeName: string, id: string): Promise<void>;
  transaction<T>(stores: string[], mode: "readonly" | "readwrite", callback: () => Promise<T>): Promise<T>;
}
