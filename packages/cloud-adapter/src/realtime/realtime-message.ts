import type { ISOTimestamp, Metadata } from "../types/common.types";

/**
 * Real-time message envelope.
 * Wraps any payload with routing and metadata.
 */
export interface RealtimeMessage<T = unknown> {
  readonly id: string;
  readonly channel: string;
  readonly event: string;
  readonly payload: T;
  readonly senderId: string | null;
  readonly timestamp: ISOTimestamp;
  readonly metadata: Metadata;
}

/**
 * Real-time channel descriptor.
 */
export interface RealtimeChannel {
  readonly name: string;
  readonly isPrivate: boolean;
  readonly presenceEnabled: boolean;
}

/**
 * Presence state for a channel — who is currently connected.
 */
export interface PresenceState {
  readonly channel: string;
  readonly members: readonly PresenceMember[];
}

/**
 * A single presence member.
 */
export interface PresenceMember {
  readonly userId: string;
  readonly joinedAt: ISOTimestamp;
  readonly metadata: Metadata;
}
