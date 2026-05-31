// Weather condition utilities — WMO weather codes from Open-Meteo

export type WeatherCondition =
  | "clear"
  | "clouds"
  | "rain"
  | "drizzle"
  | "thunderstorm"
  | "snow"
  | "mist"
  | "fog"
  | "haze"
  | "dust"
  | "tornado";

// Map WMO weather codes to conditions
export function wmoToCondition(code: number): WeatherCondition {
  if (code === 0) return "clear";
  if (code === 1) return "clear"; // mainly clear
  if (code === 2) return "clouds"; // partly cloudy
  if (code === 3) return "clouds"; // overcast
  if (code >= 45 && code <= 48) return "fog"; // fog / depositing rime fog
  if (code >= 51 && code <= 55) return "drizzle"; // drizzle
  if (code >= 56 && code <= 57) return "drizzle"; // freezing drizzle
  if (code >= 61 && code <= 65) return "rain"; // rain
  if (code >= 66 && code <= 67) return "rain"; // freezing rain
  if (code >= 71 && code <= 77) return "snow"; // snow fall
  if (code >= 80 && code <= 82) return "rain"; // rain showers
  if (code >= 85 && code <= 86) return "snow"; // snow showers
  if (code === 95) return "thunderstorm"; // thunderstorm
  if (code >= 96 && code <= 99) return "thunderstorm"; // thunderstorm with hail
  return "clouds";
}

export function getWeatherCondition(id: number): WeatherCondition {
  return wmoToCondition(id);
}

export function parseCondition(str: string): WeatherCondition {
  const s = (str || "").toLowerCase().trim();
  if (s === "thunderstorm") return "thunderstorm";
  if (s === "snow") return "snow";
  if (s === "rain") return "rain";
  if (s === "drizzle") return "drizzle";
  if (s === "mist" || s === "fog" || s === "haze") return "mist";
  if (s === "dust") return "dust";
  if (s === "tornado") return "tornado";
  if (s === "clouds" || s === "overcast" || s === "cloudy") return "clouds";
  return "clear";
}

export function getWeatherIcon(condition: WeatherCondition, isNight = false): string {
  const icons: Record<WeatherCondition, string> = {
    clear: isNight ? "\u{1F319}" : "\u2600\uFE0F",
    clouds: isNight ? "\u2601\uFE0F" : "\u26C5",
    rain: "\u{1F327}\uFE0F",
    drizzle: "\u{1F326}\uFE0F",
    thunderstorm: "\u26C8\uFE0F",
    snow: "\u2744\uFE0F",
    mist: "\u{1F32B}\uFE0F",
    fog: "\u{1F32B}\uFE0F",
    haze: "\u{1F32B}\uFE0F",
    dust: "\u{1F4A8}",
    tornado: "\u{1F32A}\uFE0F",
  };
  return icons[condition];
}

export function getBackgroundGradient(
  condition: WeatherCondition,
  isNight = false
): string {
  const gradients: Record<WeatherCondition, { day: string; night: string }> = {
    clear: {
      day: "from-sky-400 via-blue-300 to-amber-200",
      night: "from-indigo-950 via-blue-950 to-slate-900",
    },
    clouds: {
      day: "from-slate-400 via-gray-300 to-blue-200",
      night: "from-slate-800 via-gray-700 to-slate-900",
    },
    rain: {
      day: "from-slate-600 via-blue-500 to-gray-400",
      night: "from-slate-900 via-blue-900 to-slate-800",
    },
    drizzle: {
      day: "from-slate-400 via-blue-400 to-gray-300",
      night: "from-slate-800 via-blue-800 to-gray-700",
    },
    thunderstorm: {
      day: "from-gray-700 via-purple-800 to-slate-600",
      night: "from-gray-950 via-purple-950 to-slate-900",
    },
    snow: {
      day: "from-blue-100 via-white to-slate-200",
      night: "from-slate-700 via-blue-200 to-gray-600",
    },
    mist: {
      day: "from-gray-300 via-slate-300 to-blue-200",
      night: "from-gray-800 via-slate-700 to-blue-900",
    },
    fog: {
      day: "from-gray-400 via-slate-400 to-gray-300",
      night: "from-gray-900 via-slate-800 to-gray-700",
    },
    haze: {
      day: "from-amber-200 via-yellow-100 to-gray-200",
      night: "from-amber-900 via-yellow-900 to-gray-800",
    },
    dust: {
      day: "from-amber-400 via-yellow-300 to-orange-200",
      night: "from-amber-950 via-yellow-950 to-orange-900",
    },
    tornado: {
      day: "from-gray-600 via-green-700 to-slate-500",
      night: "from-gray-950 via-green-950 to-slate-900",
    },
  };

  return isNight ? gradients[condition].night : gradients[condition].day;
}

export function isNightTime(): boolean {
  const hour = new Date().getHours();
  return hour < 6 || hour >= 19;
}

export function isNightByTime(ts: number): boolean {
  const d = new Date(ts * 1000);
  const h = d.getHours();
  return h < 6 || h >= 19;
}

export function getWindDirection(deg: number): string {
  const dirs = [
    "U", "U-TH", "TH", "T-TH", "T", "T-TG", "TG", "TG-SE",
    "SE", "SE-SE", "S", "S-BD", "BD", "BD-BL", "BL", "BL-U",
  ];
  // Also keep English fallback
  const dirsEn = [
    "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
  ];
  const index = Math.round(((deg % 360 + 360) % 360) / 22.5) % 16;
  return dirs[index] || dirsEn[index];
}

export function formatTemp(temp: number): string {
  return `${Math.round(temp)}\u00B0`;
}

export function getUVLevel(uv: number): { label: string; color: string } {
  if (uv <= 2) return { label: "Rendah", color: "text-green-400" };
  if (uv <= 5) return { label: "Sedang", color: "text-yellow-400" };
  if (uv <= 7) return { label: "Tinggi", color: "text-orange-400" };
  if (uv <= 10) return { label: "Sangat Tinggi", color: "text-red-400" };
  return { label: "Ekstrem", color: "text-purple-400" };
}

export function getVisibilityLabel(m: number): string {
  if (m >= 10000) return `${(m / 1000).toFixed(1)} km`;
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${m} m`;
}

export function getConditionLabel(condition: string): string {
  const labels: Record<string, string> = {
    clear: "Cerah",
    clouds: "Berawan",
    rain: "Hujan",
    drizzle: "Gerimis",
    thunderstorm: "Badai Petir",
    snow: "Salju",
    mist: "Berkabut",
    fog: "Berkabut Tebal",
    haze: "Kabut Asap",
    dust: "Debu",
    tornado: "Tornado",
  };
  return labels[condition] || condition;
}

export function getCloudCoverLabel(percent: number): string {
  if (percent <= 10) return "Cerah";
  if (percent <= 30) return "Sedikit Berawan";
  if (percent <= 60) return "Berawan Sebagian";
  if (percent <= 85) return "Mayoritas Berawan";
  return "Mendung";
}

export function getPrecipTypeLabel(ptype: number): string {
  const labels: Record<number, string> = {
    0: "Tidak Ada",
    1: "Hujan",
    3: "Hujan Beku",
    5: "Salju",
    7: "Campuran",
    8: "Es",
  };
  return labels[ptype] || "Tidak Diketahui";
}
