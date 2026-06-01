// JelajahID - Indonesia Transit Data
// Real station data from TransJakarta, MRT Jakarta, LRT Jabodebek, and KRL Commuterline

export interface Station {
  id: string;
  name: string;
  lat: number;
  lng: number;
  lines: string[];
}

export interface TransitLine {
  id: string;
  name: string;
  color: string;
  type: 'mrt' | 'lrt' | 'krl' | 'bus';
  stations: string[]; // station IDs in order
  fare: number; // base fare in IDR
  speed: number; // average speed km/h
}

// All stations
export const stations: Record<string, Station> = {
  'id-mrt-001': { id: 'id-mrt-001', name: 'Lebak Bulus', lat: -6.2919, lng: 106.7836, lines: ['mrt-jakarta'] },
  'id-mrt-002': { id: 'id-mrt-002', name: 'Fatmawati', lat: -6.2793, lng: 106.787, lines: ['mrt-jakarta'] },
  'id-mrt-003': { id: 'id-mrt-003', name: 'Cipete Raya', lat: -6.2652, lng: 106.7905, lines: ['mrt-jakarta'] },
  'id-mrt-004': { id: 'id-mrt-004', name: 'Haji Nawi', lat: -6.2543, lng: 106.7943, lines: ['mrt-jakarta'] },
  'id-mrt-005': { id: 'id-mrt-005', name: 'Blok A', lat: -6.2411, lng: 106.7986, lines: ['mrt-jakarta'] },
  'id-mrt-006': { id: 'id-mrt-006', name: 'Blok M', lat: -6.2335, lng: 106.8015, lines: ['mrt-jakarta', 'bus-corridor1'] },
  'id-mrt-007': { id: 'id-mrt-007', name: 'ASEAN', lat: -6.2262, lng: 106.8059, lines: ['mrt-jakarta'] },
  'id-mrt-008': { id: 'id-mrt-008', name: 'Senayan', lat: -6.219, lng: 106.8098, lines: ['mrt-jakarta'] },
  'id-mrt-009': { id: 'id-mrt-009', name: 'Istora Mandiri', lat: -6.2156, lng: 106.814, lines: ['mrt-jakarta'] },
  'id-mrt-010': { id: 'id-mrt-010', name: 'Bendungan Hilir', lat: -6.208, lng: 106.8184, lines: ['mrt-jakarta'] },
  'id-mrt-011': { id: 'id-mrt-011', name: 'Setiabudi', lat: -6.2026, lng: 106.8227, lines: ['mrt-jakarta'] },
  'id-mrt-012': { id: 'id-mrt-012', name: 'Dukuh Atas', lat: -6.1955, lng: 106.8265, lines: ['mrt-jakarta', 'lrt-jabodebek', 'krl-bogor'] },
  'id-mrt-013': { id: 'id-mrt-013', name: 'Bundaran HI', lat: -6.1864, lng: 106.8299, lines: ['mrt-jakarta', 'bus-corridor1'] },

  'id-lrt-001': { id: 'id-lrt-001', name: 'Velodrome', lat: -6.1653, lng: 106.889, lines: ['lrt-jakarta'] },
  'id-lrt-002': { id: 'id-lrt-002', name: 'Pulomas', lat: -6.171, lng: 106.88, lines: ['lrt-jakarta'] },
  'id-lrt-003': { id: 'id-lrt-003', name: 'Equestrian', lat: -6.175, lng: 106.87, lines: ['lrt-jakarta'] },
  'id-lrt-004': { id: 'id-lrt-004', name: 'Kelapa Gading', lat: -6.152, lng: 106.86, lines: ['lrt-jakarta'] },
  'id-lrt-005': { id: 'id-lrt-005', name: 'Boulevard Utara', lat: -6.148, lng: 106.852, lines: ['lrt-jakarta'] },
  'id-lrt-006': { id: 'id-lrt-006', name: 'Boulevard Selatan', lat: -6.145, lng: 106.844, lines: ['lrt-jakarta'] },
  'id-lrt-007': { id: 'id-lrt-007', name: 'Dukuh Atas', lat: -6.1948, lng: 106.8265, lines: ['lrt-jabodebek', 'mrt-jakarta', 'krl-bogor'] },
  'id-lrt-008': { id: 'id-lrt-008', name: 'Cikoko', lat: -6.1895, lng: 106.83, lines: ['lrt-jabodebek'] },
  'id-lrt-009': { id: 'id-lrt-009', name: 'Rasuna Said', lat: -6.184, lng: 106.8335, lines: ['lrt-jabodebek'] },
  'id-lrt-010': { id: 'id-lrt-010', name: 'Kuningan', lat: -6.179, lng: 106.837, lines: ['lrt-jabodebek'] },
  'id-lrt-011': { id: 'id-lrt-011', name: 'Cawang', lat: -6.174, lng: 106.846, lines: ['lrt-jabodebek'] },
  'id-lrt-012': { id: 'id-lrt-012', name: 'Halim', lat: -6.17, lng: 106.855, lines: ['lrt-jabodebek'] },
  'id-lrt-013': { id: 'id-lrt-013', name: 'Ciracas', lat: -6.165, lng: 106.865, lines: ['lrt-jabodebek'] },
  'id-lrt-014': { id: 'id-lrt-014', name: 'Cibubur', lat: -6.16, lng: 106.875, lines: ['lrt-jabodebek'] },
  'id-lrt-015': { id: 'id-lrt-015', name: 'Harjamukti', lat: -6.155, lng: 106.883, lines: ['lrt-jabodebek'] },
  'id-lrt-016': { id: 'id-lrt-016', name: 'Cileungsi', lat: -6.15, lng: 106.892, lines: ['lrt-jabodebek'] },

  'id-krl-001': { id: 'id-krl-001', name: 'Bogor', lat: -6.597, lng: 106.7991, lines: ['krl-bogor'] },
  'id-krl-002': { id: 'id-krl-002', name: 'Cilebut', lat: -6.57, lng: 106.805, lines: ['krl-bogor'] },
  'id-krl-003': { id: 'id-krl-003', name: 'Citayam', lat: -6.55, lng: 106.813, lines: ['krl-bogor'] },
  'id-krl-004': { id: 'id-krl-004', name: 'Depok', lat: -6.4025, lng: 106.8196, lines: ['krl-bogor'] },
  'id-krl-005': { id: 'id-krl-005', name: 'Depok Baru', lat: -6.39, lng: 106.82, lines: ['krl-bogor'] },
  'id-krl-006': { id: 'id-krl-006', name: 'Pondok Cina', lat: -6.375, lng: 106.826, lines: ['krl-bogor'] },
  'id-krl-007': { id: 'id-krl-007', name: 'Universitas Indonesia', lat: -6.36, lng: 106.83, lines: ['krl-bogor'] },
  'id-krl-008': { id: 'id-krl-008', name: 'Universitas Pancasila', lat: -6.347, lng: 106.833, lines: ['krl-bogor'] },
  'id-krl-009': { id: 'id-krl-009', name: 'Lenteng Agung', lat: -6.338, lng: 106.836, lines: ['krl-bogor'] },
  'id-krl-010': { id: 'id-krl-010', name: 'Tanjung Barat', lat: -6.324, lng: 106.838, lines: ['krl-bogor'] },
  'id-krl-011': { id: 'id-krl-011', name: 'Pasar Minggu', lat: -6.31, lng: 106.842, lines: ['krl-bogor'] },
  'id-krl-012': { id: 'id-krl-012', name: 'Manggarai', lat: -6.21, lng: 106.845, lines: ['krl-bogor', 'krl-bekasi'] },
  'id-krl-013': { id: 'id-krl-013', name: 'Cikini', lat: -6.199, lng: 106.841, lines: ['krl-bogor'] },
  'id-krl-014': { id: 'id-krl-014', name: 'Gondangdia', lat: -6.193, lng: 106.838, lines: ['krl-bogor'] },
  'id-krl-015': { id: 'id-krl-015', name: 'Sudirman', lat: -6.186, lng: 106.827, lines: ['krl-bogor', 'lrt-jabodebek', 'mrt-jakarta'] },
  'id-krl-016': { id: 'id-krl-016', name: 'Karet', lat: -6.181, lng: 106.822, lines: ['krl-bogor'] },
  'id-krl-017': { id: 'id-krl-017', name: 'Tanah Abang', lat: -6.185, lng: 106.812, lines: ['krl-bogor'] },
  'id-krl-018': { id: 'id-krl-018', name: 'Duri', lat: -6.163, lng: 106.803, lines: ['krl-bogor'] },
  'id-krl-019': { id: 'id-krl-019', name: 'Angke', lat: -6.15, lng: 106.806, lines: ['krl-bogor'] },
  'id-krl-020': { id: 'id-krl-020', name: 'Jakarta Kota', lat: -6.135, lng: 106.826, lines: ['krl-bogor', 'bus-corridor1'] },
  'id-krl-021': { id: 'id-krl-021', name: 'Bekasi', lat: -6.238, lng: 107.002, lines: ['krl-bekasi'] },
  'id-krl-022': { id: 'id-krl-022', name: 'Bekasi Timur', lat: -6.235, lng: 106.993, lines: ['krl-bekasi'] },
  'id-krl-023': { id: 'id-krl-023', name: 'Kranji', lat: -6.232, lng: 106.986, lines: ['krl-bekasi'] },
  'id-krl-024': { id: 'id-krl-024', name: 'Cakung', lat: -6.222, lng: 106.972, lines: ['krl-bekasi'] },
  'id-krl-025': { id: 'id-krl-025', name: 'Klender', lat: -6.216, lng: 106.96, lines: ['krl-bekasi'] },
  'id-krl-026': { id: 'id-krl-026', name: 'Buaran', lat: -6.212, lng: 106.95, lines: ['krl-bekasi'] },
  'id-krl-027': { id: 'id-krl-027', name: 'Rawamangun', lat: -6.207, lng: 106.94, lines: ['krl-bekasi'] },
  'id-krl-028': { id: 'id-krl-028', name: 'Pisangan Baru', lat: -6.2, lng: 106.928, lines: ['krl-bekasi'] },
  'id-krl-029': { id: 'id-krl-029', name: 'Jatinegara', lat: -6.215, lng: 106.868, lines: ['krl-bekasi'] },
  'id-krl-030': { id: 'id-krl-030', name: 'Manggarai', lat: -6.21, lng: 106.845, lines: ['krl-bekasi', 'krl-bogor'] },
  'id-krl-031': { id: 'id-krl-031', name: 'Senen', lat: -6.185, lng: 106.85, lines: ['krl-bekasi'] },
  'id-krl-032': { id: 'id-krl-032', name: 'Gambir', lat: -6.175, lng: 106.831, lines: ['krl-bekasi'] },
  'id-krl-033': { id: 'id-krl-033', name: 'Juanda', lat: -6.17, lng: 106.833, lines: ['krl-bekasi'] },
  'id-krl-034': { id: 'id-krl-034', name: 'Sawah Besar', lat: -6.163, lng: 106.831, lines: ['krl-bekasi'] },
  'id-krl-035': { id: 'id-krl-035', name: 'Jakarta Kota', lat: -6.135, lng: 106.826, lines: ['krl-bekasi', 'bus-corridor1'] },

  'id-bus-001': { id: 'id-bus-001', name: 'Halte Blok M', lat: -6.243, lng: 106.7982, lines: ['bus-corridor1'] },
  'id-bus-002': { id: 'id-bus-002', name: 'Halte Polda Metro Jaya', lat: -6.237, lng: 106.803, lines: ['bus-corridor1'] },
  'id-bus-003': { id: 'id-bus-003', name: 'Halte Kebayoran', lat: -6.229, lng: 106.808, lines: ['bus-corridor1'] },
  'id-bus-004': { id: 'id-bus-004', name: 'Halte Senayan', lat: -6.222, lng: 106.813, lines: ['bus-corridor1'] },
  'id-bus-005': { id: 'id-bus-005', name: 'Halte Gelora Bung Karno', lat: -6.215, lng: 106.817, lines: ['bus-corridor1'] },
  'id-bus-006': { id: 'id-bus-006', name: 'Halte Semanggi', lat: -6.208, lng: 106.821, lines: ['bus-corridor1'] },
  'id-bus-007': { id: 'id-bus-007', name: 'Halte Monas', lat: -6.199, lng: 106.824, lines: ['bus-corridor1'] },
  'id-bus-008': { id: 'id-bus-008', name: 'Halte Bundaran HI', lat: -6.188, lng: 106.829, lines: ['bus-corridor1'] },
  'id-bus-009': { id: 'id-bus-009', name: 'Halte Tosari', lat: -6.185, lng: 106.827, lines: ['bus-corridor1'] },
  'id-bus-010': { id: 'id-bus-010', name: 'Halte Sarinah', lat: -6.183, lng: 106.825, lines: ['bus-corridor1'] },
  'id-bus-011': { id: 'id-bus-011', name: 'Halte Harmoni', lat: -6.175, lng: 106.822, lines: ['bus-corridor1', 'bus-corridor2'] },
  'id-bus-012': { id: 'id-bus-012', name: 'Halte Pecenongan', lat: -6.167, lng: 106.82, lines: ['bus-corridor1'] },
  'id-bus-013': { id: 'id-bus-013', name: 'Halte Gajah Mada', lat: -6.158, lng: 106.821, lines: ['bus-corridor1'] },
  'id-bus-014': { id: 'id-bus-014', name: 'Halte Glodok', lat: -6.148, lng: 106.824, lines: ['bus-corridor1'] },
  'id-bus-015': { id: 'id-bus-015', name: 'Halte Kota', lat: -6.138, lng: 106.827, lines: ['bus-corridor1'] },
  'id-bus-016': { id: 'id-bus-016', name: 'Halte PG Cipto Mangunkusumo', lat: -6.193, lng: 106.882, lines: ['bus-corridor2'] },
  'id-bus-017': { id: 'id-bus-017', name: 'Halte Salemba UI', lat: -6.191, lng: 106.872, lines: ['bus-corridor2'] },
  'id-bus-018': { id: 'id-bus-018', name: 'Halte Salemba', lat: -6.188, lng: 106.862, lines: ['bus-corridor2'] },
  'id-bus-019': { id: 'id-bus-019', name: 'Halte Paseban', lat: -6.186, lng: 106.854, lines: ['bus-corridor2'] },
  'id-bus-020': { id: 'id-bus-020', name: 'Halte Kenari', lat: -6.184, lng: 106.849, lines: ['bus-corridor2'] },
  'id-bus-021': { id: 'id-bus-021', name: 'Halte Kramat', lat: -6.183, lng: 106.846, lines: ['bus-corridor2'] },
  'id-bus-022': { id: 'id-bus-022', name: 'Halte Senen', lat: -6.181, lng: 106.843, lines: ['bus-corridor2'] },
  'id-bus-023': { id: 'id-bus-023', name: 'Halte Kwitang', lat: -6.179, lng: 106.838, lines: ['bus-corridor2'] },
  'id-bus-024': { id: 'id-bus-024', name: 'Halte Harmoni', lat: -6.175, lng: 106.822, lines: ['bus-corridor2', 'bus-corridor1'] },
  'id-bus-025': { id: 'id-bus-025', name: 'Halte Harmoni Central', lat: -6.173, lng: 106.817, lines: ['bus-corridor2'] },
  'id-bus-026': { id: 'id-bus-026', name: 'Halte Juanda', lat: -6.169, lng: 106.824, lines: ['bus-corridor2'] },
  'id-bus-027': { id: 'id-bus-027', name: 'Halte Pintu Besar', lat: -6.158, lng: 106.827, lines: ['bus-corridor2'] },
};

