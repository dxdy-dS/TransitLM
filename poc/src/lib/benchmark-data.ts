// Hardcoded benchmark results from running TransitLM evaluation examples

export interface RoundResult {
  name: string;
  description: string;
  passCount: number;
  totalCount: number;
  passRate: number;
  details: string[];
}

export interface BenchmarkResult {
  id: number;
  name: string;
  description: string;
  icon: string;
  totalSamples: number;
  rounds: RoundResult[];
  extraMetrics?: Record<string, string | number>;
  charts?: ChartData[];
}

export interface ChartData {
  name: string;
  category: string;
  value: number;
  fill?: string;
}

// ─── Benchmark 1: Single Route ───
export const benchmark1: BenchmarkResult = {
  id: 1,
  name: "Single-Route Planning",
  description: "Core 4-round funnel evaluation for single route generation",
  icon: "Route",
  totalSamples: 10,
  rounds: [
    {
      name: "Round 1: Reachability",
      description: "Adjacent stations are connected in next_stop_ids",
      passCount: 10,
      totalCount: 10,
      passRate: 100,
      details: [
        "All 10 samples pass reachability check",
        "Adjacent stations verified against station_info.csv",
      ],
    },
    {
      name: "Round 2: Grounding & Distance",
      description: "Start/end grounding + transfer distance plausibility",
      passCount: 19,
      totalCount: 20,
      passRate: 95,
      details: [
        "Station Grounding (SG): 10/10 pass",
        "Distance Plausibility (DP): 9/10 pass",
        "Thresholds: walk 3km, bike 5km, taxi 10km",
      ],
    },
    {
      name: "Round 3: Structural Consistency",
      description: "Line IoU + Station IoU + Expert Score + Transfer Mode",
      passCount: 9,
      totalCount: 10,
      passRate: 90,
      details: [
        "Line IoU Avg: 0.8500",
        "Station IoU Avg: 0.9783",
        "Station IoU = 1: 9/10 samples",
      ],
    },
    {
      name: "Round 4: Estimation Accuracy",
      description: "Distance, time, fare, transfer accuracy",
      passCount: 9,
      totalCount: 9,
      passRate: 100,
      details: [
        "Distance MAPE: 0.70%",
        "Time MAPE: 1.38%",
        "Fare MAPE: 0.00%",
        "Overall Accurate: 9/9",
      ],
    },
  ],
  extraMetrics: {
    distanceMAPE: "0.70%",
    timeMAPE: "1.38%",
    fareMAPE: "0.00%",
    lineIoU: "0.8500",
    stationIoU: "0.9783",
  },
  charts: [
    { name: "Reachability", category: "Round 1", value: 100, fill: "var(--color-emerald-500)" },
    { name: "Grounding (SG)", category: "Round 2", value: 100, fill: "var(--color-teal-500)" },
    { name: "Distance (DP)", category: "Round 2", value: 90, fill: "var(--color-teal-400)" },
    { name: "Station IoU=1", category: "Round 3", value: 90, fill: "var(--color-cyan-500)" },
    { name: "Overall Accurate", category: "Round 4", value: 100, fill: "var(--color-cyan-400)" },
  ],
};

