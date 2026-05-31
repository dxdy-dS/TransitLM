import { NextResponse } from "next/server";

const WINDY_API_KEY = "qIkPU3vvCKYY706uRHbqbxQ6D4Vwndkh";
const WINDY_FORECAST_URL = "https://api.windy.com/api/point-forecast/v2";

const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 10 * 60 * 1000;

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

  const cacheKey = `forecast-daily-${lat}-${lon}`;
  const cached = getCached(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    // Request 7+ days of data from GFS
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
    const timestamps: number[] = data.ts || [];
    if (timestamps.length === 0) {
      return NextResponse.json({ error: "No forecast data" }, { status: 404 });
    }

    const temps: number[] = data["temp-surface"] || [];
    const dewpoints: number[] = data["dewpoint-surface"] || [];
    const windU: number[] = data["wind_u-surface"] || [];
    const windV: number[] = data["wind_v-surface"] || [];
    const gusts: number[] = data["gust-surface"] || [];
    const precip: number[] = data["past3hprecip-surface"] || [];
    const snowPrecip: number[] = data["past3hsnowprecip-surface"] || [];
    const ptype: number[] = data["ptype-surface"] || [];
    const lclouds: number[] = data["lclouds-surface"] || [];
    const mclouds: number[] = data["mclouds-surface"] || [];
    const hclouds: number[] = data["hclouds-surface"] || [];
    const humidity: number[] = data["rh-surface"] || [];
    const pressure: number[] = data["pressure-surface"] || [];
    const cape: number[] = data["cape-surface"] || [];

    // Group by day
    const dayMap = new Map<
      string,
      {
        date: Date;
        temps: number[];
        windSpeeds: number[];
        windDegs: number[];
        gusts: number[];
        precips: number[];
        snows: number[];
        ptypes: number[];
        cloudValues: number[];
        humidities: number[];
        pressures: number[];
        capes: number[];
      }
    >();

    timestamps.forEach((ts, i) => {
      const date = new Date(ts);
      const dayKey = date.toISOString().split("T")[0];

      if (!dayMap.has(dayKey)) {
        dayMap.set(dayKey, {
          date,
          temps: [],
          windSpeeds: [],
          windDegs: [],
          gusts: [],
          precips: [],
          snows: [],
          ptypes: [],
          cloudValues: [],
          humidities: [],
          pressures: [],
          capes: [],
        });
      }

      const day = dayMap.get(dayKey)!;
      if (temps[i] != null) day.temps.push(temps[i]);
      if (windU[i] != null && windV[i] != null) {
        day.windSpeeds.push(
          Math.sqrt(windU[i] ** 2 + windV[i] ** 2)
        );
        day.windDegs.push(
          (Math.atan2(windV[i], windU[i]) * 180) / Math.PI + 180
        );
      }
      if (gusts[i] != null) day.gusts.push(gusts[i]);
      if (precip[i] != null) day.precips.push(precip[i]);
      if (snowPrecip[i] != null) day.snows.push(snowPrecip[i]);
      if (ptype[i] != null) day.ptypes.push(ptype[i]);
      if (lclouds[i] != null && mclouds[i] != null && hclouds[i] != null) {
        day.cloudValues.push(Math.max(lclouds[i], mclouds[i], hclouds[i]));
      }
      if (humidity[i] != null) day.humidities.push(humidity[i]);
      if (pressure[i] != null) day.pressures.push(pressure[i] / 100);
      if (cape[i] != null) day.capes.push(cape[i]);
    });

    const daily = Array.from(dayMap.values())
      .slice(0, 7)
      .map((day) => {
        const tempMin = day.temps.length > 0 ? Math.min(...day.temps) : 0;
        const tempMax = day.temps.length > 0 ? Math.max(...day.temps) : 0;
        const avgWind =
          day.windSpeeds.length > 0
            ? day.windSpeeds.reduce((a, b) => a + b, 0) / day.windSpeeds.length
            : 0;
        const avgWindDeg =
          day.windDegs.length > 0
            ? day.windDegs[Math.floor(day.windDegs.length / 2)]
            : 0;
        const maxGust = day.gusts.length > 0 ? Math.max(...day.gusts) : 0;
        const totalPrecip =
          day.precips.length > 0
            ? day.precips.reduce((a, b) => a + b, 0)
            : 0;
        const totalSnow =
          day.snows.length > 0
            ? day.snows.reduce((a, b) => a + b, 0)
            : 0;
        const avgClouds =
          day.cloudValues.length > 0
            ? day.cloudValues.reduce((a, b) => a + b, 0) / day.cloudValues.length
            : 0;
        const avgHumidity =
          day.humidities.length > 0
            ? day.humidities.reduce((a, b) => a + b, 0) / day.humidities.length
            : 0;
        const avgPressure =
          day.pressures.length > 0
            ? day.pressures.reduce((a, b) => a + b, 0) / day.pressures.length
            : 0;
        const maxCape = day.capes.length > 0 ? Math.max(...day.capes) : 0;

        // Dominant ptype for the day
        const ptypeCounts = new Map<number, number>();
        day.ptypes.forEach((p) => {
          if (p > 0) ptypeCounts.set(p, (ptypeCounts.get(p) || 0) + 1);
        });
        const dominantPtype =
          ptypeCounts.size > 0
            ? [...ptypeCounts.entries()].sort((a, b) => b[1] - a[1])[0][0]
            : 0;

        // Derive condition
        let condition = "clear";
        if (maxCape > 1000 && maxGust > 15 && totalPrecip > 5) condition = "thunderstorm";
        else if (dominantPtype === 5 || dominantPtype === 7) condition = "snow";
        else if (totalPrecip > 5) condition = "rain";
        else if (totalPrecip > 1) condition = "drizzle";
        else if (avgClouds > 70) condition = "clouds";

        const precipProbability = totalPrecip > 0 ? Math.min(100, Math.round(totalPrecip * 10)) : 0;

        return {
          dt: day.date.getTime() / 1000,
          date: day.date.toISOString().split("T")[0],
          tempMin,
          tempMax,
          windSpeed: avgWind,
          windDeg: avgWindDeg % 360,
          gust: maxGust,
          precip: totalPrecip,
          snow: totalSnow,
          ptype: dominantPtype,
          clouds: Math.round(avgClouds),
          humidity: Math.round(avgHumidity),
          pressure: Math.round(avgPressure),
          cape: maxCape,
          condition,
          pop: precipProbability,
        };
      });

    const result = { daily, meta: { model: "gfs", source: "windy" } };
    setCache(cacheKey, result);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to fetch forecast: ${err instanceof Error ? err.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
