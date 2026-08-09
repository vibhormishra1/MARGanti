/**
 * Sync engine finite state machine.
 *
 * States:
 * - IDLE: No sync in progress. Ready for next cycle.
 * - PUSHING: Pushing local changes to remote.
 * - PULLING: Pulling remote changes to local.
 * - RESOLVING: Resolving detected conflicts.
 * - ERROR: Sync failed. Will retry or require manual intervention.
 *
 * Transitions:
 *   IDLE → PUSHING → PULLING → IDLE
 *   PUSHING → RESOLVING → IDLE
 *   PULLING → RESOLVING → IDLE
 *   ANY → ERROR → IDLE (via reset/retry)
 */
export type SyncPhase = "IDLE" | "PUSHING" | "PULLING" | "RESOLVING" | "ERROR";

/**
 * Full sync state — includes phase, progress, and error details.
 */
export interface SyncState {
  readonly phase: SyncPhase;
  readonly lastSyncedAt: number | null;
  readonly pendingOperations: number;
  readonly conflictCount: number;
  readonly error: string | null;
  readonly retryAttempt: number;
}

/**
 * Creates the initial idle sync state.
 */
export function createInitialSyncState(): SyncState {
  return {
    phase: "IDLE",
    lastSyncedAt: null,
    pendingOperations: 0,
    conflictCount: 0,
    error: null,
    retryAttempt: 0,
  };
}

/**
 * State transition helpers.
 * Returns a new SyncState — never mutates the input.
 */
export function transitionToPushing(
  state: SyncState,
  pendingCount: number
): SyncState {
  return {
    ...state,
    phase: "PUSHING",
    pendingOperations: pendingCount,
    error: null,
  };
}

export function transitionToPulling(state: SyncState): SyncState {
  return {
    ...state,
    phase: "PULLING",
    error: null,
  };
}

export function transitionToResolving(
  state: SyncState,
  conflictCount: number
): SyncState {
  return {
    ...state,
    phase: "RESOLVING",
    conflictCount,
    error: null,
  };
}

export function transitionToIdle(
  state: SyncState,
  lastSyncedAt: number
): SyncState {
  return {
    ...state,
    phase: "IDLE",
    lastSyncedAt,
    pendingOperations: 0,
    conflictCount: 0,
    error: null,
    retryAttempt: 0,
  };
}

export function transitionToError(
  state: SyncState,
  error: string,
  retryAttempt: number
): SyncState {
  return {
    ...state,
    phase: "ERROR",
    error,
    retryAttempt,
  };
}
