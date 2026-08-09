import { CloudAdapterError } from "./cloud-adapter.error";

/**
 * Cloud file/blob storage errors.
 * Named CloudStorageError to avoid collision with @marg/storage-local's StorageError.
 */
export class CloudStorageError extends CloudAdapterError {
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
      code: options.code ?? "CLOUD_STORAGE_ERROR",
      retryable: options.retryable ?? false,
      cause: options.cause,
      metadata: options.metadata,
    });
    this.name = "CloudStorageError";
  }
}

export class FileNotFoundError extends CloudStorageError {
  constructor(path: string, cause?: Error) {
    super(`File not found: ${path}`, {
      code: "CLOUD_STORAGE_NOT_FOUND",
      retryable: false,
      cause,
      metadata: { path },
    });
    this.name = "FileNotFoundError";
  }
}

export class QuotaExceededError extends CloudStorageError {
  constructor(
    message = "Storage quota exceeded",
    options: { quotaBytes?: number; usedBytes?: number; cause?: Error } = {}
  ) {
    super(message, {
      code: "CLOUD_STORAGE_QUOTA_EXCEEDED",
      retryable: false,
      cause: options.cause,
      metadata: {
        ...(options.quotaBytes !== undefined && { quotaBytes: options.quotaBytes }),
        ...(options.usedBytes !== undefined && { usedBytes: options.usedBytes }),
      },
    });
    this.name = "QuotaExceededError";
  }
}

export class UploadFailedError extends CloudStorageError {
  constructor(
    path: string,
    options: { sizeBytes?: number; cause?: Error } = {}
  ) {
    super(`Upload failed for: ${path}`, {
      code: "CLOUD_STORAGE_UPLOAD_FAILED",
      retryable: true,
      cause: options.cause,
      metadata: {
        path,
        ...(options.sizeBytes !== undefined && { sizeBytes: options.sizeBytes }),
      },
    });
    this.name = "UploadFailedError";
  }
}
