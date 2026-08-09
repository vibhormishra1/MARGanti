import type { Result } from "@marg/domain";
import type { Unsubscribe } from "../types/common.types";
import type { RealtimeError } from "../errors/realtime.error";
import type { RealtimeMessage, PresenceState } from "./realtime-message";
import type { RealtimeConnectionState } from "./realtime-channel";

/**
 * Callback type for real-time message subscriptions.
 */
export type RealtimeCallback<T> = (message: RealtimeMessage<T>) => void;

/**
 * Real-time communication provider port.
 *
 * Abstracts bidirectional real-time messaging.
 * Implementations map to:
 * - Firebase Realtime Database / Firestore listeners
 * - Supabase Realtime (Postgres changes + broadcast)
 * - AWS AppSync subscriptions
 * - Pusher / Ably channels
 *
 * This interface does NOT handle:
 * - WebSocket protocol details
 * - Polling fallback implementation
 * - Message serialization/deserialization beyond the envelope
 */
export interface RealtimeProvider {
  /**
   * Establish the real-time connection.
   */
  connect(): Promise<Result<void, RealtimeError>>;

  /**
   * Gracefully disconnect. All subscriptions are automatically cleaned up.
   */
  disconnect(): Promise<void>;

  /**
   * Subscribe to messages on a channel.
   * Returns an unsubscribe function.
   *
   * @param channel - Channel name to subscribe to.
   * @param event - Optional event filter. If omitted, receives all events.
   * @param callback - Handler for incoming messages.
   */
  subscribe<T>(
    channel: string,
    event: string | null,
    callback: RealtimeCallback<T>
  ): Unsubscribe;

  /**
   * Publish a message to a channel.
   */
  publish<T>(
    channel: string,
    event: string,
    payload: T
  ): Promise<Result<void, RealtimeError>>;

  /**
   * Get the current presence state for a channel.
   */
  presence(
    channel: string
  ): Promise<Result<PresenceState, RealtimeError>>;

  /**
   * Subscribe to connection state changes.
   */
  onConnectionStateChange(
    callback: (state: RealtimeConnectionState) => void
  ): Unsubscribe;
}
