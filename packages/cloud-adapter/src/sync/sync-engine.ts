import { ResultFactory, type Result } from "@marg/domain";
import { SyncError, SyncAbortedError } from "../errors/sync.error";
import type { Clock } from "../utils/clock";
import { RealClock } from "../utils/clock";
import { withRetry, type RetryPolicy, DEFAULT_RETRY_POLICY } from "../utils/retry";
import type { Unsubscribe } from "../types/common.types";
import type {
  SyncOperation,
  SyncCursor,
  SyncConflict,
  SyncPushResult,
  SyncPullResult,
  RemoteSyncTarget,
} from "./sync-operation";
import type { ConflictResolver } from "./conflict-resolver.port";
import {
  type SyncState,
  createInitialSyncState,
  transitionToPushing,
  transitionToPulling,
  transitionToResolving,
  transitionToIdle,
  transitionToError,
} from "./sync-state";

/**
 * Sync engine configuration.
 */
export interface SyncEngineConfig {
  readonly batchSize: number;
  readonly retryPolicy: RetryPolicy;
}

/** Default sync engine configuration. */
const DEFAULT_SYNC_ENGINE_CONFIG: SyncEngineConfig = {
  batchSize: 50,
  retryPolicy: DEFAULT_RETRY_POLICY,
};

/**
 * SyncEngine — orchestrates push/pull sync cycles between local and cloud.
 *
 * This is the only class in the sync module with non-trivial logic.
 * It coordinates:
 * 1. Pushing local changes to a RemoteSyncTarget
 * 2. Pulling remote changes from the target
 * 3. Detecting and delegating conflicts to a ConflictResolver
 * 4. Managing sync state transitions
 * 5. Applying retry policy on transient failures
 *
 * It does NOT:
 * - Access local storage directly (consumer provides operations)
 * - Know about any specific cloud provider
 * - Contain business rules about what data should sync
 */
export class SyncEngine {
  private state: SyncState;
  private readonly config: SyncEngineConfig;
  private readonly clock: Clock;
  private aborted = false;
  private readonly stateListeners: Array<(state: SyncState) => void> = [];

  constructor(
    private readonly target: RemoteSyncTarget,
    private readonly conflictResolver: ConflictResolver,
    config?: Partial<SyncEngineConfig>,
    clock?: Clock
  ) {
    this.config = { ...DEFAULT_SYNC_ENGINE_CONFIG, ...config };
    this.clock = clock ?? new RealClock();
    this.state = createInitialSyncState();
  }

  /** Returns the current sync state. */
  getState(): SyncState {
    return this.state;
  }

  /** Subscribe to sync state changes. Returns an unsubscribe function. */
  onStateChange(listener: (state: SyncState) => void): Unsubscribe {
    this.stateListeners.push(listener);
    return () => {
      const index = this.stateListeners.indexOf(listener);
      if (index !== -1) {
        this.stateListeners.splice(index, 1);
      }
    };
  }

  /**
   * Push local changes to the remote.
   * Operations are batched according to config.batchSize.
   *
   * @param operations - Local mutations to push.
   * @returns Accepted, rejected, and unresolved conflicts.
   */
  async push(
    operations: readonly SyncOperation[]
  ): Promise<Result<SyncPushResult, SyncError>> {
    if (this.state.phase !== "IDLE") {
      return ResultFactory.fail(
        new SyncError("Cannot push: sync engine is not idle", {
          code: "CLOUD_SYNC_NOT_IDLE",
          metadata: { currentPhase: this.state.phase },
        })
      );
    }

    this.aborted = false;
    this.updateState(transitionToPushing(this.state, operations.length));

    try {
      const allAccepted: SyncOperation[] = [];
      const allRejected: Array<{ operation: SyncOperation; reason: string }> = [];
      const allConflicts: SyncConflict[] = [];

      const batches = this.batchOperations(operations);

      for (const batch of batches) {
        if (this.aborted) {
          this.updateState(
            transitionToError(this.state, "Sync aborted by consumer", 0)
          );
          return ResultFactory.fail(
            new SyncAbortedError("Push aborted by consumer")
          );
        }

        const result = await withRetry(
          () => this.target.push(batch),
          { policy: this.config.retryPolicy, clock: this.clock }
        );

        allAccepted.push(...result.accepted);
        allRejected.push(...result.rejected);
        allConflicts.push(...result.conflicts);
      }

      if (allConflicts.length > 0) {
        this.updateState(
          transitionToResolving(this.state, allConflicts.length)
        );
        await this.resolveConflicts(allConflicts);
      }

      this.updateState(transitionToIdle(this.state, this.clock.now()));

      return ResultFactory.ok({
        accepted: allAccepted,
        rejected: allRejected,
        conflicts: allConflicts,
      });
    } catch (error: unknown) {
      const syncError =
        error instanceof SyncError
          ? error
          : new SyncError(
              error instanceof Error ? error.message : "Unknown push error",
              { cause: error instanceof Error ? error : undefined }
            );

      this.updateState(
        transitionToError(this.state, syncError.message, this.state.retryAttempt + 1)
      );

      return ResultFactory.fail(syncError);
    }
  }

