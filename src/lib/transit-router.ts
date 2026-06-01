// JelajahID - Transit Routing Engine
// BFS-based multi-modal transit routing for Jakarta area

import { stations, transitLines, type Station } from './transit-data';

export interface RouteSegment {
  lineId: string;
  lineName: string;
  lineColor: string;
  stationIds: string[];
  stationNames: string[];
  distance: number;
  time: number; // minutes
  fare: number;
}

export interface TransitRoute {
  segments: RouteSegment[];
  totalStations: number;
  totalDistance: number;
  totalTime: number;
  totalFare: number;
  transfers: number;
}

// Build adjacency graph from station data
function buildGraph(): Map<string, Set<string>> {
  const graph = new Map<string, Set<string>>();
  
  // Initialize all station nodes
  for (const stationId of Object.keys(stations)) {
    graph.set(stationId, new Set<string>());
  }
  
  // Add edges based on transit line sequences
  for (const line of Object.values(transitLines)) {
    for (let i = 0; i < line.stations.length; i++) {
      const current = line.stations[i];
      const station = stations[current];
      if (!station) continue;
      
      // If station already has an entry for this line, use that
      if (!graph.has(current)) {
        graph.set(current, new Set<string>());
      }
      
      if (i > 0) {
        const prev = line.stations[i - 1];
        // Find the canonical ID for the previous station
        const prevCanonical = findCanonicalStation(prev, current, line.stations);
        graph.get(current)?.add(prevCanonical);
        graph.get(prevCanonical)?.add(current);
      }
      if (i < line.stations.length - 1) {
        const next = line.stations[i + 1];
        const nextCanonical = findCanonicalStation(next, current, line.stations);
        graph.get(current)?.add(nextCanonical);
        graph.get(nextCanonical)?.add(current);
      }
    }
  }
  
  return graph;
}

// Find canonical station ID (for shared stations like Dukuh Atas)
function findCanonicalStation(stationId: string, context: string, lineStations: string[]): string {
  // Check if this station shares a location with another station
  const station = stations[stationId];
  if (!station) return stationId;
  
  // Find all stations at the same approximate location
  for (const [id, s] of Object.entries(stations)) {
    if (id === stationId) continue;
    if (Math.abs(s.lat - station.lat) < 0.002 && Math.abs(s.lng - station.lng) < 0.002) {
      // They're at the same location - use the one that appears in the current line
      if (lineStations.includes(id)) return id;
    }
  }
  return stationId;
}

// Haversine distance between two coordinates
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// BFS to find shortest path (in terms of number of segments/transfers)
function findShortestPath(
  startId: string,
  endId: string
): { stationIds: string[]; lineId: string } | null {
  // Find actual station IDs
  const startStation = resolveStationId(startId);
  const endStation = resolveStationId(endId);
  
  if (!startStation || !endStation) return null;
  if (startStation === endStation) return null;
  
  // BFS through the graph, tracking which line we're on
  const graph = buildGraph();
  const visited = new Set<string>();
  const queue: Array<{ stationId: string; path: string[]; lineId: string }> = [];
  
  // Start from all lines passing through the start station
  const startSt = stations[startStation];
  for (const lineId of startSt.lines) {
    queue.push({ stationId: startStation, path: [startStation], lineId });
  }
  
  let best: { stationIds: string[]; lineId: string } | null = null;
  
  while (queue.length > 0) {
    const { stationId, path, lineId } = queue.shift()!;
    
    if (visited.has(`${stationId}-${lineId}`)) continue;
    visited.add(`${stationId}-${lineId}`);
    
    const currentStation = stations[stationId];
    if (!currentStation) continue;
    
    if (stationId === endStation) {
      if (!best || path.length < best.stationIds.length) {
        best = { stationIds: path, lineId };
      }
      continue;
    }
    
    // Continue on same line
    const line = transitLines[lineId];
    if (line) {
      const idx = line.stations.indexOf(stationId);
      if (idx >= 0) {
        if (idx > 0) {
          const prev = line.stations[idx - 1];
          if (!path.includes(prev)) {
            queue.push({ stationId: prev, path: [...path, prev], lineId });
          }
        }
        if (idx < line.stations.length - 1) {
          const next = line.stations[idx + 1];
          if (!path.includes(next)) {
            queue.push({ stationId: next, path: [...path, next], lineId });
          }
        }
      }
    }
    
    // Try switching lines at this station (transfer)
    for (const newLineId of currentStation.lines) {
      if (newLineId === lineId) continue;
      // Allow transfer but don't count the station twice
      const newLine = transitLines[newLineId];
      if (newLine) {
        for (const nextStation of newLine.stations) {
          if (nextStation !== stationId && !path.includes(nextStation)) {
            queue.push({ stationId: nextStation, path: [...path, nextStation], lineId: newLineId });
          }
        }
      }
    }
  }
  
  return best;
}

