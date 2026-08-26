export interface ResolvedLocation {
  displayName: string;
  latitude: number;
  longitude: number;
  source: "search" | "gps";
}

interface NominatimPlace {
  display_name: string;
  lat: string;
  lon: string;
}

const NOMINATIM = "https://nominatim.openstreetmap.org";

async function nominatim(path: string): Promise<NominatimPlace[]> {
  const response = await fetch(`${NOMINATIM}${path}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("Location service is unavailable. Try again shortly.");
  return response.json();
}

function toLocation(place: NominatimPlace, source: ResolvedLocation["source"]): ResolvedLocation {
  return {
    displayName: place.display_name,
    latitude: Number(place.lat),
    longitude: Number(place.lon),
    source,
  };
}

export async function resolveLocation(query: string): Promise<ResolvedLocation> {
  const value = query.trim();
  if (value.length < 2) throw new Error("Enter a city, town, or recognizable place.");
  const places = await nominatim(`/search?format=jsonv2&limit=1&countrycodes=in&q=${encodeURIComponent(value)}`);
  if (!places.length) throw new Error(`MARG could not resolve “${value}”. Check the spelling or try a nearby city.`);
  return toLocation(places[0], "search");
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<ResolvedLocation> {
  const places = await nominatim(`/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
  if (!places.length) throw new Error("GPS found your coordinates, but MARG could not name this area.");
  return toLocation(places[0], "gps");
}
