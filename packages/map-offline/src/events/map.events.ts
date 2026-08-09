import { LngLat } from "../types/map.types";

export interface MapClickEvent {
  lngLat: LngLat;
  point: { x: number; y: number };
}

export type MapEventHandler<T> = (event: T) => void;

export class MapEventEmitter {
  private listeners: Map<string, Set<MapEventHandler<any>>> = new Map();

  public on<T>(event: string, handler: MapEventHandler<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  public off<T>(event: string, handler: MapEventHandler<T>): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(handler);
    }
  }

  public emit<T>(event: string, payload: T): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(handler => handler(payload));
    }
  }
}
