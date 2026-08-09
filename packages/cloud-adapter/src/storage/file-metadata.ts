import type { ISOTimestamp, Metadata } from "../types/common.types";

/**
 * File metadata returned after upload or from getMetadata.
 */
export interface FileMetadata {
  readonly path: string;
  readonly bucket: string;
  readonly sizeBytes: number;
  readonly mimeType: string;
  readonly etag: string | null;
  readonly createdAt: ISOTimestamp;
  readonly updatedAt: ISOTimestamp;
  readonly metadata: Metadata;
}

/** Parameters for uploading a file. */
export interface FileUploadParams {
  readonly path: string;
  readonly data: Uint8Array | ReadableStream<Uint8Array>;
  readonly mimeType: string;
  readonly bucket?: string;
  readonly upsert?: boolean;
  readonly metadata?: Metadata;
}

/** Options for listing files. */
export interface FileListOptions {
  readonly prefix?: string;
  readonly limit?: number;
  readonly cursor?: string;
}

/** Result of listing files. */
export interface FileListResult {
  readonly files: readonly FileMetadata[];
  readonly nextCursor: string | null;
  readonly hasMore: boolean;
}

/** Options for generating signed URLs. */
export interface SignedUrlOptions {
  readonly expiresInMs: number;
  readonly method?: "GET" | "PUT";
  readonly contentType?: string;
}
