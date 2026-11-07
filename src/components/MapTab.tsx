import React, { useState } from 'react';
import type { AppSettings, Restroom } from '../types';
import { RESTROOMS, FILTERS } from '../data/appleData';

interface MapTabProps {
  settings: AppSettings;
  onOpenRestroom: (restroom: Restroom) => void;
}

export const MapTab: React.FC<MapTabProps> = ({ settings, onOpenRestroom }) => {
  const [activeFilter, setActiveFilter] = useState<string>('any');

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
    if (rep.clean >= 2) {
      return { cls: 't-peach', short: 'Needs cleaning', dot: '#FF9F6B' };
    }
    if (rep.supplies >= 1) {
      return { cls: 't-sun', short: 'Low supplies', dot: '#FFC94A' };
    }
    if (rep.ok >= 1) {
      return { cls: 't-mint', short: 'Clean ✓', dot: '#23A27E' };
    }
    return null;
  };

  const getFeatText = (r: Restroom) => {
    const list: string[] = [];
    if (r.all) list.push('All-gender');
    if (r.acc) list.push('Accessible');
    if (r.per) list.push('Period products');
    if (r.single) list.push('Single-stall');
    if (r.baby) list.push('Changing table');
    return list.length > 0 ? list.join(' · ') : "Women's & men's";
  };

  // Schematic Buildings on F&M Campus
  const buildings: [number, number, number, number, string][] = [
    [190, 24, 140, 50, "Alumni Sports & Fitness"],
    [24, 70, 110, 50, "Hackman Phys. Sci."],
    [160, 96, 120, 48, "Barshinger Life Sci."],
    [24, 146, 96, 46, "Ware · N. Ben"],
    [24, 200, 96, 46, "Bonchek · S. Ben"],
    [250, 152, 92, 46, "Weis Hall"],
    [250, 206, 92, 52, "Brooks · Buchanan"],
    [128, 266, 108, 44, "Steinman Center"],
    [24, 282, 92, 70, "Shadek Library"],
    [250, 280, 92, 40, "Stager Hall"],
    [250, 336, 92, 40, "Keiper Hall"],
    [134, 350, 96, 42, "Old Main"],
  ];

  return (
    <div className="apple-view space-y-3 pb-24">
      <div>
        <h1 className="text-[27px] font-black tracking-tight text-[var(--ink)]">
          Bathroom map
        </h1>
        <p className="text-[14px] font-semibold text-[var(--ink2)]">
          Locate all-gender, ADA-accessible, and stocked restrooms on F&amp;M campus.
        </p>
      </div>

      {/* Filter Horizontal Scroll */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            className={`apple-chip ${activeFilter === f.id ? 'on' : ''}`}
            onClick={() => setActiveFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Schematic Campus SVG Map */}
      <div className="rounded-[24px] overflow-hidden shadow-[var(--shadow)] bg-[#EAF3E6] relative">
        <svg
          viewBox="0 0 360 440"
          className="w-full h-auto block select-none"
          role="img"
          aria-label="F&M Campus Restroom Map"
        >
          {/* Base Map Lawn */}
          <rect width="360" height="440" fill="#EAF3E6" />

          {/* College House Green Quad */}
          <rect x="128" y="150" width="108" height="104" rx="18" fill="#CFE8C6" />
          <text
            x="182"
            y="198"
            textAnchor="middle"
            fontSize="10"
            fontWeight="800"
            fill="#5E8A55"
          >
            College House
          </text>
          <text
            x="182"
            y="211"
            textAnchor="middle"
            fontSize="10"
            fontWeight="800"
            fill="#5E8A55"
          >
            Green
          </text>

          {/* Campus Walkways */}
          <path
            d="M0 418H360M140 0V140M244 0V440M120 258H360M0 258H124M182 254V346"
            stroke="#FFFFFF"
            strokeWidth="9"
            fill="none"
            strokeLinecap="round"
          />
          <text x="12" y="434" fontSize="10" fontWeight="800" fill="#8AA284">
            COLLEGE AVE
          </text>

          {/* Campus Buildings */}
          {buildings.map((b, idx) => {
            const words = b[4].split(' ');
            const lines: string[] = [];
            let cur = '';
            for (const w of words) {
              if ((cur + ' ' + w).trim().length > 14) {
                lines.push(cur.trim());
                cur = w;
              } else {
                cur += ' ' + w;
              }
            }
            lines.push(cur.trim());

            return (
              <g key={idx}>
                <rect
                  x={b[0]}
                  y={b[1]}
                  width={b[2]}
                  height={b[3]}
                  rx={10}
                  fill="#FFFFFF"
                  stroke="#DCE7D6"
                  strokeWidth="1.5"
                />
                {lines.map((ln, i) => (
                  <text
                    key={i}
                    x={b[0] + b[2] / 2}
                    y={b[1] + b[3] / 2 + 4 + (i - (lines.length - 1) / 2) * 12}
                    textAnchor="middle"
                    fontSize="10.5"
                    fontWeight="800"
                    fill="#5F5770"
                  >
                    {ln}
                  </text>
                ))}
              </g>
            );
          })}

          {/* Restroom Interactive Pins */}
          {RESTROOMS.map((r) => {
            const matches =
              activeFilter === 'any' ||
              (activeFilter === 'all' && r.all) ||
              (activeFilter === 'acc' && r.acc) ||
              (activeFilter === 'per' && r.per) ||
              (activeFilter === 'single' && r.single) ||
              (activeFilter === 'baby' && r.baby);

            const st = getStatus(r.id);
            const fill = r.all ? '#6E5FE6' : '#2A2238';

            return (
              <g
                key={r.id}
                className={matches ? "cursor-pointer transition-opacity duration-200" : "transition-opacity duration-200"}
                opacity={matches ? 1 : 0.18}
                style={{ pointerEvents: matches ? 'auto' : 'none' }}
                onClick={matches ? () => onOpenRestroom(r) : undefined}
              >
                <circle cx={r.x} cy={r.y} r="22" fill="transparent" />
                <circle
                  cx={r.x}
                  cy={r.y}
                  r="13"
                  fill={fill}
                  stroke="#FFFFFF"
                  strokeWidth="3"
                />
                <text
                  x={r.x}
                  y={r.y + 4.5}
                  textAnchor="middle"
                  fontSize="11.5"
                  fill="#FFFFFF"
                  fontWeight="900"
                >
                  {r.all ? '⚧' : 'WC'}
                </text>
                {st && st.dot && (
                  <circle
                    cx={r.x + 10}
                    cy={r.y - 10}
                    r="5.5"
                    fill={st.dot}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <p className="text-[12px] text-[var(--muted)] font-bold px-1">
        🗺️ Interactive schematic map. Tap any pin to report cleanliness or check amenities.
      </p>

      {/* Restroom List */}
      <div>
        <h2 className="text-[18px] font-black tracking-tight text-[var(--ink)] mb-2">
          {filteredRestrooms.length} restroom{filteredRestrooms.length !== 1 ? 's' : ''}
          {activeFilter !== 'any' && (
            <span className="text-[var(--ink2)] font-semibold text-[15px]">
              {' '}
              · {FILTERS.find((f) => f.id === activeFilter)?.label}
            </span>
          )}
        </h2>

        <div className="apple-card p-2 divide-y divide-[var(--line)]">
          {filteredRestrooms.map((r) => {
            const st = getStatus(r.id);
            return (
              <button
                key={r.id}
                className="w-full flex items-center gap-3 py-3 px-2 text-left hover:bg-[#FFFDF9] rounded-xl transition"
                onClick={() => onOpenRestroom(r)}
              >
                <div
                  className="w-10 h-10 rounded-[13px] grid place-items-center text-[19px] flex-none"
                  style={{ background: r.all ? 'var(--lav-l)' : '#F3E9DC' }}
                >
                  {r.all ? '⚧' : '🚻'}
                </div>
                <div className="flex-1 min-w-0">
                  <b className="text-[14.5px] font-black text-[var(--ink)] block truncate">
                    {r.b}
                  </b>
                  <p className="text-[12.5px] text-[var(--ink2)] font-semibold truncate">
                    {r.f} · {getFeatText(r)}
                  </p>
                </div>
                {st && <span className={`apple-tag ${st.cls}`}>{st.short}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
