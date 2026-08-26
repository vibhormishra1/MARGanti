import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams; const fromLat = Number(params.get("fromLat")); const fromLng = Number(params.get("fromLng")); const toLat = Number(params.get("toLat")); const toLng = Number(params.get("toLng"));
  if (![fromLat, fromLng, toLat, toLng].every(Number.isFinite)) return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) return NextResponse.json({ error: "Route unavailable" }, { status: 502 });
    const data = await response.json(); const route = data.routes?.[0];
    if (!route?.geometry?.coordinates?.length) return NextResponse.json({ error: "Route unavailable" }, { status: 502 });
    const distanceMeters = route.distance as number; const durationSeconds = route.duration as number;
    const distanceLabel = distanceMeters < 1000 ? `${Math.round(distanceMeters)} m` : `${(distanceMeters / 1000).toFixed(distanceMeters < 10000 ? 1 : 0)} km`;
    return NextResponse.json({ coordinates: route.geometry.coordinates, distanceMeters, durationSeconds, distanceLabel, durationLabel: `~${Math.max(1, Math.round(durationSeconds / 60))} min` });
  } catch { return NextResponse.json({ error: "Route unavailable" }, { status: 502 }); }
}
