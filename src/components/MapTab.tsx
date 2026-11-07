import React, { useState, useRef } from 'react';
import type { AppSettings, Restroom } from '../types';
import { RESTROOMS, FILTERS } from '../data/appleData';

interface MapTabProps {
  settings: AppSettings;
  onOpenRestroom: (restroom: Restroom) => void;
}

export const MapTab: React.FC<MapTabProps> = ({ settings, onOpenRestroom }) => {
  const [activeFilter, setActiveFilter] = useState<string>('any');
  const [selectedRestroom, setSelectedRestroom] = useState<Restroom | null>(null);
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const filteredRestrooms = RESTROOMS.filter((r) => {
    if (activeFilter === 'any') return true;
    if (activeFilter === 'all') return r.all;
    if (activeFilter === 'acc') return r.acc;
    if (activeFilter === 'per') return r.per;
    if (activeFilter === 'single') return r.single;
    if (activeFilter === 'baby') return r.baby;
    return true;
  });

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

  const handleSelectPin = (r: Restroom) => {
    setSelectedRestroom(r);
    // Scroll corresponding card into view smoothly
    if (cardRefs.current[r.id]) {
      cardRefs.current[r.id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  return (
    <div className="apple-view space-y-3 pb-24">
      {/* Title & Description */}
      <div>
        <h1 className="text-[27px] font-black tracking-tight text-[var(--ink)]">
          Bathroom reports
        </h1>
        <p className="text-[14px] font-semibold text-[var(--ink2)]">
          Live student crowdsourced reports, cleanliness tracking, and amenity status on F&amp;M campus.
        </p>
      </div>

      {/* Filter Chips */}
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

      {/* Cute Interactive Illustrated F&M Campus Map */}
      <div className="apple-card p-0 overflow-hidden border border-[var(--line)] shadow-[var(--shadow)] bg-[#F8F5EE] relative">
        {/* Map Top Bar */}
        <div className="p-3 bg-[#FFFDF9] border-b border-[var(--line)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[18px]">🗺️</span>
            <div>
              <b className="text-[14px] font-black text-[var(--ink)] block leading-tight">
                F&amp;M Campus Restrooms Map
              </b>
              <span className="text-[11px] font-bold text-[var(--muted)]">
                Based on official F&amp;M Concept3D Campus Spatial Layout
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-[var(--mint-l)] text-[#1B6F55]">
              Live GPS Sync
            </span>
          </div>
        </div>

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

        {/* Interactive SVG Canvas */}
        <div className="relative w-full aspect-[720/860] overflow-hidden select-none touch-manipulation">
          <svg
            viewBox="0 0 720 860"
            className="w-full h-full block"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <filter id="soft-shadow" x="-8%" y="-8%" width="120%" height="120%">
                <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#2A2238" floodOpacity="0.08" />
              </filter>
              <filter id="pin-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#7C5CE5" floodOpacity="0.4" />
              </filter>
              <linearGradient id="trackGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F29E93" />
                <stop offset="100%" stopColor="#E67B6F" />
              </linearGradient>
              <linearGradient id="stadiumTurf" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5AA764" />
                <stop offset="100%" stopColor="#4A9354" />
              </linearGradient>
              <linearGradient id="quadGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#D9EED1" />
                <stop offset="100%" stopColor="#CBE6C2" />
              </linearGradient>
              <linearGradient id="parkGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#CEEBC0" />
                <stop offset="100%" stopColor="#C0E0B1" />
              </linearGradient>
            </defs>

            {/* Background Canvas */}
            <rect width="720" height="860" fill="#F7F3EA" />

            {/* Streets & Boundaries */}
            {/* Harrisburg Pike (Northwest diagonal street) */}
            <path
              d="M 120 120 L 720 20"
              stroke="#E8E0D2"
              strokeWidth="28"
              strokeLinecap="round"
            />
            <path
              d="M 120 120 L 720 20"
              stroke="#FAF7F0"
              strokeWidth="2"
              strokeDasharray="6 6"
            />
            <text x="560" y="24" fill="#A89E8E" fontSize="9" fontWeight="800" letterSpacing="1">
              HARRISBURG PIKE
            </text>

            {/* Race Avenue (West border street) */}
            <path
              d="M 155 110 L 40 860"
              stroke="#E8E0D2"
              strokeWidth="26"
              strokeLinecap="round"
            />
            <path
              d="M 155 110 L 40 860"
              stroke="#FAF7F0"
              strokeWidth="2"
              strokeDasharray="6 6"
            />
            <text
              transform="translate(85, 480) rotate(82)"
              fill="#A89E8E"
              fontSize="10"
              fontWeight="800"
              letterSpacing="1.5"
            >
              RACE AVENUE
            </text>

            {/* North Pine Street (East border street along College Houses) */}
            <path
              d="M 495 190 L 440 860"
              stroke="#E8E0D2"
              strokeWidth="26"
              strokeLinecap="round"
            />
            <path
              d="M 495 190 L 440 860"
              stroke="#FAF7F0"
              strokeWidth="2"
              strokeDasharray="6 6"
            />
            <text
              transform="translate(465, 420) rotate(94)"
              fill="#A89E8E"
              fontSize="10"
              fontWeight="800"
              letterSpacing="1.5"
            >
              NORTH PINE STREET
            </text>

            {/* College Avenue (South border street) */}
            <path
              d="M 30 755 L 700 755"
              stroke="#E8E0D2"
              strokeWidth="24"
              strokeLinecap="round"
            />
            <text x="310" y="760" fill="#A89E8E" fontSize="10" fontWeight="800" letterSpacing="1.5">
              COLLEGE AVENUE
            </text>

            {/* Cross Streets */}
            {/* West Frederick Street */}
            <path d="M 40 480 L 700 500" stroke="#EFE9DC" strokeWidth="12" />
            <text x="55" y="474" fill="#B5AB9B" fontSize="8" fontWeight="700">W FREDERICK ST</text>

            {/* West James Street */}
            <path d="M 40 640 L 700 660" stroke="#EFE9DC" strokeWidth="12" />
            <text x="55" y="634" fill="#B5AB9B" fontSize="8" fontWeight="700">W JAMES ST</text>

            {/* Main Campus Grounds Green Enclosure */}
            <path
              d="M 175 140 C 260 130, 480 150, 490 200 L 475 740 C 350 750, 180 745, 160 730 L 160 250 Z"
              fill="#E5F3DD"
            />

            {/* Buchanan Park (West Campus Green Park) */}
            <path
              d="M 50 560 C 120 540, 180 570, 190 640 C 200 720, 195 820, 130 840 C 70 855, 30 820, 40 680 Z"
              fill="url(#parkGrad)"
              filter="url(#soft-shadow)"
            />
            <text x="65" y="585" fill="#5B874F" fontSize="11" fontWeight="900" letterSpacing="0.5">
              BUCHANAN PARK
            </text>

            {/* Buchanan Park Baseball Diamond */}
            <g transform="translate(100, 680) rotate(-25)">
              <path d="M 0 0 L 28 -28 A 40 40 0 0 1 28 28 Z" fill="#E8D9BF" />
              <rect x="0" y="-12" width="16" height="16" rx="2" fill="#CFE6C2" transform="rotate(45)" />
              <circle cx="12" cy="0" r="2.5" fill="#FFFFFF" />
            </g>

            {/* Sponaugle-Williamson Track & Field Oval */}
            <g transform="translate(420, 205)" filter="url(#soft-shadow)">
              {/* Outer Track Red Surface */}
              <rect x="0" y="0" width="75" height="150" rx="37.5" fill="url(#trackGrad)" />
              {/* Lane Markings */}
              <rect x="6" y="6" width="63" height="138" rx="31.5" fill="none" stroke="#FAF0EE" strokeWidth="1.2" strokeDasharray="3 3" />
              <rect x="12" y="12" width="51" height="126" rx="25.5" fill="none" stroke="#FAF0EE" strokeWidth="1.2" />
              {/* Infield Grass */}
              <rect x="16" y="16" width="43" height="118" rx="21.5" fill="#C5E8BA" />
              <text x="37" y="75" textAnchor="middle" fill="#883B32" fontSize="7.5" fontWeight="900">
                TRACK
              </text>
              <text x="37" y="86" textAnchor="middle" fill="#883B32" fontSize="6.5" fontWeight="800">
                &amp; FIELD
              </text>
            </g>

            {/* Shadek Stadium (North Turf Football Field) */}
            <g transform="translate(490, 30)" filter="url(#soft-shadow)">
              <rect x="0" y="0" width="150" height="90" rx="10" fill="url(#stadiumTurf)" />
              {/* Bleachers */}
              <rect x="-8" y="10" width="6" height="70" rx="2" fill="#D3CBC0" />
              <rect x="152" y="10" width="6" height="70" rx="2" fill="#D3CBC0" />
              {/* Yard Lines */}
              <line x1="20" y1="5" x2="20" y2="85" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.7" />
              <line x1="45" y1="5" x2="45" y2="85" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.7" />
              <line x1="75" y1="5" x2="75" y2="85" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.9" />
              <line x1="105" y1="5" x2="105" y2="85" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.7" />
              <line x1="130" y1="5" x2="130" y2="85" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.7" />
              {/* Endzones */}
              <text x="75" y="49" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="900" letterSpacing="2">
                DIPLOMATS
              </text>
              <text x="75" y="62" textAnchor="middle" fill="#E8F6EA" fontSize="7" fontWeight="700">
                SHADEK STADIUM
              </text>
              {/* Goalposts */}
              <path d="M 6 45 L 14 45 M 10 38 L 10 52" stroke="#FFD84D" strokeWidth="2" />
              <path d="M 144 45 L 136 45 M 140 38 L 140 52" stroke="#FFD84D" strokeWidth="2" />
            </g>

            {/* Central Hartman Green / College Green (Heart of F&M Quad) */}
            <g filter="url(#soft-shadow)">
              <rect x="235" y="270" width="135" height="280" rx="18" fill="url(#quadGrad)" />
              {/* Crisscrossing Quad Walking Paths */}
              <path d="M 235 290 L 370 530" stroke="#FAF6EE" strokeWidth="6" strokeLinecap="round" />
              <path d="M 235 530 L 370 290" stroke="#FAF6EE" strokeWidth="6" strokeLinecap="round" />
              <path d="M 302 270 L 302 550" stroke="#FAF6EE" strokeWidth="5" strokeLinecap="round" />
              <path d="M 235 410 L 370 410" stroke="#FAF6EE" strokeWidth="5" strokeLinecap="round" />
              {/* Center Plaza / Sundial */}
              <circle cx="302.5" cy="410" r="14" fill="#FAF6EE" />
              <circle cx="302.5" cy="410" r="6" fill="#D3C7B5" />
              <text x="302.5" y="445" textAnchor="middle" fill="#4B7742" fontSize="9" fontWeight="900" letterSpacing="0.5">
                COLLEGE GREEN
              </text>
            </g>

            {/* Cute Campus Trees 🌳 */}
            {[
              [80, 610, 11], [140, 620, 13], [165, 660, 10], [90, 740, 14], [140, 760, 12], [80, 800, 11], [115, 825, 13],
              [245, 230, 9], [275, 240, 8], [250, 330, 9], [250, 470, 9], [355, 330, 9], [355, 470, 9],
              [210, 190, 10], [420, 140, 9], [450, 150, 10], [405, 410, 8], [400, 520, 8]
            ].map(([tx, ty, tr], i) => (
              <g key={`tree-${i}`}>
                <ellipse cx={tx} cy={ty + tr * 0.7} rx={tr * 0.9} ry={tr * 0.35} fill="#2A2238" fillOpacity="0.08" />
                <circle cx={tx} cy={ty} r={tr} fill="#6DAA65" />
                <circle cx={tx - tr * 0.25} cy={ty - tr * 0.25} r={tr * 0.65} fill="#82C07A" />
              </g>
            ))}

            {/* Campus Buildings (Cute Isometric / 2.5D Blocks) */}

            {/* 1. Alumni Sports & Fitness (ASFC) */}
            <g
              transform="translate(325, 75)"
              filter="url(#soft-shadow)"
              className="cursor-pointer group"
              onClick={() => handleSelectPin(RESTROOMS.find((r) => r.id === 'asfc') || RESTROOMS[0])}
            >
              <rect x="0" y="0" width="115" height="70" rx="8" fill="#FFFFFF" stroke="#DED6C7" strokeWidth="2" />
              <path d="M 0 0 L 115 0 L 115 14 L 0 14 Z" fill="#E8DEC9" />
              <text x="57" y="36" textAnchor="middle" fill="#2A2238" fontSize="9.5" fontWeight="900">
                Alumni Sports (ASFC)
              </text>
              <text x="57" y="49" textAnchor="middle" fill="#7A7065" fontSize="7.5" fontWeight="700">
                Fitness, Pool &amp; Courts
              </text>
            </g>

            {/* 2. Hackman Physical Sciences */}
            <g
              transform="translate(160, 240)"
              filter="url(#soft-shadow)"
              className="cursor-pointer"
              onClick={() => handleSelectPin(RESTROOMS.find((r) => r.id === 'hack') || RESTROOMS[0])}
            >
              <rect x="0" y="0" width="95" height="55" rx="7" fill="#FFFFFF" stroke="#DED6C7" strokeWidth="2" />
              <rect x="0" y="0" width="95" height="10" rx="4" fill="#E6DFD3" />
              <text x="47" y="28" textAnchor="middle" fill="#2A2238" fontSize="8.5" fontWeight="900">
                Hackman Phys.
              </text>
              <text x="47" y="40" textAnchor="middle" fill="#7A7065" fontSize="7" fontWeight="700">
                Sciences Complex
              </text>
            </g>

            {/* 3. Barshinger Life Sciences (LSB) */}
            <g
              transform="translate(315, 220)"
              filter="url(#soft-shadow)"
              className="cursor-pointer"
              onClick={() => handleSelectPin(RESTROOMS.find((r) => r.id === 'lsb') || RESTROOMS[0])}
            >
              <rect x="0" y="0" width="95" height="55" rx="7" fill="#FFFFFF" stroke="#DED6C7" strokeWidth="2" />
              {/* Glass Atrium Roof */}
              <path d="M 0 0 L 95 0 L 80 12 L 15 12 Z" fill="#D2E8F7" />
              <text x="47" y="30" textAnchor="middle" fill="#2A2238" fontSize="8.5" fontWeight="900">
                Barshinger Life Sci.
              </text>
              <text x="47" y="42" textAnchor="middle" fill="#7A7065" fontSize="7" fontWeight="700">
                Atrium &amp; Labs
              </text>
            </g>

            {/* 4. Stager Hall */}
            <g
              transform="translate(315, 425)"
              filter="url(#soft-shadow)"
              className="cursor-pointer"
              onClick={() => handleSelectPin(RESTROOMS.find((r) => r.id === 'stag') || RESTROOMS[0])}
            >
              <rect x="0" y="0" width="75" height="45" rx="6" fill="#FFFFFF" stroke="#DED6C7" strokeWidth="2" />
              <rect x="0" y="0" width="75" height="8" rx="3" fill="#E6DFD3" />
              <text x="37" y="25" textAnchor="middle" fill="#2A2238" fontSize="8.5" fontWeight="900">
                Stager Hall
              </text>
              <text x="37" y="35" textAnchor="middle" fill="#7A7065" fontSize="7" fontWeight="700">
                Academic Hall
              </text>
            </g>

            {/* 5. Keiper Liberal Arts */}
            <g
              transform="translate(320, 500)"
              filter="url(#soft-shadow)"
              className="cursor-pointer"
              onClick={() => handleSelectPin(RESTROOMS.find((r) => r.id === 'keip') || RESTROOMS[0])}
            >
              <rect x="0" y="0" width="80" height="45" rx="6" fill="#FFFFFF" stroke="#DED6C7" strokeWidth="2" />
              <rect x="0" y="0" width="80" height="8" rx="3" fill="#E6DFD3" />
              <text x="40" y="25" textAnchor="middle" fill="#2A2238" fontSize="8.5" fontWeight="900">
                Keiper Hall
              </text>
              <text x="40" y="35" textAnchor="middle" fill="#7A7065" fontSize="7" fontWeight="700">
                Liberal Arts
              </text>
            </g>

            {/* 6. Old Main (Historic Icon with Bell Cupola Tower) */}
            <g
              transform="translate(250, 580)"
              filter="url(#soft-shadow)"
              className="cursor-pointer"
              onClick={() => handleSelectPin(RESTROOMS.find((r) => r.id === 'main') || RESTROOMS[0])}
            >
              <rect x="0" y="0" width="115" height="52" rx="8" fill="#FFFDF8" stroke="#DED6C7" strokeWidth="2" />
              <rect x="0" y="0" width="115" height="10" rx="4" fill="#DCCFB8" />
              {/* Cupola Bell Tower */}
              <rect x="47" y="-18" width="22" height="18" rx="3" fill="#FFFDF8" stroke="#DED6C7" strokeWidth="1.5" />
              <polygon points="46,-18 58,-32 70,-18" fill="#589E78" />
              <circle cx="58" cy="-8" r="3" fill="#D48A0F" />
              <text x="58" y="27" textAnchor="middle" fill="#2A2238" fontSize="10" fontWeight="900">
                Old Main 🏛️
              </text>
              <text x="58" y="39" textAnchor="middle" fill="#7A7065" fontSize="7.5" fontWeight="700">
                Historic F&amp;M Center
              </text>
            </g>

            {/* 7. Shadek-Fackenthal Library */}
            <g
              transform="translate(155, 655)"
              filter="url(#soft-shadow)"
              className="cursor-pointer"
              onClick={() => handleSelectPin(RESTROOMS.find((r) => r.id === 'lib1') || RESTROOMS[0])}
            >
              <rect x="0" y="0" width="95" height="65" rx="8" fill="#FFFFFF" stroke="#DED6C7" strokeWidth="2" />
              <rect x="0" y="0" width="95" height="12" rx="4" fill="#E8DEC9" />
              <text x="47" y="32" textAnchor="middle" fill="#2A2238" fontSize="9" fontWeight="900">
                Shadek Library 📚
              </text>
              <text x="47" y="44" textAnchor="middle" fill="#7A7065" fontSize="7.5" fontWeight="700">
                Main Quiet Stacks
              </text>
            </g>

            {/* 8. Steinman College Center (SCC / Dining Hub) */}
            <g
              transform="translate(275, 655)"
              filter="url(#soft-shadow)"
              className="cursor-pointer"
              onClick={() => handleSelectPin(RESTROOMS.find((r) => r.id === 'scc1') || RESTROOMS[0])}
            >
              <rect x="0" y="0" width="115" height="65" rx="8" fill="#FFFFFF" stroke="#DED6C7" strokeWidth="2" />
              <rect x="0" y="0" width="115" height="12" rx="4" fill="#E8DEC9" />
              <text x="57" y="32" textAnchor="middle" fill="#2A2238" fontSize="9" fontWeight="900">
                Steinman Center 🥗
              </text>
              <text x="57" y="44" textAnchor="middle" fill="#7A7065" fontSize="7.5" fontWeight="700">
                Dining Hall, Blue Room &amp; Hub
              </text>
            </g>

            {/* 9. East Spine: College Houses along North Pine Street */}

            {/* Ware College House (North Ben) */}
            <g
              transform="translate(530, 240)"
              filter="url(#soft-shadow)"
              className="cursor-pointer"
              onClick={() => handleSelectPin(RESTROOMS.find((r) => r.id === 'ware') || RESTROOMS[0])}
            >
              <rect x="0" y="0" width="95" height="55" rx="8" fill="#FFFFFF" stroke="#8E5CE0" strokeWidth="2" strokeOpacity="0.4" />
              <rect x="0" y="0" width="95" height="8" rx="4" fill="#8E5CE0" fillOpacity="0.2" />
              <circle cx="12" cy="18" r="5" fill="#8E5CE0" />
              <text x="50" y="26" textAnchor="middle" fill="#2A2238" fontSize="8.5" fontWeight="900">
                Ware House
              </text>
              <text x="50" y="38" textAnchor="middle" fill="#8E5CE0" fontSize="7.5" fontWeight="800">
                North Ben Commons
              </text>
            </g>

            {/* Bonchek College House (South Ben) */}
            <g
              transform="translate(525, 325)"
              filter="url(#soft-shadow)"
              className="cursor-pointer"
              onClick={() => handleSelectPin(RESTROOMS.find((r) => r.id === 'bonchek') || RESTROOMS[0])}
            >
              <rect x="0" y="0" width="95" height="55" rx="8" fill="#FFFFFF" stroke="#3D6FE0" strokeWidth="2" strokeOpacity="0.4" />
              <rect x="0" y="0" width="95" height="8" rx="4" fill="#3D6FE0" fillOpacity="0.2" />
              <circle cx="12" cy="18" r="5" fill="#3D6FE0" />
              <text x="50" y="26" textAnchor="middle" fill="#2A2238" fontSize="8.5" fontWeight="900">
                Bonchek House
              </text>
              <text x="50" y="38" textAnchor="middle" fill="#3D6FE0" fontSize="7.5" fontWeight="800">
                South Ben Dorms
              </text>
            </g>

            {/* Brooks College House (Buchanan) */}
            <g
              transform="translate(520, 410)"
              filter="url(#soft-shadow)"
              className="cursor-pointer"
              onClick={() => handleSelectPin(RESTROOMS.find((r) => r.id === 'brooks') || RESTROOMS[0])}
            >
              <rect x="0" y="0" width="95" height="55" rx="8" fill="#FFFFFF" stroke="#D9483F" strokeWidth="2" strokeOpacity="0.4" />
              <rect x="0" y="0" width="95" height="8" rx="4" fill="#D9483F" fillOpacity="0.2" />
              <circle cx="12" cy="18" r="5" fill="#D9483F" />
              <text x="50" y="26" textAnchor="middle" fill="#2A2238" fontSize="8.5" fontWeight="900">
                Brooks House
              </text>
              <text x="50" y="38" textAnchor="middle" fill="#D9483F" fontSize="7.5" fontWeight="800">
                Buchanan Commons
              </text>
            </g>

            {/* Weis College House */}
            <g
              transform="translate(515, 495)"
              filter="url(#soft-shadow)"
              className="cursor-pointer"
              onClick={() => handleSelectPin(RESTROOMS.find((r) => r.id === 'weis') || RESTROOMS[0])}
            >
              <rect x="0" y="0" width="95" height="55" rx="8" fill="#FFFFFF" stroke="#D48A0F" strokeWidth="2" strokeOpacity="0.4" />
              <rect x="0" y="0" width="95" height="8" rx="4" fill="#D48A0F" fillOpacity="0.2" />
              <circle cx="12" cy="18" r="5" fill="#D48A0F" />
              <text x="50" y="26" textAnchor="middle" fill="#2A2238" fontSize="8.5" fontWeight="900">
                Weis House
              </text>
              <text x="50" y="38" textAnchor="middle" fill="#D48A0F" fontSize="7.5" fontWeight="800">
                Weis Hall Commons
              </text>
            </g>

            {/* Roschel Performing Arts Center */}
            <g
              transform="translate(460, 585)"
              filter="url(#soft-shadow)"
              className="cursor-pointer"
              onClick={() => handleSelectPin(RESTROOMS.find((r) => r.id === 'roschel') || RESTROOMS[0])}
            >
              <rect x="0" y="0" width="105" height="58" rx="8" fill="#FFFFFF" stroke="#2A9A72" strokeWidth="2" strokeOpacity="0.4" />
              <rect x="0" y="0" width="105" height="8" rx="4" fill="#2A9A72" fillOpacity="0.2" />
              <circle cx="12" cy="18" r="5" fill="#2A9A72" />
              <text x="55" y="26" textAnchor="middle" fill="#2A2238" fontSize="8.5" fontWeight="900">
                Roschel Center 🎭
              </text>
              <text x="55" y="38" textAnchor="middle" fill="#2A9A72" fontSize="7.5" fontWeight="800">
                Performing Arts &amp; House
              </text>
            </g>

            {/* Buchanan Park Pavilion */}
            <g
              transform="translate(95, 785)"
              filter="url(#soft-shadow)"
              className="cursor-pointer"
              onClick={() => handleSelectPin(RESTROOMS.find((r) => r.id === 'park') || RESTROOMS[0])}
            >
              <rect x="0" y="0" width="95" height="45" rx="7" fill="#FFFFFF" stroke="#DED6C7" strokeWidth="2" />
              <text x="47" y="22" textAnchor="middle" fill="#2A2238" fontSize="8.5" fontWeight="900">
                Park Pavilion
              </text>
              <text x="47" y="33" textAnchor="middle" fill="#7A7065" fontSize="7" fontWeight="700">
                Buchanan Restrooms
              </text>
            </g>

            {/* Interactive Restroom Map Pins */}
            {RESTROOMS.map((r) => {
              const isSelected = selectedRestroom?.id === r.id;
              const matchesFilter = filteredRestrooms.some((fr) => fr.id === r.id);
              const st = getStatus(r.id);

              return (
                <g
                  key={r.id}
                  transform={`translate(${r.x}, ${r.y})`}
                  className="cursor-pointer transition-transform duration-200"
                  style={{
                    opacity: matchesFilter ? 1 : 0.22,
                    filter: isSelected ? 'url(#pin-glow)' : 'url(#soft-shadow)',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPin(r);
                  }}
                >
                  {/* Outer selection ring if selected */}
                  {isSelected && (
                    <circle
                      cx="0"
                      cy="0"
                      r="22"
                      fill="none"
                      stroke="#7C5CE5"
                      strokeWidth="3.5"
                      strokeDasharray="4 2"
                      className="animate-spin"
                      style={{ animationDuration: '6s' }}
                    />
                  )}

                  {/* Pin Background Bubble */}
                  <circle
                    cx="0"
                    cy="0"
                    r={isSelected ? 16 : 13}
                    fill={r.all ? '#7C5CE5' : '#323C4D'}
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                  />

                  {/* Icon */}
                  <text
                    x="0"
                    y={isSelected ? 4.5 : 4}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize={isSelected ? 12 : 9.5}
                    fontWeight="900"
                    style={{ pointerEvents: 'none' }}
                  >
                    {r.all ? '⚧' : '🚻'}
                  </text>

                  {/* Status Indicator Dot */}
                  <circle
                    cx="8"
                    cy="-8"
                    r="4.5"
                    fill={st ? st.dot : '#23A27E'}
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                </g>
              );
            })}
          </svg>

          {/* Interactive Floating Detail Overlay for Selected Pin */}
          {selectedRestroom && (
            <div className="absolute bottom-3 left-3 right-3 bg-[#FFFDF9]/95 backdrop-blur-md p-3.5 rounded-2xl border border-[var(--line)] shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="min-w-0 flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-2xl grid place-items-center text-[22px] flex-none shadow-sm"
                  style={{ background: selectedRestroom.all ? 'var(--lav-l)' : '#F5EBE1' }}
                >
                  {selectedRestroom.all ? '⚧' : '🚻'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <b className="text-[14px] font-black text-[var(--ink)] truncate block">
                      {selectedRestroom.b}
                    </b>
                    {getStatus(selectedRestroom.id) ? (
                      <span className={`apple-tag ${getStatus(selectedRestroom.id)?.cls} text-[10px] font-black py-0.5`}>
                        {getStatus(selectedRestroom.id)?.short}
                      </span>
                    ) : (
                      <span className="apple-tag t-lav text-[10px] font-black py-0.5">
                        ✓ Operational
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] font-bold text-[var(--muted)] truncate">
                    📍 {selectedRestroom.f} · {selectedRestroom.all ? 'All-gender' : 'Standard'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-none">
                <button
                  type="button"
                  className="apple-btn-primary py-2 px-3 text-[12px] font-black shadow-sm"
                  onClick={() => onOpenRestroom(selectedRestroom)}
                >
                  Report / Details →
                </button>
                <button
                  type="button"
                  className="w-8 h-8 rounded-xl bg-[var(--card)] font-bold text-[16px] text-[var(--muted)] hover:text-[var(--ink)] grid place-items-center border border-[var(--line)]"
                  onClick={() => setSelectedRestroom(null)}
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Restroom Cards Grid (Square/Rectangular Cards Retained) */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-[17px] font-black tracking-tight text-[var(--ink)]">
            {filteredRestrooms.length} Restroom Location{filteredRestrooms.length !== 1 ? 's' : ''}
          </h2>
          <span className="text-[12px] font-bold text-[var(--muted)]">
            Tap card to report or view details
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredRestrooms.map((r) => {
            const st = getStatus(r.id);
            const isSelected = selectedRestroom?.id === r.id;

            return (
              <button
                key={r.id}
                ref={(el) => {
                  cardRefs.current[r.id] = el;
                }}
                type="button"
                className={`apple-card my-0 p-4 text-left transition-all hover:scale-[1.01] hover:shadow-[var(--shadow-hover)] border flex flex-col justify-between group cursor-pointer ${
                  isSelected ? 'border-[var(--brand)] ring-2 ring-[var(--brand)]/20 shadow-md bg-[#FFFDF8]' : 'border-[var(--line)]'
                }`}
                onClick={() => {
                  setSelectedRestroom(r);
                  onOpenRestroom(r);
                }}
              >
                <div>
                  {/* Top Bar: Icon + Building + Status Badge */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-10 h-10 rounded-2xl grid place-items-center text-[20px] flex-none shadow-sm transition-transform group-hover:scale-105"
                        style={{ background: r.all ? 'var(--lav-l)' : '#F5EBE1' }}
                      >
                        {r.all ? '⚧' : '🚻'}
                      </div>
                      <div className="min-w-0">
                        <b className="text-[15px] font-black text-[var(--ink)] block leading-snug truncate">
                          {r.b}
                        </b>
                        <span className="text-[12px] font-bold text-[var(--muted)] block">
                          📍 {r.f}
                        </span>
                      </div>
                    </div>

                    {st ? (
                      <span className={`apple-tag ${st.cls} flex-none text-[11px] font-extrabold`}>
                        {st.short}
                      </span>
                    ) : (
                      <span className="apple-tag t-lav flex-none text-[11px] font-extrabold">
                        ✓ Operational
                      </span>
                    )}
                  </div>

                  {/* Amenity Badges */}
                  <div className="flex flex-wrap gap-1.5 my-2">
                    {r.all && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-[var(--lav-l)] text-[#5040C0]">
                        ⚧ All-Gender
                      </span>
                    )}
                    {r.acc && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-[var(--mint-l)] text-[#11634C]">
                        ♿ ADA
                      </span>
                    )}
                    {r.per && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-[var(--peach-l)] text-[var(--peach-d)]">
                        🌸 Period Products
                      </span>
                    )}
                    {r.single && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-[#FFF2DE] text-[#B87000]">
                        🚪 Single-Stall
                      </span>
                    )}
                    {r.baby && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-[#EBF6FF] text-[#1E6AC4]">
                        🍼 Changing Table
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-2 mt-2 border-t border-[var(--line)] flex items-center justify-between text-[12px] font-bold text-[var(--ink2)] group-hover:text-[var(--ink)]">
                  <span>Facilities Queue</span>
                  <span className="text-[var(--brand)] font-extrabold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Report / Inspect →
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
