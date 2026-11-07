import React from 'react';
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
  return (
    <div
      className={`grid grid-cols-2 gap-2.5 ${className}`}
      role="radiogroup"
      aria-label="F&M College House Selection"
    >
      {HOUSES.map((h) => {
        const isSelected = selectedHouse === h.id;
        const isWeis = h.id === 'Weis';

        return (
          <button
            key={h.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(h.id)}
            className="p-3 rounded-2xl text-left transition-all duration-150 cursor-pointer select-none flex items-center justify-between min-w-0"
            style={{
              gridColumn: isWeis ? '1 / -1' : undefined,
              border: isSelected ? `2.5px solid ${h.color}` : '2px solid #E5DFD5',
              backgroundColor: isSelected ? `${h.color}15` : '#FFFFFF',
              boxShadow: isSelected
                ? `0 0 0 1px ${h.color}, 0 4px 14px ${h.color}25`
                : '0 1px 3px rgba(42, 34, 56, 0.05)',
            }}
          >
            <div className="flex items-center gap-2.5 min-w-0 pr-1">
              <span
                className="w-3.5 h-3.5 rounded-full flex-none shadow-sm"
                style={{ background: h.color }}
              />
              <div className="min-w-0 truncate">
                <span className="text-[13.5px] font-black text-[var(--ink)] block leading-snug truncate">
                  {h.id} House
                </span>
                <span
                  className="text-[11px] font-extrabold block leading-tight truncate"
                  style={{ color: isSelected ? h.color : 'var(--muted)' }}
                >
                  {isSelected ? '✓ Active Faction' : 'College House'}
                </span>
              </div>
            </div>

            <div className="flex-none ml-1.5">
              {isSelected ? (
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[11px] font-black shadow-sm"
                  style={{ background: h.color }}
                >
                  ✓
                </span>
              ) : (
                <span className="w-5 h-5 rounded-full border-2 border-[#D8CFC3] bg-[#F7F4EE] block" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
