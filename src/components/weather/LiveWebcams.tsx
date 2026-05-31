"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Camera, ExternalLink, ChevronLeft, ChevronRight,
  RefreshCw, MapPin, Eye, Loader2, X,
} from "lucide-react";

interface WebcamData {
  id: string;
  status: string;
  title: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  viewCount: number;
  imageIcon: string;
  imageThumbnail: string;
  imagePreview: string;
  imageDaylightPreview: string;
  playerLive: string;
  playerDay: string;
  playerMonth: string;
  playerYear: string;
  playerLifetime: string;
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
  const [embedUrl, setEmbedUrl] = useState("");

  const fetchWebcams = async () => {
    setLoading(true);
    setError(null);
    setImageLoaded(false);

    try {
      const res = await fetch(
        `/api/webcams?lat=${lat}&lon=${lon}&radius=50&limit=8`
      );
      if (!res.ok) throw new Error("Gagal mengambil data webcam");
      const data = await res.json();

      if (data.webcams && data.webcams.length > 0) {
        setWebcams(data.webcams);
        setCurrentIndex(0);
        setShowEmbed(false);
      } else {
        setError("Tidak ada webcam di sekitar lokasi");
      }
    } catch {
      setError("Tidak dapat memuat webcam");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebcams();
    const interval = setInterval(() => {
      if (webcams.length > 0) fetchWebcams();
    }, 3 * 60 * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lon]);

  const current = webcams[currentIndex];

  const goNext = () => {
    if (webcams.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % webcams.length);
      setImageLoaded(false);
      setShowEmbed(false);
    }
  };

  const goPrev = () => {
    if (webcams.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + webcams.length) % webcams.length);
      setImageLoaded(false);
      setShowEmbed(false);
    }
  };

  const openEmbed = (url: string) => {
    setEmbedUrl(url);
    setShowEmbed(true);
  };

  if (loading && webcams.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }} className="w-full max-w-2xl mx-auto"
      >
        <h3 className="text-sm font-medium text-white/50 mb-3 px-1">
          WEBCAM LANGSUNG
        </h3>
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <CardContent className="p-8 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 text-white/30 animate-spin" />
            <p className="text-white/40 mt-3 text-sm">Mencari webcam terdekat...</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (error && webcams.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }} className="w-full max-w-2xl mx-auto"
      >
        <h3 className="text-sm font-medium text-white/50 mb-3 px-1">WEBCAM LANGSUNG</h3>
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }} className="w-full max-w-2xl mx-auto"
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-medium text-white/50 flex items-center gap-2">
          <Camera className="h-3.5 w-3.5" />
          WEBCAM LANGSUNG
          <span className="text-white/25">({currentIndex + 1}/{webcams.length})</span>
          <span className="text-white/15 text-[10px]">{webcams.reduce((a, b) => a + b.viewCount, 0).toLocaleString()} total views</span>
        </h3>
        <Button variant="ghost" size="sm" onClick={fetchWebcams}
          className="text-white/30 hover:text-white/60 h-6 px-2" disabled={loading}
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <AnimatePresence mode="wait">
            {current && (
              <motion.div key={current.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                {/* Embed Modal */}
                {showEmbed && embedUrl && (
                  <div className="relative w-full aspect-video bg-black">
                    <Button variant="ghost" size="icon" onClick={() => setShowEmbed(false)}
                      className="absolute top-2 right-2 z-10 h-8 w-8 bg-black/50 rounded-full hover:bg-black/70 text-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <iframe src={embedUrl} className="w-full h-full" allowFullScreen
                      allow="autoplay; encrypted-media" title={current.title}
                    />
                  </div>
                )}

                {!showEmbed && (
                  <div className="relative w-full aspect-video bg-black/30 overflow-hidden">
                    <img
                      src={current.imagePreview || current.imageDaylightPreview || current.imageIcon}
                      alt={current.title}
                      className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                      onLoad={() => setImageLoaded(true)}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = current.imageIcon || "";
                        setImageLoaded(true);
                      }}
                    />
                    {!imageLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 text-white/20 animate-spin" />
                      </div>
                    )}

                    {/* Status badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      {current.status === "active" ? (
                        <span className="flex items-center gap-1 bg-green-500/20 backdrop-blur-sm text-green-300 text-[10px] px-2 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> LANGSUNG
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 bg-white/10 backdrop-blur-sm text-white/50 text-[10px] px-2 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 bg-white/30 rounded-full" /> OFFLINE
                        </span>
                      )}
                    </div>

                    {/* Nav */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <Button variant="ghost" size="icon" onClick={goPrev}
                        className="h-8 w-8 bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 text-white/80"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-2">
                        {current.playerLive && (
                          <Button variant="ghost" size="sm" onClick={() => openEmbed(current.playerLive)}
                            className="h-7 bg-red-500/20 backdrop-blur-sm rounded-full hover:bg-red-500/30 text-red-300 text-xs gap-1 px-3"
                          >
                            <Eye className="h-3 w-3" /> Live
                          </Button>
                        )}
                        {current.playerDay && (
                          <Button variant="ghost" size="sm" onClick={() => openEmbed(current.playerDay)}
                            className="h-7 bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 text-white/80 text-xs gap-1 px-3"
                          >
                            <ExternalLink className="h-3 w-3" /> Hari Ini
                          </Button>
                        )}
                        {current.playerLifetime && (
                          <Button variant="ghost" size="sm" onClick={() => openEmbed(current.playerLifetime)}
                            className="h-7 bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 text-white/80 text-xs gap-1 px-3"
                          >
                            <ExternalLink className="h-3 w-3" /> Time-lapse
                          </Button>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" onClick={goNext}
                        className="h-8 w-8 bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 text-white/80"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Info bar */}
                <div className="px-4 py-3 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-medium text-white/80 truncate">{current.title}</h4>
                      <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {[current.city, current.region, current.country].filter(Boolean).join(", ") || "Lokasi tidak diketahui"}
                      </p>
                    </div>
                    <span className="text-[10px] text-white/20 shrink-0 ml-2">
                      {(current.viewCount || 0).toLocaleString()} views
                    </span>
                  </div>
                </div>

                {/* Dots */}
                {webcams.length > 1 && (
                  <div className="flex justify-center pb-3 gap-1">
                    {webcams.map((_, i) => (
                      <button key={i} onClick={() => { setCurrentIndex(i); setImageLoaded(false); setShowEmbed(false); }}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentIndex ? "bg-white/60 w-4" : "bg-white/15 hover:bg-white/30"}`}
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
