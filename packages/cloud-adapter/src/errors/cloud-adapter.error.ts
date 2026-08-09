/**
 * Base error class for all cloud adapter operations.
 * Every error in the hierarchy extends this class.
 *
 * Design decisions:
 * - `code` is machine-readable for programmatic error handling
 * - `retryable` tells consumers whether to attempt retry
 * - `metadata` carries structured context without polluting the message
 * - `cause` preserves the original error chain per ES2022 Error Cause
 */
export class CloudAdapterError extends Error {
  public readonly code: string;
  public readonly retryable: boolean;
  public readonly metadata: Readonly<Record<string, unknown>>;

  constructor(
    message: string,
    options: {
      code?: string;
      retryable?: boolean;
      cause?: Error;
      metadata?: Record<string, unknown>;
    } = {}
  ) {
    super(message, { cause: options.cause });
    this.name = "CloudAdapterError";
    this.code = options.code ?? "CLOUD_ADAPTER_ERROR";
    this.retryable = options.retryable ?? false;
    this.metadata = Object.freeze(options.metadata ?? {});

    if (typeof (Error as any).captureStackTrace === "function") {
      (Error as any).captureStackTrace(this, this.constructor);
    }
  }
}
