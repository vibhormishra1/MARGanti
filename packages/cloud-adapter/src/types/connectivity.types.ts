/**
 * Connectivity and network state types for offline-first architecture.
 */

/** Connectivity states the adapter can report. */
export type ConnectivityState = "online" | "offline" | "degraded";

/** Connection quality assessment. */
export interface ConnectionQuality {
  readonly state: ConnectivityState;
  readonly latencyMs: number | null;
  readonly bandwidth: "high" | "medium" | "low" | "unknown";
  readonly measuredAt: number;
}

/** Connectivity change event payload. */
export interface ConnectivityChangeEvent {
  readonly previous: ConnectivityState;
  readonly current: ConnectivityState;
  readonly timestamp: number;
}
