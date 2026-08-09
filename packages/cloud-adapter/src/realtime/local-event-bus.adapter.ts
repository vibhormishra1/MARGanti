import { IRealTimeGateway, EventPayload } from "@marg/domain";

/**
 * An in-memory local event bus adapter that implements the IRealTimeGateway port.
 * This simulates a WebSocket / PubSub server by broadcasting events instantly across the frontend
 * in an offline-first manner.
 * 
 * In a fully connected state, this adapter could be swapped with a Socket.io or Redis PubSub adapter
 * without changing any domain logic.
 */
export class LocalEventBusAdapter implements IRealTimeGateway {
  private subscribers: Map<string, Set<(event: EventPayload) => void>> = new Map();

  subscribe(channel: string, onMessage: (event: EventPayload) => void): () => void {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    
    this.subscribers.get(channel)!.add(onMessage);

    // Return unsubscribe function
    return () => {
      const channelSubs = this.subscribers.get(channel);
      if (channelSubs) {
        channelSubs.delete(onMessage);
        if (channelSubs.size === 0) {
          this.subscribers.delete(channel);
        }
      }
    };
  }

  async publish(channel: string, event: EventPayload): Promise<void> {
    // Simulate network delay for real-time pubsub
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const channelSubs = this.subscribers.get(channel);
    if (channelSubs) {
      channelSubs.forEach(callback => {
        try {
          callback(event);
        } catch (e) {
          console.error(`Error in subscriber callback for channel ${channel}:`, e);
        }
      });
    }
  }

  disconnect(): void {
    this.subscribers.clear();
  }
}