// ─── Benchmark 2: Personalized ───
export const benchmark2: BenchmarkResult = {
  id: 2,
  name: "Personalized Planning",
  description: "Adds preference compliance round to the 4-round funnel",
  icon: "Settings",
  totalSamples: 10,
  rounds: [
    {
      name: "Round 1: Reachability",
      description: "All generated routes are reachable",
      passCount: 10,
      totalCount: 10,
      passRate: 100,
      details: ["All 10 samples pass reachability check"],
    },
    {
      name: "Round 2: Grounding & Distance",
      description: "Start/end grounding + transfer distance plausibility",
      passCount: 20,
      totalCount: 20,
      passRate: 100,
      details: [
        "Station Grounding (SG): 10/10 pass",
        "Distance Plausibility (DP): 10/10 pass",
      ],
    },
    {
      name: "Round 3: Structural Consistency",
      description: "Line IoU + Station IoU + Expert Score",
      passCount: 3,
      totalCount: 10,
      passRate: 30,
      details: [
        "Station IoU = 1: 3/10 samples",
        "Lower IoU due to personalized route deviations",
      ],
    },
    {
      name: "Round 4: Estimation Accuracy",
      description: "Distance, time, fare accuracy",
      passCount: 3,
      totalCount: 3,
      passRate: 100,
      details: [
        "All reachable routes have accurate estimates",
      ],
    },
    {
      name: "Round 5: Preference Compliance",
      description: "Route satisfies user preference constraints",
      passCount: 7,
      totalCount: 10,
      passRate: 70,
      details: [
        "Fewer Transfers (req_type=2): 0/3",
        "No Subway (req_type=5): 3/3",
        "Subway First (req_type=7): 3/3",
        "Shorter Time (req_type=8): 1/1",
      ],
    },
  ],
  extraMetrics: {
    overallPreferenceCompliance: "7/10 (70%)",
    labelCompliance: "10/10 (100%)",
    fewerTransfers: "0/3",
    noSubway: "3/3",
    subwayFirst: "3/3",
    shorterTime: "1/1",
  },
  charts: [
    { name: "Fewer Transfers", category: "Preference", value: 0, fill: "var(--color-rose-400)" },
    { name: "No Subway", category: "Preference", value: 100, fill: "var(--color-emerald-500)" },
    { name: "Subway First", category: "Preference", value: 100, fill: "var(--color-teal-500)" },
    { name: "Shorter Time", category: "Preference", value: 100, fill: "var(--color-cyan-500)" },
  ],
};

// ─── Benchmark 3: Diversity ───
export const benchmark3: BenchmarkResult = {
  id: 3,
  name: "Route Diversity",
  description: "Evaluates multi-route diversity with Best-Match and RD metrics",
  icon: "GitBranch",
  totalSamples: 10,
  rounds: [
    {
      name: "Round 1: Reachability",
      description: "All generated routes must be reachable",
      passCount: 8,
      totalCount: 10,
      passRate: 80,
      details: [
        "First route reachability: 8/10",
        "Second route reachability: 8/10",
        "Third route reachability: 7/10",
        "All routes reachable: 6/10",
      ],
    },
    {
      name: "Round 2: Grounding & Distance",
      description: "Start/end grounding + transfer distance plausibility",
      passCount: 16,
      totalCount: 20,
      passRate: 80,
      details: [
        "Pass rate calculated across all routes",
      ],
    },
    {
      name: "Round 3: Best-Match Selection",
      description: "Finds best matching route among first/second/third",
      passCount: 5,
      totalCount: 8,
      passRate: 62.5,
      details: [
        "Line IoU Avg (best match): 0.6458",
        "Station IoU Avg (best match): 0.8295",
        "Station IoU=1 (best match): 5/8",
        "Best match distribution: first=3, second=2, third=0",
      ],
    },
    {
      name: "Round 4: Estimation Accuracy",
      description: "Distance, time, fare accuracy",
      passCount: 8,
      totalCount: 8,
      passRate: 100,
      details: [
        "Distance MAPE: 0.49%",
        "Time MAPE: 3.74%",
        "Fare MAPE: 0.00%",
      ],
    },
  ],
  extraMetrics: {
    routeDiversityEval: "0.4706",
    routeDiversityLabel: "0.6146",
    bestMatchFirst: 3,
    bestMatchSecond: 2,
    bestMatchThird: 0,
    firstReachability: "8/10",
    secondReachability: "8/10",
    thirdReachability: "7/10",
    allReachable: "6/10",
  },
  charts: [
    { name: "1st Route", category: "Reachability", value: 80, fill: "var(--color-emerald-500)" },
    { name: "2nd Route", category: "Reachability", value: 80, fill: "var(--color-teal-500)" },
    { name: "3rd Route", category: "Reachability", value: 70, fill: "var(--color-cyan-500)" },
    { name: "All Routes", category: "Reachability", value: 60, fill: "var(--color-cyan-600)" },
    { name: "RD (eval)", category: "Diversity", value: 47.1, fill: "var(--color-teal-400)" },
    { name: "RD (label)", category: "Diversity", value: 61.5, fill: "var(--color-emerald-400)" },
  ],
};

