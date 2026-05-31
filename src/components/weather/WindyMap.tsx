"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, MapPin, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WindyMapProps {
  lat: number;
  lon: number;
  cityName?: string;
}

export default function WindyMap({ lat, lon, cityName }: WindyMapProps) {
  const [expanded, setExpanded] = useState(false);

  // Windy embed URL — no API key required
  const embedUrl = `https://embed.windy.com/embed.html?type=map&gradient=temperature&radar=1&satellite=1&pressure=1&wind=1&temp=1&rh=1&clouds=1&zoom=11&lat=${lat}&lon=${lon}&level=surface&metric=ca&calendar=gregorian&location=coordinates&lang=id`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className={`w-full mx-auto ${expanded ? "max-w-4xl" : "max-w-2xl"}`}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-medium text-white/50 flex items-center gap-2">
          <Camera className="h-3.5 w-3.5" />
          PETA CUACA &amp; WEBCAM LANGSUNG
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="text-white/30 hover:text-white/60 h-6 px-2"
        >
          {expanded ? (
            <Minimize2 className="h-3 w-3" />
          ) : (
            <Maximize2 className="h-3 w-3" />
          )}
        </Button>
      </div>

      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div
            className={`relative w-full bg-black/30 overflow-hidden transition-all duration-300 ${
              expanded ? "aspect-video" : "aspect-[16/10]"
            }`}
          >
            <iframe
              src={embedUrl}
              className="w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              title={`Peta cuaca ${cityName || "Windy"}`}
            />
          </div>

          <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between">
            <p className="text-xs text-white/30 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {cityName || `${lat.toFixed(2)}, ${lon.toFixed(2)}`}
            </p>
            <p className="text-[10px] text-white/20">
              Data dari Windy.com &bull; Gunakan ikon webcam di peta untuk live view
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
