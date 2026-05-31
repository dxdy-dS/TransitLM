import { NextResponse } from "next/server";

// Windy.com Webcam API v3
const WINDY_WEBCAM_KEY = "W8efMgsqKF3CQS3fQ8KxQpOKTNfJaIdf";
const WINDY_WEBCAM_URL = "https://api.windy.com/webcams/api/v3/webcams";

// Cache (3 min — images expire in 10 min for free tier)
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 3 * 60 * 1000;

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
  const limit = searchParams.get("limit") || "8";

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "Berikan koordinat (lat, lon)" },
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
      lang: "id",
    });

    const res = await fetch(`${WINDY_WEBCAM_URL}?${params}`, {
      headers: {
        "x-windy-api-key": WINDY_WEBCAM_KEY,
        "Accept": "application/json",
      },
      next: { revalidate: 180 },
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `Webcam API: ${errText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const webcams = (data.webcams || []).map((cam: Record<string, unknown>) => {
      const images = cam.image as Record<string, Record<string, string>> | undefined;
      const location = cam.location as Record<string, unknown> | undefined;
      const player = cam.player as Record<string, string> | undefined;

      return {
        id: cam.webcamId,
        status: cam.status,
        title: cam.title,
        city: location?.city || "",
        region: location?.region || "",
        country: location?.country || "",
        countryCode: location?.country_code || "",
        lat: location?.latitude,
        lng: location?.longitude,
        viewCount: cam.viewCount || 0,
        // Image URLs (expire in ~10 min)
        imageIcon: images?.current?.icon || "",
        imageThumbnail: images?.current?.thumbnail || "",
        imagePreview: images?.current?.preview || "",
        imageDaylightPreview: images?.daylight?.preview || "",
        // Embed player URLs
        playerLive: player?.live || "",
        playerDay: player?.day || "",
        playerMonth: player?.month || "",
        playerYear: player?.year || "",
        playerLifetime: player?.lifetime || "",
      };
    });

    const result = {
      webcams,
      total: data.total || 0,
      meta: { source: "windy-webcams", generatedAt: Date.now() },
    };

    setCache(cacheKey, result);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: `Gagal: ${err instanceof Error ? err.message : "Kesalahan"}` },
      { status: 500 }
    );
  }
}
