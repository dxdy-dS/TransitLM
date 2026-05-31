import { NextResponse } from "next/server";

const API_KEY = process.env.OPENWEATHER_API_KEY || "demo";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const units = searchParams.get("units") || "metric";

  if (!q && (!lat || !lon)) {
    return NextResponse.json(
      { error: "Provide city name (q) or coordinates (lat, lon)" },
      { status: 400 }
    );
  }

  try {
    const location = q
      ? `${BASE_URL}/forecast?q=${encodeURIComponent(q)}&appid=${API_KEY}&units=${units}`
      : `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`;

    const res = await fetch(location, { next: { revalidate: 300 } });
    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json(
        { error: err.message || "Forecast not found" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch forecast" },
      { status: 500 }
    );
  }
}
