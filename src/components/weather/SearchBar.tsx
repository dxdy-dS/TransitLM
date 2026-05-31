"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchBarProps {
  onSearch: (city: string) => void;
  onGeolocate: (lat: number, lon: number) => void;
  isLoading?: boolean;
}

const POPULAR_CITIES = [
  "Jakarta", "Tokyo", "New York", "London", "Paris",
  "Sydney", "Dubai", "Singapore", "Seoul", "Bangkok",
  "Berlin", "Mumbai", "Shanghai", "Los Angeles", "Istanbul",
];

export default function SearchBar({
  onSearch,
  onGeolocate,
  isLoading = false,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filtered = query.length > 0
    ? POPULAR_CITIES.filter((c) =>
        c.toLowerCase().startsWith(query.toLowerCase())
      )
    : POPULAR_CITIES.slice(0, 5);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        onSearch(query.trim());
        setShowSuggestions(false);
      }
    },
    [query, onSearch]
  );

  const handleGeolocate = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          onGeolocate(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          console.error("Geolocation failed");
        }
      );
    }
  }, [onGeolocate]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== document.querySelector("input")) {
        e.preventDefault();
        document.querySelector<HTMLInputElement>("input[type='text']")?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto relative">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input
              type="text"
              placeholder="Search city... (press /)"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="pl-10 pr-4 h-12 bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-white/40 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
            />
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={handleGeolocate}
            className="h-12 w-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl hover:bg-white/20 transition-all text-white/70 hover:text-white"
          >
            <MapPin className="h-4 w-4" />
          </Button>
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !query.trim()}
            className="h-12 w-12 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/30 transition-all text-white disabled:opacity-40"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>

      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden z-50"
          >
            {filtered.map((city) => (
              <button
                key={city}
                type="button"
                onMouseDown={() => {
                  setQuery(city);
                  onSearch(city);
                  setShowSuggestions(false);
                }}
                className="w-full px-4 py-3 text-left text-white/80 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
              >
                <MapPin className="h-3 w-3 text-white/40" />
                {city}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
