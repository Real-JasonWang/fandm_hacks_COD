import React, { useState, useEffect } from 'react';
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

  return (
    <div className="apple-view space-y-3 pb-24">
      {/* Page Title & Subtitle */}
      <div>
        <h1 className="text-[27px] font-black tracking-tight text-[var(--ink)]">
          Bathroom reports
        </h1>
        <p className="text-[14px] font-semibold text-[var(--ink2)]">
          Live student crowdsourced reports, cleanliness tracking, and amenity status on F&amp;M campus.
        </p>
      </div>

      {/* Filter Chips Horizontal Scroll */}
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
                <span className="text-[10.5px] font-black px-2 py-0.5 rounded-full bg-[var(--mint-l)] text-[#166E53] uppercase tracking-wide">
                  Recommended Nearest
                </span>
                <span className="text-[11.5px] font-extrabold text-[var(--muted)]">
                  📍 {nearestRestroom.distMeters}m ({nearestRestroom.walkMins} min walk)
                </span>
              </div>
              <b className="text-[16px] font-black text-[var(--ink)] block truncate leading-snug mt-0.5">
                {nearestRestroom.b}
              </b>
              <span className="text-[12.5px] font-bold text-[var(--ink2)] block truncate">
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

      {/* Official F&M Concept3D Interactive Campus Map (Iframe Embed) */}
      <div className="apple-card p-0 overflow-hidden border border-[var(--line)] shadow-[var(--shadow)] bg-[#F8F5EE]">
        {/* Map Header Bar */}
        <div className="p-3 bg-[#FFFDF9] border-b border-[var(--line)] flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-[20px] flex-none">🗺️</span>
            <div className="min-w-0">
              <b className="text-[14.5px] font-black text-[var(--ink)] block leading-tight truncate">
                F&amp;M Campus Restrooms Map
              </b>
              <span className="text-[11.5px] font-bold text-[var(--muted)] block truncate">
                Official F&amp;M Concept3D Spatial Map (Restroom &amp; All-Gender Layers)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-none">
            {/* GPS Simulation / Location Switcher */}
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--card)] border border-[var(--line)] text-[11.5px] font-extrabold text-[var(--ink)] shadow-xs hover:bg-[#FAF7F0] cursor-pointer"
              onClick={() => setShowLocationPicker(!showLocationPicker)}
              title="Change simulated location"
            >
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
              <span>{userLocation.presetName || (userLocation.isReal ? 'Live GPS' : 'Campus Quad')}</span>
              <span className="text-[10px] text-[var(--muted)]">▾</span>
            </button>

            {/* Direct Link to Open in Full Concept3D Window */}
            <a
              href="https://map.concept3d.com/?id=1202#!ct/32461,57938?s/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-xl bg-[var(--card)] border border-[var(--line)] text-[12px] font-black text-[var(--muted)] hover:text-[var(--ink)] shadow-xs grid place-items-center cursor-pointer"
              title="Open full Concept3D map in new tab"
            >
              ↗
            </a>
          </div>
        </div>

        {/* Location Simulator Dropdown Picker */}
        {showLocationPicker && (
          <div className="p-3 bg-[#FFFDF8] border-b border-[var(--line)] text-[12px] animate-in fade-in duration-150">
            <div className="flex items-center justify-between mb-2">
              <span className="font-black text-[var(--ink)]">Simulate Current Location:</span>
              <button
                type="button"
                className="text-[11px] font-black text-[var(--brand)] hover:underline cursor-pointer"
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
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold border transition-all cursor-pointer ${
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

        {/* Official F&M Concept3D Iframe */}
        <div className="relative w-full h-[480px] sm:h-[550px] bg-[#FAF8F5]">
          <iframe
            src="https://map.concept3d.com/?id=1202#!ct/32461,57938?s/"
            title="Franklin & Marshall College Restroom Map"
            className="w-full h-full border-0 block"
            loading="lazy"
            allow="geolocation; fullscreen"
          />
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
              className={`px-2.5 py-1 rounded-xl text-[11px] font-black border transition-all cursor-pointer ${
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
              className={`px-2.5 py-1 rounded-xl text-[11px] font-black border transition-all cursor-pointer ${
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
