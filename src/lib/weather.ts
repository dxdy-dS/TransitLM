// Weather condition utilities
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

export function getWeatherCondition(id: number): WeatherCondition {
  if (id >= 200 && id < 300) return "thunderstorm";
  if (id >= 300 && id < 400) return "drizzle";
  if (id >= 500 && id < 600) return "rain";
  if (id >= 600 && id < 700) return "snow";
  if (id === 701 || id === 721) return "mist";
  if (id === 741) return "fog";
  if (id === 711 || id === 731 || id === 751 || id === 761) return "dust";
  if (id === 781) return "tornado";
  if (id === 800) return "clear";
  return "clouds";
}

export function getWeatherIcon(condition: WeatherCondition, isNight = false): string {
  const icons: Record<WeatherCondition, string> = {
    clear: isNight ? "🌙" : "☀️",
    clouds: isNight ? "☁️" : "⛅",
    rain: "🌧️",
    drizzle: "🌦️",
    thunderstorm: "⛈️",
    snow: "❄️",
    mist: "🌫️",
    fog: "🌫️",
    haze: "🌫️",
    dust: "💨",
    tornado: "🌪️",
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

  return isNight
    ? gradients[condition].night
    : gradients[condition].day;
}

export function isNightTime(): boolean {
  const hour = new Date().getHours();
  return hour < 6 || hour >= 19;
}

export function getWindDirection(deg: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(deg / 22.5) % 16;
  return dirs[index];
}

export function formatTemp(temp: number): string {
  return `${Math.round(temp)}°`;
}

export function getUVLevel(uv: number): { label: string; color: string } {
  if (uv <= 2) return { label: "Low", color: "text-green-400" };
  if (uv <= 5) return { label: "Moderate", color: "text-yellow-400" };
  if (uv <= 7) return { label: "High", color: "text-orange-400" };
  if (uv <= 10) return { label: "Very High", color: "text-red-400" };
  return { label: "Extreme", color: "text-purple-400" };
}

export function getVisibilityLabel(m: number): string {
  if (m >= 10000) return `${(m / 1000).toFixed(1)} km`;
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${m} m`;
}