// ─── Benchmark 4: General LLM ───
export const benchmark4: BenchmarkResult = {
  id: 4,
  name: "General-Purpose LLM",
  description: "Evaluates general LLM route generation via remote API",
  icon: "BrainCircuit",
  totalSamples: 0,
  rounds: [],
  extraMetrics: {
    status: "Requires remote API endpoint",
    apiEndpoint: "http://transit-lm.amap.com",
    batchSize: 50,
  },
  charts: [],
};

// ─── Benchmark 5: Indonesia Single Route ───
export const benchmark5Indonesia: BenchmarkResult = {
  id: 5,
  name: "Jakarta Single-Route",
  description: "Single-route evaluation for Jakarta transit (MRT, LRT, KRL, TransJakarta)",
  icon: "Route",
  totalSamples: 10,
  rounds: [
    {
      name: "Round 1: Reachability",
      description: "Adjacent stations are connected in next_stop_ids",
      passCount: 10,
      totalCount: 10,
      passRate: 100,
      details: [
        "All 10 samples pass reachability check",
        "Jakarta MRT & TransJakarta connectivity verified",
      ],
    },
    {
      name: "Round 2: Grounding & Distance",
      description: "Start/end grounding + transfer distance plausibility",
      passCount: 18,
      totalCount: 20,
      passRate: 90,
      details: [
        "Station Grounding (SG): 10/10 pass",
        "Distance Plausibility (DP): 8/10 pass",
        "Thresholds: jalan kaki 3km, sepeda 5km, taksi 10km",
      ],
    },
    {
      name: "Round 3: Structural Consistency",
      description: "Line IoU + Station IoU + Expert Score + Transfer Mode",
      passCount: 8,
      totalCount: 10,
      passRate: 80,
      details: [
        "Line IoU Avg: 0.8200",
        "Station IoU Avg: 0.9650",
        "Station IoU = 1: 8/10 samples",
      ],
    },
    {
      name: "Round 4: Estimation Accuracy",
      description: "Distance, time, fare, transfer accuracy",
      passCount: 9,
      totalCount: 9,
      passRate: 100,
      details: [
        "Distance MAPE: 1.20%",
        "Time MAPE: 2.50%",
        "Fare MAPE: 0.00%",
        "Overall Accurate: 9/9",
      ],
    },
  ],
  extraMetrics: {
    distanceMAPE: "1.20%",
    timeMAPE: "2.50%",
    fareMAPE: "0.00%",
    lineIoU: "0.8200",
    stationIoU: "0.9650",
  },
  charts: [
    { name: "Reachability", category: "Round 1", value: 100, fill: "var(--color-emerald-500)" },
    { name: "Grounding (SG)", category: "Round 2", value: 100, fill: "var(--color-teal-500)" },
    { name: "Distance (DP)", category: "Round 2", value: 80, fill: "var(--color-teal-400)" },
    { name: "Station IoU=1", category: "Round 3", value: 80, fill: "var(--color-cyan-500)" },
    { name: "Overall Accurate", category: "Round 4", value: 100, fill: "var(--color-cyan-400)" },
  ],
};

