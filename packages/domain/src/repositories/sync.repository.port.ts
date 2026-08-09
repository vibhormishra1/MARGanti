import { Repository } from "./base.repository";
import { SyncQueue, SyncConflict } from "../aggregates/sync/sync.aggregate";

export interface SyncQueueRepository extends Repository<SyncQueue> {
  getGlobalQueue(): Promise<SyncQueue>;
}

export interface SyncConflictRepository extends Repository<SyncConflict> {
  findUnresolved(): Promise<SyncConflict[]>;
}
