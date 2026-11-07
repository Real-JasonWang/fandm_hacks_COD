import React, { useState, useEffect, useRef } from 'react';
import type { AppSettings, Restroom } from '../types';
import { RESTROOMS, FILTERS, getDistanceMeters, FM_CAMPUS_DEFAULT } from '../data/appleData';

interface MapTabProps {
  settings: AppSettings;
  onOpenRestroom: (restroom: Restroom) => void;
}

interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  isReal: boolean;
  presetName?: string;
}

const PRESET_LOCATIONS: { name: string; lat: number; lng: number }[] = [
  { name: 'College Green (Quad)', lat: 40.0475, lng: -76.3190 },
  { name: 'Steinman Dining (SCC)', lat: 40.0462, lng: -76.3195 },
  { name: 'Shadek Library', lat: 40.0463, lng: -76.3210 },
  { name: 'Alumni Sports (ASFC)', lat: 40.0512, lng: -76.3192 },
  { name: 'Brooks House (Buchanan)', lat: 40.0479, lng: -76.3160 },
  { name: 'Ware House (North Ben)', lat: 40.0498, lng: -76.3158 },
];

export const MapTab: React.FC<MapTabProps> = ({ settings, onOpenRestroom }) => {
  const [activeFilter, setActiveFilter] = useState<string>('any');
  const [sortBy, setSortBy] = useState<'distance' | 'name'>('distance');

  // Zoom & Pan state for the map
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // User GPS Location State
  const [userLocation, setUserLocation] = useState<UserLocation>({
    lat: FM_CAMPUS_DEFAULT.lat,
    lng: FM_CAMPUS_DEFAULT.lng,
    accuracy: 10,
    isReal: false,
    presetName: 'College Green (Quad)',
  });
  const [showLocationPicker, setShowLocationPicker] = useState<boolean>(false);

  // Initialize and watch real device GPS
  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          // Check if reasonably near Lancaster F&M (39.9 to 40.2, -76.45 to -76.15)
          const isNearFm =
            latitude >= 39.95 && latitude <= 40.15 && longitude >= -76.45 && longitude <= -76.15;

          setUserLocation({
            lat: latitude,
            lng: longitude,
            accuracy,
            isReal: true,
            presetName: isNearFm ? 'Live GPS (Campus)' : 'Live GPS (Off-Campus)',
          });
        },
        (err) => {
          console.log('GPS watch warning/denied, fallback to campus center', err.message);
          setUserLocation({
            lat: FM_CAMPUS_DEFAULT.lat,
            lng: FM_CAMPUS_DEFAULT.lng,
            accuracy: 12,
            isReal: false,
            presetName: 'College Green (Quad)',
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Filter restrooms
  const filteredRestrooms = RESTROOMS.filter((r) => {
    if (activeFilter === 'any') return true;
    if (activeFilter === 'all') return r.all;
    if (activeFilter === 'acc') return r.acc;
    if (activeFilter === 'per') return r.per;
    if (activeFilter === 'single') return r.single;
    if (activeFilter === 'baby') return r.baby;
    return true;
  });

  // Calculate dynamic distance & walking time for each restroom
  const restroomsWithDistance = filteredRestrooms.map((r) => {
    const distMeters = getDistanceMeters(
      userLocation.lat,
      userLocation.lng,
      r.lat || 40.0475,
      r.lng || -76.3190
    );
    const walkMins = Math.max(1, Math.round(distMeters / 80));
    return {
      ...r,
      distMeters,
      walkMins,
    };
  });

  // Sort restrooms
  const sortedRestrooms = [...restroomsWithDistance].sort((a, b) => {
    if (sortBy === 'distance') {
      return a.distMeters - b.distMeters;
    }
    return a.b.localeCompare(b.b);
  });

  // Recommended nearest restroom
  const nearestRestroom = [...restroomsWithDistance].sort((a, b) => a.distMeters - b.distMeters)[0];

  const getStatus = (id: string) => {
    const rep = settings.reports[id];
    if (!rep) return null;
    if (rep.maintenance && rep.maintenance >= 1) {
      return { cls: 't-peach', short: '🔧 Maintenance', dot: '#D9483F', text: 'Attention needed' };
    }
    if (rep.clean >= 2) {
      return { cls: 't-peach', short: '🧽 Needs cleaning', dot: '#FF9F6B', text: 'Cleaning requested' };
    }
    if (rep.supplies >= 1) {
      return { cls: 't-sun', short: '🧻 Low supplies', dot: '#FFC94A', text: 'Low supplies' };
    }
    if (rep.ok >= 1) {
      return { cls: 't-mint', short: '✨ Clean ✓', dot: '#23A27E', text: 'Clean & stocked' };
    }
    return null;
  };

  // Convert GPS (lat, lng) to SVG coordinate (x, y)
  const gpsToSvg = (lat: number, lng: number): { x: number; y: number } => {
    const latMin = 40.0440;
    const latMax = 40.0535;
    const lngMin = -76.3235;
    const lngMax = -76.3150;

    const yRatio = (latMax - lat) / (latMax - latMin);
    const y = 60 + yRatio * (820 - 60);

    const xRatio = (lng - lngMin) / (lngMax - lngMin);
    const x = 120 + xRatio * (610 - 120);

    return {
      x: Math.max(50, Math.min(670, x)),
      y: Math.max(50, Math.min(830, y)),
    };
  };

  const userSvgPos = gpsToSvg(userLocation.lat, userLocation.lng);

  // Zoom handlers
  const handleZoomIn = () => setZoom((z) => Math.min(2.2, +(z + 0.35).toFixed(2)));
  const handleZoomOut = () => {
    setZoom((z) => {
      const next = Math.max(1.0, +(z - 0.35).toFixed(2));
      if (next === 1.0) setPan({ x: 0, y: 0 });
      return next;
    });
  };
  const handleRecenter = () => {
    setZoom(1.35);
    // Center viewport on user position
    const offsetX = (360 - userSvgPos.x) * 0.45;
    const offsetY = (430 - userSvgPos.y) * 0.45;
    setPan({ x: offsetX, y: offsetY });
  };
  const handleResetView = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  // Drag pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1.0) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1.0) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };
  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="apple-view space-y-3 pb-24">
      {/* Page Header */}
      <div>
        <h1 className="text-[27px] font-black tracking-tight text-[var(--ink)]">
          Bathroom reports
        </h1>
        <p className="text-[14px] font-semibold text-[var(--ink2)]">
          Live student crowdsourced reports, cleanliness tracking, and amenity status on F&amp;M campus.
        </p>
      </div>

      {/* Filter Horizontal Scroll */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`apple-chip ${activeFilter === f.id ? 'on' : ''}`}
            onClick={() => setActiveFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Recommended Nearest Restroom Hero Card (Dynamic GPS Driven) */}
      {nearestRestroom && (
        <div
          className="apple-card my-0 p-4 border border-[var(--mint-d)]/30 bg-gradient-to-r from-[#F0FAF5] to-[#FFFDF9] shadow-[var(--shadow)] flex items-center justify-between gap-3 cursor-pointer hover:scale-[1.01] transition-transform"
          onClick={() => onOpenRestroom(nearestRestroom)}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-[var(--mint-l)] text-[24px] grid place-items-center flex-none shadow-sm">
              ⚡
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-[var(--mint-l)] text-[#166E53] uppercase tracking-wide">
                  Recommended Nearest
                </span>
                <span className="text-[11px] font-extrabold text-[var(--muted)]">
                  📍 {nearestRestroom.distMeters}m ({nearestRestroom.walkMins} min walk)
                </span>
              </div>
              <b className="text-[16px] font-black text-[var(--ink)] block truncate leading-snug mt-0.5">
                {nearestRestroom.b}
              </b>
              <span className="text-[12px] font-bold text-[var(--ink2)] block truncate">
                {nearestRestroom.f} · {nearestRestroom.all ? 'All-Gender' : 'Standard'}
              </span>
            </div>
          </div>

          <div className="flex-none">
            <button
              type="button"
              className="apple-btn-primary py-2 px-3.5 text-[12.5px] font-black shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                onOpenRestroom(nearestRestroom);
              }}
            >
              Go / Report →
            </button>
          </div>
        </div>
      )}

      {/* Cute Illustrated Interactive Campus Map Container */}
      <div className="apple-card p-0 overflow-hidden border border-[var(--line)] shadow-[var(--shadow)] bg-[#F8F5EE] relative">
        {/* Map Top Header Bar */}
        <div className="p-3 bg-[#FFFDF9] border-b border-[var(--line)] flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[19px]">🗺️</span>
            <div>
              <b className="text-[14px] font-black text-[var(--ink)] block leading-tight">
                F&amp;M Campus Restrooms Map
              </b>
              <span className="text-[11px] font-bold text-[var(--muted)]">
                Franklin &amp; Marshall Concept3D Spatial Layout
              </span>
            </div>
          </div>

          {/* GPS Live Status Indicator & Preset Trigger */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--card)] border border-[var(--line)] text-[11px] font-extrabold text-[var(--ink)] shadow-xs hover:bg-[#FAF7F0]"
              onClick={() => setShowLocationPicker(!showLocationPicker)}
              title="Change simulated GPS location"
            >
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
              <span>{userLocation.presetName || (userLocation.isReal ? 'Live GPS' : 'Campus GPS')}</span>
              <span className="text-[10px] text-[var(--muted)]">▾</span>
            </button>
          </div>
        </div>

        {/* Location Simulator Dropdown Picker */}
        {showLocationPicker && (
          <div className="p-3 bg-[#FFFDF8] border-b border-[var(--line)] text-[12px] animate-in fade-in duration-150">
            <div className="flex items-center justify-between mb-2">
              <span className="font-black text-[var(--ink)]">Simulate Your Current Location:</span>
              <button
                type="button"
                className="text-[11px] font-bold text-[var(--brand)]"
                onClick={() => setShowLocationPicker(false)}
              >
                Close ✕
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_LOCATIONS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold border transition-all ${
                    userLocation.presetName === preset.name
                      ? 'bg-[var(--brand)] text-white border-[var(--brand)] shadow-xs'
                      : 'bg-white border-[var(--line)] text-[var(--ink2)] hover:border-[var(--brand)]'
                  }`}
                  onClick={() => {
                    setUserLocation({
                      lat: preset.lat,
                      lng: preset.lng,
                      accuracy: 8,
                      isReal: false,
                      presetName: preset.name,
                    });
                    setShowLocationPicker(false);
                  }}
                >
                  📍 {preset.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Legend Bar */}
        <div className="px-3 py-1.5 bg-[#FAF7F0] border-b border-[var(--line)] flex flex-wrap items-center justify-between text-[11px] font-bold text-[var(--ink2)] gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded-full bg-[#7C5CE5] text-white text-[9px] grid place-items-center">⚧</span> All-Gender
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded-full bg-[#323C4D] text-white text-[9px] grid place-items-center">🚻</span> Standard
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#23A27E] inline-block"></span> Clean
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#FFC94A] inline-block"></span> Low Supplies
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#D9483F] inline-block"></span> Needs Attention
            </span>
          </div>
        </div>

        {/* Interactive Large SVG Canvas Container */}
        <div
          className="relative w-full h-[470px] sm:h-[550px] overflow-hidden select-none bg-[#F7F3EA] cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Floating Zoom / Recenter Controls */}
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-[var(--line)] shadow-md">
            <button
              type="button"
              className="w-8 h-8 rounded-xl bg-[var(--card)] hover:bg-[#FAF7F0] text-[16px] font-black grid place-items-center border border-[var(--line)] text-[var(--ink)]"
              onClick={handleZoomIn}
              title="Zoom In"
            >
              +
            </button>
            <button
              type="button"
              className="w-8 h-8 rounded-xl bg-[var(--card)] hover:bg-[#FAF7F0] text-[16px] font-black grid place-items-center border border-[var(--line)] text-[var(--ink)]"
              onClick={handleZoomOut}
              title="Zoom Out"
            >
              −
            </button>
            <button
              type="button"
              className="w-8 h-8 rounded-xl bg-[var(--card)] hover:bg-[#FAF7F0] text-[14px] font-black grid place-items-center border border-[var(--line)] text-[var(--ink)]"
              onClick={handleRecenter}
              title="Center on My GPS Location"
            >
              🎯
            </button>
            {zoom > 1.0 && (
              <button
                type="button"
                className="w-8 h-8 rounded-xl bg-[var(--card)] hover:bg-[#FAF7F0] text-[11px] font-extrabold grid place-items-center border border-[var(--line)] text-[var(--muted)]"
                onClick={handleResetView}
                title="Reset View"
              >
                1x
              </button>
            )}
          </div>

          {/* SVG Map Canvas with Transform Pan & Zoom */}
          <svg
            viewBox="0 0 720 860"
            className="w-full h-full block transition-transform duration-100 ease-out"
            preserveAspectRatio="xMidYMid meet"
            style={{
              transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
              transformOrigin: 'center center',
            }}
          >
            <defs>
              <filter id="soft-shadow-lg" x="-12%" y="-12%" width="124%" height="124%">
                <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#2A2238" floodOpacity="0.10" />
              </filter>
              <filter id="pin-glow-lg" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#7C5CE5" floodOpacity="0.5" />
              </filter>
              <linearGradient id="trackGrad2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F29E93" />
                <stop offset="100%" stopColor="#E67B6F" />
              </linearGradient>
              <linearGradient id="stadiumTurf2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5AA764" />
                <stop offset="100%" stopColor="#4A9354" />
              </linearGradient>
              <linearGradient id="quadGrad2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#D9EED1" />
                <stop offset="100%" stopColor="#CBE6C2" />
              </linearGradient>
              <linearGradient id="parkGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#CEEBC0" />
                <stop offset="100%" stopColor="#C0E0B1" />
              </linearGradient>
            </defs>

            {/* Background Canvas */}
            <rect width="720" height="860" fill="#F7F3EA" />

            {/* Streets */}
            {/* Harrisburg Pike */}
            <path d="M 120 120 L 720 20" stroke="#E8E0D2" strokeWidth="32" strokeLinecap="round" />
            <path d="M 120 120 L 720 20" stroke="#FAF7F0" strokeWidth="2.5" strokeDasharray="8 8" />
            <text x="540" y="22" fill="#A89E8E" fontSize="10" fontWeight="900" letterSpacing="1.2">
              HARRISBURG PIKE
            </text>

            {/* Race Avenue */}
            <path d="M 155 110 L 40 860" stroke="#E8E0D2" strokeWidth="30" strokeLinecap="round" />
            <path d="M 155 110 L 40 860" stroke="#FAF7F0" strokeWidth="2.5" strokeDasharray="8 8" />
            <text
              transform="translate(85, 480) rotate(82)"
              fill="#A89E8E"
              fontSize="11"
              fontWeight="900"
              letterSpacing="1.5"
            >
              RACE AVENUE
            </text>

            {/* North Pine Street */}
            <path d="M 495 190 L 440 860" stroke="#E8E0D2" strokeWidth="30" strokeLinecap="round" />
            <path d="M 495 190 L 440 860" stroke="#FAF7F0" strokeWidth="2.5" strokeDasharray="8 8" />
            <text
              transform="translate(465, 420) rotate(94)"
              fill="#A89E8E"
              fontSize="11"
              fontWeight="900"
              letterSpacing="1.5"
            >
              NORTH PINE STREET
            </text>

            {/* College Avenue */}
            <path d="M 30 755 L 700 755" stroke="#E8E0D2" strokeWidth="26" strokeLinecap="round" />
            <text x="310" y="760" fill="#A89E8E" fontSize="11" fontWeight="900" letterSpacing="1.5">
              COLLEGE AVENUE
            </text>

            {/* Campus Grounds Green Base */}
            <path
              d="M 175 140 C 260 130, 480 150, 490 200 L 475 740 C 350 750, 180 745, 160 730 L 160 250 Z"
              fill="#E5F3DD"
            />

            {/* Buchanan Park */}
            <path
              d="M 50 560 C 120 540, 180 570, 190 640 C 200 720, 195 820, 130 840 C 70 855, 30 820, 40 680 Z"
              fill="url(#parkGrad2)"
              filter="url(#soft-shadow-lg)"
            />
            <text x="65" y="585" fill="#5B874F" fontSize="12" fontWeight="900" letterSpacing="0.5">
              BUCHANAN PARK
            </text>

            {/* Buchanan Park Baseball Diamond */}
            <g transform="translate(100, 680) rotate(-25)">
              <path d="M 0 0 L 32 -32 A 46 46 0 0 1 32 32 Z" fill="#E8D9BF" />
              <rect x="0" y="-14" width="18" height="18" rx="2" fill="#CFE6C2" transform="rotate(45)" />
              <circle cx="14" cy="0" r="3" fill="#FFFFFF" />
            </g>

            {/* Sponaugle-Williamson Track & Field Oval */}
            <g transform="translate(420, 205)" filter="url(#soft-shadow-lg)">
              <rect x="0" y="0" width="75" height="150" rx="37.5" fill="url(#trackGrad2)" />
              <rect x="6" y="6" width="63" height="138" rx="31.5" fill="none" stroke="#FAF0EE" strokeWidth="1.4" strokeDasharray="3 3" />
              <rect x="12" y="12" width="51" height="126" rx="25.5" fill="none" stroke="#FAF0EE" strokeWidth="1.4" />
              <rect x="16" y="16" width="43" height="118" rx="21.5" fill="#C5E8BA" />
              <text x="37" y="74" textAnchor="middle" fill="#883B32" fontSize="8.5" fontWeight="900">
                TRACK
              </text>
              <text x="37" y="86" textAnchor="middle" fill="#883B32" fontSize="7.5" fontWeight="800">
                &amp; FIELD
              </text>
            </g>

            {/* Shadek Stadium */}
            <g transform="translate(490, 30)" filter="url(#soft-shadow-lg)">
              <rect x="0" y="0" width="150" height="90" rx="10" fill="url(#stadiumTurf2)" />
              <rect x="-8" y="10" width="6" height="70" rx="2" fill="#D3CBC0" />
              <rect x="152" y="10" width="6" height="70" rx="2" fill="#D3CBC0" />
              <line x1="20" y1="5" x2="20" y2="85" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.7" />
              <line x1="45" y1="5" x2="45" y2="85" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.7" />
              <line x1="75" y1="5" x2="75" y2="85" stroke="#FFFFFF" strokeWidth="2.5" strokeOpacity="0.9" />
              <line x1="105" y1="5" x2="105" y2="85" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.7" />
              <line x1="130" y1="5" x2="130" y2="85" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.7" />
              <text x="75" y="49" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="900" letterSpacing="2">
                DIPLOMATS
              </text>
              <text x="75" y="62" textAnchor="middle" fill="#E8F6EA" fontSize="8" fontWeight="700">
                SHADEK STADIUM
              </text>
              <path d="M 6 45 L 14 45 M 10 38 L 10 52" stroke="#FFD84D" strokeWidth="2" />
              <path d="M 144 45 L 136 45 M 140 38 L 140 52" stroke="#FFD84D" strokeWidth="2" />
            </g>

            {/* Central Hartman Green / College Green */}
            <g filter="url(#soft-shadow-lg)">
              <rect x="235" y="270" width="135" height="280" rx="18" fill="url(#quadGrad2)" />
              <path d="M 235 290 L 370 530" stroke="#FAF6EE" strokeWidth="6.5" strokeLinecap="round" />
              <path d="M 235 530 L 370 290" stroke="#FAF6EE" strokeWidth="6.5" strokeLinecap="round" />
              <path d="M 302 270 L 302 550" stroke="#FAF6EE" strokeWidth="5.5" strokeLinecap="round" />
              <path d="M 235 410 L 370 410" stroke="#FAF6EE" strokeWidth="5.5" strokeLinecap="round" />
              <circle cx="302.5" cy="410" r="15" fill="#FAF6EE" />
              <circle cx="302.5" cy="410" r="6" fill="#D3C7B5" />
              <text x="302.5" y="445" textAnchor="middle" fill="#4B7742" fontSize="10" fontWeight="900" letterSpacing="0.5">
                COLLEGE GREEN
              </text>
            </g>

            {/* Trees 🌳 */}
            {[
              [80, 610, 12], [140, 620, 14], [165, 660, 11], [90, 740, 15], [140, 760, 13], [80, 800, 12], [115, 825, 14],
              [245, 230, 10], [275, 240, 9], [250, 330, 10], [250, 470, 10], [355, 330, 10], [355, 470, 10],
              [210, 190, 11], [420, 140, 10], [450, 150, 11], [405, 410, 9], [400, 520, 9]
            ].map(([tx, ty, tr], i) => (
              <g key={`tree-${i}`}>
                <ellipse cx={tx} cy={ty + tr * 0.7} rx={tr * 0.9} ry={tr * 0.35} fill="#2A2238" fillOpacity="0.08" />
                <circle cx={tx} cy={ty} r={tr} fill="#6DAA65" />
                <circle cx={tx - tr * 0.25} cy={ty - tr * 0.25} r={tr * 0.65} fill="#82C07A" />
              </g>
            ))}

            {/* Buildings: Larger, Generous, Beautiful Touch Targets */}

            {/* 1. ASFC (Alumni Sports & Fitness) */}
            <g
              transform="translate(315, 75)"
              filter="url(#soft-shadow-lg)"
              className="cursor-pointer group"
              onClick={() => onOpenRestroom(RESTROOMS.find((r) => r.id === 'asfc') || RESTROOMS[0])}
            >
              <rect x="0" y="0" width="135" height="72" rx="10" fill="#FFFFFF" stroke="#DED6C7" strokeWidth="2" />
              <path d="M 0 0 L 135 0 L 135 14 L 0 14 Z" fill="#E8DEC9" />
              <text x="67" y="37" textAnchor="middle" fill="#2A2238" fontSize="11" fontWeight="900">
                Alumni Sports (ASFC) 🏀
              </text>
              <text x="67" y="52" textAnchor="middle" fill="#7A7065" fontSize="8.5" fontWeight="700">
                Main Lobby &amp; Gym Pool
              </text>
            </g>

            {/* 2. Hackman Physical Science Lab */}
            <g
              transform="translate(150, 235)"
              filter="url(#soft-shadow-lg)"
              className="cursor-pointer"
              onClick={() => onOpenRestroom(RESTROOMS.find((r) => r.id === 'hack') || RESTROOMS[0])}
            >
              <rect x="0" y="0" width="115" height="60" rx="9" fill="#FFFFFF" stroke="#DED6C7" strokeWidth="2" />
              <rect x="0" y="0" width="115" height="10" rx="4" fill="#E6DFD3" />
              <text x="57" y="31" textAnchor="middle" fill="#2A2238" fontSize="10.5" fontWeight="900">
                Hackman Phys. 🔬
              </text>
              <text x="57" y="45" textAnchor="middle" fill="#7A7065" fontSize="8" fontWeight="700">
                Science Labs (Basement)
              </text>
            </g>

            {/* 3. Barshinger Life Science / LSP */}
            <g
              transform="translate(305, 215)"
              filter="url(#soft-shadow-lg)"
              className="cursor-pointer"
              onClick={() => onOpenRestroom(RESTROOMS.find((r) => r.id === 'lsb') || RESTROOMS[0])}
            >
              <rect x="0" y="0" width="115" height="60" rx="9" fill="#FFFFFF" stroke="#DED6C7" strokeWidth="2" />
              <path d="M 0 0 L 115 0 L 100 12 L 15 12 Z" fill="#D2E8F7" />
              <text x="57" y="33" textAnchor="middle" fill="#2A2238" fontSize="10.5" fontWeight="900">
                Barshinger LSP 🧬
              </text>
              <text x="57" y="47" textAnchor="middle" fill="#7A7065" fontSize="8" fontWeight="700">
                Life Science &amp; Philosophy
              </text>
            </g>

            {/* 4. Stager Hall */}
            <g
              transform="translate(310, 420)"
              filter="url(#soft-shadow-lg)"
              className="cursor-pointer"
              onClick={() => onOpenRestroom(RESTROOMS.find((r) => r.id === 'stag') || RESTROOMS[0])}
            >
              <rect x="0" y="0" width="90" height="50" rx="8" fill="#FFFFFF" stroke="#DED6C7" strokeWidth="2" />
              <rect x="0" y="0" width="90" height="8" rx="3" fill="#E6DFD3" />
              <text x="45" y="28" textAnchor="middle" fill="#2A2238" fontSize="10" fontWeight="900">
                Stager Hall
              </text>
              <text x="45" y="40" textAnchor="middle" fill="#7A7065" fontSize="8" fontWeight="700">
                Academic Hall
              </text>
            </g>

            {/* 5. Keiper Liberal Arts */}
            <g
              transform="translate(315, 495)"
              filter="url(#soft-shadow-lg)"
              className="cursor-pointer"
              onClick={() => onOpenRestroom(RESTROOMS.find((r) => r.id === 'keip') || RESTROOMS[0])}
            >
              <rect x="0" y="0" width="95" height="50" rx="8" fill="#FFFFFF" stroke="#DED6C7" strokeWidth="2" />
              <rect x="0" y="0" width="95" height="8" rx="3" fill="#E6DFD3" />
              <text x="47" y="28" textAnchor="middle" fill="#2A2238" fontSize="10" fontWeight="900">
                Keiper Hall 📚
              </text>
              <text x="47" y="40" textAnchor="middle" fill="#7A7065" fontSize="8" fontWeight="700">
                Liberal Arts 1st Fl
              </text>
            </g>

            {/* 6. Old Main (Historic Icon with Bell Cupola) */}
            <g
              transform="translate(245, 575)"
              filter="url(#soft-shadow-lg)"
              className="cursor-pointer"
              onClick={() => onOpenRestroom(RESTROOMS.find((r) => r.id === 'main') || RESTROOMS[0])}
            >
              <rect x="0" y="0" width="130" height="58" rx="10" fill="#FFFDF8" stroke="#DED6C7" strokeWidth="2" />
              <rect x="0" y="0" width="130" height="12" rx="4" fill="#DCCFB8" />
              <rect x="54" y="-18" width="24" height="18" rx="3" fill="#FFFDF8" stroke="#DED6C7" strokeWidth="1.5" />
              <polygon points="53,-18 66,-34 79,-18" fill="#589E78" />
              <circle cx="66" cy="-8" r="3.5" fill="#D48A0F" />
              <text x="65" y="32" textAnchor="middle" fill="#2A2238" fontSize="12" fontWeight="900">
                Old Main 🏛️
              </text>
              <text x="65" y="46" textAnchor="middle" fill="#7A7065" fontSize="8.5" fontWeight="700">
                2nd Floor Cupola Hall
              </text>
            </g>

            {/* 7. Shadek-Fackenthal Library */}
            <g
              transform="translate(145, 650)"
              filter="url(#soft-shadow-lg)"
              className="cursor-pointer"
              onClick={() => onOpenRestroom(RESTROOMS.find((r) => r.id === 'lib1') || RESTROOMS[0])}
            >
              <rect x="0" y="0" width="115" height="72" rx="10" fill="#FFFFFF" stroke="#DED6C7" strokeWidth="2" />
              <rect x="0" y="0" width="115" height="12" rx="4" fill="#E8DEC9" />
              <text x="57" y="36" textAnchor="middle" fill="#2A2238" fontSize="11" fontWeight="900">
                Shadek Library 📚
              </text>
              <text x="57" y="50" textAnchor="middle" fill="#7A7065" fontSize="8.5" fontWeight="700">
                1st &amp; 2nd Fl Commons
              </text>
            </g>

            {/* 8. Steinman College Center (SCC / Dining Hub) */}
            <g
              transform="translate(270, 650)"
              filter="url(#soft-shadow-lg)"
              className="cursor-pointer"
              onClick={() => onOpenRestroom(RESTROOMS.find((r) => r.id === 'scc1') || RESTROOMS[0])}
            >
              <rect x="0" y="0" width="130" height="72" rx="10" fill="#FFFFFF" stroke="#DED6C7" strokeWidth="2" />
              <rect x="0" y="0" width="130" height="12" rx="4" fill="#E8DEC9" />
              <text x="65" y="36" textAnchor="middle" fill="#2A2238" fontSize="11" fontWeight="900">
                Steinman Center 🥗
              </text>
              <text x="65" y="50" textAnchor="middle" fill="#7A7065" fontSize="8.5" fontWeight="700">
                Dining Hall &amp; Phillips Museum
              </text>
            </g>

            {/* 9. East Spine: College Houses along North Pine Street */}

            {/* Ware College House (North Ben) */}
            <g
              transform="translate(520, 235)"
              filter="url(#soft-shadow-lg)"
              className="cursor-pointer"
              onClick={() => onOpenRestroom(RESTROOMS.find((r) => r.id === 'ware') || RESTROOMS[0])}
            >
              <rect x="0" y="0" width="120" height="60" rx="9" fill="#FFFFFF" stroke="#8E5CE0" strokeWidth="2.5" strokeOpacity="0.5" />
              <rect x="0" y="0" width="120" height="9" rx="4" fill="#8E5CE0" fillOpacity="0.25" />
              <circle cx="15" cy="20" r="5" fill="#8E5CE0" />
              <text x="64" y="30" textAnchor="middle" fill="#2A2238" fontSize="10.5" fontWeight="900">
                Ware House
              </text>
              <text x="64" y="44" textAnchor="middle" fill="#8E5CE0" fontSize="8.5" fontWeight="800">
                North Ben Commons
              </text>
            </g>

            {/* Bonchek College House (South Ben) */}
            <g
              transform="translate(515, 320)"
              filter="url(#soft-shadow-lg)"
              className="cursor-pointer"
              onClick={() => onOpenRestroom(RESTROOMS.find((r) => r.id === 'bonchek') || RESTROOMS[0])}
            >
              <rect x="0" y="0" width="120" height="60" rx="9" fill="#FFFFFF" stroke="#3D6FE0" strokeWidth="2.5" strokeOpacity="0.5" />
              <rect x="0" y="0" width="120" height="9" rx="4" fill="#3D6FE0" fillOpacity="0.25" />
              <circle cx="15" cy="20" r="5" fill="#3D6FE0" />
              <text x="64" y="30" textAnchor="middle" fill="#2A2238" fontSize="10.5" fontWeight="900">
                Bonchek House
              </text>
              <text x="64" y="44" textAnchor="middle" fill="#3D6FE0" fontSize="8.5" fontWeight="800">
                South Ben Dorms
              </text>
            </g>

            {/* Brooks College House (Buchanan) */}
            <g
              transform="translate(510, 405)"
              filter="url(#soft-shadow-lg)"
              className="cursor-pointer"
              onClick={() => onOpenRestroom(RESTROOMS.find((r) => r.id === 'brooks') || RESTROOMS[0])}
            >
              <rect x="0" y="0" width="120" height="60" rx="9" fill="#FFFFFF" stroke="#D9483F" strokeWidth="2.5" strokeOpacity="0.5" />
              <rect x="0" y="0" width="120" height="9" rx="4" fill="#D9483F" fillOpacity="0.25" />
              <circle cx="15" cy="20" r="5" fill="#D9483F" />
              <text x="64" y="30" textAnchor="middle" fill="#2A2238" fontSize="10.5" fontWeight="900">
                Brooks House
              </text>
              <text x="64" y="44" textAnchor="middle" fill="#D9483F" fontSize="8.5" fontWeight="800">
                Buchanan Commons
              </text>
            </g>

            {/* Weis College House */}
            <g
              transform="translate(505, 490)"
              filter="url(#soft-shadow-lg)"
              className="cursor-pointer"
              onClick={() => onOpenRestroom(RESTROOMS.find((r) => r.id === 'weis') || RESTROOMS[0])}
            >
              <rect x="0" y="0" width="120" height="60" rx="9" fill="#FFFFFF" stroke="#D48A0F" strokeWidth="2.5" strokeOpacity="0.5" />
              <rect x="0" y="0" width="120" height="9" rx="4" fill="#D48A0F" fillOpacity="0.25" />
              <circle cx="15" cy="20" r="5" fill="#D48A0F" />
              <text x="64" y="30" textAnchor="middle" fill="#2A2238" fontSize="10.5" fontWeight="900">
                Weis House
              </text>
              <text x="64" y="44" textAnchor="middle" fill="#D48A0F" fontSize="8.5" fontWeight="800">
                Weis Hall Commons
              </text>
            </g>

            {/* Roschel Center */}
            <g
              transform="translate(450, 580)"
              filter="url(#soft-shadow-lg)"
              className="cursor-pointer"
              onClick={() => onOpenRestroom(RESTROOMS.find((r) => r.id === 'roschel') || RESTROOMS[0])}
            >
              <rect x="0" y="0" width="125" height="65" rx="9" fill="#FFFFFF" stroke="#2A9A72" strokeWidth="2.5" strokeOpacity="0.5" />
              <rect x="0" y="0" width="125" height="9" rx="4" fill="#2A9A72" fillOpacity="0.25" />
              <circle cx="15" cy="20" r="5" fill="#2A9A72" />
              <text x="67" y="30" textAnchor="middle" fill="#2A2238" fontSize="10.5" fontWeight="900">
                Roschel Center 🎭
              </text>
              <text x="67" y="44" textAnchor="middle" fill="#2A9A72" fontSize="8.5" fontWeight="800">
                Performing Arts &amp; House
              </text>
            </g>

            {/* Buchanan Park Pavilion */}
            <g
              transform="translate(90, 780)"
              filter="url(#soft-shadow-lg)"
              className="cursor-pointer"
              onClick={() => onOpenRestroom(RESTROOMS.find((r) => r.id === 'park') || RESTROOMS[0])}
            >
              <rect x="0" y="0" width="115" height="50" rx="8" fill="#FFFFFF" stroke="#DED6C7" strokeWidth="2" />
              <text x="57" y="26" textAnchor="middle" fill="#2A2238" fontSize="10" fontWeight="900">
                Park Pavilion 🌳
              </text>
              <text x="57" y="39" textAnchor="middle" fill="#7A7065" fontSize="8" fontWeight="700">
                Buchanan Restrooms
              </text>
            </g>

            {/* Restroom Pins: Positioned Cleanly Without Obscuring Building Text */}
            {RESTROOMS.map((r) => {
              const matchesFilter = filteredRestrooms.some((fr) => fr.id === r.id);
              const st = getStatus(r.id);

              return (
                <g
                  key={r.id}
                  transform={`translate(${r.x}, ${r.y})`}
                  className="cursor-pointer transition-transform duration-200 hover:scale-125"
                  style={{
                    opacity: matchesFilter ? 1 : 0.25,
                    filter: 'url(#soft-shadow-lg)',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Click immediately pops up the bottom sheet!
                    onOpenRestroom(r);
                  }}
                >
                  {/* Pin Background Bubble */}
                  <circle
                    cx="0"
                    cy="0"
                    r="15"
                    fill={r.all ? '#7C5CE5' : '#323C4D'}
                    stroke="#FFFFFF"
                    strokeWidth="3"
                  />

                  {/* Icon */}
                  <text
                    x="0"
                    y="4.5"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="11"
                    fontWeight="900"
                    style={{ pointerEvents: 'none' }}
                  >
                    {r.all ? '⚧' : '🚻'}
                  </text>

                  {/* Status Indicator Dot */}
                  <circle
                    cx="10"
                    cy="-10"
                    r="5"
                    fill={st ? st.dot : '#23A27E'}
                    stroke="#FFFFFF"
                    strokeWidth="1.8"
                  />
                </g>
              );
            })}

            {/* Live User GPS Location Pulsing Marker (You Are Here 📍) */}
            <g transform={`translate(${userSvgPos.x}, ${userSvgPos.y})`} className="pointer-events-none">
              {/* Outer Radar Waves */}
              <circle r="32" fill="#3B82F6" opacity="0.15" />
              <circle r="22" fill="#3B82F6" opacity="0.3" className="animate-ping" style={{ transformOrigin: 'center' }} />
              {/* White Outline and Core Dot */}
              <circle r="9" fill="#2563EB" stroke="#FFFFFF" strokeWidth="3" filter="url(#soft-shadow-lg)" />
              {/* Label Pill */}
              <rect x="-38" y="14" width="76" height="20" rx="10" fill="#1E40AF" filter="url(#soft-shadow-lg)" />
              <text x="0" y="28" textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="900" letterSpacing="0.2">
                YOU ARE HERE
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* Restroom Horizontal Cards List ("下面卡片长条状" - Full Width Rows) */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <h2 className="text-[18px] font-black tracking-tight text-[var(--ink)]">
              {sortedRestrooms.length} Restroom Location{sortedRestrooms.length !== 1 ? 's' : ''}
            </h2>
            <span className="text-[12px] font-extrabold text-[var(--muted)]">
              (Sorted by {sortBy === 'distance' ? 'distance' : 'name'})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className={`px-2.5 py-1 rounded-xl text-[11px] font-black border transition-all ${
                sortBy === 'distance'
                  ? 'bg-[var(--brand)] text-white border-[var(--brand)] shadow-xs'
                  : 'bg-[var(--card)] border-[var(--line)] text-[var(--ink2)]'
              }`}
              onClick={() => setSortBy('distance')}
            >
              ⚡ Nearest
            </button>
            <button
              type="button"
              className={`px-2.5 py-1 rounded-xl text-[11px] font-black border transition-all ${
                sortBy === 'name'
                  ? 'bg-[var(--brand)] text-white border-[var(--brand)] shadow-xs'
                  : 'bg-[var(--card)] border-[var(--line)] text-[var(--ink2)]'
              }`}
              onClick={() => setSortBy('name')}
            >
              A–Z
            </button>
          </div>
        </div>

        {/* Full-Width Horizontal Long-Bar Cards (Never squished into 2-columns!) */}
        <div className="flex flex-col gap-2.5">
          {sortedRestrooms.map((r) => {
            const st = getStatus(r.id);

            return (
              <button
                key={r.id}
                type="button"
                className="apple-card my-0 p-3.5 sm:p-4 text-left border border-[var(--line)] hover:border-[var(--brand)] hover:shadow-[var(--shadow-hover)] transition-all flex items-center justify-between gap-3 group cursor-pointer bg-[var(--card)]"
                onClick={() => onOpenRestroom(r)}
              >
                {/* Left: Icon & GPS Distance Pill */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex flex-col items-center flex-none">
                    <div
                      className="w-12 h-12 rounded-2xl grid place-items-center text-[22px] shadow-sm transition-transform group-hover:scale-105"
                      style={{ background: r.all ? 'var(--lav-l)' : '#F5EBE1' }}
                    >
                      {r.all ? '⚧' : '🚻'}
                    </div>
                    <span className="text-[10.5px] font-black mt-1 px-1.5 py-0.5 rounded-md bg-[#F2EDE4] text-[var(--ink2)] whitespace-nowrap">
                      {r.distMeters}m · {r.walkMins}m
                    </span>
                  </div>

                  {/* Middle: Full Untruncated Building Name, Floor & Amenities */}
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <b className="text-[15.5px] font-black text-[var(--ink)] block leading-snug group-hover:text-[var(--brand)] transition-colors">
                        {r.b}
                      </b>
                    </div>
                    <span className="text-[12.5px] font-bold text-[var(--muted)] block truncate mb-1.5">
                      📍 {r.f} · {r.all ? 'All-Gender facility' : "Women's & men's facilities"}
                    </span>

                    {/* Amenity Pills in a Clean Row */}
                    <div className="flex flex-wrap gap-1.5">
                      {r.all && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-[var(--lav-l)] text-[#5040C0]">
                          ⚧ All-Gender
                        </span>
                      )}
                      {r.acc && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-[var(--mint-l)] text-[#11634C]">
                          ♿ ADA
                        </span>
                      )}
                      {r.per && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-[var(--peach-l)] text-[var(--peach-d)]">
                          🌸 Period Products
                        </span>
                      )}
                      {r.single && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-[#FFF2DE] text-[#B87000]">
                          🚪 Single-Stall
                        </span>
                      )}
                      {r.baby && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-[#EBF6FF] text-[#1E6AC4]">
                          🍼 Changing Table
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Status Tag & Action Chevron */}
                <div className="flex flex-col items-end justify-center gap-1.5 flex-none pl-3 border-l border-[var(--line)]">
                  {st ? (
                    <span className={`apple-tag ${st.cls} text-[11px] font-black whitespace-nowrap`}>
                      {st.short}
                    </span>
                  ) : (
                    <span className="apple-tag t-lav text-[11px] font-black whitespace-nowrap">
                      ✓ Operational
                    </span>
                  )}
                  <span className="text-[12px] font-extrabold text-[var(--brand)] group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    Report <span>›</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
