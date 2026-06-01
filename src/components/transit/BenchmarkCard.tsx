"use client";

import { motion } from "framer-motion";
import { Route, Settings, GitBranch, BrainCircuit, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { BenchmarkResult } from "@/lib/benchmark-data";

const iconMap: Record<string, React.ElementType> = {
  Route,
  Settings,
  GitBranch,
  BrainCircuit,
};

interface BenchmarkCardProps {
  benchmark: BenchmarkResult;
  index: number;
}

export default function BenchmarkCard({ benchmark, index }: BenchmarkCardProps) {
  const [expanded, setExpanded] = useState(false);
  const IconComponent = iconMap[benchmark.icon] || Route;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="group"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6
                   hover:border-emerald-500/30 hover:bg-white/[0.07] transition-all duration-300"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400 mt-0.5">
              <IconComponent className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-emerald-500/70">
                  Benchmark {benchmark.id}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mt-1">
                {benchmark.name}
              </h3>
              <p className="text-sm text-slate-400 mt-1 max-w-sm">
                {benchmark.description}
              </p>
              {benchmark.totalSamples > 0 && (
                <p className="text-xs text-slate-500 mt-2">
                  {benchmark.totalSamples} samples &middot;{" "}
                  {benchmark.rounds.length} evaluation rounds
                </p>
              )}
            </div>
          </div>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-5 w-5 text-slate-500" />
          </motion.div>
        </div>

        {/* Expanded content */}
        <motion.div
          initial={false}
          animate={{
            height: expanded ? "auto" : 0,
            opacity: expanded ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="mt-4 pt-4 border-t border-white/10">
            {benchmark.rounds.length > 0 ? (
              <div className="space-y-2">
                {benchmark.rounds.map((round) => (
                  <div
                    key={round.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-slate-400">{round.name}</span>
                    <span className="font-mono text-emerald-400">
                      {round.passRate.toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-500 italic">
                Remote API evaluation — no local results available
              </div>
            )}
          </div>
        </motion.div>
      </button>
    </motion.div>
  );
}
