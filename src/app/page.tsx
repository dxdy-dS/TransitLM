"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  CloudOff,
  RefreshCw,
  CloudSunRain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/weather/SearchBar";
import CurrentWeather from "@/components/weather/CurrentWeather";
import HourlyForecast from "@/components/weather/HourlyForecast";
import DailyForecast from "@/components/weather/DailyForecast";
import WindyMap from "@/components/weather/WindyMap";
import WeatherParticles from "@/components/weather/WeatherParticles";
import {
  wmoToCondition,
  getWeatherIcon,
  getBackgroundGradient,
  isNightTime,
  type WeatherCondition,
} from "@/lib/weather";

interface CurrentWeatherData {
  dt: number;
  temp: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  windSpeed: number;
  windDeg: number;
  gust: number;
  precip: number;
  weatherCode: number;
  clouds: number;
  pressure: number;
  isDay: boolean;
  visibility: number;
}

interface HourlyData {
  dt: number;
  temp: number;
  feelsLike: number;
  precipProb: number;
  precip: number;
  weatherCode: number;
  windSpeed: number;
  windDeg: number;
  gust: number;
  clouds: number;
  humidity: number;
  uvIndex: number;
  visibility: number;
}

interface DailyData {
  dt: number;
  date: string;
  tempMax: number;
  tempMin: number;
  precipSum: number;
  precipProb: number;
  weatherCode: number;
  windMax: number;
  gustMax: number;
  sunrise: number;
  sunset: number;
  uvIndexMax: number;
}

