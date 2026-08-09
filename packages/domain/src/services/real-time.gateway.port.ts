export type ChannelType = "CHAT" | "PRESENCE" | "NOTIFICATIONS" | "COLLABORATION";

export interface EventPayload {
  type: string;
  data: any;
}

export interface IRealTimeGateway {
  /**
   * Subscribes to a real-time channel.
   * 
   * @param channel The channel identifier (e.g. 'incident-123-chat')
   * @param onMessage Callback fired when an event is received on the channel
   * @returns An unsubscribe function
   */
  subscribe(channel: string, onMessage: (event: EventPayload) => void): () => void;

  /**
   * Publishes an event to a specific channel.
   */
  publish(channel: string, event: EventPayload): Promise<void>;

  /**
   * Disconnects the gateway, clearing all active subscriptions.
   */
  disconnect(): void;
}
