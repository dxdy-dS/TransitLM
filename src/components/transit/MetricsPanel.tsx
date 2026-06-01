"use client";

import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  CheckCircle2, Target, BarChart3, TrendingUp,
  Shield, BrainCircuit, AlertCircle,
} from "lucide-react";
import {
  benchmark1, benchmark2, benchmark3, benchmark4,
} from "@/lib/benchmark-data";

const benchmarks = [benchmark1, benchmark2, benchmark3, benchmark4];

const COLORS = ["#10b981", "#14b8a6", "#06b6d4", "#0891b2", "#0d9488", "#f59e0b"];

function MetricCard({
  label,
  value,
  icon: Icon,
  variant = "default",
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  variant?: "default" | "success" | "warning" | "error";
}) {
  const colorMap = {
    default: "text-slate-300",
    success: "text-emerald-400",
    warning: "text-amber-400",
    error: "text-rose-400",
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${colorMap[variant]}`} />
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <p className={`text-xl font-bold ${colorMap[variant]}`}>{value}</p>
    </div>
  );
}

function Benchmark1Panel() {
  const pieData = [
    { name: "Passed", value: 9, fill: "#10b981" },
    { name: "Station IoU<1", value: 1, fill: "#334155" },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Reachability"
          value="100%"
          icon={CheckCircle2}
          variant="success"
        />
        <MetricCard
          label="SG Pass"
          value="10/10"
          icon={Shield}
          variant="success"
        />
        <MetricCard
          label="DP Pass"
          value="9/10"
          icon={Target}
          variant="warning"
        />
        <MetricCard
          label="Station IoU=1"
          value="9/10"
          icon={TrendingUp}
          variant="success"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar chart - MAPE */}
        <Card className="border-white/10 bg-white/5 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300">
              Estimation MAPE (%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={[
                  { name: "Distance", mape: 0.70 },
                  { name: "Time", mape: 1.38 },
                  { name: "Fare", mape: 0.00 },
                ]}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15,23,42,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="mape" radius={[6, 6, 0, 0]}>
                  <Cell fill="#10b981" />
                  <Cell fill="#14b8a6" />
                  <Cell fill="#06b6d4" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie chart */}
        <Card className="border-white/10 bg-white/5 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300">
              Station IoU Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15,23,42,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#e2e8f0",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card className="border-white/10 bg-white/5 backdrop-blur-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-300">
            Detailed Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Line IoU Avg", value: "0.8500" },
              { label: "Station IoU Avg", value: "0.9783" },
              { label: "Distance Accurate", value: "9/9" },
              { label: "Time Accurate", value: "9/9" },
              { label: "Fare Accurate", value: "9/9" },
              { label: "Transfer Accurate", value: "9/9" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
              >
                <span className="text-xs text-slate-400">{item.label}</span>
                <span className="text-sm font-mono text-emerald-400">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Benchmark2Panel() {
  const preferenceData = [
    { name: "Fewer Transfers", pass: 0, total: 3, fill: "#f43f5e" },
    { name: "No Subway", pass: 3, total: 3, fill: "#10b981" },
    { name: "Subway First", pass: 3, total: 3, fill: "#14b8a6" },
    { name: "Shorter Time", pass: 1, total: 1, fill: "#06b6d4" },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Preference Compliance"
          value="7/10"
          icon={Target}
          variant="warning"
        />
        <MetricCard
          label="Label Compliance"
          value="10/10"
          icon={CheckCircle2}
          variant="success"
        />
        <MetricCard
          label="Reachability"
          value="10/10"
          icon={Shield}
          variant="success"
        />
        <MetricCard
          label="Station IoU=1"
          value="3/10"
          icon={AlertCircle}
          variant="warning"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Grouped Bar Chart */}
        <Card className="border-white/10 bg-white/5 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300">
              Preference Compliance by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={preferenceData}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  angle={-20}
                  textAnchor="end"
                  height={50}
                />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15,23,42,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#e2e8f0",
                    fontSize: 12,
                  }}
                  formatter={(value: number, name: string) => [
                    value,
                    name === "pass" ? "Passed" : "Total",
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: "#94a3b8" }}
                />
                <Bar
                  dataKey="total"
                  name="Total"
                  fill="#334155"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="pass"
                  name="Passed"
                  radius={[4, 4, 0, 0]}
                >
                  {preferenceData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Compliance Pie */}
        <Card className="border-white/10 bg-white/5 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300">
              Overall Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Compliant", value: 7, fill: "#10b981" },
                    { name: "Non-compliant", value: 3, fill: "#f43f5e" },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15,23,42,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#e2e8f0",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Details */}
      <Card className="border-white/10 bg-white/5 backdrop-blur-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-300">
            Preference Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {preferenceData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-xs text-slate-400">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={item.pass === item.total ? "default" : "destructive"}
                    className={
                      item.pass === item.total
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs"
                        : "bg-rose-500/20 text-rose-400 border-rose-500/30 text-xs"
                    }
                  >
                    {item.pass}/{item.total}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {((item.pass / item.total) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Benchmark3Panel() {
  const reachabilityData = [
    { name: "1st Route", value: 8, total: 10, fill: "#10b981" },
    { name: "2nd Route", value: 8, total: 10, fill: "#14b8a6" },
    { name: "3rd Route", value: 7, total: 10, fill: "#06b6d4" },
    { name: "All Routes", value: 6, total: 10, fill: "#0891b2" },
  ];

  const diversityData = [
    { name: "RD (eval)", value: 47.1, fill: "#14b8a6" },
    { name: "RD (label)", value: 61.5, fill: "#10b981" },
  ];

  const bestMatchData = [
    { name: "1st Route", value: 3 },
    { name: "2nd Route", value: 2 },
    { name: "3rd Route", value: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="All Routes Reachable"
          value="6/10"
          icon={Shield}
          variant="warning"
        />
        <MetricCard
          label="Best-Match IoU=1"
          value="5/8"
          icon={Target}
          variant="warning"
        />
        <MetricCard
          label="RD (eval)"
          value="0.4706"
          icon={TrendingUp}
          variant="default"
        />
        <MetricCard
          label="RD (label)"
          value="0.6146"
          icon={BarChart3}
          variant="success"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Per-Route Reachability */}
        <Card className="border-white/10 bg-white/5 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300">
              Per-Route Reachability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={reachabilityData}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15,23,42,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" name="Reachable" radius={[6, 6, 0, 0]}>
                  {reachabilityData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Route Diversity */}
        <Card className="border-white/10 bg-white/5 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300">
              Route Diversity Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={diversityData}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15,23,42,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#e2e8f0",
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [`${value}%`, "Score"]}
                />
                <Bar dataKey="value" name="Diversity" radius={[6, 6, 0, 0]}>
                  {diversityData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Best Match Distribution */}
      <Card className="border-white/10 bg-white/5 backdrop-blur-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-300">
            Best-Match Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {bestMatchData.map((item, i) => (
              <div
                key={item.name}
                className="text-center rounded-xl bg-white/5 p-4 border border-white/5"
              >
                <p className="text-2xl font-bold" style={{ color: COLORS[i] }}>
                  {item.value}
                </p>
                <p className="text-xs text-slate-500 mt-1">{item.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card className="border-white/10 bg-white/5 backdrop-blur-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-300">Detailed Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Line IoU (best match)", value: "0.6458" },
              { label: "Station IoU (best match)", value: "0.8295" },
              { label: "Distance MAPE", value: "0.49%" },
              { label: "Time MAPE", value: "3.74%" },
              { label: "Fare MAPE", value: "0.00%" },
              { label: "1st Reachability", value: "8/10" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
              >
                <span className="text-xs text-slate-400">{item.label}</span>
                <span className="text-sm font-mono text-emerald-400">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Benchmark4Panel() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
      <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-8 max-w-md">
        <BrainCircuit className="h-10 w-10 text-cyan-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          Remote API Evaluation
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          Benchmark 4 evaluates general-purpose LLM route generation through a
          remote route-eval API. It requires an active network connection to the
          evaluation endpoint.
        </p>
        <div className="mt-6 space-y-3 text-left">
          <div className="rounded-lg bg-white/5 px-4 py-2.5">
            <p className="text-xs text-slate-500">API Endpoint</p>
            <p className="text-sm font-mono text-cyan-400 mt-0.5">
              http://transit-lm.amap.com
            </p>
          </div>
          <div className="rounded-lg bg-white/5 px-4 py-2.5">
            <p className="text-xs text-slate-500">Default Batch Size</p>
            <p className="text-sm font-mono text-emerald-400 mt-0.5">50</p>
          </div>
          <div className="rounded-lg bg-white/5 px-4 py-2.5">
            <p className="text-xs text-slate-500">Input Field</p>
            <p className="text-sm font-mono text-teal-400 mt-0.5">
              generate_results
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MetricsPanel() {
  return (
    <Tabs defaultValue="1" className="w-full">
      <TabsList className="bg-white/5 border border-white/10 w-full sm:w-auto flex-wrap h-auto gap-1 p-1">
        {benchmarks.map((b) => (
          <TabsTrigger
            key={b.id}
            value={String(b.id)}
            className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 text-slate-400 text-xs px-3 py-1.5"
          >
            BM {b.id}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="1" className="mt-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Benchmark1Panel />
        </motion.div>
      </TabsContent>

      <TabsContent value="2" className="mt-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Benchmark2Panel />
        </motion.div>
      </TabsContent>

      <TabsContent value="3" className="mt-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Benchmark3Panel />
        </motion.div>
      </TabsContent>

      <TabsContent value="4" className="mt-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Benchmark4Panel />
        </motion.div>
      </TabsContent>
    </Tabs>
  );
}
