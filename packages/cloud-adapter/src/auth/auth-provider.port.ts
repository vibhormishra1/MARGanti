import type { Result } from "@marg/domain";
import type { Unsubscribe } from "../types/common.types";
import type { AuthError } from "../errors/auth.error";
import type { AuthSession } from "./auth-session";
import type { AuthCredentials, TokenRefreshResult } from "./auth-token";

/**
 * Authentication state reported by the provider.
 */
export type AuthState = "authenticated" | "unauthenticated" | "loading";

/**
 * Auth state change event payload.
 */
export interface AuthStateChangeEvent {
  readonly state: AuthState;
  readonly session: AuthSession | null;
}

/**
 * Authentication provider port.
 *
 * Abstracts all auth operations. Implementations must handle:
 * - Credential-based sign in/up
 * - Token refresh (automatic if configured)
 * - Session persistence
 * - Auth state observation
 *
 * This interface does NOT handle:
 * - OAuth redirect flows (consumer/UI responsibility)
 * - Password hashing (provider responsibility)
 * - MFA challenge rendering (consumer responsibility)
 */
export interface AuthProvider {
  /**
   * Sign in with the given credentials.
   * Returns the established session or an auth error.
   */
  signIn(credentials: AuthCredentials): Promise<Result<AuthSession, AuthError>>;

  /**
   * Create a new account and sign in.
   * Returns the new session or an auth error.
   */
  signUp(credentials: AuthCredentials): Promise<Result<AuthSession, AuthError>>;

  /**
   * Sign out the current user. Invalidates the session.
   */
  signOut(): Promise<Result<void, AuthError>>;

  /**
   * Refresh the current access token.
   * Typically called automatically when autoRefreshToken is enabled.
   */
  refreshToken(): Promise<Result<TokenRefreshResult, AuthError>>;

  /**
   * Returns the current session, or null if not authenticated.
   */
  getCurrentSession(): Promise<Result<AuthSession | null, AuthError>>;

  /**
   * Subscribe to auth state changes.
   * Callback fires immediately with the current state, then on every change.
   * Returns an unsubscribe function.
   */
  onAuthStateChange(
    callback: (event: AuthStateChangeEvent) => void
  ): Unsubscribe;
}
