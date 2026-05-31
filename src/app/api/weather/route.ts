import { NextResponse } from "next/server";

const WINDY_API_KEY = "qIkPU3vvCKYY706uRHbqbxQ6D4Vwndkh";
const WINDY_FORECAST_URL = "https://api.windy.com/api/point-forecast/v2";

// Simple in-memory cache (5 min TTL)
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

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

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "Provide coordinates (lat, lon)" },
      { status: 400 }
    );
  }

  const cacheKey = `weather-${lat}-${lon}`;
  const cached = getCached(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const body = {
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      model: "gfs",
      parameters: [
        "temp",
        "dewpoint",
        "wind",
        "windGust",
        "precip",
        "convPrecip",
        "snowPrecip",
        "ptype",
        "lclouds",
        "mclouds",
        "hclouds",
        "rh",
        "pressure",
        "cape",
      ],
      levels: ["surface"],
      key: WINDY_API_KEY,
    };

    const res = await fetch(WINDY_FORECAST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `Windy API error: ${errText}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Transform Windy time-series data into our app format
    const timestamps: number[] = data.ts || [];
    if (timestamps.length === 0) {
      return NextResponse.json({ error: "No forecast data available" }, { status: 404 });
    }

    const temps: number[] = data["temp-surface"] || [];
    const dewpoints: number[] = data["dewpoint-surface"] || [];
    const windU: number[] = data["wind_u-surface"] || [];
    const windV: number[] = data["wind_v-surface"] || [];
    const gusts: number[] = data["gust-surface"] || [];
    const precip: number[] = data["past3hprecip-surface"] || [];
    const convPrecip: number[] = data["past3hconvprecip-surface"] || [];
    const snowPrecip: number[] = data["past3hsnowprecip-surface"] || [];
    const ptype: number[] = data["ptype-surface"] || [];
    const lclouds: number[] = data["lclouds-surface"] || [];
    const mclouds: number[] = data["mclouds-surface"] || [];
    const hclouds: number[] = data["hclouds-surface"] || [];
    const humidity: number[] = data["rh-surface"] || [];
    const pressure: number[] = data["pressure-surface"] || [];
    const cape: number[] = data["cape-surface"] || [];

    // Build current weather from first data point
    const now = timestamps[0];
    const currentTemp = temps[0];
    const currentDewpoint = dewpoints[0] || 0;
    const currentWindU = windU[0] || 0;
    const currentWindV = windV[0] || 0;
    const currentWindSpeed = Math.sqrt(currentWindU ** 2 + currentWindV ** 2);
    const currentWindDeg = (Math.atan2(currentWindV, currentWindU) * 180) / Math.PI + 180;
    const currentGust = gusts[0] || 0;
    const currentPrecip = precip[0] || 0;
    const currentSnow = snowPrecip[0] || 0;
    const currentPtype = ptype[0] || 0;
    const currentClouds = Math.max(lclouds[0] || 0, mclouds[0] || 0, hclouds[0] || 0);
    const currentHumidity = humidity[0] || 0;
    const currentPressure = pressure[0] ? pressure[0] / 100 : 1013; // Pa -> hPa
    const currentCape = cape[0] || 0;

    // Calculate "feels like" using wind chill / heat index approximation
    const feelsLike = calcFeelsLike(currentTemp, currentDewpoint, currentWindSpeed);

    // Derive weather condition
    const condition = deriveCondition(currentPrecip, currentPtype, currentClouds, currentCape, currentGust);

    // Build hourly forecast (up to 48 hours)
    const hourly = timestamps.slice(0, 48).map((ts, i) => ({
      dt: ts / 1000, // Convert ms to seconds for consistency
      temp: temps[i],
      dewpoint: dewpoints[i],
      windSpeed: Math.sqrt((windU[i] || 0) ** 2 + (windV[i] || 0) ** 2),
      windDeg: (Math.atan2(windV[i] || 0, windU[i] || 0) * 180) / Math.PI + 180,
      gust: gusts[i] || 0,
      precip: precip[i] || 0,
      snow: snowPrecip[i] || 0,
      ptype: ptype[i] || 0,
      clouds: Math.max(lclouds[i] || 0, mclouds[i] || 0, hclouds[i] || 0),
      humidity: humidity[i] || 0,
      pressure: pressure[i] ? pressure[i] / 100 : 1013,
      cape: cape[i] || 0,
      condition: deriveCondition(
        precip[i] || 0,
        ptype[i] || 0,
        Math.max(lclouds[i] || 0, mclouds[i] || 0, hclouds[i] || 0),
        cape[i] || 0,
        gusts[i] || 0
      ),
    }));

    const result = {
      current: {
        dt: now / 1000,
        temp: currentTemp,
        feelsLike,
        tempMin: currentTemp,
        tempMax: currentTemp,
        dewpoint: currentDewpoint,
        humidity: currentHumidity,
        pressure: currentPressure,
        windSpeed: currentWindSpeed,
        windDeg: currentWindDeg % 360,
        gust: currentGust,
        precip: currentPrecip,
        snow: currentSnow,
        ptype: currentPtype,
        clouds: currentClouds,
        condition,
        cape: currentCape,
        visibility: estimateVisibility(currentClouds, currentPrecip, currentHumidity),
      },
      hourly,
      meta: {
        model: "gfs",
        source: "windy",
        generatedAt: Date.now(),
      },
    };

    setCache(cacheKey, result);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to fetch weather: ${err instanceof Error ? err.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}

function deriveCondition(
  precip: number,
  ptype: number,
  clouds: number,
  cape: number,
  gust: number
): string {
  // Thunderstorm detection: high CAPE + gust + precip
  if (cape > 1000 && gust > 15 && precip > 2) return "thunderstorm";
  if (cape > 2000 && precip > 0) return "thunderstorm";

  // Snow
  if (ptype === 5) return "snow";
  if (ptype === 7) return "snow"; // mix treated as snow-ish

  // Rain
  if (precip > 0 && ptype === 1) return "rain";
  if (precip > 5 && ptype === 0) return "rain"; // heavy convective

  // Drizzle
  if (precip > 0 && precip <= 2) return "drizzle";

  // Overcast
  if (clouds > 85) return "clouds";
  if (clouds > 50) return "clouds";

  // Clear
  return "clear";
}

function calcFeelsLike(temp: number, dewpoint: number, windSpeed: number): number {
  // Heat index approximation for warm temps
  if (temp >= 27 && dewpoint >= 15) {
    const hi =
      -8.785 +
      1.611 * temp +
      2.339 * dewpoint -
      0.1461 * temp * dewpoint -
      0.01231 * temp * temp -
      0.01642 * dewpoint * dewpoint +
      0.002212 * temp * temp * dewpoint +
      0.0007255 * temp * dewpoint * dewpoint -
      0.000003582 * temp * temp * dewpoint * dewpoint;
    return Math.round(hi * 10) / 10;
  }

  // Wind chill for cold temps with wind
  if (temp <= 10 && windSpeed > 1.3) {
    const wc =
      13.12 +
      0.6215 * temp -
      11.37 * Math.pow(windSpeed, 0.16) +
      0.3965 * temp * Math.pow(windSpeed, 0.16);
    return Math.round(wc * 10) / 10;
  }

  return temp;
}

function estimateVisibility(clouds: number, precip: number, humidity: number): number {
  let vis = 20000; // 20km baseline

  // Reduce visibility based on conditions
  if (precip > 5) vis *= 0.2;
  else if (precip > 1) vis *= 0.5;
  else if (precip > 0) vis *= 0.7;

  if (humidity > 95) vis *= 0.5;
  else if (humidity > 90) vis *= 0.7;
  else if (humidity > 80) vis *= 0.85;

  if (clouds > 90) vis *= 0.8;

  return Math.round(Math.max(100, vis));
}
