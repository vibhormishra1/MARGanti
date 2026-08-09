import type { ISOTimestamp, Metadata } from "../types/common.types";

/**
 * CloudEvents v1.0 compatible event envelope.
 * See: https://cloudevents.io/
 *
 * Used for publishing domain events to cloud messaging infrastructure
 * (Pub/Sub, EventBridge, Cloud Events, etc.)
 */
export interface CloudEvent<T = unknown> {
  /** Unique event identifier (UUID). */
  readonly id: string;
  /** URI identifying the event source (e.g., "marg://sync-engine"). */
  readonly source: string;
  /** Event type identifier (e.g., "marg.sync.completed"). */
  readonly type: string;
  /** CloudEvents specification version. Always "1.0". */
  readonly specversion: "1.0";
  /** ISO 8601 timestamp of event creation. */
  readonly time: ISOTimestamp;
  /** MIME type of the data field. */
  readonly datacontenttype: string;
  /** Subject of the event (e.g., entity ID). */
  readonly subject?: string;
  /** Event payload data. */
  readonly data: T;
  /** Optional extension attributes. */
  readonly extensions?: Metadata;
}

/** Options for publishing events. */
export interface EventPublishOptions {
  /** Topic/channel to publish to. If omitted, uses the event type as the topic. */
  readonly topic?: string;
  /** Optional ordering key for ordered delivery. */
  readonly orderingKey?: string;
  /** Optional deduplication ID to prevent duplicate processing. */
  readonly deduplicationId?: string;
}

/** Subscription filter for receiving events. */
export interface EventSubscriptionFilter {
  /** Event type pattern (supports exact match or prefix with "*"). */
  readonly type?: string;
  /** Source URI pattern. */
  readonly source?: string;
  /** Subject pattern. */
  readonly subject?: string;
}
