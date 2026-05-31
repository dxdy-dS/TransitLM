"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Camera,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  MapPin,
  Eye,
  Loader2,
} from "lucide-react";

interface WebcamData {
  id: string;
  status: string;
  title: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  imageIcon: string;
  imagePreview: string;
  imageDaylight: string;
  playerUrl: string;
  categories: number[];
}

interface LiveWebcamsProps {
  lat: number;
  lon: number;
}

export default function LiveWebcams({ lat, lon }: LiveWebcamsProps) {
  const [webcams, setWebcams] = useState<WebcamData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);

  const fetchWebcams = async () => {
    setLoading(true);
    setError(null);
    setImageLoaded(false);

    try {
      const res = await fetch(
        `/api/webcams?lat=${lat}&lon=${lon}&radius=50&limit=8`
      );
      if (!res.ok) throw new Error("Failed to fetch webcams");
      const data = await res.json();

      if (data.webcams && data.webcams.length > 0) {
        setWebcams(data.webcams);
        setCurrentIndex(0);
      } else {
        setError("No webcams found nearby");
      }
    } catch {
      setError("Unable to load webcams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebcams();
    // Refresh images every 3 minutes (they expire in 10 min)
    const interval = setInterval(() => {
      if (webcams.length > 0) {
        fetchWebcams();
      }
    }, 3 * 60 * 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lon]);

  const current = webcams[currentIndex];

  const goNext = () => {
    if (webcams.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % webcams.length);
      setImageLoaded(false);
    }
  };

  const goPrev = () => {
    if (webcams.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + webcams.length) % webcams.length);
      setImageLoaded(false);
    }
  };

  if (loading && webcams.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="w-full max-w-2xl mx-auto"
      >
        <h3 className="text-sm font-medium text-white/50 mb-3 px-1">
          LIVE WEBCAMS
        </h3>
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <CardContent className="p-8 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 text-white/30 animate-spin" />
            <p className="text-white/40 mt-3 text-sm">
              Searching for nearby webcams...
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (error && webcams.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="w-full max-w-2xl mx-auto"
      >
        <h3 className="text-sm font-medium text-white/50 mb-3 px-1">
          LIVE WEBCAMS
        </h3>
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <CardContent className="p-8 flex flex-col items-center justify-center">
            <Camera className="h-8 w-8 text-white/15" />
            <p className="text-white/40 mt-3 text-sm">{error}</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-medium text-white/50 flex items-center gap-2">
          <Camera className="h-3.5 w-3.5" />
          LIVE WEBCAMS
          <span className="text-white/25">
            ({currentIndex + 1}/{webcams.length})
          </span>
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchWebcams}
          className="text-white/30 hover:text-white/60 h-6 px-2"
          disabled={loading}
        >
          <RefreshCw
            className={`h-3 w-3 ${loading ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <AnimatePresence mode="wait">
            {current && (
              <motion.div
                key={current.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Webcam Image or Embed */}
                <div className="relative w-full aspect-video bg-black/30 overflow-hidden">
                  {showEmbed && current.playerUrl ? (
                    <iframe
                      src={current.playerUrl}
                      className="w-full h-full"
                      allowFullScreen
                      allow="autoplay; encrypted-media"
                      title={current.title}
                    />
                  ) : (
                    <>
                      <img
                        src={
                          current.imagePreview ||
                          current.imageDaylight ||
                          current.imageIcon
                        }
                        alt={current.title}
                        className={`w-full h-full object-cover transition-opacity duration-500 ${
                          imageLoaded
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                        onLoad={() => setImageLoaded(true)}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            current.imageIcon || "";
                          setImageLoaded(true);
                        }}
                      />
                      {!imageLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 text-white/20 animate-spin" />
                        </div>
                      )}
                    </>
                  )}

                  {/* Overlay controls */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    {current.status === "online" ? (
                      <span className="flex items-center gap-1 bg-green-500/20 backdrop-blur-sm text-green-300 text-[10px] px-2 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                        LIVE
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 bg-white/10 backdrop-blur-sm text-white/50 text-[10px] px-2 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 bg-white/30 rounded-full" />
                        OFFLINE
                      </span>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={goPrev}
                      className="h-8 w-8 bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 text-white/80"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2">
                      {current.playerUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowEmbed(!showEmbed)}
                          className="h-7 bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 text-white/80 text-xs gap-1 px-3"
                        >
                          {showEmbed ? (
                            <>
                              <Eye className="h-3 w-3" /> Preview
                            </>
                          ) : (
                            <>
                              <ExternalLink className="h-3 w-3" /> Live
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={goNext}
                      className="h-8 w-8 bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 text-white/80"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Webcam info */}
                <div className="px-4 py-3 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-white/80">
                        {current.title}
                      </h4>
                      <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {[current.city, current.country]
                          .filter(Boolean)
                          .join(", ") || "Unknown location"}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {current.imageDaylight && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setImageLoaded(false);
                            const wc = { ...current };
                            wc.imagePreview = wc.imageDaylight;
                            setWebcams((prev) => {
                              const next = [...prev];
                              next[currentIndex] = wc as WebcamData;
                              return next;
                            });
                          }}
                          className="h-7 text-[10px] text-white/30 hover:text-white/60 px-2"
                        >
                          Daylight
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dot indicators */}
                {webcams.length > 1 && (
                  <div className="flex justify-center pb-3 gap-1">
                    {webcams.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setCurrentIndex(i);
                          setImageLoaded(false);
                        }}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          i === currentIndex
                            ? "bg-white/60 w-4"
                            : "bg-white/15 hover:bg-white/30"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
