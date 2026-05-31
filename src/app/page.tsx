"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CloudOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/weather/SearchBar";
import CurrentWeather from "@/components/weather/CurrentWeather";
import HourlyForecast from "@/components/weather/HourlyForecast";
import DailyForecast from "@/components/weather/DailyForecast";
import WeatherParticles from "@/components/weather/WeatherParticles";
import {
  getWeatherCondition,
  getWeatherIcon,
  getBackgroundGradient,
  isNightTime,
  type WeatherCondition,
} from "@/lib/weather";

interface WeatherData {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{ id: number; main: string; description: string; icon: string }>;
  wind: { speed: number; deg: number };
  visibility: number;
  sys: { sunrise: number; sunset: number; country: string };
  coord: { lat: number; lon: number };
  dt: number;
}

interface ForecastData {
  list: Array<{
    dt: number;
    main: { temp: number; temp_min: number; temp_max: number; humidity: number };
    weather: Array<{ id: number; description: string; icon: string }>;
    wind: { speed: number; deg: number };
    pop: number;
    dt_txt: string;
  }>;
}

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCity, setLastCity] = useState<string>("");
  const [bgCondition, setBgCondition] = useState<WeatherCondition>("clear");

  const fetchWeather = useCallback(async (cityOrCoords: string | { lat: number; lon: number }) => {
    setLoading(true);
    setError(null);

    try {
      const weatherParams =
        typeof cityOrCoords === "string"
          ? `?q=${encodeURIComponent(cityOrCoords)}`
          : `?lat=${cityOrCoords.lat}&lon=${cityOrCoords.lon}`;

      const [weatherRes, forecastRes] = await Promise.all([
        fetch(`/api/weather${weatherParams}`),
        fetch(`/api/forecast/daily${weatherParams}`),
      ]);

      if (!weatherRes.ok) {
        const errData = await weatherRes.json();
        throw new Error(errData.error || "City not found");
      }

      const weatherData: WeatherData = await weatherRes.json();
      setWeather(weatherData);
      setLastCity(weatherData.name);

      const condition = getWeatherCondition(weatherData.weather[0].id);
      setBgCondition(condition);

      if (forecastRes.ok) {
        const forecastData: ForecastData = await forecastRes.json();
        setForecast(forecastData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

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
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -40, 20, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -40, 20, 0],
            y: [0, 30, -30, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/5 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 20, -30, 0],
            y: [0, -20, 40, 0],
          }}
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
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            <span className="bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
              Aura
            </span>
          </h1>
          <p className="text-sm text-white/40 mt-1">
            Real-time weather, beautifully presented
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
                <p className="text-white/40 mt-4 text-sm">Fetching weather...</p>
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
                  <RefreshCw className="h-3 w-3 mr-1" /> Retry
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
                  city={`${weather.name}, ${weather.sys.country}`}
                  temp={weather.main.temp}
                  feelsLike={weather.main.feels_like}
                  tempMin={weather.main.temp_min}
                  tempMax={weather.main.temp_max}
                  humidity={weather.main.humidity}
                  pressure={weather.main.pressure}
                  windSpeed={weather.wind.speed}
                  windDeg={weather.wind.deg}
                  visibility={weather.visibility}
                  weatherMain={weather.weather[0].main}
                  weatherDesc={weather.weather[0].description}
                  weatherIcon={getWeatherIcon(
                    getWeatherCondition(weather.weather[0].id),
                    night
                  )}
                  sunrise={weather.sys.sunrise}
                  sunset={weather.sys.sunset}
                />

                {forecast && (
                  <>
                    <HourlyForecast list={forecast.list} />
                    <DailyForecast list={forecast.list} />
                  </>
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
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="text-6xl mb-4"
                >
                  {getWeatherIcon(bgCondition, night)}
                </motion.div>
                <p className="text-white/40 text-sm max-w-xs">
                  Search for a city or use your location to get started with
                  real-time weather information
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
            Powered by OpenWeather API &bull; Enhanced by{" "}
            <span className="text-white/30">Aura</span>
            &bull; Built with Next.js 16
          </p>
        </motion.footer>
      </main>
    </div>
  );
}
