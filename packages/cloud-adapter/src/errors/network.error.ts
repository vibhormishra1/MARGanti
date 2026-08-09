import { CloudAdapterError } from "./cloud-adapter.error";

/**
 * Network and connectivity errors.
 */
export class NetworkError extends CloudAdapterError {
  constructor(
    message: string,
    options: {
      code?: string;
      retryable?: boolean;
      cause?: Error;
      metadata?: Record<string, unknown>;
    } = {}
  ) {
    super(message, {
      code: options.code ?? "CLOUD_NETWORK_ERROR",
      retryable: options.retryable ?? true,
      cause: options.cause,
      metadata: options.metadata,
    });
    this.name = "NetworkError";
  }
}

export class TimeoutError extends NetworkError {
  constructor(
    operation: string,
    timeoutMs: number,
    cause?: Error
  ) {
    super(`Operation '${operation}' timed out after ${timeoutMs}ms`, {
      code: "CLOUD_NETWORK_TIMEOUT",
      retryable: true,
      cause,
      metadata: { operation, timeoutMs },
    });
    this.name = "TimeoutError";
  }
}

export class OfflineError extends NetworkError {
  constructor(
    operation: string,
    cause?: Error
  ) {
    super(`Cannot perform '${operation}' while offline`, {
      code: "CLOUD_NETWORK_OFFLINE",
      retryable: true,
      cause,
      metadata: { operation },
    });
    this.name = "OfflineError";
  }
}

export class RateLimitedError extends NetworkError {
  constructor(
    options: { retryAfterMs?: number; cause?: Error } = {}
  ) {
    super(
      options.retryAfterMs
        ? `Rate limited. Retry after ${options.retryAfterMs}ms`
        : "Rate limited by cloud provider",
      {
        code: "CLOUD_NETWORK_RATE_LIMITED",
        retryable: true,
        cause: options.cause,
        metadata: options.retryAfterMs !== undefined
          ? { retryAfterMs: options.retryAfterMs }
          : {},
      }
    );
    this.name = "RateLimitedError";
  }
}
