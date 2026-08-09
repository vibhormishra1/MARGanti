import { CloudAdapterError } from "./cloud-adapter.error";

/**
 * Real-time communication errors.
 */
export class RealtimeError extends CloudAdapterError {
  constructor(
    message: string,
    options: {
      code?: string;
      retryable?: boolean;
      cause?: Error;
      metadata?: Record<string, unknown>;
    } = {}
  ) {
    super(message, {
      code: options.code ?? "CLOUD_REALTIME_ERROR",
      retryable: options.retryable ?? true,
      cause: options.cause,
      metadata: options.metadata,
    });
    this.name = "RealtimeError";
  }
}

export class ConnectionLostError extends RealtimeError {
  constructor(message = "Real-time connection lost", cause?: Error) {
    super(message, {
      code: "CLOUD_REALTIME_CONNECTION_LOST",
      retryable: true,
      cause,
    });
    this.name = "ConnectionLostError";
  }
}

export class SubscriptionError extends RealtimeError {
  constructor(
    channel: string,
    options: { reason?: string; cause?: Error } = {}
  ) {
    super(`Failed to subscribe to channel: ${channel}`, {
      code: "CLOUD_REALTIME_SUBSCRIPTION_FAILED",
      retryable: true,
      cause: options.cause,
      metadata: {
        channel,
        ...(options.reason && { reason: options.reason }),
      },
    });
    this.name = "SubscriptionError";
  }
}

export class ChannelNotFoundError extends RealtimeError {
  constructor(channel: string, cause?: Error) {
    super(`Channel not found: ${channel}`, {
      code: "CLOUD_REALTIME_CHANNEL_NOT_FOUND",
      retryable: false,
      cause,
      metadata: { channel },
    });
    this.name = "ChannelNotFoundError";
  }
}
