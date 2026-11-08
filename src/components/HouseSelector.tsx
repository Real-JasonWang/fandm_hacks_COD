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
      {/* Segmented iOS Tab Switcher - Apple chunky segmented control matching Interface Vibe */}
      <div className="apple-seg tri mb-3">
        <button
          type="button"
          className={activeCategory === 'all' ? 'on' : ''}
          onClick={() => setActiveCategory('all')}
        >
          All ({HOUSES.length})
        </button>
        <button
          type="button"
          className={activeCategory === 'house' ? 'on' : ''}
          onClick={() => setActiveCategory('house')}
        >
          Houses ({collegeHouses.length})
        </button>
        <button
          type="button"
          className={activeCategory === 'hall' ? 'on' : ''}
          onClick={() => setActiveCategory('hall')}
        >
          Halls ({residenceHalls.length})
        </button>
      </div>

      {/* Grid of Residential Communities - Clean Tactile Apple Selection Cards */}
      <div className="grid grid-cols-2 gap-2.5">
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
                  ? 'border-2 border-[var(--brand)] bg-[#FFF6EE] shadow-[0_2px_8px_rgba(235,114,59,0.12)] ring-1 ring-[var(--brand)]/20'
                  : 'border border-[#E4DDD3] bg-white hover:border-[#CFC3B3] hover:bg-[#FFFCF8] shadow-[0_1px_3px_rgba(42,34,56,0.04)]'
              }`}
            >
              <div className="min-w-0 pr-1.5 flex-1">
                <span className="text-[14px] font-black text-[var(--ink)] block leading-snug truncate">
                  {h.name.replace(' College House', ' House')}
                </span>
                <span
                  className={`text-[11.5px] block leading-tight truncate mt-0.5 ${
                    isSelected
                      ? 'text-[var(--brand)] font-extrabold'
                      : 'text-[var(--muted)] font-bold'
                  }`}
                >
                  {isSelected
                    ? '✓ Selected'
                    : h.category === 'house'
                    ? 'College House'
                    : 'Residence Hall'}
                </span>
              </div>

              {/* iOS Radio Indicator */}
              <div className="flex-none ml-1">
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
