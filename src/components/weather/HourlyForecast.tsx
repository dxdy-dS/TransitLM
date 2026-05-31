"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  wmoToCondition,
  getWeatherIcon,
  formatTemp,
  getConditionLabel,
  isNightByTime,
  getWindDirection,
} from "@/lib/weather";

interface HourlyItem {
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

interface HourlyForecastProps {
  list: HourlyItem[];
}

export default function HourlyForecast({ list }: HourlyForecastProps) {
  const hourly = list.slice(0, 24).map((item) => {
    const condition = wmoToCondition(item.weatherCode);
    const isNight = isNightByTime(item.dt);
    const date = new Date(item.dt * 1000);
    return {
      time: date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      temp: Math.round(item.temp),
      icon: getWeatherIcon(condition, isNight),
      condition: getConditionLabel(condition),
      precipProb: item.precipProb,
      precip: item.precip,
      windSpeed: item.windSpeed,
      windDir: getWindDirection(item.windDeg),
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="w-full max-w-2xl mx-auto"
    >
      <h3 className="text-sm font-medium text-white/50 mb-3 px-1">
        PRAKIRAAN PER JAM
      </h3>
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <CardContent className="p-4">
          <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-thin">
            {hourly.map((h, i) => (
              <motion.div
                key={h.time}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.02 }}
                className="flex flex-col items-center min-w-[72px] p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors shrink-0"
              >
                <span className="text-xs text-white/40 mb-2">{h.time}</span>
                <span className="text-2xl mb-1">{h.icon}</span>
                <span className="text-sm font-semibold text-white/90">
                  {formatTemp(h.temp)}
                </span>
                {h.precipProb > 0 && (
                  <span className="text-[10px] text-blue-300 mt-1">
                    {h.precipProb}%
                  </span>
                )}
                <span className="text-[10px] text-white/25 mt-0.5">
                  {h.windSpeed.toFixed(0)} km/j
                </span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