// ─── Benchmark 6: Indonesia Personalized ───
export const benchmark6Indonesia: BenchmarkResult = {
  id: 6,
  name: "Jakarta Personalized",
  description: "Preference-aware planning for Jakarta (sedikit transfer, tanpa KRL, kereta prioritas, waktu tercepat)",
  icon: "Settings",
  totalSamples: 10,
  rounds: [
    {
      name: "Round 1: Reachability",
      description: "All generated routes are reachable",
      passCount: 10,
      totalCount: 10,
      passRate: 100,
      details: ["All 10 samples pass reachability check"],
    },
    {
      name: "Round 2: Grounding & Distance",
      description: "Start/end grounding + transfer distance plausibility",
      passCount: 18,
      totalCount: 20,
      passRate: 90,
      details: [
        "Station Grounding (SG): 10/10 pass",
        "Distance Plausibility (DP): 8/10 pass",
      ],
    },
    {
      name: "Round 3: Structural Consistency",
      description: "Line IoU + Station IoU + Expert Score",
      passCount: 5,
      totalCount: 10,
      passRate: 50,
      details: [
        "Station IoU = 1: 5/10 samples",
        "Lower IoU due to personalized route deviations",
      ],
    },
    {
      name: "Round 4: Estimation Accuracy",
      description: "Distance, time, fare accuracy",
      passCount: 5,
      totalCount: 5,
      passRate: 100,
      details: [
        "All reachable routes have accurate estimates",
      ],
    },
    {
      name: "Round 5: Preference Compliance",
      description: "Route satisfies user preference constraints",
      passCount: 6,
      totalCount: 10,
      passRate: 60,
      details: [
        "Sedikit Transfer (req_type=2): 2/3",
        "Tanpa KRL (req_type=5): 2/3",
        "Kereta Prioritas (req_type=7): 1/2",
        "Waktu Tercepat (req_type=8): 1/2",
      ],
    },
  ],
  extraMetrics: {
    overallPreferenceCompliance: "6/10 (60%)",
    labelCompliance: "9/10 (90%)",
    sedikitTransfer: "2/3",
    tanpaKRL: "2/3",
    keretaPrioritas: "1/2",
    waktuTercepat: "1/2",
  },
  charts: [
    { name: "Sedikit Transfer", category: "Preference", value: 67, fill: "var(--color-amber-400)" },
    { name: "Tanpa KRL", category: "Preference", value: 67, fill: "var(--color-emerald-500)" },
    { name: "Kereta Prioritas", category: "Preference", value: 50, fill: "var(--color-teal-500)" },
    { name: "Waktu Tercepat", category: "Preference", value: 50, fill: "var(--color-cyan-500)" },
  ],
};

// ─── Benchmark 7: Indonesia Diversity ───
export const benchmark7Indonesia: BenchmarkResult = {
  id: 7,
  name: "Jakarta Route Diversity",
  description: "Multi-route diversity for Jakarta (KRL, MRT, TransJakarta combinations)",
  icon: "GitBranch",
  totalSamples: 10,
  rounds: [
    {
      name: "Round 1: Reachability",
      description: "All generated routes must be reachable",
      passCount: 7,
      totalCount: 10,
      passRate: 70,
      details: [
        "First route reachability: 7/10",
        "Second route reachability: 7/10",
        "Third route reachability: 6/10",
        "All routes reachable: 5/10",
      ],
    },
    {
      name: "Round 2: Grounding & Distance",
      description: "Start/end grounding + transfer distance plausibility",
      passCount: 14,
      totalCount: 20,
      passRate: 70,
      details: [
        "Pass rate calculated across all routes",
      ],
    },
    {
      name: "Round 3: Best-Match Selection",
      description: "Finds best matching route among first/second/third",
      passCount: 4,
      totalCount: 7,
      passRate: 57.1,
      details: [
        "Line IoU Avg (best match): 0.6100",
        "Station IoU Avg (best match): 0.7950",
        "Station IoU=1 (best match): 4/7",
        "Best match distribution: first=2, second=2, third=0",
      ],
    },
    {
      name: "Round 4: Estimation Accuracy",
      description: "Distance, time, fare accuracy",
      passCount: 7,
      totalCount: 7,
      passRate: 100,
      details: [
        "Distance MAPE: 0.85%",
        "Time MAPE: 4.20%",
        "Fare MAPE: 0.00%",
      ],
    },
  ],
  extraMetrics: {
    routeDiversityEval: "0.4200",
    routeDiversityLabel: "0.5800",
    bestMatchFirst: 2,
    bestMatchSecond: 2,
    bestMatchThird: 0,
    firstReachability: "7/10",
    secondReachability: "7/10",
    thirdReachability: "6/10",
    allReachable: "5/10",
  },
  charts: [
    { name: "1st Route", category: "Reachability", value: 70, fill: "var(--color-emerald-500)" },
    { name: "2nd Route", category: "Reachability", value: 70, fill: "var(--color-teal-500)" },
    { name: "3rd Route", category: "Reachability", value: 60, fill: "var(--color-cyan-500)" },
    { name: "All Routes", category: "Reachability", value: 50, fill: "var(--color-cyan-600)" },
    { name: "RD (eval)", category: "Diversity", value: 42.0, fill: "var(--color-teal-400)" },
    { name: "RD (label)", category: "Diversity", value: 58.0, fill: "var(--color-emerald-400)" },
  ],
};

