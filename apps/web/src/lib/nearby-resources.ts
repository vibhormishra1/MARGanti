export type ResourceType = "HOSPITAL" | "SHELTER" | "RESPONSE";

export interface NearbyResource {
  id: string;
  name: string;
  type: ResourceType;
  latitude: number;
  longitude: number;
  address?: string;
  distanceMeters: number;
  distanceLabel: string;
  durationSeconds?: number;
  durationLabel?: string;
  source: "OpenStreetMap directory";
}

export interface RouteResult {
  coordinates: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
  distanceLabel: string;
  durationLabel: string;
}

type OverpassElement = { id: number; type: string; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> };

export function haversineMeters(from: [number, number], to: [number, number]): number {
  const [fromLat, fromLng] = from; const [toLat, toLng] = to;
  const earthRadius = 6371008.8; const radians = (degrees: number) => degrees * Math.PI / 180;
  const latDelta = radians(toLat - fromLat); const lngDelta = radians(toLng - fromLng);
  const a = Math.sin(latDelta / 2) ** 2 + Math.cos(radians(fromLat)) * Math.cos(radians(toLat)) * Math.sin(lngDelta / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(meters: number): string {
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(meters < 10000 ? 1 : 0)} km`;
}

function elementCoordinates(element: OverpassElement): [number, number] | null {
  const latitude = element.lat ?? element.center?.lat; const longitude = element.lon ?? element.center?.lon;
  return Number.isFinite(latitude) && Number.isFinite(longitude) ? [latitude as number, longitude as number] : null;
}

function classify(tags: Record<string, string> = {}): ResourceType | null {
  if (tags.amenity === "hospital" || tags.healthcare === "hospital" || tags.healthcare === "clinic") return "HOSPITAL";
  if (tags.amenity === "shelter" || tags.social_facility === "shelter") return "SHELTER";
  if (tags.amenity === "fire_station" || tags.emergency === "ambulance_station") return "RESPONSE";
  return null;
}

export function buildOverpassQuery(latitude: number, longitude: number): string {
  return `[out:json][timeout:15];(nwr(around:8000,${latitude},${longitude})["amenity"~"hospital|shelter|fire_station"];nwr(around:8000,${latitude},${longitude})["healthcare"~"hospital|clinic"];nwr(around:8000,${latitude},${longitude})["emergency"="ambulance_station"];);out center tags;`;
}

export function parseNearbyResources(data: { elements?: OverpassElement[] }, latitude: number, longitude: number): NearbyResource[] {
  const origin: [number, number] = [latitude, longitude]; const seen = new Set<string>();
  return (data.elements ?? []).flatMap((element) => {
    const type = classify(element.tags); const coordinates = elementCoordinates(element); const name = element.tags?.name?.trim();
    if (!type || !coordinates || !name) return [];
    const id = `${element.type}-${element.id}`; if (seen.has(id)) return []; seen.add(id);
    const distanceMeters = haversineMeters(origin, coordinates);
    const address = [element.tags?.["addr:street"], element.tags?.["addr:city"]].filter(Boolean).join(", ");
    return [{ id, name, type, latitude: coordinates[0], longitude: coordinates[1], address: address || undefined, distanceMeters, distanceLabel: formatDistance(distanceMeters), source: "OpenStreetMap directory" as const }];
  }).sort((a, b) => a.distanceMeters - b.distanceMeters).slice(0, 12);
}

export async function fetchNearbyResources(latitude: number, longitude: number): Promise<NearbyResource[]> {
  const response = await fetch(`/api/nearby?lat=${latitude}&lng=${longitude}`);
  if (!response.ok) throw new Error("Nearby directory is unavailable right now.");
  return response.json();
}

export async function fetchRoute(from: [number, number], to: [number, number]): Promise<RouteResult> {
  const response = await fetch(`/api/route?fromLat=${from[0]}&fromLng=${from[1]}&toLat=${to[0]}&toLng=${to[1]}`);
  if (!response.ok) throw new Error("Route unavailable right now.");
  return response.json();
}
