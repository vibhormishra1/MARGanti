import maplibregl from "maplibre-gl";
import { IMapEngine } from "./map.engine.interface";
import { MapOptions, LngLat } from "../types/map.types";
import { EngineInitError } from "../errors/map.error";
import { MapEventEmitter } from "../events/map.events";

export class MapLibreAdapter implements IMapEngine {
  public readonly events = new MapEventEmitter();
  private map: maplibregl.Map | null = null;

  async initialize(options: MapOptions): Promise<void> {
    // WebGL support check removed as it can cause import issues in Next.js SSR or turbopack

    return new Promise((resolve, reject) => {
      try {
        this.map = new maplibregl.Map({
          container: options.container,
          style: options.style as any,
          center: options.center ?? [0, 0],
          zoom: options.zoom ?? 1,
        });

        this.map.once("load", () => {
          this.setupEventListeners();
          resolve();
        });

        this.map.once("error", (e) => {
          reject(new EngineInitError(e.error?.message || "Map failed to load"));
        });
      } catch (err: any) {
        reject(new EngineInitError(err.message));
      }
    });
  }

  private setupEventListeners(): void {
    if (!this.map) return;
    
    this.map.on("click", (e) => {
      this.events.emit("click", {
        lngLat: { lng: e.lngLat.lng, lat: e.lngLat.lat },
        point: { x: e.point.x, y: e.point.y }
      });
    });

    this.map.on("moveend", () => {
      this.events.emit("moveend", { center: this.getCenter(), zoom: this.getZoom() });
    });
  }

  destroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  setCenter(center: [number, number]): void {
    this.map?.setCenter(center);
  }

  setZoom(zoom: number): void {
    this.map?.setZoom(zoom);
  }

  getCenter(): LngLat {
    if (!this.map) return { lng: 0, lat: 0 };
    const center = this.map.getCenter();
    return { lng: center.lng, lat: center.lat };
  }

  getZoom(): number {
    return this.map?.getZoom() ?? 0;
  }

  addSource(id: string, source: any): void {
    this.map?.addSource(id, source as maplibregl.SourceSpecification);
  }

  addLayer(layer: any): void {
    this.map?.addLayer(layer as maplibregl.LayerSpecification);
  }

  removeLayer(id: string): void {
    if (this.map?.getLayer(id)) {
      this.map.removeLayer(id);
    }
  }

  removeSource(id: string): void {
    if (this.map?.getSource(id)) {
      this.map.removeSource(id);
    }
  }
}