// ─── Benchmark 8: Indonesia General LLM ───
export const benchmark8Indonesia: BenchmarkResult = {
  id: 8,
  name: "Jakarta General LLM",
  description: "General-purpose LLM evaluation for Jakarta transit",
  icon: "BrainCircuit",
  totalSamples: 0,
  rounds: [],
  extraMetrics: {
    status: "Requires remote API endpoint",
    apiEndpoint: "http://transit-lm.amap.com",
    batchSize: 50,
    locale: "id-ID",
  },
  charts: [],
};

export const allBenchmarks = [benchmark1, benchmark2, benchmark3, benchmark4, benchmark5Indonesia, benchmark6Indonesia, benchmark7Indonesia, benchmark8Indonesia];

export const sampleRoute = {
  query: "我想从朱辛庄(地铁站)出发去玉东郊野公园，请帮我规划路线",
  city: "Beijing",
  start: [116.313698, 40.104297],
  end: [116.256265, 39.992097],
  lineSequence: [
    "地铁昌平线\n(昌平西山口--蓟门桥)",
    "地铁10号线外环\n(车道沟--车道沟)",
    "西郊线\n(巴沟--香山)",
  ],
  stationSequence: [
    "朱辛庄", "生命科学园", "西二旗", "清河", "学知园", "六道口",
    "学院桥", "牡丹园", "健德门", "北土城",
    "【换乘】",
    "海淀黄庄", "苏州街", "巴沟",
    "【换乘】",
    "颐和园西门", "茶棚", "万安", "玉东郊野公园",
  ],
  totalDistance: "27.8 km",
  totalTime: "1h 7min",
  totalFare: "¥8",
  startTransferMode: "Walk",
  endTransferMode: "Walk",
};

export const lineColors: Record<number, string> = {
  0: "#10b981", // emerald-500
  1: "#14b8a6", // teal-500
  2: "#06b6d4", // cyan-500
};

// Funnel data for visualization
export interface FunnelStep {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  description: string;
}

export function getFunnelData(benchmarkId: number): FunnelStep[] {
  const samples = 10;
  switch (benchmarkId) {
    case 1:
      return [
        { label: "Total Samples", value: samples, maxValue: samples, color: "#10b981", description: "10 samples entered evaluation" },
        { label: "Reachability", value: samples, maxValue: samples, color: "#14b8a6", description: "10/10 passed (100%)" },
        { label: "Grounding & Distance", value: 9, maxValue: samples, color: "#0d9488", description: "9/10 passed SG+DP (90%)" },
        { label: "Structural Consistency", value: 9, maxValue: samples, color: "#0891b2", description: "9/10 had Station IoU=1" },
        { label: "Estimation Accuracy", value: 9, maxValue: 9, color: "#06b6d4", description: "9/9 accurate estimates (100%)" },
      ];
    case 2:
      return [
        { label: "Total Samples", value: samples, maxValue: samples, color: "#10b981", description: "10 personalized samples" },
        { label: "Reachability", value: samples, maxValue: samples, color: "#14b8a6", description: "10/10 passed (100%)" },
        { label: "Grounding & Distance", value: samples, maxValue: samples, color: "#0d9488", description: "10/10 passed (100%)" },
        { label: "Structural Consistency", value: 3, maxValue: samples, color: "#0891b2", description: "3/10 had Station IoU=1" },
        { label: "Preference Compliance", value: 7, maxValue: samples, color: "#06b6d4", description: "7/10 preference compliant" },
      ];
    case 3:
      return [
        { label: "Total Samples", value: samples, maxValue: samples, color: "#10b981", description: "10 multi-route samples" },
        { label: "First Route Reachable", value: 8, maxValue: samples, color: "#14b8a6", description: "8/10 first routes reachable" },
        { label: "Second Route Reachable", value: 8, maxValue: samples, color: "#0d9488", description: "8/10 second routes reachable" },
        { label: "Best-Match Found", value: 5, maxValue: 8, color: "#0891b2", description: "5/8 best-match with IoU=1" },
        { label: "Estimation Accurate", value: 8, maxValue: 8, color: "#06b6d4", description: "8/8 accurate estimates" },
      ];
    default:
      return [];
  }
}

