import { NextRequest, NextResponse } from "next/server";
import { buildOverpassQuery, parseNearbyResources } from "@/lib/nearby-resources";

export async function GET(request: NextRequest) {
  const latitude = Number(request.nextUrl.searchParams.get("lat"));
  const longitude = Number(request.nextUrl.searchParams.get("lng"));
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  try {
    const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(buildOverpassQuery(latitude, longitude))}`, { headers: { Accept: "application/json" }, next: { revalidate: 300 } });
    if (!response.ok) return NextResponse.json({ error: "Nearby directory unavailable" }, { status: 502 });
    const data = await response.json();
    return NextResponse.json(parseNearbyResources(data, latitude, longitude), { headers: { "Cache-Control": "public, max-age=300" } });
  } catch { return NextResponse.json({ error: "Nearby directory unavailable" }, { status: 502 }); }
}
