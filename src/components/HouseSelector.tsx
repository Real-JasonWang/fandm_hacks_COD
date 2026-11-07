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
      {/* Category Tab Switcher */}
      <div className="flex p-0.5 bg-[#F2EDE4] rounded-xl border border-[var(--line)]">
        <button
          type="button"
          className={`flex-1 py-1 text-[11.5px] font-black rounded-lg transition-all cursor-pointer ${
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
          className={`flex-1 py-1 text-[11.5px] font-black rounded-lg transition-all cursor-pointer ${
            activeCategory === 'house'
              ? 'bg-white text-[var(--ink)] shadow-xs'
              : 'text-[var(--muted)] hover:text-[var(--ink)]'
          }`}
          onClick={() => setActiveCategory('house')}
        >
          College Houses (5)
        </button>
        <button
          type="button"
          className={`flex-1 py-1 text-[11.5px] font-black rounded-lg transition-all cursor-pointer ${
            activeCategory === 'hall'
              ? 'bg-white text-[var(--ink)] shadow-xs'
              : 'text-[var(--muted)] hover:text-[var(--ink)]'
          }`}
          onClick={() => setActiveCategory('hall')}
        >
          Residence Halls (5)
        </button>
      </div>

      {/* Grid of Residential Communities - NO UGLY COLOR DOTS */}
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
                  ? 'border-[var(--brand)] bg-[#FFF6EE] shadow-sm ring-1 ring-[var(--brand)]/20'
                  : 'border-[var(--line)] bg-white hover:border-[#D8CFC3] hover:bg-[#FFFDF9]'
              }`}
            >
              <div className="min-w-0 pr-1 truncate">
                <span className="text-[13.5px] font-black text-[var(--ink)] block leading-snug truncate">
                  {h.name.replace(' College House', ' House')}
                </span>
                <span
                  className={`text-[11px] font-extrabold block leading-tight truncate ${
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

              {/* Clean Checkmark / Radio Indicator (No colored circle dot!) */}
              <div className="flex-none ml-1.5">
                {isSelected ? (
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[11px] font-black bg-[var(--brand)] shadow-xs">
                    ✓
                  </span>
                ) : (
                  <span className="w-5 h-5 rounded-full border-2 border-[#D8CFC3] bg-[#FAF8F5] block" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