// ─── Indonesian Sample Route ───
export const sampleRouteIndonesia = {
  query: "Saya ingin pergi dari Stasiun MRT Lebak Bulus ke Monas, tolong rencanakan rute",
  city: "Jakarta",
  start: [106.7949, -6.2936],
  end: [106.8272, -6.1754],
  lineSequence: [
    "MRT Jakarta (Lebak Bulus–Bundaran HI)",
    "TransJakarta Koridor 1 (Blok M–Kota)",
  ],
  stationSequence: [
    "Lebak Bulus Grab", "Fatmawati", "Cipete Raya", "Haji Nawi",
    "Blok A", "Blok M", "Sisingamangaraja", "Senayan", "Istora Senayan",
    "Bendungan Hilir", "Setiabudi Astra", "Dukuh Atas",
    "【换乘】",
    "Monas", "Harmoni", "Sawah Besar", "Mangga Besar", "Pasar Baru", "Kota"
  ],
  totalDistance: "15.3 km",
  totalTime: "42 menit",
  totalFare: "Rp17.500",
  startTransferMode: "Jalan Kaki",
  endTransferMode: "Jalan Kaki",
};

// Funnel data for Indonesian benchmarks
export function getFunnelDataIndonesia(benchmarkId: number): FunnelStep[] {
  const samples = 10;
  switch (benchmarkId) {
    case 5:
      return [
        { label: "Total Samples", value: samples, maxValue: samples, color: "#10b981", description: "10 Jakarta samples entered evaluation" },
        { label: "Reachability", value: samples, maxValue: samples, color: "#14b8a6", description: "10/10 passed (100%)" },
        { label: "Grounding & Distance", value: 8, maxValue: samples, color: "#0d9488", description: "8/10 passed SG+DP (90%)" },
        { label: "Structural Consistency", value: 8, maxValue: samples, color: "#0891b2", description: "8/10 had Station IoU=1" },
        { label: "Estimation Accuracy", value: 9, maxValue: 9, color: "#06b6d4", description: "9/9 accurate estimates (100%)" },
      ];
    case 6:
      return [
        { label: "Total Samples", value: samples, maxValue: samples, color: "#10b981", description: "10 Jakarta personalized samples" },
        { label: "Reachability", value: samples, maxValue: samples, color: "#14b8a6", description: "10/10 passed (100%)" },
        { label: "Grounding & Distance", value: 8, maxValue: samples, color: "#0d9488", description: "8/10 passed (90%)" },
        { label: "Structural Consistency", value: 5, maxValue: samples, color: "#0891b2", description: "5/10 had Station IoU=1" },
        { label: "Preference Compliance", value: 6, maxValue: samples, color: "#06b6d4", description: "6/10 preference compliant" },
      ];
    case 7:
      return [
        { label: "Total Samples", value: samples, maxValue: samples, color: "#10b981", description: "10 Jakarta multi-route samples" },
        { label: "First Route Reachable", value: 7, maxValue: samples, color: "#14b8a6", description: "7/10 first routes reachable" },
        { label: "Second Route Reachable", value: 7, maxValue: samples, color: "#0d9488", description: "7/10 second routes reachable" },
        { label: "Best-Match Found", value: 4, maxValue: 7, color: "#0891b2", description: "4/7 best-match with IoU=1" },
        { label: "Estimation Accurate", value: 7, maxValue: 7, color: "#06b6d4", description: "7/7 accurate estimates" },
      ];
    default:
      return [];
  }
}
