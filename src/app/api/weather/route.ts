import { NextResponse } from "next/server";

// Free weather data from Open-Meteo — no API key required
const OPENMETEO_URL = "https://api.open-meteo.com/v1/forecast";

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
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      current: [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "precipitation",
        "weather_code",
        "wind_speed_10m",
        "wind_direction_10m",
        "wind_gusts_10m",
        "surface_pressure",
        "cloud_cover",
        "is_day",
      ].join(","),
      hourly: [
        "temperature_2m",
        "apparent_temperature",
        "precipitation_probability",
        "precipitation",
        "weather_code",
        "wind_speed_10m",
        "wind_direction_10m",
        "wind_gusts_10m",
        "cloud_cover",
        "relative_humidity_2m",
        "uv_index",
        "visibility",
      ].join(","),
      daily: [
        "temperature_2m_max",
        "temperature_2m_min",
        "apparent_temperature_max",
        "apparent_temperature_min",
        "precipitation_sum",
        "precipitation_probability_max",
        "weather_code",
        "wind_speed_10m_max",
        "wind_gusts_10m_max",
        "sunrise",
        "sunset",
        "uv_index_max",
      ].join(","),
      timezone: "auto",
      forecast_days: "7",
    });

    const res = await fetch(`${OPENMETEO_URL}?${params}`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Weather service unavailable" },
        { status: 502 }
      );
    }

    const raw = await res.json();

    // Transform Open-Meteo data into app-friendly format
    const current = {
      dt: Math.floor(new Date(raw.current.time).getTime() / 1000),
      temp: raw.current.temperature_2m,
      feelsLike: raw.current.apparent_temperature,
      humidity: raw.current.relative_humidity_2m,
      windSpeed: raw.current.wind_speed_10m,
      windDeg: raw.current.wind_direction_10m,
      gust: raw.current.wind_gusts_10m,
      precip: raw.current.precipitation,
      weatherCode: raw.current.weather_code,
      clouds: raw.current.cloud_cover,
      pressure: raw.current.surface_pressure,
      isDay: raw.current.is_day === 1,
      visibility: raw.current.visibility || 20000,
    };

    // Hourly forecast
    const hourly = raw.hourly.time.map((t: string, i: number) => {
      const ts = Math.floor(new Date(t).getTime() / 1000);
      return {
        dt: ts,
        temp: raw.hourly.temperature_2m[i],
        feelsLike: raw.hourly.apparent_temperature[i],
        precipProb: raw.hourly.precipitation_probability[i],
        precip: raw.hourly.precipitation[i],
        weatherCode: raw.hourly.weather_code[i],
        windSpeed: raw.hourly.wind_speed_10m[i],
        windDeg: raw.hourly.wind_direction_10m[i],
        gust: raw.hourly.wind_gusts_10m[i],
        clouds: raw.hourly.cloud_cover[i],
        humidity: raw.hourly.relative_humidity_2m[i],
        uvIndex: raw.hourly.uv_index[i],
        visibility: raw.hourly.visibility[i],
      };
    });

    // Daily forecast
    const daily = raw.daily.time.map((t: string, i: number) => {
      const ts = Math.floor(new Date(t + "T00:00:00").getTime() / 1000);
      return {
        dt: ts,
        date: t,
        tempMax: raw.daily.temperature_2m_max[i],
        tempMin: raw.daily.temperature_2m_min[i],
        feelsLikeMax: raw.daily.apparent_temperature_max[i],
        feelsLikeMin: raw.daily.apparent_temperature_min[i],
        precipSum: raw.daily.precipitation_sum[i],
        precipProb: raw.daily.precipitation_probability_max[i],
        weatherCode: raw.daily.weather_code[i],
        windMax: raw.daily.wind_speed_10m_max[i],
        gustMax: raw.daily.wind_gusts_10m_max[i],
        sunrise: Math.floor(new Date(raw.daily.sunrise[i]).getTime() / 1000),
        sunset: Math.floor(new Date(raw.daily.sunset[i]).getTime() / 1000),
        uvIndexMax: raw.daily.uv_index_max[i],
      };
    });

    // Set current temp min/max from daily
    current.tempMin = daily[0]?.tempMin ?? current.temp;
    current.tempMax = daily[0]?.tempMax ?? current.temp;

    const result = {
      current,
      hourly,
      daily,
      meta: {
        source: "open-meteo",
        timezone: raw.timezone,
        timezoneAbbrev: raw.timezone_abbreviation,
        units: raw.current_units,
        generatedAt: Date.now(),
      },
    };

    setCache(cacheKey, result);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      {
        error: `Gagal mengambil data cuaca: ${err instanceof Error ? err.message : "Kesalahan tidak diketahui"}`,
      },
      { status: 500 }
    );
  }
}
