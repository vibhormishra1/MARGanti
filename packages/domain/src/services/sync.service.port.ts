import { SyncQueue, SyncConflict } from "../aggregates/sync/sync.aggregate";
import { SyncOperation } from "../aggregates/sync/sync.vo";
import { Result } from "../types/result.type";

export interface ISyncService {
  /**
   * Called locally to enqueue an operation.
   */
  enqueueMutation(operation: SyncOperation): Promise<Result<void>>;

  /**
   * Pushes all pending operations to the remote server.
   * Returns conflicts if any operations were rejected due to version mismatches.
   */
  pushOperations(): Promise<Result<{ conflicts: SyncConflict[] }>>;

  /**
   * Fetches latest state from remote server.
   */
  pullUpdates(): Promise<Result<void>>;
}
