"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  parseCondition,
  getWeatherIcon,
  formatTemp,
  getWindDirection,
  getConditionLabel,
} from "@/lib/weather";

interface DailyItem {
  dt: number;
  date: string;
  tempMin: number;
  tempMax: number;
  windSpeed: number;
  windDeg: number;
  gust: number;
  precip: number;
  snow: number;
  ptype: number;
  clouds: number;
  humidity: number;
  pressure: number;
  cape: number;
  condition: string;
  pop: number;
}

interface DailyForecastProps {
  list: DailyItem[];
}

export default function DailyForecast({ list }: DailyForecastProps) {
  const daily = list.slice(0, 7);
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
        PRAKIRAAN 7 HARI
      </h3>
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <CardContent className="p-2">
          {daily.map((day, i) => {
            const isToday = i === 0;
            const condition = parseCondition(day.condition);
            const dayName = isToday
              ? "Hari Ini"
              : new Date(day.dt * 1000).toLocaleDateString("id-ID", { weekday: "short" });
            const dateStr = new Date(day.dt * 1000).toLocaleDateString("id-ID", {
              month: "short", day: "numeric",
            });
            const barLeft = ((day.tempMin - globalMin) / range) * 100;
            const barWidth = ((day.tempMax - day.tempMin) / range) * 100;

            return (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="w-20 shrink-0">
                  <span className="text-sm font-medium text-white/80">{dayName}</span>
                  <br />
                  <span className="text-xs text-white/35">{dateStr}</span>
                </div>
                <div className="w-14 shrink-0 flex items-center gap-1">
                  <span className="text-xl">{getWeatherIcon(condition, false)}</span>
                  {day.pop > 0 && (
                    <span className="text-[10px] text-blue-300">{day.pop}%</span>
                  )}
                </div>
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <span className="text-sm text-white/50 w-8 text-right shrink-0">
                    {formatTemp(day.tempMin)}
                  </span>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full relative overflow-hidden">
                    <div
                      className="absolute h-full rounded-full bg-gradient-to-r from-blue-400 via-amber-400 to-orange-400"
                      style={{ left: `${Math.max(0, barLeft)}%`, width: `${Math.max(8, barWidth)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-white/80 w-8 shrink-0">
                    {formatTemp(day.tempMax)}
                  </span>
                </div>
                <div className="w-20 shrink-0 text-right hidden sm:block">
                  {day.precip > 0 && (
                    <span className="text-[10px] text-blue-300">{day.precip.toFixed(1)}mm</span>
                  )}
                  <span className="text-xs text-white/35 block">
                    Gust {day.gust.toFixed(0)} km/j
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
