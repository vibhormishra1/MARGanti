import type { Metadata, ISOTimestamp } from "../types/common.types";

/**
 * Sync operation — a single unit of change to push or pull.
 */
export interface SyncOperation {
  /** Unique operation ID. */
  readonly operationId: string;
  /** Entity being synced. */
  readonly entityId: string;
  /** Entity type/collection (e.g., "incidents", "responders"). */
  readonly entityType: string;
  /** Type of mutation. */
  readonly action: "CREATE" | "UPDATE" | "DELETE";
  /** The data payload (null for DELETE). */
  readonly payload: Record<string, unknown> | null;
  /** Version/revision number for optimistic concurrency. */
  readonly version: number;
  /** Timestamp of the local mutation. */
  readonly timestamp: number;
  /** Additional operation metadata. */
  readonly metadata: Metadata;
}

/**
 * Sync record — the versioned representation of an entity.
 * Used in conflict detection and resolution.
 */
export interface SyncRecord {
  readonly entityId: string;
  readonly entityType: string;
  readonly data: Record<string, unknown>;
  readonly version: number;
  readonly updatedAt: ISOTimestamp;
  readonly updatedBy: string | null;
}

/**
 * Sync cursor — watermark for incremental sync.
 * Tracks the last known sync position per entity type.
 */
export interface SyncCursor {
  readonly entityType: string;
  readonly lastSyncedAt: ISOTimestamp;
  readonly lastVersion: number;
  readonly serverToken: string | null;
}

/**
 * Result of a push sync operation.
 */
export interface SyncPushResult {
  readonly accepted: readonly SyncOperation[];
  readonly rejected: ReadonlyArray<{
    readonly operation: SyncOperation;
    readonly reason: string;
  }>;
  readonly conflicts: readonly SyncConflict[];
}

/**
 * Result of a pull sync operation.
 */
export interface SyncPullResult {
  readonly changes: readonly SyncRecord[];
  readonly cursor: SyncCursor;
  readonly hasMore: boolean;
}

/**
 * A detected conflict between local and remote versions.
 */
export interface SyncConflict {
  readonly entityId: string;
  readonly entityType: string;
  readonly localVersion: SyncRecord;
  readonly remoteVersion: SyncRecord;
  readonly baseVersion: SyncRecord | null;
  readonly detectedAt: ISOTimestamp;
}

/**
 * Resolution of a conflict — the chosen winner.
 */
export interface SyncResolution {
  readonly entityId: string;
  readonly entityType: string;
  readonly resolvedData: Record<string, unknown>;
  readonly resolvedVersion: number;
  readonly strategy: string;
}

/**
 * Remote sync target port — the cloud-side operations.
 * Implemented by the provider adapter (e.g., Supabase sync target).
 */
export interface RemoteSyncTarget {
  /**
   * Push local changes to the remote.
   */
  push(operations: readonly SyncOperation[]): Promise<SyncPushResult>;

  /**
   * Pull remote changes since the given cursor.
   */
  pull(cursor: SyncCursor): Promise<SyncPullResult>;

  /**
   * Apply a conflict resolution to the remote.
   */
  applyResolution(resolution: SyncResolution): Promise<void>;
}
