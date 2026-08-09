import { CloudAdapterError } from "../errors/cloud-adapter.error";
import type { Clock } from "./clock";
import { RealClock } from "./clock";

/**
 * Circuit breaker states.
 *
 * CLOSED  → Normal operation. Failures increment counter.
 * OPEN    → All calls rejected immediately. Timer running until half-open.
 * HALF_OPEN → Limited trial calls allowed. Success closes; failure re-opens.
 */
export type CircuitBreakerState = "CLOSED" | "OPEN" | "HALF_OPEN";

/** Configuration for the circuit breaker. */
export interface CircuitBreakerConfig {
  /** Number of failures before transitioning CLOSED → OPEN. Default: 5 */
  readonly failureThreshold: number;
  /** Time in ms to stay OPEN before transitioning to HALF_OPEN. Default: 30_000 */
  readonly resetTimeoutMs: number;
  /** Number of consecutive successes in HALF_OPEN to transition back to CLOSED. Default: 3 */
  readonly halfOpenMaxAttempts: number;
}

/** Default circuit breaker configuration. */
export const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  resetTimeoutMs: 30_000,
  halfOpenMaxAttempts: 3,
};

/** Snapshot of circuit breaker internal state for observability. */
export interface CircuitBreakerSnapshot {
  readonly state: CircuitBreakerState;
  readonly failureCount: number;
  readonly successCount: number;
  readonly lastFailureTime: number | null;
  readonly nextRetryTime: number | null;
}

/** State change event for external monitoring. */
export interface CircuitBreakerStateChange {
  readonly previous: CircuitBreakerState;
  readonly current: CircuitBreakerState;
  readonly timestamp: number;
}

/**
 * Circuit breaker implementation following the standard pattern.
 *
 * Wraps calls to an unreliable external service and prevents cascade failures
 * by fast-failing when the service is known to be down.
 */
export class CircuitBreaker {
  private state: CircuitBreakerState = "CLOSED";
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime: number | null = null;
  private readonly config: CircuitBreakerConfig;
  private readonly clock: Clock;
  private readonly stateListeners: Array<
    (change: CircuitBreakerStateChange) => void
  > = [];

  constructor(config?: Partial<CircuitBreakerConfig>, clock?: Clock) {
    this.config = { ...DEFAULT_CIRCUIT_BREAKER_CONFIG, ...config };
    this.clock = clock ?? new RealClock();
  }

  /** Returns the current state of the circuit breaker. */
  getState(): CircuitBreakerState {
    this.evaluateState();
    return this.state;
  }

  /** Returns a snapshot of internal state for monitoring/debugging. */
  getSnapshot(): CircuitBreakerSnapshot {
    this.evaluateState();
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      nextRetryTime:
        this.state === "OPEN" && this.lastFailureTime !== null
          ? this.lastFailureTime + this.config.resetTimeoutMs
          : null,
    };
  }

  /** Subscribe to state change events. Returns an unsubscribe function. */
  onStateChange(
    listener: (change: CircuitBreakerStateChange) => void
  ): () => void {
    this.stateListeners.push(listener);
    return () => {
      const index = this.stateListeners.indexOf(listener);
      if (index !== -1) {
        this.stateListeners.splice(index, 1);
      }
    };
  }

  /**
   * Execute an operation through the circuit breaker.
   *
   * @param operation - The async operation to protect.
   * @returns The result of the operation.
   * @throws CloudAdapterError if the circuit is OPEN.
   * @throws The operation's error if it fails and the circuit stays CLOSED/HALF_OPEN.
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    this.evaluateState();

    if (this.state === "OPEN") {
      throw new CloudAdapterError("Circuit breaker is OPEN — request rejected", {
        code: "CLOUD_CIRCUIT_OPEN",
        retryable: true,
        metadata: this.getSnapshot() as any,
      });
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /** Reset the circuit breaker to CLOSED with zeroed counters. */
  reset(): void {
    const previous = this.state;
    this.state = "CLOSED";
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    if (previous !== "CLOSED") {
      this.notifyStateChange(previous, "CLOSED");
    }
  }

  private evaluateState(): void {
    if (
      this.state === "OPEN" &&
      this.lastFailureTime !== null &&
      this.clock.now() - this.lastFailureTime >= this.config.resetTimeoutMs
    ) {
      this.transitionTo("HALF_OPEN");
    }
  }

  private onSuccess(): void {
    if (this.state === "HALF_OPEN") {
      this.successCount++;
      if (this.successCount >= this.config.halfOpenMaxAttempts) {
        this.failureCount = 0;
        this.successCount = 0;
        this.lastFailureTime = null;
        this.transitionTo("CLOSED");
      }
    } else if (this.state === "CLOSED") {
      this.failureCount = 0;
    }
  }

  private onFailure(): void {
    this.lastFailureTime = this.clock.now();

    if (this.state === "HALF_OPEN") {
      this.successCount = 0;
      this.transitionTo("OPEN");
    } else if (this.state === "CLOSED") {
      this.failureCount++;
      if (this.failureCount >= this.config.failureThreshold) {
        this.transitionTo("OPEN");
      }
    }
  }

  private transitionTo(newState: CircuitBreakerState): void {
    const previous = this.state;
    this.state = newState;
    this.notifyStateChange(previous, newState);
  }

  private notifyStateChange(
    previous: CircuitBreakerState,
    current: CircuitBreakerState
  ): void {
    const change: CircuitBreakerStateChange = {
      previous,
      current,
      timestamp: this.clock.now(),
    };
    for (const listener of this.stateListeners) {
      listener(change);
    }
  }
}
