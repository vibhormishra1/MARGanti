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

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const OSRM_URL = "https://router.project-osrm.org/route/v1/driving";

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

export async function fetchNearbyResources(latitude: number, longitude: number): Promise<NearbyResource[]> {
  const query = `[out:json][timeout:15];(nwr(around:8000,${latitude},${longitude})["amenity"~"hospital|shelter|fire_station"];nwr(around:8000,${latitude},${longitude})["healthcare"~"hospital|clinic"];nwr(around:8000,${latitude},${longitude})["emergency"="ambulance_station"];);out center tags;`;
  const response = await fetch(`${OVERPASS_URL}?data=${encodeURIComponent(query)}`, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("Nearby directory is unavailable right now.");
  const data = await response.json() as { elements?: OverpassElement[] };
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

export async function fetchRoute(from: [number, number], to: [number, number]): Promise<RouteResult> {
  const url = `${OSRM_URL}/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("Route unavailable right now.");
  const data = await response.json() as { routes?: Array<{ distance: number; duration: number; geometry?: { coordinates: [number, number][] } }> };
  const route = data.routes?.[0];
  if (!route?.geometry?.coordinates?.length) throw new Error("Route unavailable right now.");
  return { coordinates: route.geometry.coordinates, distanceMeters: route.distance, durationSeconds: route.duration, distanceLabel: formatDistance(route.distance), durationLabel: `~${Math.max(1, Math.round(route.duration / 60))} min` };
}
