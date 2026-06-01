"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getFunnelData, type FunnelStep } from "@/lib/benchmark-data";

interface FunnelVisualizationProps {
  benchmarkId: number;
}

export default function FunnelVisualization({ benchmarkId }: FunnelVisualizationProps) {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const data = useMemo(() => getFunnelData(benchmarkId), [benchmarkId]);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-slate-500 text-sm">
          Funnel visualization is not available for Benchmark 4.
          <br />
          It requires the remote route-eval API.
        </p>
      </div>
    );
  }

  const maxVal = data[0].maxValue;

  return (
    <div className="w-full">
      {/* SVG Funnel */}
      <div className="relative w-full max-w-lg mx-auto">
        <svg viewBox="0 0 400 400" className="w-full h-auto">
          {data.map((step, i) => {
            const widthPercent = (step.value / maxVal) * 80 + 20;
            const nextWidthPercent = i < data.length - 1
              ? (data[i + 1].value / data[i + 1].maxValue) * 80 + 20
              : widthPercent - 10;
            const height = 60;
            const gap = 8;
            const y = i * (height + gap) + 10;
            const leftX = (100 - widthPercent) / 2;
            const rightX = 100 - leftX;
            const nextLeftX = (100 - nextWidthPercent) / 2;
            const nextRightX = 100 - nextLeftX;
            const isActive = activeStep === i;

            return (
              <g key={step.label}>
                {/* Trapezoid shape */}
                <motion.path
                  d={`
                    M ${leftX} ${y}
                    L ${rightX} ${y}
                    L ${nextRightX} ${y + height}
                    L ${nextLeftX} ${y + height}
                    Z
                  `}
                  fill={step.color}
                  initial={{ opacity: 0.4, y: 10 }}
                  animate={{
                    opacity: isActive ? 1 : 0.6,
                    y: 0,
                    filter: isActive ? "brightness(1.3)" : "brightness(1)",
                  }}
                  transition={{ duration: 0.3 }}
                  className="cursor-pointer"
                  onMouseEnter={() => setActiveStep(i)}
                  onMouseLeave={() => setActiveStep(null)}
                  style={{ transition: "opacity 0.2s" }}
                />
                {/* Label */}
                <text
                  x="200"
                  y={y + height / 2 + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="600"
                  className="pointer-events-none select-none"
                >
                  {step.label}: {step.value}/{step.maxValue}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Step Details */}
      <AnimatePresence mode="wait">
        {activeStep !== null && (
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mt-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm px-5 py-3 text-center"
          >
            <p className="text-sm text-slate-300">{data[activeStep].description}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flow indicators */}
      <div className="flex justify-center gap-1 mt-4">
        {data.map((step, i) => (
          <motion.div
            key={i}
            className="w-8 h-1 rounded-full"
            style={{ backgroundColor: step.color }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: i * 0.15, duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}
