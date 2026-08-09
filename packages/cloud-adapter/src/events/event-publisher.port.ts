import type { Result } from "@marg/domain";
import type { CloudAdapterError } from "../errors/cloud-adapter.error";
import type { CloudEvent, EventPublishOptions } from "./cloud-event";

/**
 * Event publisher port.
 *
 * Publishes CloudEvents to cloud messaging infrastructure.
 * Implementations map to:
 * - Google Cloud Pub/Sub
 * - AWS EventBridge / SNS
 * - Azure Event Grid
 * - Supabase Edge Functions (via webhooks)
 * - Firebase Cloud Functions (via event triggers)
 */
export interface EventPublisher {
  /**
   * Publish a single event.
   */
  publish<T>(
    event: CloudEvent<T>,
    options?: EventPublishOptions
  ): Promise<Result<void, CloudAdapterError>>;

  /**
   * Publish multiple events in a batch.
   * Returns individual results for each event.
   */
  publishBatch<T>(
    events: readonly CloudEvent<T>[],
    options?: EventPublishOptions
  ): Promise<Result<void, CloudAdapterError>>;
}
