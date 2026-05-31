import { NextResponse } from "next/server";

const WINDY_API_KEY = "qIkPU3vvCKYY706uRHbqbxQ6D4Vwndkh";
const WINDY_WEBCAM_URL = "https://api.windy.com/webcams/api/v3/webcams";

const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 3 * 60 * 1000; // 3 min cache (images expire in 10 min)

function getCached(key: string) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, ts: Date.now() });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const radius = searchParams.get("radius") || "50";
  const limit = searchParams.get("limit") || "6";

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "Provide coordinates (lat, lon)" },
      { status: 400 }
    );
  }

  const cacheKey = `webcams-${lat}-${lon}`;
  const cached = getCached(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const params = new URLSearchParams({
      nearby: `${lat},${lon},${radius}`,
      limit,
      orderby: "distance",
      direction: "asc",
      include: "images,location,player",
      lang: "en",
    });

    const res = await fetch(`${WINDY_WEBCAM_URL}?${params}`, {
      headers: {
        "x-windy-api-key": WINDY_API_KEY,
        "Accept": "application/json",
      },
      next: { revalidate: 180 }, // Revalidate every 3 min
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `Webcam API error: ${errText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const webcams = (data.webcams || []).map((cam: Record<string, unknown>) => {
      const images = cam.image as Record<string, Record<string, string>> | undefined;
      const location = cam.location as Record<string, unknown> | undefined;
      const player = cam.player as Record<string, string> | undefined;

      return {
        id: cam.id,
        status: cam.status,
        title: cam.title,
        city: location?.city || "",
        country: location?.country || "",
        region: location?.region || "",
        lat: location?.latitude,
        lng: location?.longitude,
        timezone: location?.timezone,
        // Current image URLs (expire in ~10 min for free tier)
        imageIcon: images?.current?.icon || "",
        imagePreview: images?.current?.preview || "",
        imageDaylight: images?.daylight?.preview || "",
        // Embed player URL
        playerUrl: player?.lifetime || player?.day || "",
        categories: cam.categories || [],
      };
    });

    const result = {
      webcams,
      meta: { source: "windy", generatedAt: Date.now() },
    };

    setCache(cacheKey, result);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to fetch webcams: ${err instanceof Error ? err.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
