export interface LngLat {
  lng: number;
  lat: number;
}

export interface BoundingBox {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

export interface MapOptions {
  container: string | HTMLElement;
  style: string | object;
  center?: [number, number];
  zoom?: number;
  offlineMode?: boolean;
}
