import React, { useState } from 'react';
import type { HouseId } from '../types';
import { HOUSES } from '../data/appleData';

export interface HouseSelectorProps {
  selectedHouse: string;
  onSelect: (houseId: HouseId) => void;
  className?: string;
}

export const HouseSelector: React.FC<HouseSelectorProps> = ({
  selectedHouse,
  onSelect,
  className = '',
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'house' | 'hall'>('all');

  const collegeHouses = HOUSES.filter((h) => h.category === 'house');
  const residenceHalls = HOUSES.filter((h) => h.category === 'hall');

  const displayedHouses =
    activeCategory === 'house'
      ? collegeHouses
      : activeCategory === 'hall'
      ? residenceHalls
      : HOUSES;

  return (
    <div className={`space-y-2.5 ${className}`} role="radiogroup" aria-label="F&M Residential Community Selection">
      {/* Segmented iOS Tab Switcher */}
      <div className="flex p-1 bg-[#EFE9DE] rounded-xl border border-[var(--line)]">
        <button
          type="button"
          className={`flex-1 py-1.5 text-[11.5px] font-black rounded-lg transition-all cursor-pointer ${
            activeCategory === 'all'
              ? 'bg-white text-[var(--ink)] shadow-xs'
              : 'text-[var(--muted)] hover:text-[var(--ink)]'
          }`}
          onClick={() => setActiveCategory('all')}
        >
          All ({HOUSES.length})
        </button>
        <button
          type="button"
          className={`flex-1 py-1.5 text-[11.5px] font-black rounded-lg transition-all cursor-pointer ${
            activeCategory === 'house'
              ? 'bg-white text-[var(--ink)] shadow-xs'
              : 'text-[var(--muted)] hover:text-[var(--ink)]'
          }`}
          onClick={() => setActiveCategory('house')}
        >
          Houses ({collegeHouses.length})
        </button>
        <button
          type="button"
          className={`flex-1 py-1.5 text-[11.5px] font-black rounded-lg transition-all cursor-pointer ${
            activeCategory === 'hall'
              ? 'bg-white text-[var(--ink)] shadow-xs'
              : 'text-[var(--muted)] hover:text-[var(--ink)]'
          }`}
          onClick={() => setActiveCategory('hall')}
        >
          Halls ({residenceHalls.length})
        </button>
      </div>

      {/* Grid of Residential Communities - Sleek Apple Selection Cards */}
      <div className="grid grid-cols-2 gap-2">
        {displayedHouses.map((h) => {
          const isSelected = selectedHouse === h.id;

          return (
            <button
              key={h.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(h.id)}
              className={`p-3 rounded-2xl text-left transition-all duration-150 cursor-pointer select-none flex items-center justify-between min-w-0 border ${
                isSelected
                  ? 'border-2 border-[var(--brand)] bg-[#FFF6EE] shadow-sm ring-1 ring-[var(--brand)]/20'
                  : 'border border-[var(--line)] bg-white hover:border-[#D8CFC3] hover:bg-[#FFFDF9]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span
                  className="w-1.5 h-8 rounded-full flex-none transition-transform"
                  style={{ backgroundColor: h.color }}
                />
                <div className="min-w-0 truncate">
                  <span className="text-[13.5px] font-black text-[var(--ink)] block leading-snug truncate">
                    {h.name.replace(' College House', ' House')}
                  </span>
                  <span
                    className={`text-[11px] font-bold block leading-tight truncate ${
                      isSelected ? 'text-[var(--brand)]' : 'text-[var(--muted)]'
                    }`}
                  >
                    {isSelected
                      ? '✓ Selected'
                      : h.category === 'house'
                      ? 'College House'
                      : 'Residence Hall'}
                  </span>
                </div>
              </div>

              {isSelected && (
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[11px] font-black bg-[var(--brand)] shadow-xs flex-none ml-1.5">
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
