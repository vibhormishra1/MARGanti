/**
 * Common type primitives shared across all cloud-adapter modules.
 * These types have ZERO internal dependencies and form the foundation layer.
 */

/** ISO 8601 timestamp string. */
export type ISOTimestamp = string;

/** Milliseconds since Unix epoch. */
export type EpochMs = number;

/** Opaque identifier string. */
export type EntityId = string;

/** Semantic version string (e.g., "1.0.0"). */
export type SemVer = string;

/** Generic key-value metadata bag. */
export type Metadata = Readonly<Record<string, unknown>>;

/** Unsubscribe function returned by observable-pattern subscriptions. */
export type Unsubscribe = () => void;

/** Health check result for provider liveliness probes. */
export interface HealthStatus {
  readonly healthy: boolean;
  readonly provider: string;
  readonly latencyMs: number;
  readonly details: Readonly<Record<string, unknown>>;
  readonly checkedAt: ISOTimestamp;
}

/** Generic batch operation result. */
export interface BatchResult<T> {
  readonly succeeded: readonly T[];
  readonly failed: ReadonlyArray<{ readonly item: T; readonly reason: string }>;
}
