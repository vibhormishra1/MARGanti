import type { ConnectivityState } from "../types/connectivity.types";

/**
 * Real-time connection states.
 * Models the lifecycle of a persistent connection (WebSocket, SSE, long-poll).
 */
export type RealtimeConnectionState =
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "error";

/**
 * Maps connectivity to realtime connection states.
 */
export interface RealtimeConnectionInfo {
  readonly state: RealtimeConnectionState;
  readonly connectivity: ConnectivityState;
  readonly reconnectAttempt: number;
  readonly lastConnectedAt: number | null;
}