  /**
   * Pull remote changes since the given cursor.
   * Automatically pages through results if hasMore is true.
   *
   * @param cursor - Starting sync cursor.
   * @returns All pulled changes and the updated cursor.
   */
  async pull(
    cursor: SyncCursor
  ): Promise<Result<SyncPullResult, SyncError>> {
    if (this.state.phase !== "IDLE") {
      return ResultFactory.fail(
        new SyncError("Cannot pull: sync engine is not idle", {
          code: "CLOUD_SYNC_NOT_IDLE",
          metadata: { currentPhase: this.state.phase },
        })
      );
    }

    this.aborted = false;
    this.updateState(transitionToPulling(this.state));

    try {
      const allChanges: Array<SyncPullResult["changes"][number]> = [];
      let currentCursor = cursor;
      let hasMore = true;

      while (hasMore) {
        if (this.aborted) {
          this.updateState(
            transitionToError(this.state, "Sync aborted by consumer", 0)
          );
          return ResultFactory.fail(
            new SyncAbortedError("Pull aborted by consumer")
          );
        }

        const result = await withRetry(
          () => this.target.pull(currentCursor),
          { policy: this.config.retryPolicy, clock: this.clock }
        );

        allChanges.push(...result.changes);
        currentCursor = result.cursor;
        hasMore = result.hasMore;
      }

      this.updateState(transitionToIdle(this.state, this.clock.now()));

      return ResultFactory.ok({
        changes: allChanges,
        cursor: currentCursor,
        hasMore: false,
      });
    } catch (error: unknown) {
      const syncError =
        error instanceof SyncError
          ? error
          : new SyncError(
              error instanceof Error ? error.message : "Unknown pull error",
              { cause: error instanceof Error ? error : undefined }
            );

      this.updateState(
        transitionToError(this.state, syncError.message, this.state.retryAttempt + 1)
      );

      return ResultFactory.fail(syncError);
    }
  }

  /**
   * Abort the current sync operation.
   * The engine will stop after completing the current batch.
   */
  abort(): void {
    this.aborted = true;
  }

  /**
   * Reset the engine to IDLE state, clearing any error.
   */
  reset(): void {
    this.aborted = false;
    this.state = createInitialSyncState();
    this.notifyListeners();
  }

  private async resolveConflicts(conflicts: readonly SyncConflict[]): Promise<void> {
    for (const conflict of conflicts) {
      const result = await this.conflictResolver.resolve(conflict);
      if (result.isSuccess) {
        await this.target.applyResolution(result.getValue());
      }
    }
  }

  private batchOperations(
    operations: readonly SyncOperation[]
  ): readonly (readonly SyncOperation[])[] {
    const batches: SyncOperation[][] = [];
    for (let i = 0; i < operations.length; i += this.config.batchSize) {
      batches.push(operations.slice(i, i + this.config.batchSize) as SyncOperation[]);
    }
    return batches;
  }

  private updateState(newState: SyncState): void {
    this.state = newState;
    this.notifyListeners();
  }

  private notifyListeners(): void {
    for (const listener of this.stateListeners) {
      listener(this.state);
    }
  }
}
