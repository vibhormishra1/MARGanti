import type { ISOTimestamp, Metadata } from "../types/common.types";

/**
 * Token lifecycle and metadata types.
 */

/** Decoded token claims (subset — not all providers expose all fields). */
export interface TokenClaims {
  readonly sub: string;
  readonly iss?: string;
  readonly aud?: string | string[];
  readonly exp?: number;
  readonly iat?: number;
  readonly roles?: readonly string[];
  readonly metadata?: Metadata;
}

/** Token refresh result. */
export interface TokenRefreshResult {
  readonly accessToken: string;
  readonly refreshToken: string | null;
  readonly expiresAt: ISOTimestamp;
}

/** Credentials for email/password authentication. */
export interface EmailPasswordCredentials {
  readonly email: string;
  readonly password: string;
}

/** Credentials for token-based authentication (API keys, service accounts). */
export interface TokenCredentials {
  readonly token: string;
}

/** Credentials for OAuth authentication. */
export interface OAuthCredentials {
  readonly provider: string;
  readonly accessToken: string;
  readonly idToken?: string;
}

/** Union of all supported credential types. */
export type AuthCredentials =
  | EmailPasswordCredentials
  | TokenCredentials
  | OAuthCredentials;
