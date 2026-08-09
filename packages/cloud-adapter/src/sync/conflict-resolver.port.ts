import type { Result } from "@marg/domain";
import type { SyncError } from "../errors/sync.error";
import type { SyncConflict, SyncResolution } from "./sync-operation";

/**
 * Conflict resolver port — strategy pattern for resolving sync conflicts.
 *
 * Implementations:
 * - LastWriteWinsResolver: Compare updatedAt timestamps; latest wins.
 * - ClientWinsResolver: Local change always wins.
 * - ServerWinsResolver: Remote change always wins.
 * - ManualResolver: Returns conflict to consumer for manual resolution.
 * - MergeResolver: Field-level merge using a consumer-provided merge function.
 *
 * Consumers can implement custom resolvers for domain-specific merge logic.
 */
export interface ConflictResolver {
  /** Human-readable name of this resolver strategy. */
  readonly strategy: string;

  /**
   * Resolve a single conflict.
   * Returns a SyncResolution describing the winning data,
   * or a SyncError if resolution fails.
   */
  resolve(
    conflict: SyncConflict
  ): Promise<Result<SyncResolution, SyncError>>;
}

/**
 * Merge function type for field-level merging.
 * Receives the local, remote, and base (if available) data.
 * Returns the merged result.
 */
export type MergeFunction = (
  local: Record<string, unknown>,
  remote: Record<string, unknown>,
  base: Record<string, unknown> | null
) => Record<string, unknown>;
