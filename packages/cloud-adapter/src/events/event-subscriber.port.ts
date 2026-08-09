import type { Result } from "@marg/domain";
import type { Unsubscribe } from "../types/common.types";
import type { CloudAdapterError } from "../errors/cloud-adapter.error";
import type { CloudEvent, EventSubscriptionFilter } from "./cloud-event";

/**
 * Event subscriber port.
 *
 * Subscribes to CloudEvents from cloud messaging infrastructure.
 * Typically used by background workers or event-driven services.
 */
export interface EventSubscriber {
  /**
   * Subscribe to events matching the given filter.
   * The callback is invoked for each matching event.
   * Returns an unsubscribe function.
   */
  subscribe<T>(
    filter: EventSubscriptionFilter,
    callback: (event: CloudEvent<T>) => Promise<void>
  ): Unsubscribe;

  /**
   * Acknowledge successful processing of an event.
   * Required for at-least-once delivery semantics.
   */
  acknowledge(eventId: string): Promise<Result<void, CloudAdapterError>>;

  /**
   * Negative-acknowledge an event, indicating processing failure.
   * The event may be retried or sent to a dead-letter queue.
   */
  nack(
    eventId: string,
    reason?: string
  ): Promise<Result<void, CloudAdapterError>>;
}