export default function Home() {
  const [weather, setWeather] = useState<CurrentWeatherData | null>(null);
  const [hourly, setHourly] = useState<HourlyData[] | null>(null);
  const [daily, setDaily] = useState<DailyData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCity, setLastCity] = useState<string>("");
  const [locationName, setLocationName] = useState<string>("");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [bgCondition, setBgCondition] = useState<WeatherCondition>("clear");

  const fetchWeather = useCallback(
    async (cityOrCoords: string | { lat: number; lon: number }) => {
      setLoading(true);
      setError(null);

      try {
        let lat: number, lon: number, cityName: string;

        if (typeof cityOrCoords === "string") {
          const geoRes = await fetch(
            `/api/geocode?q=${encodeURIComponent(cityOrCoords)}&limit=1`
          );
          if (!geoRes.ok) throw new Error("Kota tidak ditemukan");
          const geoData = await geoRes.json();

          if (!geoData.results || geoData.results.length === 0) {
            throw new Error("Kota tidak ditemukan");
          }

          const result = geoData.results[0];
          lat = result.latitude;
          lon = result.longitude;
          cityName = `${result.name}, ${result.country || ""}`.trim();
          setLastCity(cityOrCoords);
        } else {
          lat = cityOrCoords.lat;
          lon = cityOrCoords.lon;

          try {
            const geoRes = await fetch(
              `/api/geocode?lat=${lat}&lon=${lon}`
            );
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              cityName = `${geoData.name}, ${geoData.country || ""}`.trim();
            } else {
              cityName = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
            }
          } catch {
            cityName = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
          }
          setLastCity(`${lat},${lon}`);
        }

        setLocationName(cityName);
        setCoords({ lat, lon });

        // Single API call — Open-Meteo returns current + hourly + daily
        const weatherRes = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);

        if (!weatherRes.ok) {
          const errData = await weatherRes.json();
          throw new Error(errData.error || "Data cuaca tidak tersedia");
        }

        const data = await weatherRes.json();
        const current = data.current;
        setWeather(current);
        setHourly(data.hourly || []);
        setDaily(data.daily || []);

        const condition = wmoToCondition(current.weatherCode);
        setBgCondition(condition);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Terjadi kesalahan"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleSearch = useCallback(
    (city: string) => fetchWeather(city),
    [fetchWeather]
  );

  const handleGeolocate = useCallback(
    (lat: number, lon: number) => fetchWeather({ lat, lon }),
    [fetchWeather]
  );

  const night = isNightTime();
  const bgGradient = getBackgroundGradient(bgCondition, night);

  return (
    <div
      className={`min-h-screen relative overflow-hidden bg-gradient-to-br ${bgGradient} transition-all duration-1000`}
    >
      {/* Animated weather particles */}
      <WeatherParticles condition={bgCondition} intensity="medium" />

      {/* Floating ambient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -40, 20, 0], y: [0, 30, -30, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/5 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 20, -30, 0], y: [0, -20, 40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/3 blur-3xl"
        />
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center min-h-screen px-4 py-8 sm:py-12">
        {/* Logo & Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight flex items-center gap-2 justify-center">
            <CloudSunRain className="h-8 w-8 text-white/70" />
            <span className="bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
              Cuaca
            </span>
          </h1>
          <p className="text-sm text-white/40 mt-1">
            Prakiraan cuaca real-time &amp; webcam langsung
          </p>
        </motion.div>

        {/* Search */}
        <SearchBar
          onSearch={handleSearch}
          onGeolocate={handleGeolocate}
          isLoading={loading}
        />

        {/* Content Area */}
        <div className="w-full mt-8 space-y-6">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <Loader2 className="h-10 w-10 text-white/40 animate-spin" />
                <p className="text-white/40 mt-4 text-sm">
                  Mengambil data cuaca...
                </p>
              </motion.div>
            )}

            {error && !loading && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <CloudOff className="h-12 w-12 text-white/20" />
                <p className="text-white/50 mt-4 text-sm">{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => lastCity && fetchWeather(lastCity)}
                  className="mt-4 text-white/40 hover:text-white/70"
                >
                  <RefreshCw className="h-3 w-3 mr-1" /> Coba Lagi
                </Button>
              </motion.div>
            )}

            {weather && !loading && !error && (
              <motion.div
                key="weather"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <CurrentWeather
                  city={locationName || "Tidak Diketahui"}
                  temp={weather.temp}
                  feelsLike={weather.feelsLike}
                  tempMin={weather.tempMin}
                  tempMax={weather.tempMax}
                  humidity={weather.humidity}
                  pressure={weather.pressure}
                  windSpeed={weather.windSpeed}
                  windDeg={weather.windDeg}
                  gust={weather.gust}
                  precip={weather.precip}
                  clouds={weather.clouds}
                  condition={wmoToCondition(weather.weatherCode)}
                  visibility={weather.visibility}
                  weatherIcon={getWeatherIcon(
                    wmoToCondition(weather.weatherCode),
                    !weather.isDay
                  )}
                  sunrise={daily?.[0]?.sunrise}
                  sunset={daily?.[0]?.sunset}
                  uvIndexMax={daily?.[0]?.uvIndexMax}
                />

                {hourly && hourly.length > 0 && (
                  <HourlyForecast list={hourly} />
                )}

                {daily && daily.length > 0 && (
                  <DailyForecast list={daily} />
                )}

                {/* Windy Map & Webcam Embed */}
                {coords && (
                  <WindyMap
                    lat={coords.lat}
                    lon={coords.lon}
                    cityName={locationName}
                  />
                )}
              </motion.div>
            )}

            {!weather && !loading && !error && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="text-6xl mb-4"
                >
                  {getWeatherIcon(bgCondition, night)}
                </motion.div>
                <p className="text-white/40 text-sm max-w-xs">
                  Cari nama kota atau gunakan lokasi Anda untuk melihat
                  prakiraan cuaca, peta, dan webcam langsung
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-auto pt-12 text-center"
        >
          <p className="text-xs text-white/20">
            Data dari Open-Meteo &bull; Peta dari Windy.com &bull;
            <span className="text-white/30"> Cuaca</span> &bull;
            Dibuat dengan Next.js 16
          </p>
        </motion.footer>
      </main>
    </div>
  );
}
