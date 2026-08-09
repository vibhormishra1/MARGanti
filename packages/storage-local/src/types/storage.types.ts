export interface StorageRecord {
  id: string;
  [key: string]: any;
}

export interface StorageQuery {
  storeName: string;
  key?: string;
  indexName?: string;
  indexValue?: any;
  limit?: number;
}
