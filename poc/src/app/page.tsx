"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrainFront,
  ExternalLink,
  FileText,
  Database,
  Scale,
  ChevronRight,
  Github,
  ArrowDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import BenchmarkCard from "@/components/transit/BenchmarkCard";
import FunnelVisualization from "@/components/transit/FunnelVisualization";
import MetricsPanel from "@/components/transit/MetricsPanel";
import RouteVisualization from "@/components/transit/RouteVisualization";
import { allBenchmarks, sampleRouteIndonesia, benchmark5Indonesia, benchmark6Indonesia, benchmark7Indonesia, benchmark8Indonesia } from "@/lib/benchmark-data";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const indonesiaBenchmarks = [benchmark5Indonesia, benchmark6Indonesia, benchmark7Indonesia, benchmark8Indonesia];

export default function Home() {
  const [funnelBenchmark, setFunnelBenchmark] = useState(1);
  const [indoFunnelBenchmark, setIndoFunnelBenchmark] = useState(5);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background ambient effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-48 -left-48 w-[500px] h-[500px] rounded-full bg-emerald-500/[0.04] blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -40, 20, 0], y: [0, 30, -30, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-48 -right-48 w-[500px] h-[500px] rounded-full bg-teal-500/[0.04] blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 20, -30, 0], y: [0, -20, 40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/[0.03] blur-3xl"
        />
      </div>

      <main className="relative z-10 flex flex-col">
        {/* ─── Hero Section ─── */}
        <section className="px-4 pt-16 sm:pt-24 pb-12 sm:pb-16">
          <motion.div
            {...fadeInUp}
            className="max-w-4xl mx-auto text-center"
          >
            {/* Logo / Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 mb-6"
            >
              <TrainFront className="h-8 w-8 text-emerald-400" />
            </motion.div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                TransitLM
              </span>
            </h1>

            <p className="mt-4 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              A Large-Scale Dataset and Benchmark for{" "}
              <span className="text-slate-300">Map-Free Transit Route Generation</span>
            </p>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              <a
                href="https://arxiv.org/abs/2605.22355"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:border-emerald-500/30 hover:bg-white/[0.08] transition-all duration-200"
              >
                <FileText className="h-4 w-4" />
                arXiv Paper
                <ExternalLink className="h-3 w-3 text-slate-500" />
              </a>
              <a
                href="https://huggingface.co/datasets/GD-ML/TransitLM"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:border-teal-500/30 hover:bg-white/[0.08] transition-all duration-200"
              >
                <Database className="h-4 w-4" />
                HuggingFace
                <ExternalLink className="h-3 w-3 text-slate-500" />
              </a>
              <a
                href="https://modelscope.cn/datasets/GD-ML/TransitLM"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:border-cyan-500/30 hover:bg-white/[0.08] transition-all duration-200"
              >
                <Database className="h-4 w-4" />
                ModelScope
                <ExternalLink className="h-3 w-3 text-slate-500" />
              </a>
            </div>

            {/* Indonesia badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-4 inline-flex items-center gap-2"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1 text-xs text-amber-400">
                <span>🇮🇩</span> Indonesia Transit
              </span>
            </motion.div>

            <div className="mt-2 flex items-center justify-center gap-2">
              <Scale className="h-3.5 w-3.5 text-slate-600" />
              <span className="text-xs text-slate-600">Apache 2.0 License</span>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex justify-center mt-10"
          >
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowDown className="h-5 w-5 text-slate-600" />
            </motion.div>
          </motion.div>
        </section>

        <Separator className="bg-white/5 max-w-5xl mx-auto" />

        {/* ─── Architecture Overview Section ─── */}
        <section className="px-4 py-12 sm:py-16" id="overview">
          <div className="max-w-5xl mx-auto">
            <motion.div {...fadeInUp} className="text-center mb-10">
              <Badge
                variant="outline"
                className="border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs mb-3"
              >
                Evaluation Scenarios
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Four Benchmark Scenarios
              </h2>
              <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">
                TransitLM provides a unified funnel-style pipeline for systematically
                evaluating route-planning model outputs across four representative settings.
              </p>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {allBenchmarks.map((b, i) => (
                <BenchmarkCard key={b.id} benchmark={b} index={i} />
              ))}
            </motion.div>
          </div>
        </section>

        <Separator className="bg-white/5 max-w-5xl mx-auto" />

        {/* ─── Evaluation Funnel Section ─── */}
        <section className="px-4 py-12 sm:py-16" id="funnel">
          <div className="max-w-5xl mx-auto">
            <motion.div {...fadeInUp} className="text-center mb-10">
              <Badge
                variant="outline"
                className="border-teal-500/20 bg-teal-500/5 text-teal-400 text-xs mb-3"
              >
                Evaluation Pipeline
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Funnel Visualization
              </h2>
              <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">
                Each benchmark applies a multi-round evaluation funnel. Hover over
                each level to see details. Switch between benchmarks to compare results.
              </p>
            </motion.div>

            {/* Benchmark switcher */}
            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3].map((id) => (
                <button
                  key={id}
                  onClick={() => setFunnelBenchmark(id)}
                  className={`rounded-lg px-4 py-2 text-sm transition-all duration-200 ${
                    funnelBenchmark === id
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/[0.08] hover:text-slate-300"
                  }`}
                >
                  Benchmark {id}
                </button>
              ))}
            </div>

            <motion.div
              key={funnelBenchmark}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-6">
                <FunnelVisualization benchmarkId={funnelBenchmark} />
              </div>
            </motion.div>

            {/* Funnel Legend */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
              {[
                { round: "Round 1", label: "Reachability", color: "bg-emerald-500" },
                { round: "Round 2", label: "Grounding", color: "bg-teal-500" },
                { round: "Round 3", label: "Structure", color: "bg-cyan-500" },
                { round: "Round 4", label: "Estimation", color: "bg-cyan-400" },
              ].map((item) => (
                <div
                  key={item.round}
                  className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2"
                >
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  <div>
                    <p className="text-xs text-slate-400">{item.round}</p>
                    <p className="text-[10px] text-slate-600">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Separator className="bg-white/5 max-w-5xl mx-auto" />

        {/* ─── Benchmark Results Dashboard ─── */}
        <section className="px-4 py-12 sm:py-16" id="results">
          <div className="max-w-5xl mx-auto">
            <motion.div {...fadeInUp} className="text-center mb-10">
              <Badge
                variant="outline"
                className="border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-xs mb-3"
              >
                Results
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Benchmark Dashboard
              </h2>
              <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">
                Comprehensive results across all four benchmarks with detailed metrics,
                charts, and breakdowns.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-4 sm:p-6"
            >
              <MetricsPanel />
            </motion.div>
          </div>
        </section>

        <Separator className="bg-white/5 max-w-5xl mx-auto" />

        {/* ─── Indonesia Transit Integration Section ─── */}
        <section className="px-4 py-12 sm:py-16" id="indonesia">
          <div className="max-w-5xl mx-auto">
            <motion.div {...fadeInUp} className="text-center mb-10">
              <Badge
                variant="outline"
                className="border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs mb-3"
              >
                <span className="mr-1">🇮🇩</span> Cross-Border
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Indonesia Transit Integration
              </h2>
              <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">
                TransitLM benchmark applied to Jakarta's multi-modal transit network
                (MRT, LRT, KRL, TransJakarta)
              </p>
            </motion.div>

            {/* Indonesian Benchmark Cards */}
            <motion.div
              variants={stagger}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10"
            >
              {indonesiaBenchmarks.map((b, i) => (
                <BenchmarkCard key={b.id} benchmark={b} index={i} />
              ))}
            </motion.div>

            {/* Indonesia Funnel Visualization */}
            <motion.div {...fadeInUp} className="mb-10">
              <h3 className="text-lg font-semibold text-white text-center mb-6">
                Jakarta Evaluation Funnel
              </h3>
              <div className="flex justify-center gap-2 mb-8">
                {[5, 6, 7].map((id) => (
                  <button
                    key={id}
                    onClick={() => setIndoFunnelBenchmark(id)}
                    className={`rounded-lg px-4 py-2 text-sm transition-all duration-200 ${
                      indoFunnelBenchmark === id
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/[0.08] hover:text-slate-300"
                    }`}
                  >
                    Benchmark {id}
                  </button>
                ))}
              </div>
              <motion.div
                key={indoFunnelBenchmark}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="max-w-2xl mx-auto"
              >
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-6">
                  <FunnelVisualization benchmarkId={indoFunnelBenchmark} />
                </div>
              </motion.div>
            </motion.div>

            {/* Indonesia Sample Route Visualization */}
            <motion.div {...fadeInUp}>
              <h3 className="text-lg font-semibold text-white text-center mb-6">
                Jakarta Sample Route
              </h3>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <RouteVisualization route={sampleRouteIndonesia} />
              </motion.div>
            </motion.div>
          </div>
        </section>

        <Separator className="bg-white/5 max-w-5xl mx-auto" />

        {/* ─── Sample Route Visualization ─── */}
        <section className="px-4 py-12 sm:py-16" id="route">
          <div className="max-w-5xl mx-auto">
            <motion.div {...fadeInUp} className="text-center mb-10">
              <Badge
                variant="outline"
                className="border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs mb-3"
              >
                Sample Output
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Route Visualization
              </h2>
              <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">
                An example of a generated transit route from the benchmark dataset,
                showing the complete station sequence and line transfers.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <RouteVisualization />
            </motion.div>
          </div>
        </section>

        <Separator className="bg-white/5 max-w-5xl mx-auto" />

        {/* ─── Technical Details Section ─── */}
        <section className="px-4 py-12 sm:py-16" id="technical">
          <div className="max-w-5xl mx-auto">
            <motion.div {...fadeInUp} className="text-center mb-10">
              <Badge
                variant="outline"
                className="border-teal-500/20 bg-teal-500/5 text-teal-400 text-xs mb-3"
              >
                Technical Reference
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Technical Details
              </h2>
              <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">
                Input contract, evaluation thresholds, and scoring formulas used in the
                TransitLM benchmark pipeline.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CSV Fields */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5"
              >
                <h3 className="text-sm font-semibold text-emerald-400 mb-4">
                  Input Contract (CSV Fields)
                </h3>
                <div className="space-y-2">
                  {[
                    { field: "index_id", desc: "Sample identifier" },
                    { field: "sft_prompt", desc: "Prompt JSON (query, start, end, city)" },
                    { field: "sft_label", desc: "Ground-truth route JSON" },
                    { field: "generate_results", desc: "Model output JSON" },
                    { field: "req_type", desc: "Preference type (BM2 only)" },
                  ].map((item) => (
                    <div
                      key={item.field}
                      className="flex items-start justify-between gap-2 rounded-lg bg-white/5 px-3 py-2"
                    >
                      <code className="text-xs font-mono text-cyan-400 shrink-0">
                        {item.field}
                      </code>
                      <span className="text-xs text-slate-500 text-right">
                        {item.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Evaluation Thresholds */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5"
              >
                <h3 className="text-sm font-semibold text-teal-400 mb-4">
                  Evaluation Thresholds
                </h3>

                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">
                    Round 2 — Transfer Distance Thresholds
                  </p>
                  <div className="space-y-1.5">
                    {[
                      { mode: "Walk", threshold: "3 km" },
                      { mode: "Bike", threshold: "5 km" },
                      { mode: "Taxi", threshold: "10 km" },
                    ].map((item) => (
                      <div
                        key={item.mode}
                        className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-1.5"
                      >
                        <span className="text-xs text-slate-400">{item.mode}</span>
                        <span className="text-xs font-mono text-emerald-400">
                          {item.threshold}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-2">
                    Round 4 — Estimation Tolerances
                  </p>
                  <div className="space-y-1.5">
                    {[
                      { metric: "Distance", tolerance: "±10% or 0.5 km" },
                      { metric: "Time", tolerance: "±10% or 5 min" },
                      { metric: "Fare", tolerance: "±10% or 1 CNY" },
                      { metric: "Transfer Dist.", tolerance: "±0.5 km" },
                    ].map((item) => (
                      <div
                        key={item.metric}
                        className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-1.5"
                      >
                        <span className="text-xs text-slate-400">{item.metric}</span>
                        <span className="text-xs font-mono text-cyan-400">
                          {item.tolerance}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Expert Score Formula */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 lg:col-span-2"
              >
                <h3 className="text-sm font-semibold text-cyan-400 mb-4">
                  Expert Score Formula (Round 3)
                </h3>
                <div className="rounded-xl bg-white/5 border border-white/5 px-5 py-4">
                  <code className="text-sm font-mono text-emerald-400">
                    S = T<sub className="text-slate-400 text-xs">sec</sub> / 300 + (N<sub className="text-slate-400 text-xs">lines</sub> + cycling_segments) + fare
                  </code>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {[
                      { var: "T_sec", desc: "Total travel time in seconds" },
                      { var: "N_lines", desc: "Number of transit lines used" },
                      { var: "fare", desc: "Total ticket fare in CNY" },
                    ].map((item) => (
                      <span key={item.var} className="text-xs text-slate-500">
                        <code className="text-cyan-400">{item.var}</code> — {item.desc}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Route JSON Schema */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 lg:col-span-2"
              >
                <h3 className="text-sm font-semibold text-emerald-400 mb-4">
                  Route JSON Schema (Single-Route)
                </h3>
                <div className="rounded-xl bg-white/5 border border-white/5 p-4 overflow-x-auto">
                  <pre className="text-xs font-mono text-slate-400 leading-relaxed">
{`{
  "station_sequence": ["stop_id_1", "stop_id_2", "stop_id_3"],
  "line_sequence": ["Line A", "Line B"],
  "total_distance": "12.5",
  "total_time": "35",
  "total_fare": "4",
  "start_transfer_mode": "步行",
  "start_transfer_distance": "0.8",
  "end_transfer_mode": "步行",
  "end_transfer_distance": "0.6"
}`}
                  </pre>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── Footer ─── */}
        <footer className="mt-auto px-4 py-8 border-t border-white/5">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <TrainFront className="h-3.5 w-3.5" />
              <span>TransitLM Benchmark Dashboard</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-600">
              <a
                href="https://arxiv.org/abs/2605.22355"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-400 transition-colors"
              >
                Paper
              </a>
              <a
                href="https://huggingface.co/datasets/GD-ML/TransitLM"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-400 transition-colors"
              >
                Dataset
              </a>
              <span>Apache 2.0</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
