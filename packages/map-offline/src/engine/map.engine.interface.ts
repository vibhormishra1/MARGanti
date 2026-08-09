import { LngLat, MapOptions } from "../types/map.types";
import { MapEventEmitter } from "../events/map.events";

export interface IMapEngine {
  readonly events: MapEventEmitter;
  initialize(options: MapOptions): Promise<void>;
  destroy(): void;
  setCenter(center: [number, number]): void;
  setZoom(zoom: number): void;
  getCenter(): LngLat;
  getZoom(): number;
  addSource(id: string, source: any): void;
  addLayer(layer: any): void;
  removeLayer(id: string): void;
  removeSource(id: string): void;
}
