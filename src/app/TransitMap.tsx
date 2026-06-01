'use client';

import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap, useMapEvents } from 'react-leaflet';
import { stations, transitLines, MAP_CENTER, MAP_ZOOM, getUniqueStations, type Station } from '@/lib/transit-data';
import type { TransitRoute } from '@/lib/transit-router';

// Fix leaflet default icon issue
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

function createColoredIcon(color: string, size = 28) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: ${size}px; height: ${size}px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function createStartIcon() {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 32px; height: 32px;
      background: #22c55e;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
      font-weight: bold; color: white; font-size: 14px;
    ">A</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
  });
}

function createEndIcon() {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 32px; height: 32px;
      background: #ef4444;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
      font-weight: bold; color: white; font-size: 14px;
    ">B</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
  });
}

function createTransferIcon() {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 24px; height: 24px;
      background: #f59e0b;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">&#8644;</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });
}

// Map click handler
function MapClickHandler({ onSelect }: { onSelect: (station: Station) => void }) {
  useMapEvents({
    click(e) {
      let nearest: Station | null = null;
      let minDist = Infinity;
      for (const station of Object.values(stations)) {
        const dist = Math.sqrt(
          Math.pow(station.lat - e.latlng.lat, 2) + Math.pow(station.lng - e.latlng.lng, 2)
        );
        if (dist < minDist && dist < 0.008) {
          minDist = dist;
          nearest = station;
        }
      }
      if (nearest) onSelect(nearest);
    },
  });
  return null;
}

// Fit bounds to route
function FitBounds({ stationIds }: { stationIds: string[] }) {
  const map = useMap();
  useEffect(() => {
    if (stationIds.length === 0) return;
    const bounds: L.LatLngBounds = L.latLngBounds([]);
    for (const id of stationIds) {
      const s = stations[id];
      if (s) bounds.extend([s.lat, s.lng]);
    }
    if (bounds.isValid()) {
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1 });
    }
  }, [map, stationIds]);
  return null;
}

interface TransitMapProps {
  startStation: Station | null;
  endStation: Station | null;
  onStationClick: (station: Station) => void;
  showLines: boolean;
  selectedRoute: TransitRoute | null;
  routeStationIds: string[];
  transferStationIds: string[];
  fitToRoute: string[];
}

export default function TransitMap({
  startStation,
  endStation,
  onStationClick,
  showLines,
  selectedRoute,
  routeStationIds,
  transferStationIds,
  fitToRoute,
}: TransitMapProps) {
  // Get unique stations for markers
  const uniqueStations = useMemo(() => getUniqueStations(), []);

  // Route polylines
  const routePolylines = useMemo(() => {
    if (!selectedRoute) return [];
    return selectedRoute.segments.map((seg) =>
      seg.stationIds.map((id) => {
        const s = stations[id];
        return s ? [s.lat, s.lng] as [number, number] : [0, 0] as [number, number];
      })
    );
  }, [selectedRoute]);

  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={MAP_ZOOM}
      className="h-full w-full"
      zoomControl={false}
      style={{ minHeight: '400px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapClickHandler onSelect={onStationClick} />

      {/* Fit to route */}
      {fitToRoute.length > 0 && <FitBounds stationIds={fitToRoute} />}

      {/* Transit lines */}
      {showLines &&
        Object.values(transitLines).map((line) => (
          <Polyline
            key={line.id}
            positions={line.stations
              .map((id) => {
                const s = stations[id];
                return s ? [s.lat, s.lng] as [number, number] : null;
              })
              .filter(Boolean) as [number, number][]}
            pathOptions={{
              color: line.color,
              weight: 4,
              opacity: selectedRoute ? 0.2 : 0.6,
            }}
          />
        ))}

      {/* Route polylines */}
      {routePolylines.map((coords, idx) => {
        const color = selectedRoute?.segments[idx]?.lineColor || '#333';
        return (
          <Polyline
            key={`route-${idx}`}
            positions={coords}
            pathOptions={{
              color,
              weight: 6,
              opacity: 0.9,
            }}
          />
        );
      })}

      {/* Station markers */}
      {showLines &&
        uniqueStations.map((station) => {
          const isActive = routeStationIds.includes(station.id);
          return (
            <Marker
              key={station.id}
              position={[station.lat, station.lng]}
              icon={createColoredIcon(
                station.lines[0] ? transitLines[station.lines[0]]?.color || '#666' : '#666',
                isActive ? 14 : 8
              )}
              opacity={isActive ? 1 : 0.5}
            >
              <Popup>
                <div className="text-xs">
                  <p className="font-bold">{station.name}</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {station.lines.map((l) => (
                      <span
                        key={l}
                        className="inline-block px-1.5 py-0.5 rounded text-white text-[10px]"
                        style={{ backgroundColor: transitLines[l]?.color || '#666' }}
                      >
                        {transitLines[l]?.name || l}
                      </span>
                    ))}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

      {/* Start marker */}
      {startStation && (
        <Marker
          position={[startStation.lat, startStation.lng]}
          icon={createStartIcon()}
        >
          <Popup>
            <div className="text-xs">
              <p className="font-bold text-green-600">Asal: {startStation.name}</p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* End marker */}
      {endStation && (
        <Marker
          position={[endStation.lat, endStation.lng]}
          icon={createEndIcon()}
        >
          <Popup>
            <div className="text-xs">
              <p className="font-bold text-red-600">Tujuan: {endStation.name}</p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Transfer markers */}
      {transferStationIds.map((id) => {
        const s = stations[id];
        if (!s) return null;
        return (
          <Marker key={`transfer-${id}`} position={[s.lat, s.lng]} icon={createTransferIcon()}>
            <Popup>
              <div className="text-xs">
                <p className="font-bold text-amber-600">Transfer: {s.name}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Map legend */}
      <div className="leaflet-bottom leaflet-left">
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border max-w-[200px]">
          <p className="text-[11px] font-semibold mb-2">Jaringan Transit</p>
          <div className="space-y-1.5">
            {Object.entries(transitLines).map(([id, line]) => (
              <div key={id} className="flex items-center gap-2 text-[11px]">
                <div className="w-4 h-1 rounded-full shrink-0" style={{ backgroundColor: line.color }} />
                <span className="truncate">{line.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MapContainer>
  );
}
