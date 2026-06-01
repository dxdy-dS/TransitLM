'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { findRoute, formatTime, formatFare, type TransitRoute, searchStations, type Station } from '@/lib/transit-router';
import { stations, transitLines, type TransitLine } from '@/lib/transit-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { MapPin, Train, Bus, Navigation, ArrowRightLeft, Clock, Wallet, Route, ChevronDown, ChevronUp, X, Loader2, Zap } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the map component (no SSR)
const TransitMapView = dynamic(() => import('./TransitMap'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-100">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Memuat peta transit...</p>
      </div>
    </div>
  ),
});

// Station Selector Dropdown
function StationSelector({
  label,
  value,
  onSelect,
  placeholder,
  color,
}: {
  label: string;
  value: string;
  onSelect: (station: Station) => void;
  placeholder: string;
  color: 'green' | 'red';
}) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState<Station[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = useCallback(
    (q: string) => {
      setQuery(q);
      setResults(searchStations(q));
      setIsOpen(true);
    },
    []
  );

  const handleSelect = useCallback(
    (station: Station) => {
      setQuery(station.name);
      onSelect(station);
      setIsOpen(false);
    },
    [onSelect]
  );

  const handleClear = useCallback(() => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  }, []);

  const borderColor = color === 'green' ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500';

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-foreground mb-1.5">{label}</label>
      <div className="relative">
        <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${color === 'green' ? 'text-green-500' : 'text-red-500'}`} />
        <Input
          className={`pl-10 pr-10 ${borderColor}`}
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => { if (query) setIsOpen(true); }}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />
        {query && (
          <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-popover border rounded-md shadow-lg max-h-64 overflow-y-auto">
          {results.slice(0, 10).map((station) => (
            <button
              key={station.id}
              className="w-full text-left px-3 py-2 hover:bg-accent flex items-center gap-2 text-sm"
              onMouseDown={() => handleSelect(station)}
            >
              <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="font-medium truncate">{station.name}</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 ml-auto shrink-0">
                {station.lines.map(l => {
                  const type = transitLines[l]?.type;
                  return type === 'mrt' ? 'MRT' : type === 'lrt' ? 'LRT' : type === 'krl' ? 'KRL' : 'BUS';
                }).join(', ')}
              </Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Route Result Card
function RouteResultCard({
  route,
  index,
  isSelected,
  onSelect,
  onFlyToRoute,
}: {
  route: TransitRoute;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onFlyToRoute: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const tag = index === 0 ? 'Tercepat' : `Opsi ${index + 1}`;
  const tagColor = index === 0 ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 ${isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md border-border'}`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge className={tagColor} variant="outline">
              {tag}
            </Badge>
            {route.transfers > 0 && (
              <Badge variant="secondary" className="text-xs">
                <ArrowRightLeft className="h-3 w-3 mr-1" />
                {route.transfers} transfer
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Route className="h-3.5 w-3.5" />
            {route.totalStations} halte
          </div>
        </div>

        {/* Line badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {route.segments.map((seg, i) => (
            <div key={seg.lineId} className="flex items-center gap-1">
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: seg.lineColor }}
              >
                {seg.lineName}
              </span>
              {i < route.segments.length - 1 && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-muted-foreground">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              )}
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Waktu</p>
              <p className="text-sm font-semibold">{formatTime(route.totalTime)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50">
              <Wallet className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tarif</p>
              <p className="text-sm font-semibold">{formatFare(route.totalFare)}</p>
            </div>
          </div>
        </div>

        {/* Expand station list */}
        <button
          className="mt-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground w-full"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {expanded ? 'Sembunyikan' : 'Lihat detail halte'}
        </button>

        {expanded && (
          <div className="mt-2 space-y-1">
            <Separator className="my-2" />
            {route.segments.map((seg, segIdx) => (
              <div key={`${seg.lineId}-${segIdx}`} className="mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.lineColor }} />
                  <span className="text-xs font-medium" style={{ color: seg.lineColor }}>
                    {seg.lineName}
                  </span>
                </div>
                <div className="pl-4 space-y-0.5">
                  {seg.stationNames.map((name, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs py-0.5">
                      <div
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: i === 0 || i === seg.stationNames.length - 1 ? seg.lineColor : '#ccc',
                        }}
                      />
                      <span className={i === 0 || i === seg.stationNames.length - 1 ? 'font-medium' : 'text-muted-foreground'}>
                        {name}
                      </span>
                    </div>
                  ))}
                </div>
                {segIdx < route.segments.length - 1 && (
                  <div className="flex items-center gap-2 mt-1 ml-2">
                    <div className="w-4 h-px bg-amber-500" />
                    <span className="text-[10px] text-amber-600 font-medium">Transfer</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Fly to button */}
        <Button
          variant="outline"
          size="sm"
          className="mt-3 w-full text-xs"
          onClick={(e) => {
            e.stopPropagation();
            onFlyToRoute();
          }}
        >
          <Navigation className="h-3.5 w-3.5 mr-1" />
          Lihat di Peta
        </Button>
      </CardContent>
    </Card>
  );
}

export default function JelajahID() {
  const [startStation, setStartStation] = useState<Station | null>(null);
  const [endStation, setEndStation] = useState<Station | null>(null);
  const [routes, setRoutes] = useState<TransitRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<number>(0);
  const [isSearching, setIsSearching] = useState(false);
  const [showLines, setShowLines] = useState(true);
  const [fitToRoute, setFitToRoute] = useState<string[]>([]);

  // Search for routes
  const handleSearch = useCallback(() => {
    if (!startStation || !endStation) return;
    setIsSearching(true);
    
    setTimeout(() => {
      const found = findRoute(startStation.id, endStation.id);
      setRoutes(found);
      setSelectedRoute(0);
      setIsSearching(false);
      
      if (found.length > 0) {
        setFitToRoute(found[0].segments.flatMap(s => s.stationIds));
      }
    }, 100);
  }, [startStation, endStation]);

  // Handle map station click
  const handleMapStationClick = useCallback(
    (station: Station) => {
      if (!startStation) {
        setStartStation(station);
      } else if (!endStation) {
        setEndStation(station);
      } else {
        setStartStation(station);
        setEndStation(null);
        setRoutes([]);
      }
    },
    [startStation, endStation]
  );

  // Swap stations
  const handleSwap = useCallback(() => {
    setStartStation(endStation);
    setEndStation(startStation);
    setRoutes([]);
  }, [startStation, endStation]);

  // Get selected route polyline station IDs
  const routeStationIds = useMemo(() => {
    if (routes.length === 0 || selectedRoute >= routes.length) return [];
    return routes[selectedRoute].segments.flatMap(s => s.stationIds);
  }, [routes, selectedRoute]);

  // Transfer station IDs
  const transferStationIds = useMemo(() => {
    if (routes.length === 0 || selectedRoute >= routes.length) return [];
    const route = routes[selectedRoute];
    const transferIds: string[] = [];
    for (let i = 0; i < route.segments.length - 1; i++) {
      const currentSeg = route.segments[i];
      const nextSeg = route.segments[i + 1];
      const lastCurrent = currentSeg.stationIds[currentSeg.stationIds.length - 1];
      const firstNext = nextSeg.stationIds[0];
      transferIds.push(lastCurrent, firstNext);
    }
    return [...new Set(transferIds)];
  }, [routes, selectedRoute]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-red-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
              JR
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-red-600 to-emerald-600 bg-clip-text text-transparent">
                JelajahID
              </h1>
              <p className="text-[11px] text-muted-foreground -mt-0.5">Peta Transit Jabodetabek</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showLines ? 'default' : 'outline'}
              size="sm"
              className="text-xs"
              onClick={() => setShowLines(!showLines)}
            >
              <Route className="h-3.5 w-3.5 mr-1" />
              {showLines ? 'Sembunyikan' : 'Tampilkan'} Rute
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-57px)]">
        {/* Sidebar */}
        <aside className="w-full lg:w-96 bg-white border-r flex flex-col shrink-0">
          {/* Search panel */}
          <div className="p-4 space-y-3 border-b bg-gradient-to-b from-white to-slate-50/50">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Navigation className="h-4 w-4 text-primary" />
              Rencana Perjalanan
            </h2>

            <div className="relative">
              <StationSelector
                label="Stasiun Asal"
                value={startStation?.name || ''}
                onSelect={setStartStation}
                placeholder="Cari stasiun asal..."
                color="green"
              />
              <StationSelector
                label="Stasiun Tujuan"
                value={endStation?.name || ''}
                onSelect={setEndStation}
                placeholder="Cari stasiun tujuan..."
                color="red"
              />

              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-[38px] z-10 h-7 w-7"
                onClick={handleSwap}
                disabled={!startStation && !endStation}
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
              </Button>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium"
              onClick={handleSearch}
              disabled={!startStation || !endStation || isSearching}
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mencari rute...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Cari Rute
                </>
              )}
            </Button>

            <p className="text-[11px] text-muted-foreground text-center">
              Klik peta untuk memilih stasiun, atau ketik nama stasiun
            </p>
          </div>

          {/* Results */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {routes.length === 0 && !isSearching && startStation && endStation && (
                <div className="text-center py-8 text-muted-foreground">
                  <Route className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Tidak ditemukan rute langsung.</p>
                  <p className="text-xs">Coba stasiun lain yang lebih dekat.</p>
                </div>
              )}

              {routes.length > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">
                      {routes.length} Rute Ditemukan
                    </h3>
                  </div>
                  {routes.map((route, idx) => (
                    <RouteResultCard
                      key={idx}
                      route={route}
                      index={idx}
                      isSelected={selectedRoute === idx}
                      onSelect={() => setSelectedRoute(idx)}
                      onFlyToRoute={() => {
                        setSelectedRoute(idx);
                        setFitToRoute(route.segments.flatMap(s => s.stationIds));
                      }}
                    />
                  ))}
                </>
              )}

              {routes.length === 0 && !startStation && !endStation && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-100 to-emerald-100 flex items-center justify-center">
                    <Train className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-base font-semibold mb-1">Selamat Datang!</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Pilih stasiun asal dan tujuan untuk menemukan rute perjalanan terbaik di Jabodetabek menggunakan MRT, LRT, KRL, dan TransJakarta.
                  </p>
                  
                  <Separator className="my-6" />
                  
                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                      <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center mb-2">
                        <Train className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-xs font-semibold text-red-800">MRT Jakarta</p>
                      <p className="text-[10px] text-red-600">13 stasiun</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center mb-2">
                        <Train className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-xs font-semibold text-emerald-800">LRT Jabodebek</p>
                      <p className="text-[10px] text-emerald-600">16 stasiun</p>
                    </div>
                    <div className="p-3 rounded-xl bg-orange-50 border border-orange-100">
                      <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center mb-2">
                        <Train className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-xs font-semibold text-orange-800">KRL Commuter</p>
                      <p className="text-[10px] text-orange-600">35 stasiun</p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                      <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center mb-2">
                        <Bus className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-xs font-semibold text-blue-800">TransJakarta</p>
                      <p className="text-[10px] text-blue-600">27 halte</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </aside>

        {/* Map */}
        <main className="flex-1 relative">
          <TransitMapView
            startStation={startStation}
            endStation={endStation}
            onStationClick={handleMapStationClick}
            showLines={showLines}
            selectedRoute={routes.length > 0 && selectedRoute < routes.length ? routes[selectedRoute] : null}
            routeStationIds={routeStationIds}
            transferStationIds={transferStationIds}
            fitToRoute={fitToRoute}
          />
        </main>
      </div>
    </div>
  );
}
