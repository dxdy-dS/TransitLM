"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  MapPin, Navigation, Clock, Banknote, TrainFront,
  ArrowRight, Footprints, ArrowLeftRight, Map,
} from "lucide-react";
import { sampleRoute, lineColors } from "@/lib/benchmark-data";

export default function RouteVisualization() {
  // Pre-compute line indices for each station
  const stationLineIndices = useMemo(() => {
    const indices: number[] = [];
    let currentLine = 0;
    for (const station of sampleRoute.stationSequence) {
      indices.push(currentLine);
      if (station === "【换乘】") {
        currentLine++;
      }
    }
    return indices;
  }, []);

  return (
    <div className="space-y-6">
      {/* Query Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5"
      >
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400 mt-0.5">
            <MapPin className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-emerald-500/70 font-mono">User Query</p>
            <p className="text-sm text-slate-200 mt-1 leading-relaxed">
              {sampleRoute.query}
            </p>
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                <Map className="h-3 w-3" />
                {sampleRoute.city}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                <Navigation className="h-3 w-3" />
                [{sampleRoute.start[0].toFixed(4)}, {sampleRoute.start[1].toFixed(4)}]
              </span>
              <ArrowRight className="h-3 w-3 text-slate-600" />
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                <Navigation className="h-3 w-3" />
                [{sampleRoute.end[0].toFixed(4)}, {sampleRoute.end[1].toFixed(4)}]
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Route Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: MapPin, label: "Distance", value: sampleRoute.totalDistance, iconClass: "text-emerald-400" },
          { icon: Clock, label: "Time", value: sampleRoute.totalTime, iconClass: "text-teal-400" },
          { icon: Banknote, label: "Fare", value: sampleRoute.totalFare, iconClass: "text-cyan-400" },
          { icon: TrainFront, label: "Lines", value: String(sampleRoute.lineSequence.length), iconClass: "text-emerald-400" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 text-center"
          >
            <stat.icon className={`h-4 w-4 mx-auto mb-2 ${stat.iconClass}`} />
            <p className="text-lg font-semibold text-white">{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Visual Route Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5"
      >
        <p className="text-xs text-emerald-500/70 font-mono mb-4">Route Visualization</p>

        {/* Line legends */}
        <div className="flex flex-wrap gap-3 mb-5">
          {sampleRoute.lineSequence.map((line, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: lineColors[i] || "#10b981" }}
              />
              <span className="text-xs text-slate-400">{line.replace(/\n/g, " ")}</span>
            </div>
          ))}
        </div>

        {/* Station timeline */}
        <div className="relative max-h-72 overflow-y-auto custom-scrollbar pr-2">
          <div className="space-y-0">
            {sampleRoute.stationSequence.map((station, i) => {
              const isTransfer = station === "【换乘】";
              const isFirst = i === 0;
              const isLast = i === sampleRoute.stationSequence.length - 1;
              const lineIdx = stationLineIndices[i];
              const color = lineColors[lineIdx] || "#10b981";

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3"
                >
                  {/* Timeline line */}
                  <div className="flex flex-col items-center w-6 shrink-0">
                    {isFirst ? null : (
                      <div
                        className="w-0.5 h-4"
                        style={{
                          backgroundColor: isTransfer
                            ? "#475569"
                            : lineColors[stationLineIndices[i - 1]] || "#10b981",
                        }}
                      />
                    )}
                    {isTransfer ? (
                      <ArrowLeftRight className="h-4 w-4 text-amber-400 shrink-0" />
                    ) : (
                      <div
                        className={`w-3 h-3 rounded-full shrink-0 border-2 ${
                          isFirst || isLast
                            ? "border-white bg-white"
                            : ""
                        }`}
                        style={{
                          backgroundColor:
                            isFirst || isLast ? "white" : color,
                          borderColor: color,
                        }}
                      />
                    )}
                    {isLast ? null : (
                      <div
                        className="w-0.5 h-4"
                        style={{
                          backgroundColor: color,
                        }}
                      />
                    )}
                  </div>

                  {/* Station name */}
                  <div className="flex-1 min-w-0 pb-1">
                    {isTransfer ? (
                      <span className="text-xs font-medium text-amber-400/80">
                        Transfer Point
                      </span>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm ${
                            isFirst || isLast
                              ? "text-white font-medium"
                              : "text-slate-400"
                          }`}
                        >
                          {station}
                        </span>
                        {(isFirst || isLast) && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Footprints className="h-3 w-3" />
                            {isFirst ? sampleRoute.startTransferMode : sampleRoute.endTransferMode}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
