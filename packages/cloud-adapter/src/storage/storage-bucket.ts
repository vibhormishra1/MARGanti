/**
 * Storage bucket/container types.
 */
export interface StorageBucket {
  readonly name: string;
  readonly isPublic: boolean;
  readonly maxFileSizeBytes: number | null;
  readonly allowedMimeTypes: readonly string[] | null;
}

/** Options for creating a bucket. */
export interface CreateBucketOptions {
  readonly name: string;
  readonly isPublic?: boolean;
  readonly maxFileSizeBytes?: number;
  readonly allowedMimeTypes?: readonly string[];
}
