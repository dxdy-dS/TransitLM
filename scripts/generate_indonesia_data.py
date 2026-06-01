#!/usr/bin/env python3
"""
Generate Indonesia (Jakarta) transit data for the TransitLM evaluation framework.

Produces:
  - data/station_info_indonesia.csv
  - data/benchmark_indonesia_single_route_example.csv
  - data/benchmark_indonesia_personalized_example.csv
  - data/benchmark_indonesia_diversity_example.csv

Transit lines covered:
  1. MRT Jakarta (North-South Line) – Lebak Bulus to Bundaran HI (13 stations)
  2. LRT Jakarta (Kelapa Gading–Velodrome) – 6 stations
  3. LRT Jabodebek (Cibubur Line) – Dukuh Atas to Cileungsi (10 stations)
  4. KRL Commuter Line – Bogor Line (20 stations)
  5. KRL Commuter Line – Bekasi Line (15 stations)
  6. TransJakarta Corridor 1 (Blok M–Kota) – 15 stations
  7. TransJakarta Corridor 2 (Pulogadung–Harmoni) – 12 stations
"""

import csv
import json
import math
import os
import uuid
import random

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
os.makedirs(DATA_DIR, exist_ok=True)

random.seed(42)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def haversine_km(lat1, lon1, lat2, lon2):
    """Return distance in km between two (lat, lon) points."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    return R * 2 * math.asin(math.sqrt(a))


def gen_index_id():
    return uuid.uuid4().hex


def fmt_time(mins):
    """Format minutes as Indonesian time string."""
    if mins >= 60:
        h = int(mins // 60)
        m = int(mins % 60)
        return f"{h} jam {m} menit"
    return f"{mins} menit"


def make_route_json(line_names, station_ids, distance_km, time_min,
                    fare_idr, start_mode="", end_mode="",
                    start_dist="", end_dist=""):
    """Build a route JSON dict matching the benchmark schema."""
    return {
        "line_sequence": line_names,
        "station_sequence": station_ids,
        "total_distance": f"{distance_km:.1f}km",
        "total_time": fmt_time(time_min),
        "total_fare": str(fare_idr),
        "start_transfer_mode": start_mode,
        "end_transfer_mode": end_mode,
        "start_transfer_distance": start_dist,
        "end_transfer_distance": end_dist,
    }


def jitter_route(route, dist_range=(0.1, 0.5), time_range=(1, 3)):
    """Return a slightly different copy of a route to simulate model output."""
    r = dict(route)
    dist = float(r["total_distance"].replace("km", ""))
    dd = random.uniform(*dist_range) * random.choice([-1, 1])
    r["total_distance"] = f"{max(0.1, dist + dd):.1f}km"
    # parse time
    time_str = r["total_time"]
    total_mins = 0
    if "jam" in time_str:
        parts = time_str.split("jam")
        total_mins = int(parts[0].strip()) * 60
        if "menit" in parts[1]:
            total_mins += int(parts[1].strip().replace("menit", "").strip())
    elif "menit" in time_str:
        total_mins = int(time_str.replace("menit", "").strip())
    td = random.randint(*time_range) * random.choice([-1, 1])
    total_mins = max(1, total_mins + td)
    r["total_time"] = fmt_time(total_mins)
    # jitter distances
    if r["start_transfer_distance"]:
        try:
            sd = float(r["start_transfer_distance"].replace("km", "").replace("meter", "").strip())
            if "meter" in r["start_transfer_distance"]:
                sd = max(0, sd + random.randint(-50, 50))
                r["start_transfer_distance"] = f"{int(sd)}meter"
            else:
                sd = max(0.01, sd + random.uniform(-0.05, 0.05))
                r["start_transfer_distance"] = f"{sd:.0f}km" if sd >= 1 else f"{int(sd*1000)}meter"
        except ValueError:
            pass
    if r["end_transfer_distance"]:
        try:
            ed = float(r["end_transfer_distance"].replace("km", "").replace("meter", "").strip())
            if "meter" in r["end_transfer_distance"]:
                ed = max(0, ed + random.randint(-50, 50))
                r["end_transfer_distance"] = f"{int(ed)}meter"
            else:
                ed = max(0.01, ed + random.uniform(-0.05, 0.05))
                r["end_transfer_distance"] = f"{ed:.0f}km" if ed >= 1 else f"{int(ed*1000)}meter"
        except ValueError:
            pass
    return r

# ---------------------------------------------------------------------------
# 1. Define all stations
# ---------------------------------------------------------------------------
# Format: (stop_id, ad_code, lng, lat, station_name)

MRT_NORTH_SOUTH = [
    ("id-mrt-001",  31, 106.7836, -6.2919, "Lebak Bulus"),
    ("id-mrt-002",  31, 106.7870, -6.2793, "Fatmawati"),
    ("id-mrt-003",  31, 106.7905, -6.2652, "Cipete Raya"),
    ("id-mrt-004",  31, 106.7943, -6.2543, "Haji Nawi"),
    ("id-mrt-005",  31, 106.7986, -6.2411, "Blok A"),
    ("id-mrt-006",  31, 106.8015, -6.2335, "Blok M"),
    ("id-mrt-007",  31, 106.8059, -6.2262, "ASEAN"),
    ("id-mrt-008",  31, 106.8098, -6.2190, "Senayan"),
    ("id-mrt-009",  31, 106.8140, -6.2156, "Istora Mandiri"),
    ("id-mrt-010",  31, 106.8184, -6.2080, "Bendungan Hilir"),
    ("id-mrt-011",  31, 106.8227, -6.2026, "Setiabudi"),
    ("id-mrt-012",  31, 106.8265, -6.1955, "Dukuh Atas"),
    ("id-mrt-013",  31, 106.8299, -6.1864, "Bundaran HI"),
]

LRT_JAKARTA = [
    ("id-lrt-001",  31, 106.8890, -6.1653, "Velodrome"),
    ("id-lrt-002",  31, 106.8800, -6.1710, "Pulomas"),
    ("id-lrt-003",  31, 106.8700, -6.1750, "Equestrian"),
    ("id-lrt-004",  31, 106.8600, -6.1520, "Kelapa Gading"),
    ("id-lrt-005",  31, 106.8520, -6.1480, "Boulevard Utara"),
    ("id-lrt-006",  31, 106.8440, -6.1450, "Boulevard Selatan"),
]

LRT_JABODEBEK = [
    ("id-lrt-007",  31, 106.8265, -6.1948, "Dukuh Atas"),      # transfer with MRT
    ("id-lrt-008",  31, 106.8300, -6.1895, "Cikoko"),
    ("id-lrt-009",  31, 106.8335, -6.1840, "Rasuna Said"),
    ("id-lrt-010",  31, 106.8370, -6.1790, "Kuningan"),
    ("id-lrt-011",  31, 106.8460, -6.1740, "Cawang"),
    ("id-lrt-012",  31, 106.8550, -6.1700, "Halim"),
    ("id-lrt-013",  31, 106.8650, -6.1650, "Ciracas"),
    ("id-lrt-014",  31, 106.8750, -6.1600, "Cibubur"),
    ("id-lrt-015",  31, 106.8830, -6.1550, "Harjamukti"),
    ("id-lrt-016",  31, 106.8920, -6.1500, "Cileungsi"),
]

KRL_BOGOR = [
    ("id-krl-001",  36, 106.7991, -6.5970, "Bogor"),
    ("id-krl-002",  36, 106.8050, -6.5700, "Cilebut"),
    ("id-krl-003",  36, 106.8130, -6.5500, "Citayam"),
    ("id-krl-004",  36, 106.8196, -6.4025, "Depok"),
    ("id-krl-005",  36, 106.8200, -6.3900, "Depok Baru"),
    ("id-krl-006",  36, 106.8260, -6.3750, "Pondok Cina"),
    ("id-krl-007",  36, 106.8300, -6.3600, "Universitas Indonesia"),
    ("id-krl-008",  36, 106.8330, -6.3470, "Universitas Pancasila"),
    ("id-krl-009",  36, 106.8360, -6.3380, "Lenteng Agung"),
    ("id-krl-010",  36, 106.8380, -6.3240, "Tanjung Barat"),
    ("id-krl-011",  31, 106.8420, -6.3100, "Pasar Minggu"),
    ("id-krl-012",  31, 106.8450, -6.2100, "Manggarai"),
    ("id-krl-013",  31, 106.8410, -6.1990, "Cikini"),
    ("id-krl-014",  31, 106.8380, -6.1930, "Gondangdia"),
    ("id-krl-015",  31, 106.8270, -6.1860, "Sudirman"),
    ("id-krl-016",  31, 106.8220, -6.1810, "Karet"),
    ("id-krl-017",  31, 106.8120, -6.1850, "Tanah Abang"),
    ("id-krl-018",  31, 106.8030, -6.1630, "Duri"),
    ("id-krl-019",  31, 106.8060, -6.1500, "Angke"),
    ("id-krl-020",  31, 106.8260, -6.1350, "Jakarta Kota"),
]

KRL_BEKASI = [
    ("id-krl-021",  33, 107.0020, -6.2380, "Bekasi"),
    ("id-krl-022",  33, 106.9930, -6.2350, "Bekasi Timur"),
    ("id-krl-023",  33, 106.9860, -6.2320, "Kranji"),
    ("id-krl-024",  31, 106.9720, -6.2220, "Cakung"),
    ("id-krl-025",  31, 106.9600, -6.2160, "Klender"),
    ("id-krl-026",  31, 106.9500, -6.2120, "Buaran"),
    ("id-krl-027",  31, 106.9400, -6.2070, "Rawamangun"),
    ("id-krl-028",  31, 106.9280, -6.2000, "Pisangan Baru"),
    ("id-krl-029",  31, 106.8680, -6.2150, "Jatinegara"),
    ("id-krl-030",  31, 106.8450, -6.2100, "Manggarai"),       # transfer with Bogor
    ("id-krl-031",  31, 106.8500, -6.1850, "Senen"),
    ("id-krl-032",  31, 106.8310, -6.1750, "Gambir"),
    ("id-krl-033",  31, 106.8330, -6.1700, "Juanda"),
    ("id-krl-034",  31, 106.8310, -6.1630, "Sawah Besar"),
    ("id-krl-035",  31, 106.8260, -6.1350, "Jakarta Kota"),    # transfer with Bogor
]

BUS_CORRIDOR1 = [
    ("id-bus-001",  31, 106.7982, -6.2430, "Halte Blok M"),
    ("id-bus-002",  31, 106.8030, -6.2370, "Halte Polda Metro Jaya"),
    ("id-bus-003",  31, 106.8080, -6.2290, "Halte Kebayoran"),
    ("id-bus-004",  31, 106.8130, -6.2220, "Halte Senayan"),
    ("id-bus-005",  31, 106.8170, -6.2150, "Halte Gelora Bung Karno"),
    ("id-bus-006",  31, 106.8210, -6.2080, "Halte Semanggi"),
    ("id-bus-007",  31, 106.8240, -6.1990, "Halte Monas"),
    ("id-bus-008",  31, 106.8290, -6.1880, "Halte Bundaran HI"),
    ("id-bus-009",  31, 106.8270, -6.1850, "Halte Tosari"),
    ("id-bus-010",  31, 106.8250, -6.1830, "Halte Sarinah"),
    ("id-bus-011",  31, 106.8220, -6.1750, "Halte Harmoni"),
    ("id-bus-012",  31, 106.8200, -6.1670, "Halte Pecenongan"),
    ("id-bus-013",  31, 106.8210, -6.1580, "Halte Gajah Mada"),
    ("id-bus-014",  31, 106.8240, -6.1480, "Halte Glodok"),
    ("id-bus-015",  31, 106.8270, -6.1380, "Halte Kota"),
]

BUS_CORRIDOR2 = [
    ("id-bus-016",  31, 106.8820, -6.1930, "Halte PG Cipto Mangunkusumo"),
    ("id-bus-017",  31, 106.8720, -6.1910, "Halte Salemba UI"),
    ("id-bus-018",  31, 106.8620, -6.1880, "Halte Salemba"),
    ("id-bus-019",  31, 106.8540, -6.1860, "Halte Paseban"),
    ("id-bus-020",  31, 106.8490, -6.1840, "Halte Kenari"),
    ("id-bus-021",  31, 106.8460, -6.1830, "Halte Kramat"),
    ("id-bus-022",  31, 106.8430, -6.1810, "Halte Senen"),
    ("id-bus-023",  31, 106.8380, -6.1790, "Halte Kwitang"),
    ("id-bus-024",  31, 106.8220, -6.1750, "Halte Harmoni"),       # transfer with C1
    ("id-bus-025",  31, 106.8170, -6.1730, "Halte Harmoni Central"),
    ("id-bus-026",  31, 106.8240, -6.1690, "Halte Juanda"),
    ("id-bus-027",  31, 106.8270, -6.1580, "Halte Pintu Besar"),
]

ALL_LINES = [MRT_NORTH_SOUTH, LRT_JAKARTA, LRT_JABODEBEK,
             KRL_BOGOR, KRL_BEKASI, BUS_CORRIDOR1, BUS_CORRIDOR2]

# ---------------------------------------------------------------------------
# Build station lookup & next_hop_stations
# ---------------------------------------------------------------------------
stations_by_id = {}   # stop_id -> (ad_code, lng, lat, station_name)

for line in ALL_LINES:
    for sid, ad, lng, lat, name in line:
        stations_by_id[sid] = (ad, lng, lat, name)

# Build adjacency: each station links to its immediate neighbours on the same line
next_hop = {sid: set() for sid in stations_by_id}

def add_line_edges(line_stations):
    ids = [s[0] for s in line_stations]
    for i in range(len(ids)):
        if i > 0:
            next_hop[ids[i]].add(ids[i - 1])
        if i < len(ids) - 1:
            next_hop[ids[i]].add(ids[i + 1])

for line in ALL_LINES:
    add_line_edges(line)

# Cross-line transfers (stations at same physical location on different lines)
TRANSFERS = [
    # MRT ↔ LRT Jabodebek at Dukuh Atas
    ("id-mrt-012", "id-lrt-007"),
    ("id-lrt-007", "id-mrt-012"),
    # MRT ↔ KRL (Sudirman near Dukuh Atas)
    ("id-mrt-012", "id-krl-015"),
    ("id-krl-015", "id-mrt-012"),
    # LRT Jabodebek ↔ KRL at Dukuh Atas area
    ("id-lrt-007", "id-krl-015"),
    ("id-krl-015", "id-lrt-007"),
    # MRT Blok M ↔ TransJakarta C1 Halte Blok M
    ("id-mrt-006", "id-bus-001"),
    ("id-bus-001", "id-mrt-006"),
    # MRT Bundaran HI ↔ TransJakarta C1 Halte Bundaran HI
    ("id-mrt-013", "id-bus-008"),
    ("id-bus-008", "id-mrt-013"),
    # TransJakarta C1 Harmoni ↔ TransJakarta C2 Harmoni
    ("id-bus-011", "id-bus-024"),
    ("id-bus-024", "id-bus-011"),
    # KRL Bogor Jakarta Kota ↔ KRL Bekasi Jakarta Kota
    ("id-krl-020", "id-krl-035"),
    ("id-krl-035", "id-krl-020"),
    # KRL Bogor Jakarta Kota ↔ TransJakarta Halte Kota
    ("id-krl-020", "id-bus-015"),
    ("id-bus-015", "id-krl-020"),
    # KRL Bekasi Jakarta Kota ↔ TransJakarta Halte Kota
    ("id-krl-035", "id-bus-015"),
    ("id-bus-015", "id-krl-035"),
    # KRL Bogor Manggarai ↔ KRL Bekasi Manggarai
    ("id-krl-012", "id-krl-030"),
    ("id-krl-030", "id-krl-012"),
]

for s1, s2 in TRANSFERS:
    if s1 in next_hop:
        next_hop[s1].add(s2)

# ---------------------------------------------------------------------------
# Write station_info_indonesia.csv
# ---------------------------------------------------------------------------
station_csv = os.path.join(DATA_DIR, "station_info_indonesia.csv")
with open(station_csv, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["stop_id", "ad_code", "coord_x", "coord_y",
                      "next_hop_stations", "station_name"])
    for line in ALL_LINES:
        for sid, ad, lng, lat, name in line:
            hops = json.dumps(sorted(next_hop[sid]), ensure_ascii=False)
            writer.writerow([sid, ad, f"{lng:.7f}", f"{lat:.7f}", hops, name])

print(f"[OK] {station_csv}  ({len(stations_by_id)} stations)")

# ---------------------------------------------------------------------------
# Quick helpers for route distance / time along a line
# ---------------------------------------------------------------------------
def route_distance(line_stations, start_idx, end_idx):
    """Haversine distance from start_idx to end_idx along line_stations."""
    d = 0.0
    direction = 1 if end_idx >= start_idx else -1
    for i in range(start_idx, end_idx, direction):
        j = i + direction
        _, _, lng1, lat1, _ = line_stations[i]
        _, _, lng2, lat2, _ = line_stations[j]
        d += haversine_km(lat1, lng1, lat2, lng2)
    return d

def line_ids_range(line_stations, start_idx, end_idx):
    """Return list of stop_ids from start_idx to end_idx (inclusive)."""
    direction = 1 if end_idx >= start_idx else -1
    return [line_stations[i][0] for i in range(start_idx, end_idx + direction, direction)]

# Approximate speed (km/h) for time estimation
SPEED = {"mrt": 40, "lrt": 35, "krl": 45, "bus": 18}

# ---------------------------------------------------------------------------
# 2. Benchmark 1 – Single Route Example (10 queries)
# ---------------------------------------------------------------------------
single_rows = []

def add_single(query, origin_lng, origin_lat, dest_lng, dest_lat,
               line_names, station_ids, dist_km, time_min,
               fare_idr, start_mode, end_mode, start_dist, end_dist):
    prompt = json.dumps({
        "query": query,
        "start": f"{origin_lng},{origin_lat}",
        "end": f"{dest_lng},{dest_lat}",
        "city": "Jakarta"
    }, ensure_ascii=False)
    label = make_route_json(line_names, station_ids, dist_km, time_min,
                           fare_idr, start_mode, end_mode, start_dist, end_dist)
    gen = jitter_route(label)
    single_rows.append([gen_index_id(), prompt, json.dumps(label, ensure_ascii=False),
                        json.dumps(gen, ensure_ascii=False)])

# --- Q1: MRT only – Lebak Bulus → Bundaran HI ---
add_single(
    "Saya ingin pergi dari Lebak Bulus ke Bundaran HI, tolong rencanakan rute",
    106.7836, -6.2919, 106.8299, -6.1864,
    ["MRT Jakarta (Lebak Bulus–Bundaran HI)"],
    line_ids_range(MRT_NORTH_SOUTH, 0, 12),
    route_distance(MRT_NORTH_SOUTH, 0, 12), 25, 14000,
    "Jalan Kaki", "Jalan Kaki", "", "350meter")

# --- Q2: KRL only – Depok → Jakarta Kota ---
add_single(
    "Saya ingin pergi dari Depok ke Jakarta Kota, tolong rencanakan rute",
    106.8196, -6.4025, 106.8260, -6.1350,
    ["KRL Bogor Line (Bogor–Jakarta Kota)"],
    line_ids_range(KRL_BOGOR, 3, 19),
    route_distance(KRL_BOGOR, 3, 19), 65, 8000,
    "Jalan Kaki", "Jalan Kaki", "450meter", "300meter")

# --- Q3: TransJakarta C1 only – Blok M → Kota ---
add_single(
    "Saya ingin pergi dari Halte Blok M ke Halte Kota, tolong rencanakan rute",
    106.7982, -6.2430, 106.8270, -6.1380,
    ["TransJakarta Koridor 1 (Blok M–Kota)"],
    line_ids_range(BUS_CORRIDOR1, 0, 14),
    route_distance(BUS_CORRIDOR1, 0, 14), 62, 3500,
    "Jalan Kaki", "Jalan Kaki", "120meter", "150meter")

# --- Q4: MRT + KRL transfer – Fatmawati → Jakarta Kota ---
mrt_ids_1_12 = line_ids_range(MRT_NORTH_SOUTH, 1, 11)  # Fatmawati → Dukuh Atas
krl_ids_15_19 = line_ids_range(KRL_BOGOR, 14, 19)       # Sudirman → Jakarta Kota
dist4 = route_distance(MRT_NORTH_SOUTH, 1, 11) + route_distance(KRL_BOGOR, 14, 19)
add_single(
    "Saya ingin pergi dari Fatmawati ke Jakarta Kota, tolong rencanakan rute",
    106.7870, -6.2793, 106.8260, -6.1350,
    ["MRT Jakarta (Lebak Bulus–Bundaran HI)", "KRL Bogor Line (Bogor–Jakarta Kota)"],
    mrt_ids_1_12 + ["\u3010\u6362\u4e58\u3011"] + krl_ids_15_19,
    dist4, 52, 22000,
    "Jalan Kaki", "Jalan Kaki", "500meter", "300meter")

# --- Q5: LRT Jabodebek only – Dukuh Atas → Cibubur ---
add_single(
    "Saya ingin pergi dari Dukuh Atas ke Cibubur, tolong rencanakan rute",
    106.8265, -6.1948, 106.8750, -6.1600,
    ["LRT Jabodebek (Dukuh Atas–Cileungsi)"],
    line_ids_range(LRT_JABODEBEK, 0, 7),
    route_distance(LRT_JABODEBEK, 0, 7), 22, 6000,
    "Jalan Kaki", "Naik Ojek", "", "800meter")

# --- Q6: KRL Bekasi – Bekasi → Jakarta Kota ---
add_single(
    "Saya ingin pergi dari Bekasi ke Jakarta Kota, tolong rencanakan rute",
    107.0020, -6.2380, 106.8260, -6.1350,
    ["KRL Bekasi Line (Bekasi–Jakarta Kota)"],
    line_ids_range(KRL_BEKASI, 0, 14),
    route_distance(KRL_BEKASI, 0, 14), 55, 10000,
    "Jalan Kaki", "Jalan Kaki", "600meter", "350meter")

# --- Q7: TransJakarta C1 + MRT – Halte Kota → Lebak Bulus ---
bus_c1_rev = line_ids_range(BUS_CORRIDOR1, 14, 0)  # Halte Kota → Halte Blok M
mrt_rev = line_ids_range(MRT_NORTH_SOUTH, 5, 0)      # Blok M → Lebak Bulus
dist7 = route_distance(BUS_CORRIDOR1, 14, 0) + route_distance(MRT_NORTH_SOUTH, 5, 0)
add_single(
    "Saya ingin pergi dari Halte Kota ke Lebak Bulus, tolong rencanakan rute",
    106.8270, -6.1380, 106.7836, -6.2919,
    ["TransJakarta Koridor 1 (Kota–Blok M)", "MRT Jakarta (Bundaran HI–Lebak Bulus)"],
    bus_c1_rev + ["\u3010\u6362\u4e58\u3011"] + mrt_rev,
    dist7, 68, 17500,
    "Jalan Kaki", "Jalan Kaki", "200meter", "400meter")

# --- Q8: MRT + LRT Jabodebek – Lebak Bulus → Cibubur ---
mrt_fwd = line_ids_range(MRT_NORTH_SOUTH, 0, 11)   # Lebak Bulus → Dukuh Atas
lrt_fwd = line_ids_range(LRT_JABODEBEK, 0, 7)     # Dukuh Atas → Cibubur
dist8 = route_distance(MRT_NORTH_SOUTH, 0, 11) + route_distance(LRT_JABODEBEK, 0, 7)
add_single(
    "Saya ingin pergi dari Lebak Bulus ke Cibubur, tolong rencanakan rute",
    106.7836, -6.2919, 106.8750, -6.1600,
    ["MRT Jakarta (Lebak Bulus–Bundaran HI)", "LRT Jabodebek (Dukuh Atas–Cileungsi)"],
    mrt_fwd + ["\u3010\u6362\u4e58\u3011"] + lrt_fwd,
    dist8, 48, 20000,
    "Jalan Kaki", "Naik Ojek", "", "900meter")

# --- Q9: KRL Bogor short – Bogor → Depok ---
add_single(
    "Saya ingin pergi dari Bogor ke Depok, tolong rencanakan rute",
    106.7991, -6.5970, 106.8196, -6.4025,
    ["KRL Bogor Line (Bogor–Jakarta Kota)"],
    line_ids_range(KRL_BOGOR, 0, 3),
    route_distance(KRL_BOGOR, 0, 3), 35, 4000,
    "Jalan Kaki", "Naik Ojek", "300meter", "600meter")

# --- Q10: TransJakarta C2 only – PG Cipto Mangunkusumo → Harmoni ---
add_single(
    "Saya ingin pergi dari PG Cipto Mangunkusumo ke Harmoni, tolong rencanakan rute",
    106.8820, -6.1930, 106.8220, -6.1750,
    ["TransJakarta Koridor 2 (Pulogadung–Harmoni)"],
    line_ids_range(BUS_CORRIDOR2, 0, 8),
    route_distance(BUS_CORRIDOR2, 0, 8), 30, 3500,
    "Jalan Kaki", "Jalan Kaki", "250meter", "100meter")

single_csv = os.path.join(DATA_DIR, "benchmark_indonesia_single_route_example.csv")
with open(single_csv, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["index_id", "sft_prompt", "sft_label", "generate_results"])
    for row in single_rows:
        writer.writerow(row)
print(f"[OK] {single_csv}  ({len(single_rows)} queries)")

# ---------------------------------------------------------------------------
# 3. Benchmark 2 – Personalized Example (10 queries)
# ---------------------------------------------------------------------------
personalized_rows = []

def add_personalized(query, origin_lng, origin_lat, dest_lng, dest_lat,
                     line_names, station_ids, dist_km, time_min,
                     fare_idr, start_mode, end_mode, start_dist, end_dist,
                     req_type):
    prompt = json.dumps({
        "query": query,
        "start": f"{origin_lng},{origin_lat}",
        "end": f"{dest_lng},{dest_lat}",
        "city": "Jakarta"
    }, ensure_ascii=False)
    label = make_route_json(line_names, station_ids, dist_km, time_min,
                           fare_idr, start_mode, end_mode, start_dist, end_dist)
    gen = jitter_route(label)
    personalized_rows.append([
        gen_index_id(), prompt,
        json.dumps(label, ensure_ascii=False),
        json.dumps(gen, ensure_ascii=False),
        req_type
    ])

# req_type: 2=sedikit transfer, 5=tanpa KRL, 7=kereta prioritas, 8=waktu tercepat

# --- P1: sedikit transfer (2) – Depok → Bundaran HI, minimal transfers ---
add_personalized(
    "Saya ingin pergi dari Depok ke Bundaran HI, sedikit transfer, tolong rencanakan rute",
    106.8196, -6.4025, 106.8299, -6.1864,
    ["KRL Bogor Line (Bogor–Jakarta Kota)"],
    line_ids_range(KRL_BOGOR, 3, 14),
    route_distance(KRL_BOGOR, 3, 14), 55, 8000,
    "Jalan Kaki", "Naik Ojek", "450meter", "500meter", 2)

# --- P2: tanpa KRL (5) – Bogor → Jakarta Kota, avoid KRL, use bus ---
add_personalized(
    "Saya ingin pergi dari Bogor ke Jakarta Kota, tidak naik KRL, tolong rencanakan rute",
    106.7991, -6.5970, 106.8260, -6.1350,
    ["TransJakarta Koridor 1 (Blok M–Kota)"],
    line_ids_range(BUS_CORRIDOR1, 0, 14),
    route_distance(BUS_CORRIDOR1, 0, 14), 120, 3500,
    "Naik Ojek", "Jalan Kaki", "3.2km", "200meter", 5)

# --- P3: kereta prioritas (7) – Lebak Bulus → Bekasi, prefer MRT/LRT ---
mrt_0_11 = line_ids_range(MRT_NORTH_SOUTH, 0, 11)
lrt_0_5 = line_ids_range(LRT_JABODEBEK, 0, 5)
dist_p3 = route_distance(MRT_NORTH_SOUTH, 0, 11) + route_distance(LRT_JABODEBEK, 0, 5) + 2.0
add_personalized(
    "Saya ingin pergi dari Lebak Bulus ke Bekasi, prioritas MRT/LRT, tolong rencanakan rute",
    106.7836, -6.2919, 107.0020, -6.2380,
    ["MRT Jakarta (Lebak Bulus–Bundaran HI)", "LRT Jabodebek (Dukuh Atas–Cileungsi)"],
    mrt_0_11 + ["\u3010\u6362\u4e58\u3011"] + lrt_0_5,
    dist_p3, 55, 20000,
    "Jalan Kaki", "Naik Ojek", "", "4.5km", 7)

# --- P4: waktu tercepat (8) – Bogor → Jakarta Kota, fastest ---
add_personalized(
    "Saya ingin pergi dari Bogor ke Jakarta Kota, waktu paling cepat, tolong rencanakan rute",
    106.7991, -6.5970, 106.8260, -6.1350,
    ["KRL Bogor Line (Bogor–Jakarta Kota)"],
    line_ids_range(KRL_BOGOR, 0, 19),
    route_distance(KRL_BOGOR, 0, 19), 75, 14000,
    "Jalan Kaki", "Jalan Kaki", "300meter", "300meter", 8)

# --- P5: sedikit transfer (2) – Cibubur → Blok M, minimal transfers ---
lrt_rev_7_0 = line_ids_range(LRT_JABODEBEK, 7, 0)
mrt_rev_12_6 = line_ids_range(MRT_NORTH_SOUTH, 11, 5)
dist_p5 = route_distance(LRT_JABODEBEK, 7, 0) + route_distance(MRT_NORTH_SOUTH, 11, 5)
add_personalized(
    "Saya ingin pergi dari Cibubur ke Blok M, sedikit transfer, tolong rencanakan rute",
    106.8750, -6.1600, 106.8015, -6.2335,
    ["LRT Jabodebek (Cileungsi–Dukuh Atas)", "MRT Jakarta (Bundaran HI–Lebak Bulus)"],
    lrt_rev_7_0 + ["\u3010\u6362\u4e58\u3011"] + mrt_rev_12_6,
    dist_p5, 42, 20000,
    "Naik Ojek", "Jalan Kaki", "700meter", "300meter", 2)

# --- P6: tanpa KRL (5) – Halte Kota → Lebak Bulus, avoid KRL ---
bus_rev = line_ids_range(BUS_CORRIDOR1, 14, 0)
mrt_rev_6_0 = line_ids_range(MRT_NORTH_SOUTH, 5, 0)
dist_p6 = route_distance(BUS_CORRIDOR1, 14, 0) + route_distance(MRT_NORTH_SOUTH, 5, 0)
add_personalized(
    "Saya ingin pergi dari Halte Kota ke Lebak Bulus, tidak naik KRL, tolong rencanakan rute",
    106.8270, -6.1380, 106.7836, -6.2919,
    ["TransJakarta Koridor 1 (Kota–Blok M)", "MRT Jakarta (Bundaran HI–Lebak Bulus)"],
    bus_rev + ["\u3010\u6362\u4e58\u3011"] + mrt_rev_6_0,
    dist_p6, 70, 17500,
    "Jalan Kaki", "Jalan Kaki", "200meter", "400meter", 5)

# --- P7: kereta prioritas (7) – Halte PG → Halte Kota, prefer MRT/LRT ---
add_personalized(
    "Saya ingin pergi dari PG Cipto Mangunkusumo ke Halte Kota, prioritas MRT/LRT, tolong rencanakan rute",
    106.8820, -6.1930, 106.8270, -6.1380,
    ["TransJakarta Koridor 2 (Pulogadung–Harmoni)", "TransJakarta Koridor 1 (Harmoni–Kota)"],
    line_ids_range(BUS_CORRIDOR2, 0, 8) + ["\u3010\u6362\u4e58\u3011"] + line_ids_range(BUS_CORRIDOR1, 10, 14),
    route_distance(BUS_CORRIDOR2, 0, 8) + route_distance(BUS_CORRIDOR1, 10, 14), 45, 7000,
    "Jalan Kaki", "Jalan Kaki", "250meter", "200meter", 7)

# --- P8: waktu tercepat (8) – Bekasi → Bundaran HI, fastest ---
krl_bek_0_9 = line_ids_range(KRL_BEKASI, 0, 9)
krl_bog_11_14 = line_ids_range(KRL_BOGOR, 10, 14)
dist_p8 = route_distance(KRL_BEKASI, 0, 9) + route_distance(KRL_BOGOR, 10, 14)
add_personalized(
    "Saya ingin pergi dari Bekasi ke Bundaran HI, waktu paling cepat, tolong rencanakan rute",
    107.0020, -6.2380, 106.8299, -6.1864,
    ["KRL Bekasi Line (Bekasi–Jakarta Kota)", "KRL Bogor Line (Bogor–Jakarta Kota)"],
    krl_bek_0_9 + ["\u3010\u6362\u4e58\u3011"] + krl_bog_11_14,
    dist_p8, 60, 12000,
    "Jalan Kaki", "Naik Ojek", "600meter", "450meter", 8)

# --- P9: sedikit transfer (2) – Halte Kota → Halte Senayan ---
add_personalized(
    "Saya ingin pergi dari Halte Kota ke Halte Senayan, sedikit transfer, tolong rencanakan rute",
    106.8270, -6.1380, 106.8130, -6.2220,
    ["TransJakarta Koridor 1 (Kota–Blok M)"],
    line_ids_range(BUS_CORRIDOR1, 14, 3),
    route_distance(BUS_CORRIDOR1, 14, 3), 55, 3500,
    "Jalan Kaki", "Jalan Kaki", "200meter", "200meter", 2)

# --- P10: tanpa KRL (5) – Kelapa Gading → Halte Blok M ---
lrt_rev_0_3 = line_ids_range(LRT_JAKARTA, 0, 3)
bus_c2_16_23 = line_ids_range(BUS_CORRIDOR2, 0, 7)
bus_c1_10_0 = line_ids_range(BUS_CORRIDOR1, 10, 0)
dist_p10 = (route_distance(LRT_JAKARTA, 0, 3) +
            2.5 +
            route_distance(BUS_CORRIDOR2, 0, 7) +
            route_distance(BUS_CORRIDOR1, 10, 0))
add_personalized(
    "Saya ingin pergi dari Kelapa Gading ke Halte Blok M, tidak naik KRL, tolong rencanakan rute",
    106.8600, -6.1520, 106.7982, -6.2430,
    ["LRT Jakarta (Velodrome–Kelapa Gading)", "TransJakarta Koridor 2 (Pulogadung–Harmoni)",
     "TransJakarta Koridor 1 (Harmoni–Blok M)"],
    lrt_rev_0_3 + ["\u3010\u6362\u4e58\u3011"] + bus_c2_16_23 + ["\u3010\u6362\u4e58\u3011"] + bus_c1_10_0,
    dist_p10, 80, 10500,
    "Naik Ojek", "Jalan Kaki", "1.2km", "150meter", 5)

personalized_csv = os.path.join(DATA_DIR, "benchmark_indonesia_personalized_example.csv")
with open(personalized_csv, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["index_id", "sft_prompt", "sft_label", "generate_results", "req_type"])
    for row in personalized_rows:
        writer.writerow(row)
print(f"[OK] {personalized_csv}  ({len(personalized_rows)} queries)")

# ---------------------------------------------------------------------------
# 4. Benchmark 3 – Diversity Example (10 queries)
# ---------------------------------------------------------------------------
diversity_rows = []

def add_diversity(query, origin_lng, origin_lat, dest_lng, dest_lat,
                  first, second, third):
    """first/second/third are dicts with route_tag + route fields."""
    prompt = json.dumps({
        "query": query,
        "start": f"{origin_lng},{origin_lat}",
        "end": f"{dest_lng},{dest_lat}",
        "city": "Jakarta"
    }, ensure_ascii=False)
    label = {"first": first, "second": second, "third": third}
    gen_first = dict(first, **jitter_route(first))
    gen_second = dict(second, **jitter_route(second))
    gen_third = dict(third, **jitter_route(third))
    gen = {"first": gen_first, "second": gen_second, "third": gen_third}
    diversity_rows.append([gen_index_id(), prompt,
                           json.dumps(label, ensure_ascii=False),
                           json.dumps(gen, ensure_ascii=False)])

# --- D1: Blok M → Jakarta Kota ---
# Route 1: MRT + KRL (MRT)
r1_ids = line_ids_range(MRT_NORTH_SOUTH, 5, 11) + ["\u3010\u6362\u4e58\u3011"] + line_ids_range(KRL_BOGOR, 14, 19)
r1_dist = route_distance(MRT_NORTH_SOUTH, 5, 11) + route_distance(KRL_BOGOR, 14, 19)
first1 = make_route_json(
    ["MRT Jakarta (Lebak Bulus–Bundaran HI)", "KRL Bogor Line (Bogor–Jakarta Kota)"],
    r1_ids, r1_dist, 42, 22000,
    "Jalan Kaki", "Jalan Kaki", "200meter", "300meter")
first1["route_tag"] = "MRT-KRL campuran"

# Route 2: TransJakarta only
r2_ids = line_ids_range(BUS_CORRIDOR1, 0, 14)
r2_dist = route_distance(BUS_CORRIDOR1, 0, 14)
second1 = make_route_json(
    ["TransJakarta Koridor 1 (Blok M–Kota)"],
    r2_ids, r2_dist, 62, 3500,
    "Jalan Kaki", "Jalan Kaki", "120meter", "150meter")
second1["route_tag"] = "TransJakarta"

# Route 3: KRL (walk to nearest KRL, all the way)
r3_ids = line_ids_range(KRL_BOGOR, 11, 19)
r3_dist = route_distance(KRL_BOGOR, 11, 19)
third1 = make_route_json(
    ["KRL Bogor Line (Bogor–Jakarta Kota)"],
    r3_ids, r3_dist, 30, 5000,
    "Naik Ojek", "Jalan Kaki", "5.5km", "300meter")
third1["route_tag"] = "KRL"

add_diversity(
    "Saya ingin pergi dari Blok M ke Jakarta Kota, tolong berikan beberapa opsi rute",
    106.8015, -6.2335, 106.8260, -6.1350,
    first1, second1, third1)

# --- D2: Bogor → Bundaran HI ---
# Route 1: KRL (fastest)
r1_ids_d2 = line_ids_range(KRL_BOGOR, 0, 14)
r1_dist_d2 = route_distance(KRL_BOGOR, 0, 14)
first2 = make_route_json(
    ["KRL Bogor Line (Bogor–Jakarta Kota)"],
    r1_ids_d2, r1_dist_d2, 70, 14000,
    "Jalan Kaki", "Naik Ojek", "300meter", "600meter")
first2["route_tag"] = "KRL"

# Route 2: KRL + MRT transfer
r2_ids_d2 = line_ids_range(KRL_BOGOR, 0, 14) + ["\u3010\u6362\u4e58\u3011"] + line_ids_range(MRT_NORTH_SOUTH, 11, 12)
r2_dist_d2 = r1_dist_d2 + route_distance(MRT_NORTH_SOUTH, 11, 12)
second2 = make_route_json(
    ["KRL Bogor Line (Bogor–Jakarta Kota)", "MRT Jakarta (Lebak Bulus–Bundaran HI)"],
    r2_ids_d2, r2_dist_d2, 72, 28000,
    "Jalan Kaki", "Jalan Kaki", "300meter", "350meter")
second2["route_tag"] = "KRL-MRT campuran"

# Route 3: Ojek (express)
third2 = make_route_json(
    ["Naik Ojek"],
    [], 57.5, 55, 60000,
    "Naik Ojek", "", "", "")
third2["route_tag"] = "Ojek langsung"

add_diversity(
    "Saya ingin pergi dari Bogor ke Bundaran HI, tolong berikan beberapa opsi rute",
    106.7991, -6.5970, 106.8299, -6.1864,
    first2, second2, third2)

# --- D3: Lebak Bulus → Halte Kota ---
# Route 1: MRT + KRL
r1_ids_d3 = line_ids_range(MRT_NORTH_SOUTH, 0, 11) + ["\u3010\u6362\u4e58\u3011"] + line_ids_range(KRL_BOGOR, 14, 19)
r1_dist_d3 = route_distance(MRT_NORTH_SOUTH, 0, 11) + route_distance(KRL_BOGOR, 14, 19)
first3 = make_route_json(
    ["MRT Jakarta (Lebak Bulus–Bundaran HI)", "KRL Bogor Line (Bogor–Jakarta Kota)"],
    r1_ids_d3, r1_dist_d3, 55, 22000,
    "Jalan Kaki", "Jalan Kaki", "", "300meter")
first3["route_tag"] = "MRT-KRL campuran"

# Route 2: TransJakarta C1
r2_ids_d3 = line_ids_range(BUS_CORRIDOR1, 0, 14)
r2_dist_d3 = route_distance(BUS_CORRIDOR1, 0, 14)
second3 = make_route_json(
    ["TransJakarta Koridor 1 (Blok M–Kota)"],
    r2_ids_d3, r2_dist_d3, 65, 3500,
    "Naik Ojek", "Jalan Kaki", "1.5km", "150meter")
second3["route_tag"] = "TransJakarta"

# Route 3: MRT + TransJakarta
r3_ids_d3 = line_ids_range(MRT_NORTH_SOUTH, 0, 12) + ["\u3010\u6362\u4e58\u3011"] + line_ids_range(BUS_CORRIDOR1, 7, 14)
r3_dist_d3 = route_distance(MRT_NORTH_SOUTH, 0, 12) + route_distance(BUS_CORRIDOR1, 7, 14)
third3 = make_route_json(
    ["MRT Jakarta (Lebak Bulus–Bundaran HI)", "TransJakarta Koridor 1 (Bundaran HI–Kota)"],
    r3_ids_d3, r3_dist_d3, 52, 17500,
    "Jalan Kaki", "Jalan Kaki", "", "200meter")
third3["route_tag"] = "MRT-TransJakarta campuran"

add_diversity(
    "Saya ingin pergi dari Lebak Bulus ke Halte Kota, tolong berikan beberapa opsi rute",
    106.7836, -6.2919, 106.8270, -6.1380,
    first3, second3, third3)

# --- D4: Bekasi → Bundaran HI ---
# Route 1: KRL Bekasi + transfer
r1_ids_d4 = line_ids_range(KRL_BEKASI, 0, 14)
r1_dist_d4 = route_distance(KRL_BEKASI, 0, 14)
first4 = make_route_json(
    ["KRL Bekasi Line (Bekasi–Jakarta Kota)"],
    r1_ids_d4, r1_dist_d4, 55, 10000,
    "Jalan Kaki", "Naik Ojek", "600meter", "500meter")
first4["route_tag"] = "KRL"

# Route 2: KRL + MRT (via Manggarai transfer to MRT)
r2_ids_d4 = (line_ids_range(KRL_BEKASI, 0, 9) +
             ["\u3010\u6362\u4e58\u3011"] +
             line_ids_range(KRL_BOGOR, 10, 14) +
             ["\u3010\u6362\u4e58\u3011"] +
             line_ids_range(MRT_NORTH_SOUTH, 11, 12))
r2_dist_d4 = route_distance(KRL_BEKASI, 0, 9) + route_distance(KRL_BOGOR, 10, 14) + route_distance(MRT_NORTH_SOUTH, 11, 12)
second4 = make_route_json(
    ["KRL Bekasi Line (Bekasi–Jakarta Kota)", "KRL Bogor Line", "MRT Jakarta"],
    r2_ids_d4, r2_dist_d4, 70, 24000,
    "Jalan Kaki", "Jalan Kaki", "600meter", "350meter")
second4["route_tag"] = "KRL-MRT campuran"

# Route 3: Ojek
third4 = make_route_json(
    ["Naik Ojek"],
    [], 22.5, 40, 45000,
    "Naik Ojek", "", "", "")
third4["route_tag"] = "Ojek langsung"

add_diversity(
    "Saya ingin pergi dari Bekasi ke Bundaran HI, tolong berikan beberapa opsi rute",
    107.0020, -6.2380, 106.8299, -6.1864,
    first4, second4, third4)

# --- D5: Cibubur → Bundaran HI ---
# Route 1: LRT Jabodebek + MRT
r1_ids_d5 = line_ids_range(LRT_JABODEBEK, 7, 0) + ["\u3010\u6362\u4e58\u3011"] + line_ids_range(MRT_NORTH_SOUTH, 11, 12)
r1_dist_d5 = route_distance(LRT_JABODEBEK, 7, 0) + route_distance(MRT_NORTH_SOUTH, 11, 12)
first5 = make_route_json(
    ["LRT Jabodebek (Cileungsi–Dukuh Atas)", "MRT Jakarta (Bundaran HI–Lebak Bulus)"],
    r1_ids_d5, r1_dist_d5, 35, 20000,
    "Naik Ojek", "Jalan Kaki", "900meter", "350meter")
first5["route_tag"] = "LRT-MRT campuran"

# Route 2: Ojek
second5 = make_route_json(
    ["Naik Ojek"],
    [], 19.0, 35, 35000,
    "Naik Ojek", "", "", "")
second5["route_tag"] = "Ojek langsung"

# Route 3: LRT Jabodebek + TransJakarta
r3_ids_d5 = (line_ids_range(LRT_JABODEBEK, 7, 0) +
             ["\u3010\u6362\u4e58\u3011"] +
             line_ids_range(BUS_CORRIDOR1, 9, 7))
r3_dist_d5 = route_distance(LRT_JABODEBEK, 7, 0) + route_distance(BUS_CORRIDOR1, 9, 7)
third5 = make_route_json(
    ["LRT Jabodebek (Cileungsi–Dukuh Atas)", "TransJakarta Koridor 1"],
    r3_ids_d5, r3_dist_d5, 38, 9500,
    "Naik Ojek", "Jalan Kaki", "900meter", "200meter")
third5["route_tag"] = "LRT-TransJakarta campuran"

add_diversity(
    "Saya ingin pergi dari Cibubur ke Bundaran HI, tolong berikan beberapa opsi rute",
    106.8750, -6.1600, 106.8299, -6.1864,
    first5, second5, third5)

# --- D6: Dukuh Atas → Kelapa Gading ---
# Route 1: LRT Jabodebek + walk/okek
r1_ids_d6 = line_ids_range(LRT_JABODEBEK, 0, 6)
r1_dist_d6 = route_distance(LRT_JABODEBEK, 0, 6)
first6 = make_route_json(
    ["LRT Jabodebek (Dukuh Atas–Cileungsi)"],
    r1_ids_d6, r1_dist_d6, 20, 6000,
    "Jalan Kaki", "Naik Ojek", "", "3.0km")
first6["route_tag"] = "LRT-Ojek campuran"

# Route 2: Ojek langsung
second6 = make_route_json(
    ["Naik Ojek"],
    [], 7.5, 20, 25000,
    "Naik Ojek", "", "", "")
second6["route_tag"] = "Ojek langsung"

# Route 3: TransJakarta + ojek
r3_ids_d6 = line_ids_range(BUS_CORRIDOR2, 7, 0)  # Harmoni → PG
r3_dist_d6 = route_distance(BUS_CORRIDOR2, 7, 0)
third6 = make_route_json(
    ["TransJakarta Koridor 2 (Harmoni–Pulogadung)"],
    r3_ids_d6, r3_dist_d6, 25, 3500,
    "Naik Ojek", "Naik Ojek", "500meter", "4.0km")
third6["route_tag"] = "TransJakarta-Ojek campuran"

add_diversity(
    "Saya ingin pergi dari Dukuh Atas ke Kelapa Gading, tolong berikan beberapa opsi rute",
    106.8265, -6.1948, 106.8600, -6.1520,
    first6, second6, third6)

# --- D7: Fatmawati → Harmoni ---
# Route 1: MRT only
r1_ids_d7 = line_ids_range(MRT_NORTH_SOUTH, 1, 10)
r1_dist_d7 = route_distance(MRT_NORTH_SOUTH, 1, 10)
first7 = make_route_json(
    ["MRT Jakarta (Lebak Bulus–Bundaran HI)"],
    r1_ids_d7, r1_dist_d7, 22, 14000,
    "Jalan Kaki", "Naik Ojek", "500meter", "600meter")
first7["route_tag"] = "MRT"

# Route 2: TransJakarta C1
r2_ids_d7 = line_ids_range(BUS_CORRIDOR1, 1, 10)
r2_dist_d7 = route_distance(BUS_CORRIDOR1, 1, 10)
second7 = make_route_json(
    ["TransJakarta Koridor 1 (Blok M–Kota)"],
    r2_ids_d7, r2_dist_d7, 40, 3500,
    "Jalan Kaki", "Jalan Kaki", "400meter", "200meter")
second7["route_tag"] = "TransJakarta"

# Route 3: Naik motor
third7 = make_route_json(
    ["Naik Motor"],
    [], 9.2, 22, 15000,
    "Naik Motor", "", "", "")
third7["route_tag"] = "Motor langsung"

add_diversity(
    "Saya ingin pergi dari Fatmawati ke Harmoni, tolong berikan beberapa opsi rute",
    106.7870, -6.2793, 106.8220, -6.1750,
    first7, second7, third7)

# --- D8: Depok → Bundaran HI ---
# Route 1: KRL (direct)
r1_ids_d8 = line_ids_range(KRL_BOGOR, 3, 14)
r1_dist_d8 = route_distance(KRL_BOGOR, 3, 14)
first8 = make_route_json(
    ["KRL Bogor Line (Bogor–Jakarta Kota)"],
    r1_ids_d8, r1_dist_d8, 55, 8000,
    "Jalan Kaki", "Naik Ojek", "450meter", "600meter")
first8["route_tag"] = "KRL"

# Route 2: KRL + MRT
r2_ids_d8 = line_ids_range(KRL_BOGOR, 3, 14) + ["\u3010\u6362\u4e58\u3011"] + line_ids_range(MRT_NORTH_SOUTH, 11, 12)
r2_dist_d8 = r1_dist_d8 + route_distance(MRT_NORTH_SOUTH, 11, 12)
second8 = make_route_json(
    ["KRL Bogor Line", "MRT Jakarta (Lebak Bulus–Bundaran HI)"],
    r2_ids_d8, r2_dist_d8, 58, 22000,
    "Jalan Kaki", "Jalan Kaki", "450meter", "350meter")
second8["route_tag"] = "KRL-MRT campuran"

# Route 3: Naik taksi
third8 = make_route_json(
    ["Naik Taksi"],
    [], 24.0, 50, 85000,
    "Naik Taksi", "", "", "")
third8["route_tag"] = "Taksi langsung"

add_diversity(
    "Saya ingin pergi dari Depok ke Bundaran HI, tolong berikan beberapa opsi rute",
    106.8196, -6.4025, 106.8299, -6.1864,
    first8, second8, third8)

# --- D9: Halte Blok M → Cibubur ---
# Route 1: MRT + LRT
r1_ids_d9 = line_ids_range(MRT_NORTH_SOUTH, 5, 11) + ["\u3010\u6362\u4e58\u3011"] + line_ids_range(LRT_JABODEBEK, 0, 7)
r1_dist_d9 = route_distance(MRT_NORTH_SOUTH, 5, 11) + route_distance(LRT_JABODEBEK, 0, 7)
first9 = make_route_json(
    ["MRT Jakarta (Lebak Bulus–Bundaran HI)", "LRT Jabodebek (Dukuh Atas–Cileungsi)"],
    r1_ids_d9, r1_dist_d9, 38, 20000,
    "Jalan Kaki", "Naik Ojek", "200meter", "900meter")
first9["route_tag"] = "MRT-LRT campuran"

# Route 2: TransJakarta + LRT
r2_ids_d9 = (line_ids_range(BUS_CORRIDOR1, 0, 7) +
             ["\u3010\u6362\u4e58\u3011"] +
             line_ids_range(LRT_JABODEBEK, 0, 7))
r2_dist_d9 = route_distance(BUS_CORRIDOR1, 0, 7) + route_distance(LRT_JABODEBEK, 0, 7)
second9 = make_route_json(
    ["TransJakarta Koridor 1 (Blok M–Bundaran HI)", "LRT Jabodebek (Dukuh Atas–Cileungsi)"],
    r2_ids_d9, r2_dist_d9, 48, 9500,
    "Jalan Kaki", "Naik Ojek", "120meter", "900meter")
second9["route_tag"] = "TransJakarta-LRT campuran"

# Route 3: Ojek
third9 = make_route_json(
    ["Naik Ojek"],
    [], 10.5, 28, 30000,
    "Naik Ojek", "", "", "")
third9["route_tag"] = "Ojek langsung"

add_diversity(
    "Saya ingin pergi dari Halte Blok M ke Cibubur, tolong berikan beberapa opsi rute",
    106.7982, -6.2430, 106.8750, -6.1600,
    first9, second9, third9)

# --- D10: PG Cipto Mangunkusumo → Jakarta Kota ---
# Route 1: TransJakarta C2 + C1
r1_ids_d10 = line_ids_range(BUS_CORRIDOR2, 0, 8) + ["\u3010\u6362\u4e58\u3011"] + line_ids_range(BUS_CORRIDOR1, 10, 14)
r1_dist_d10 = route_distance(BUS_CORRIDOR2, 0, 8) + route_distance(BUS_CORRIDOR1, 10, 14)
first10 = make_route_json(
    ["TransJakarta Koridor 2 (Pulogadung–Harmoni)", "TransJakarta Koridor 1 (Harmoni–Kota)"],
    r1_ids_d10, r1_dist_d10, 45, 7000,
    "Jalan Kaki", "Jalan Kaki", "250meter", "200meter")
first10["route_tag"] = "TransJakarta"

# Route 2: KRL Bekasi
r2_ids_d10 = line_ids_range(KRL_BEKASI, 6, 14)
r2_dist_d10 = route_distance(KRL_BEKASI, 6, 14)
second10 = make_route_json(
    ["KRL Bekasi Line (Bekasi–Jakarta Kota)"],
    r2_ids_d10, r2_dist_d10, 28, 5000,
    "Naik Ojek", "Jalan Kaki", "1.5km", "350meter")
second10["route_tag"] = "KRL"

# Route 3: Naik motor
third10 = make_route_json(
    ["Naik Motor"],
    [], 8.2, 18, 12000,
    "Naik Motor", "", "", "")
third10["route_tag"] = "Motor langsung"

add_diversity(
    "Saya ingin pergi dari PG Cipto Mangunkusumo ke Jakarta Kota, tolong berikan beberapa opsi rute",
    106.8820, -6.1930, 106.8260, -6.1350,
    first10, second10, third10)

diversity_csv = os.path.join(DATA_DIR, "benchmark_indonesia_diversity_example.csv")
with open(diversity_csv, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["index_id", "sft_prompt", "sft_label", "generate_results"])
    for row in diversity_rows:
        writer.writerow(row)
print(f"[OK] {diversity_csv}  ({len(diversity_rows)} queries)")

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
print("\n" + "=" * 60)
print("SUMMARY")
print("=" * 60)
print(f"Total stations created     : {len(stations_by_id)}")
print(f"  MRT Jakarta (N-S Line)   : {len(MRT_NORTH_SOUTH)} stations")
print(f"  LRT Jakarta (KG–Velodrome): {len(LRT_JAKARTA)} stations")
print(f"  LRT Jabodebek (Cibubur)   : {len(LRT_JABODEBEK)} stations")
print(f"  KRL Bogor Line           : {len(KRL_BOGOR)} stations")
print(f"  KRL Bekasi Line          : {len(KRL_BEKASI)} stations")
print(f"  TransJakarta Corridor 1   : {len(BUS_CORRIDOR1)} stations")
print(f"  TransJakarta Corridor 2   : {len(BUS_CORRIDOR2)} stations")
print(f"Transit lines covered      : 7")
print(f"Benchmark single-route      : {len(single_rows)} queries")
print(f"Benchmark personalized     : {len(personalized_rows)} queries")
print(f"Benchmark diversity        : {len(diversity_rows)} queries")
print(f"Total benchmark samples    : {len(single_rows)+len(personalized_rows)+len(diversity_rows)}")
print(f"Transfer hubs (cross-line) : {len(set(tuple(sorted([a,b])) for a,b in TRANSFERS))} unique pairs")
print("=" * 60)
print("Files generated in:", DATA_DIR)
