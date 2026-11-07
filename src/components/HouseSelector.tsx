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
            className={`relative p-3.5 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer select-none flex items-center justify-between ${
              isWeis ? 'col-span-2' : ''
            } ${
              isSelected
                ? 'shadow-md scale-[1.02]'
                : 'border-[var(--line)] bg-white hover:border-[var(--ink2)]/30 hover:bg-[#FFFDF9] hover:translate-y-[-1px]'
            }`}
            style={
              isSelected
                ? {
                    borderColor: h.color,
                    backgroundColor: `${h.color}14`,
                    boxShadow: `0 0 0 1.5px ${h.color}, 0 6px 18px ${h.color}25`,
                  }
                : undefined
            }
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="w-4 h-4 rounded-full flex-none ring-2 ring-white shadow-sm transition-transform duration-200"
                style={{
                  background: h.color,
                  transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                }}
              />
              <div className="min-w-0">
                <span className="text-[14px] font-black text-[var(--ink)] block leading-snug truncate">
                  {h.id} House
                </span>
                <span
                  className="text-[11.5px] font-extrabold block leading-tight transition-colors duration-200"
                  style={{ color: isSelected ? h.color : 'var(--muted)' }}
                >
                  {isSelected ? '✓ Selected Faction' : 'College House'}
                </span>
              </div>
            </div>

            <div
              className="w-5 h-5 rounded-full flex-none flex items-center justify-center transition-all duration-200 ml-2"
              style={
                isSelected
                  ? {
                      background: h.color,
                      color: '#ffffff',
                      boxShadow: `0 2px 6px ${h.color}40`,
                    }
                  : { border: '2px solid var(--line)', background: '#F8F6F2' }
              }
            >
              {isSelected ? (
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );
};
