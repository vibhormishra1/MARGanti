/**
 * Cursor-based and offset-based pagination types.
 */

/** Cursor-based pagination request. */
export interface CursorPaginationParams {
  readonly cursor?: string;
  readonly limit: number;
  readonly direction?: "forward" | "backward";
}

/** Cursor-based pagination response metadata. */
export interface CursorPaginationResult<T> {
  readonly items: readonly T[];
  readonly nextCursor: string | null;
  readonly previousCursor: string | null;
  readonly hasMore: boolean;
}

/** Offset-based pagination request. */
export interface OffsetPaginationParams {
  readonly offset: number;
  readonly limit: number;
}

/** Offset-based pagination response metadata. */
export interface OffsetPaginationResult<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly offset: number;
  readonly limit: number;
}

/** Union pagination params — consumers choose their preferred style. */
export type PaginationParams = CursorPaginationParams | OffsetPaginationParams;
