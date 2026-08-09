import type { ISOTimestamp, Metadata } from "../types/common.types";

/**
 * Authentication session value object.
 * Immutable snapshot of the current auth state.
 */
export interface AuthSession {
  readonly userId: string;
  readonly email: string | null;
  readonly accessToken: string;
  readonly refreshToken: string | null;
  readonly expiresAt: ISOTimestamp;
  readonly metadata: Metadata;
}

/** Authentication token metadata. */
export interface AuthToken {
  readonly token: string;
  readonly type: "bearer" | "api_key" | "custom";
  readonly expiresAt: ISOTimestamp | null;
}
