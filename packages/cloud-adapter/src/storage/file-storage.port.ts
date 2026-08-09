import type { Result } from "@marg/domain";
import type { CloudStorageError } from "../errors/storage.error";
import type {
  FileMetadata,
  FileUploadParams,
  FileListOptions,
  FileListResult,
  SignedUrlOptions,
} from "./file-metadata";
import type { StorageBucket, CreateBucketOptions } from "./storage-bucket";

/**
 * File storage provider port.
 *
 * Abstracts cloud file/blob storage operations.
 * Implementations must map to provider-specific APIs:
 * - Supabase Storage
 * - Firebase Cloud Storage
 * - AWS S3
 * - Azure Blob Storage
 * - GCP Cloud Storage
 *
 * This interface does NOT handle:
 * - Image processing / thumbnail generation
 * - MIME type detection beyond what the caller provides
 * - Client-side file selection (UI responsibility)
 */
export interface FileStorageProvider {
  /**
   * Upload a file to cloud storage.
   * Supports both Uint8Array (small files) and ReadableStream (large files).
   */
  upload(params: FileUploadParams): Promise<Result<FileMetadata, CloudStorageError>>;

  /**
   * Download a file as a readable byte stream.
   */
  download(
    path: string,
    bucket?: string
  ): Promise<Result<ReadableStream<Uint8Array>, CloudStorageError>>;

  /**
   * Delete a file from storage.
   */
  delete(path: string, bucket?: string): Promise<Result<void, CloudStorageError>>;

  /**
   * List files with optional prefix filtering and pagination.
   */
  list(options?: FileListOptions & { bucket?: string }): Promise<Result<FileListResult, CloudStorageError>>;

  /**
   * Generate a signed (pre-authenticated) URL for direct access.
   */
  getSignedUrl(
    path: string,
    options: SignedUrlOptions,
    bucket?: string
  ): Promise<Result<string, CloudStorageError>>;

  /**
   * Retrieve metadata for a file without downloading its contents.
   */
  getMetadata(
    path: string,
    bucket?: string
  ): Promise<Result<FileMetadata, CloudStorageError>>;

  /**
   * Create a new storage bucket/container.
   */
  createBucket(
    options: CreateBucketOptions
  ): Promise<Result<StorageBucket, CloudStorageError>>;

  /**
   * Delete a storage bucket/container.
   */
  deleteBucket(name: string): Promise<Result<void, CloudStorageError>>;
}
