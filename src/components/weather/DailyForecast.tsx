"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  getWeatherCondition,
  getWeatherIcon,
  formatTemp,
  getWindDirection,
} from "@/lib/weather";

interface DailyForecastProps {
  list: Array<{
    dt: number;
    main: { temp: number; temp_min: number; temp_max: number; humidity: number };
    weather: Array<{ id: number; description: string }>;
    wind: { speed: number; deg: number };
    pop: number;
  }>;
}

export default function DailyForecast({ list }: DailyForecastProps) {
  // Group forecast by day
  const dailyMap = new Map<string, {
    date: Date;
    temps: number[];
    tempMin: number;
    tempMax: number;
    weather: { id: number; description: string };
    wind: { speed: number; deg: number };
    pop: number;
    humidity: number;
  }>();

  list.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toDateString();

    if (!dailyMap.has(dayKey)) {
      dailyMap.set(dayKey, {
        date,
        temps: [item.main.temp],
        tempMin: item.main.temp_min,
        tempMax: item.main.temp_max,
        weather: item.weather[0],
        wind: item.wind,
        pop: item.pop,
        humidity: item.main.humidity,
      });
    } else {
      const day = dailyMap.get(dayKey)!;
      day.temps.push(item.main.temp);
      day.tempMin = Math.min(day.tempMin, item.main.temp_min);
      day.tempMax = Math.max(day.tempMax, item.main.temp_max);
      if (item.pop > day.pop) day.pop = item.pop;
    }
  });

  const daily = Array.from(dailyMap.values()).slice(0, 7);

  // Find global min/max for the bar
  const globalMin = Math.min(...daily.map((d) => d.tempMin));
  const globalMax = Math.max(...daily.map((d) => d.tempMax));
  const range = globalMax - globalMin || 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="w-full max-w-2xl mx-auto"
    >
      <h3 className="text-sm font-medium text-white/50 mb-3 px-1">
        7-DAY FORECAST
      </h3>
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <CardContent className="p-2">
          {daily.map((day, i) => {
            const isToday = i === 0;
            const condition = getWeatherCondition(day.weather.id);
            const isNight =
              new Date().getHours() < 6 || new Date().getHours() >= 19;
            const dayName = isToday
              ? "Today"
              : day.date.toLocaleDateString([], { weekday: "short" });
            const dateStr = day.date.toLocaleDateString([], {
              month: "short",
              day: "numeric",
            });

            const barLeft = ((day.tempMin - globalMin) / range) * 100;
            const barWidth = ((day.tempMax - day.tempMin) / range) * 100;

            return (
              <motion.div
                key={day.date.toISOString()}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors"
              >
                {/* Day name */}
                <div className="w-20 shrink-0">
                  <span className="text-sm font-medium text-white/80">
                    {dayName}
                  </span>
                  <br />
                  <span className="text-xs text-white/35">{dateStr}</span>
                </div>

                {/* Icon + Pop */}
                <div className="w-14 shrink-0 flex items-center gap-1">
                  <span className="text-xl">{getWeatherIcon(condition, isNight)}</span>
                  {day.pop > 0 && (
                    <span className="text-[10px] text-blue-300">
                      {Math.round(day.pop * 100)}%
                    </span>
                  )}
                </div>

                {/* Temp bar */}
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <span className="text-sm text-white/50 w-8 text-right shrink-0">
                    {formatTemp(day.tempMin)}
                  </span>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full relative overflow-hidden">
                    <div
                      className="absolute h-full rounded-full bg-gradient-to-r from-blue-400 via-amber-400 to-orange-400"
                      style={{
                        left: `${Math.max(0, barLeft)}%`,
                        width: `${Math.max(8, barWidth)}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-white/80 w-8 shrink-0">
                    {formatTemp(day.tempMax)}
                  </span>
                </div>

                {/* Wind */}
                <div className="w-16 shrink-0 text-right hidden sm:block">
                  <span className="text-xs text-white/35">
                    {day.wind.speed.toFixed(0)}m/s
                  </span>
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}
