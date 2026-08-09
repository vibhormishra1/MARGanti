import { CloudAdapterError } from "./cloud-adapter.error";

/**
 * Synchronization-specific errors.
 */
export class SyncError extends CloudAdapterError {
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
      code: options.code ?? "CLOUD_SYNC_ERROR",
      retryable: options.retryable ?? true,
      cause: options.cause,
      metadata: options.metadata,
    });
    this.name = "SyncError";
  }
}

export class ConflictError extends SyncError {
  constructor(
    message: string,
    options: { entityId?: string; entityType?: string; cause?: Error } = {}
  ) {
    super(message, {
      code: "CLOUD_SYNC_CONFLICT",
      retryable: false,
      cause: options.cause,
      metadata: {
        ...(options.entityId && { entityId: options.entityId }),
        ...(options.entityType && { entityType: options.entityType }),
      },
    });
    this.name = "ConflictError";
  }
}

export class SyncTimeoutError extends SyncError {
  constructor(message = "Synchronization operation timed out", cause?: Error) {
    super(message, {
      code: "CLOUD_SYNC_TIMEOUT",
      retryable: true,
      cause,
    });
    this.name = "SyncTimeoutError";
  }
}

export class SyncAbortedError extends SyncError {
  constructor(
    message = "Synchronization was aborted",
    options: { reason?: string; cause?: Error } = {}
  ) {
    super(message, {
      code: "CLOUD_SYNC_ABORTED",
      retryable: false,
      cause: options.cause,
      metadata: options.reason ? { reason: options.reason } : {},
    });
    this.name = "SyncAbortedError";
  }
}