// Transit lines
export const transitLines: Record<string, TransitLine> = {
  'mrt-jakarta': {
    id: 'mrt-jakarta',
    name: 'MRT Jakarta',
    color: '#CC0000',
    type: 'mrt',
    stations: ['id-mrt-001', 'id-mrt-002', 'id-mrt-003', 'id-mrt-004', 'id-mrt-005', 'id-mrt-006', 'id-mrt-007', 'id-mrt-008', 'id-mrt-009', 'id-mrt-010', 'id-mrt-011', 'id-mrt-012', 'id-mrt-013'],
    fare: 14000,
    speed: 35,
  },
  'lrt-jabodebek': {
    id: 'lrt-jabodebek',
    name: 'LRT Jabodebek',
    color: '#00AA44',
    type: 'lrt',
    stations: ['id-lrt-001', 'id-lrt-002', 'id-lrt-003', 'id-lrt-004', 'id-lrt-005', 'id-lrt-006', 'id-lrt-016', 'id-lrt-015', 'id-lrt-014', 'id-lrt-013', 'id-lrt-012', 'id-lrt-011', 'id-lrt-010', 'id-lrt-009', 'id-lrt-008', 'id-lrt-007'],
    fare: 6000,
    speed: 30,
  },
  'krl-bogor': {
    id: 'krl-bogor',
    name: 'KRL Bogor Line',
    color: '#FF6600',
    type: 'krl',
    stations: ['id-krl-001', 'id-krl-002', 'id-krl-003', 'id-krl-004', 'id-krl-005', 'id-krl-006', 'id-krl-007', 'id-krl-008', 'id-krl-009', 'id-krl-010', 'id-krl-011', 'id-krl-012', 'id-krl-013', 'id-krl-014', 'id-krl-015', 'id-krl-016', 'id-krl-017', 'id-krl-018', 'id-krl-019', 'id-krl-020'],
    fare: 14000,
    speed: 45,
  },
  'krl-bekasi': {
    id: 'krl-bekasi',
    name: 'KRL Bekasi Line',
    color: '#9966CC',
    type: 'krl',
    stations: ['id-krl-021', 'id-krl-022', 'id-krl-023', 'id-krl-024', 'id-krl-025', 'id-krl-026', 'id-krl-027', 'id-krl-028', 'id-krl-029', 'id-krl-030', 'id-krl-031', 'id-krl-032', 'id-krl-033', 'id-krl-034', 'id-krl-035'],
    fare: 10000,
    speed: 45,
  },
  'bus-corridor1': {
    id: 'bus-corridor1',
    name: 'TransJakarta Koridor 1',
    color: '#E60012',
    type: 'bus',
    stations: ['id-bus-001', 'id-bus-002', 'id-bus-003', 'id-bus-004', 'id-bus-005', 'id-bus-006', 'id-bus-007', 'id-bus-008', 'id-bus-009', 'id-bus-010', 'id-bus-011', 'id-bus-012', 'id-bus-013', 'id-bus-014', 'id-bus-015'],
    fare: 3500,
    speed: 18,
  },
  'bus-corridor2': {
    id: 'bus-corridor2',
    name: 'TransJakarta Koridor 2',
    color: '#E60012',
    type: 'bus',
    stations: ['id-bus-016', 'id-bus-017', 'id-bus-018', 'id-bus-019', 'id-bus-020', 'id-bus-021', 'id-bus-022', 'id-bus-023', 'id-bus-024', 'id-bus-025', 'id-bus-026', 'id-bus-027'],
    fare: 3500,
    speed: 18,
  },
  'lrt-jakarta': {
    id: 'lrt-jakarta',
    name: 'LRT Jakarta',
    color: '#00AA44',
    type: 'lrt',
    stations: ['id-lrt-001', 'id-lrt-002', 'id-lrt-003', 'id-lrt-004', 'id-lrt-005', 'id-lrt-006'],
    fare: 5000,
    speed: 30,
  },
};

// Helper to get all unique stations as array
export function getAllStations(): Station[] {
  return Object.values(stations);
}

// Helper to get unique station list (deduplicate shared stations like Dukuh Atas)
export function getUniqueStations(): Station[] {
  const seen = new Set<string>();
  const result: Station[] = [];
  for (const station of Object.values(stations)) {
    const key = `${station.lat.toFixed(3)},${station.lng.toFixed(3)}-${station.name.split(' ')[0]}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(station);
    }
  }
  return result;
}

// Get line color
export function getLineColor(lineId: string): string {
  return transitLines[lineId]?.color || '#666';
}

// Get line name
export function getLineName(lineId: string): string {
  return transitLines[lineId]?.name || lineId;
}

// Map bounds for Jakarta area
export const MAP_CENTER: [number, number] = [-6.2088, 106.8456];
export const MAP_ZOOM = 11;
export const MAP_BOUNDS: [[number, number], [number, number]] = [
  [-6.65, 106.68],
  [-6.08, 107.05],
];