// Resolve station ID - find the actual station data entry
function resolveStationId(inputId: string): string | null {
  if (stations[inputId]) return inputId;
  
  // Try to find by name
  const input = inputId.toLowerCase();
  for (const [id, station] of Object.entries(stations)) {
    if (station.name.toLowerCase().includes(input) || input.includes(station.name.toLowerCase())) {
      return id;
    }
  }
  
  return null;
}

// Find route using line-based BFS
export function findRoute(startId: string, endId: string): TransitRoute[] {
  const startStation = resolveStationId(startId);
  const endStation = resolveStationId(endId);
  
  if (!startStation || !endStation) return [];
  if (startStation === endStation) return [];
  
  // Find all lines that contain start and end stations
  const startLines = stations[startStation]?.lines || [];
  const endLines = stations[endStation]?.lines || [];
  
  const routes: TransitRoute[] = [];
  const foundPaths = new Set<string>();
  
  // Strategy 1: Direct route on same line
  for (const lineId of startLines) {
    if (endLines.includes(lineId)) {
      const line = transitLines[lineId];
      if (!line) continue;
      const startIdx = line.stations.indexOf(startStation);
      const endIdx = line.stations.indexOf(endStation);
      if (startIdx >= 0 && endIdx >= 0 && startIdx !== endIdx) {
        const segmentStations = line.stations.slice(
          Math.min(startIdx, endIdx),
          Math.max(startIdx, endIdx) + 1
        );
        const route = buildRouteFromStations(segmentStations, lineId);
        if (route) {
          const key = route.segments.map(s => s.lineId).join('+');
          if (!foundPaths.has(key)) {
            foundPaths.add(key);
            routes.push(route);
          }
        }
      }
    }
  }
  
  // Strategy 2: One-transfer routes
  for (const startLineId of startLines) {
    for (const endLineId of endLines) {
      if (startLineId === endLineId) continue;
      
      const startLine = transitLines[startLineId];
      const endLine = transitLines[endLineId];
      if (!startLine || !endLine) continue;
      
      // Find transfer station
      const transferStations = findTransferStations(startLineId, endLineId);
      for (const transfer of transferStations) {
        if (transfer === startStation || transfer === endStation) continue;
        
        const seg1Stations = getOrderedSegment(startLine, startStation, transfer);
        const seg2Stations = getOrderedSegment(endLine, transfer, endStation);
        
        if (seg1Stations && seg2Stations) {
          const segment1 = buildSegment(seg1Stations, startLineId);
          const segment2 = buildSegment(seg2Stations, endLineId);
          if (segment1 && segment2) {
            const route: TransitRoute = {
              segments: [segment1, segment2],
              totalStations: segment1.stationIds.length + segment2.stationIds.length - 1,
              totalDistance: segment1.distance + segment2.distance,
              totalTime: segment1.time + segment2.time + 5, // 5 min transfer
              totalFare: segment1.fare + segment2.fare,
              transfers: 1,
            };
            const key = route.segments.map(s => s.lineId).join('+');
            if (!foundPaths.has(key)) {
              foundPaths.add(key);
              routes.push(route);
            }
          }
        }
      }
    }
  }
  
  // Strategy 3: Two-transfer routes (if no shorter routes found)
  if (routes.length === 0) {
    for (const startLineId of startLines) {
      for (const midLineId of Object.keys(transitLines)) {
        if (midLineId === startLineId) continue;
        for (const endLineId of endLines) {
          if (endLineId === midLineId) continue;
          
          const midTransfers1 = findTransferStations(startLineId, midLineId);
          for (const transfer1 of midTransfers1) {
            if (transfer1 === startStation) continue;
            
            const midTransfers2 = findTransferStations(midLineId, endLineId);
            for (const transfer2 of midTransfers2) {
              if (transfer2 === endStation || transfer2 === transfer1) continue;
              
              const seg1 = getOrderedSegment(transitLines[startLineId], startStation, transfer1);
              const seg2 = getOrderedSegment(transitLines[midLineId], transfer1, transfer2);
              const seg3 = getOrderedSegment(transitLines[endLineId], transfer2, endStation);
              
              if (seg1 && seg2 && seg3) {
                const s1 = buildSegment(seg1, startLineId);
                const s2 = buildSegment(seg2, midLineId);
                const s3 = buildSegment(seg3, endLineId);
                if (s1 && s2 && s3) {
                  const route: TransitRoute = {
                    segments: [s1, s2, s3],
                    totalStations: s1.stationIds.length + s2.stationIds.length + s3.stationIds.length - 2,
                    totalDistance: s1.distance + s2.distance + s3.distance,
                    totalTime: s1.time + s2.time + s3.time + 10, // 10 min total transfers
                    totalFare: s1.fare + s2.fare + s3.fare,
                    transfers: 2,
                  };
                  const key = route.segments.map(s => s.lineId).join('+');
                  if (!foundPaths.has(key)) {
                    foundPaths.add(key);
                    routes.push(route);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  
  // Sort by total time
  routes.sort((a, b) => a.totalTime - b.totalTime);
  
  return routes.slice(0, 5);
}

// Find stations where two lines intersect
function findTransferStations(lineId1: string, lineId2: string): string[] {
  const line1 = transitLines[lineId1];
  const line2 = transitLines[lineId2];
  if (!line1 || !line2) return [];
  
  return line1.stations.filter(s => line2.stations.includes(s));
}

// Get ordered station sequence from start to end on a line
function getOrderedSegment(line: TransitLine, startStation: string, endStation: string): string[] | null {
  const startIdx = line.stations.indexOf(startStation);
  const endIdx = line.stations.indexOf(endStation);
  
  if (startIdx < 0 || endIdx < 0) return null;
  
  if (startIdx <= endIdx) {
    return line.stations.slice(startIdx, endIdx + 1);
  } else {
    return line.stations.slice(endIdx, startIdx + 1).reverse();
  }
}

// Build a single route segment
function buildSegment(stationIds: string[], lineId: string): RouteSegment | null {
  const line = transitLines[lineId];
  if (!line) return null;
  
  let totalDistance = 0;
  for (let i = 0; i < stationIds.length - 1; i++) {
    const s1 = stations[stationIds[i]];
    const s2 = stations[stationIds[i + 1]];
    if (s1 && s2) {
      totalDistance += haversineDistance(s1.lat, s1.lng, s2.lat, s2.lng);
    }
  }
  
  const time = Math.round((totalDistance / line.speed) * 60);
  
  return {
    lineId,
    lineName: line.name,
    lineColor: line.color,
    stationIds,
    stationNames: stationIds.map(id => stations[id]?.name || id),
    distance: Math.round(totalDistance * 10) / 10,
    time: Math.max(time, stationIds.length - 1), // at least 1 min per stop
    fare: line.fare,
  };
}

// Build a complete route from ordered stations on a single line
function buildRouteFromStations(stationIds: string[], lineId: string): TransitRoute | null {
  const segment = buildSegment(stationIds, lineId);
  if (!segment) return null;
  
  return {
    segments: [segment],
    totalStations: stationIds.length,
    totalDistance: segment.distance,
    totalTime: segment.time,
    totalFare: segment.fare,
    transfers: 0,
  };
}

// Format time in Indonesian style
export function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} menit`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours} jam ${mins} menit` : `${hours} jam`;
}

// Format fare in Indonesian Rupiah
export function formatFare(fare: number): string {
  return `Rp ${fare.toLocaleString('id-ID')}`;
}

// Get station by ID
export function getStation(stationId: string): Station | undefined {
  return stations[stationId];
}

// Search stations by name
export function searchStations(query: string): Station[] {
  const q = query.toLowerCase().trim();
  if (!q) return getAllStationsList();
  
  return getAllStationsList().filter(
    s =>
      s.name.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
  );
}

function getAllStationsList(): Station[] {
  const seen = new Set<string>();
  const result: Station[] = [];
  for (const station of Object.values(stations)) {
    const key = `${station.lat.toFixed(2)},${station.lng.toFixed(2)}-${station.name}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(station);
    }
  }
  return result.sort((a, b) => a.name.localeCompare(b.name));
}
