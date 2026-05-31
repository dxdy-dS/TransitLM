"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { getWeatherCondition, getWeatherIcon, formatTemp } from "@/lib/weather";

interface HourlyForecastProps {
  list: Array<{
    dt: number;
    main: { temp: number; temp_min: number; temp_max: number };
    weather: Array<{ id: number; description: string }>;
    pop: number;
  }>;
  timezoneOffset?: number;
}

export default function HourlyForecast({ list }: HourlyForecastProps) {
  const hourly = list.slice(0, 12).map((item) => {
    const date = new Date((item.dt as number) * 1000);
    const condition = getWeatherCondition(item.weather[0].id);
    const isNight = date.getHours() < 6 || date.getHours() >= 19;
    return {
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      temp: Math.round(item.main.temp),
      icon: getWeatherIcon(condition, isNight),
      condition: item.weather[0].description,
      pop: Math.round((item.pop || 0) * 100),
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
        HOURLY FORECAST
      </h3>
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <CardContent className="p-4">
          <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-thin">
            {hourly.map((h, i) => (
              <motion.div
                key={h.time}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.03 }}
                className="flex flex-col items-center min-w-[70px] p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors shrink-0"
              >
                <span className="text-xs text-white/40 mb-2">{h.time}</span>
                <span className="text-2xl mb-1">{h.icon}</span>
                <span className="text-sm font-semibold text-white/90">
                  {formatTemp(h.temp)}
                </span>
                {h.pop > 0 && (
                  <span className="text-[10px] text-blue-300 mt-1">
                    {h.pop}%
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
