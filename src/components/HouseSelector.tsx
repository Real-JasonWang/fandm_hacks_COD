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

      {/* Grid of Residential Communities - Clean Borderless List */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 py-1">
        {displayedHouses.map((h) => {
          const isSelected = selectedHouse === h.id;

          return (
            <button
              key={h.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(h.id)}
              className="p-2 text-left transition-opacity duration-150 cursor-pointer select-none flex items-center justify-between min-w-0 border-0 bg-transparent shadow-none hover:opacity-75 focus:outline-none"
            >
              <div className="min-w-0 pr-1.5 flex-1">
                <span className="text-[14px] font-black text-[var(--ink)] block leading-snug truncate">
                  {h.name.replace(' College House', ' House')}
                </span>
                <span className="text-[11.5px] block leading-tight truncate mt-0.5 font-bold text-[var(--muted)]">
                  {h.category === 'house' ? 'College House' : 'Residence Hall'}
                  {isSelected && (
                    <span className="text-[var(--brand)] font-extrabold ml-1.5">· Selected</span>
                  )}
                </span>
              </div>

              {/* iOS Radio Indicator */}
              <div className="flex-none ml-1">
                {isSelected ? (
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[11px] font-black bg-[var(--brand)] shadow-xs">
                    ✓
                  </span>
                ) : (
                  <span className="w-5 h-5 rounded-full border-2 border-[#D8CFC3] bg-transparent block" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
