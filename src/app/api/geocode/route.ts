import { NextResponse } from "next/server";

// Free geocoding via Open-Meteo API (no API key required)
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const limit = searchParams.get("limit") || "5";

  // Reverse geocoding: coordinates -> city name
  if (lat && lon) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`,
        {
          headers: { "User-Agent": "Aura-Weather-App/1.0" },
          next: { revalidate: 3600 },
        }
      );

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({
          name:
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            "Unknown",
          country: data.address?.country_code?.toUpperCase() || "",
          countryName: data.address?.country || "",
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          admin1: data.address?.state || "",
        });
      }
    } catch {
      // Fall through
    }

    return NextResponse.json({
      name: `${parseFloat(lat).toFixed(2)}, ${parseFloat(lon).toFixed(2)}`,
      country: "",
      countryName: "",
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      admin1: "",
    });
  }

  // Forward geocoding: city name -> coordinates
  if (!q) {
    return NextResponse.json(
      { error: "Provide city name (q) or coordinates (lat, lon)" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `${GEOCODING_URL}?name=${encodeURIComponent(q)}&count=${limit}&language=en&format=json`,
      { next: { revalidate: 86400 } }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Geocoding failed" }, { status: 502 });
    }

    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      return NextResponse.json({ error: "City not found" }, { status: 404 });
    }

    return NextResponse.json({
      results: data.results.map((r: Record<string, unknown>) => ({
        name: r.name,
        latitude: r.latitude,
        longitude: r.longitude,
        country: r.country_code,
        countryName: r.country,
        admin1: r.admin1,
        timezone: r.timezone,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Geocoding failed" }, { status: 500 });
  }
}
