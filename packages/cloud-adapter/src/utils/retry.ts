import type { RetryConfig } from "../config/cloud-config";
import { CloudAdapterError } from "../errors/cloud-adapter.error";
import type { Clock } from "./clock";
import { RealClock } from "./clock";

/**
 * Retry policy configuration.
 * Can be constructed from a RetryConfig or provided inline.
 */
export interface RetryPolicy {
  readonly maxAttempts: number;
  readonly baseDelayMs: number;
  readonly maxDelayMs: number;
  readonly backoffMultiplier: number;
  readonly jitter: boolean;
}

/** Default retry policy: 3 attempts, 1s base, 30s cap, 2x backoff, jitter on. */
export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  baseDelayMs: 1_000,
  maxDelayMs: 30_000,
  backoffMultiplier: 2,
  jitter: true,
};

/**
 * Converts a RetryConfig (from Zod schema) to a RetryPolicy.
 */
export function retryConfigToPolicy(config: RetryConfig): RetryPolicy {
  return {
    maxAttempts: config.maxAttempts,
    baseDelayMs: config.baseDelayMs,
    maxDelayMs: config.maxDelayMs,
    backoffMultiplier: config.backoffMultiplier,
    jitter: config.jitter,
  };
}

/**
 * Calculates delay for a given attempt using exponential backoff with optional jitter.
 *
 * Formula: min(maxDelay, baseDelay * multiplier^attempt) ± jitter
 * Jitter adds 0–50% randomness to prevent thundering herd.
 */
export function calculateBackoffDelay(
  attempt: number,
  policy: RetryPolicy
): number {
  const exponentialDelay =
    policy.baseDelayMs * Math.pow(policy.backoffMultiplier, attempt);
  const clampedDelay = Math.min(exponentialDelay, policy.maxDelayMs);

  if (!policy.jitter) {
    return clampedDelay;
  }

  const jitterRange = clampedDelay * 0.5;
  const jitterOffset = Math.random() * jitterRange;
  return Math.floor(clampedDelay + jitterOffset);
}

/**
 * Default retryability check: retries if the error is a CloudAdapterError
 * with `retryable: true`, or if the error is not a CloudAdapterError
 * (assumes unknown errors might be transient).
 */
function defaultIsRetryable(error: unknown): boolean {
  if (error instanceof CloudAdapterError) {
    return error.retryable;
  }
  return true;
}

/** Context passed to the onRetry callback. */
export interface RetryAttemptContext {
  readonly attempt: number;
  readonly maxAttempts: number;
  readonly delayMs: number;
  readonly error: unknown;
}

/** Options for the withRetry function. */
export interface WithRetryOptions {
  readonly policy?: RetryPolicy;
  readonly isRetryable?: (error: unknown) => boolean;
  readonly onRetry?: (context: RetryAttemptContext) => void;
  readonly clock?: Clock;
}

/**
 * Executes an async operation with retry and exponential backoff.
 *
 * @param operation - The async operation to execute.
 * @param options - Retry configuration.
 * @returns The result of the operation.
 * @throws The last error if all retries are exhausted.
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: WithRetryOptions = {}
): Promise<T> {
  const policy = options.policy ?? DEFAULT_RETRY_POLICY;
  const isRetryable = options.isRetryable ?? defaultIsRetryable;
  const clock = options.clock ?? new RealClock();

  let lastError: unknown;

  for (let attempt = 0; attempt < policy.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error: unknown) {
      lastError = error;

      const isLastAttempt = attempt === policy.maxAttempts - 1;
      if (isLastAttempt || !isRetryable(error)) {
        throw error;
      }

      const delayMs = calculateBackoffDelay(attempt, policy);

      if (options.onRetry) {
        options.onRetry({
          attempt,
          maxAttempts: policy.maxAttempts,
          delayMs,
          error,
        });
      }

      await clock.delay(delayMs);
    }
  }

  throw lastError;
}
