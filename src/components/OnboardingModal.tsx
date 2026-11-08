import React, { useState } from 'react';
import type { HouseId, ModeType } from '../types';
import { HOUSES } from '../data/appleData';

interface OnboardingModalProps {
  initialHouse: HouseId;
  initialMode: ModeType;
  userName?: string;
  onComplete: (house: HouseId, mode: ModeType) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  initialHouse,
  initialMode,
  userName,
  onComplete,
}) => {
  const [selectedMode, setSelectedMode] = useState<ModeType>(initialMode);
  const houseConfig = HOUSES.find((h) => h.id === initialHouse);

  return (
    <div className="fixed inset-0 z-50 bg-[var(--bg)] overflow-auto px-6 py-10 flex flex-col justify-between">
      <div className="max-w-[440px] w-full mx-auto space-y-4">
        <img
          src="/icon-192.png"
          alt="Call of Doodie Icon"
          className="w-[76px] h-[76px] rounded-[22px] shadow-[var(--shadow)] object-contain p-2 bg-[var(--card)] border border-[var(--line)] mb-2"
        />

        <h1 className="text-[34px] font-black leading-[1.05] tracking-tight text-[var(--ink)] select-none">
          Let's talk about gut health.<br />
          <span className="text-[var(--peach-d)]">Seriously.</span>
        </h1>

        <p className="text-[14.5px] font-semibold text-[var(--ink2)] leading-relaxed">
          {userName ? `Welcome, ${userName}! ` : ''}Everyone does it, but almost nobody tracks it. How often and how easily you poop are two of the best signs of your stress, sleep, and health.
        </p>

        {/* 3 Icons Trio */}
        <div className="grid grid-cols-3 gap-2.5 my-3">
          <div className="apple-card my-0 p-3.5 text-center font-black text-[14px]">
            <span className="text-[30px] block mb-1">💩</span>
            Digestion
          </div>
          <div className="apple-card my-0 p-3.5 text-center font-black text-[14px]">
            <span className="text-[30px] block mb-1">😴</span>
            Sleep
          </div>
          <div className="apple-card my-0 p-3.5 text-center font-black text-[14px]">
            <span className="text-[30px] block mb-1">💧</span>
            Hydration
          </div>
        </div>

        {/* Confirmed College House Faction (Set during registration) */}
        <div className="p-3.5 bg-[var(--card)] rounded-2xl border-2 border-[var(--line)] shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="w-4 h-4 rounded-full flex-none shadow-sm"
              style={{ background: houseConfig?.color || 'var(--peach)' }}
            />
            <div className="min-w-0">
              <span className="text-[11px] font-black text-[var(--muted)] block uppercase tracking-wider">
                Your F&amp;M Residence
              </span>
              <b className="text-[14.5px] font-black text-[var(--ink)] block truncate">
                {houseConfig?.name || initialHouse}
              </b>
            </div>
          </div>
          <span className="text-[11px] font-black text-[#11634C] bg-[var(--mint-l)] px-2.5 py-1 rounded-full flex-none">
            ✓ Set at Registration
          </span>
        </div>

        {/* Vibe Selection */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[14px] font-black text-[var(--ink)]">
              Choose your mode
            </p>
            <span className="text-[11px] font-black text-[var(--brand)]">
              {selectedMode === 'playful' ? 'Full Fun + AI' : 'Quiet (No AI)'}
            </span>
          </div>
          <div className="apple-seg mb-2">
            <button
              type="button"
              className={selectedMode === 'playful' ? 'on' : ''}
              onClick={() => setSelectedMode('playful')}
            >
              💩 Playful
            </button>
            <button
              type="button"
              className={selectedMode === 'discreet' ? 'on' : ''}
              onClick={() => setSelectedMode('discreet')}
            >
              🌿 Discreet
            </button>
          </div>
          <p className="text-[12px] text-[var(--muted)] font-semibold leading-snug">
            {selectedMode === 'playful'
              ? 'Playful: Full experience with emojis, house challenges, and AI tools.'
              : 'Discreet: Named Gut Log. Emojis and all camera and AI tools are turned off.'}
          </p>
        </div>

        <div className="pt-4">
          <button
            type="button"
            className="apple-btn text-[18px]"
            onClick={() => onComplete(initialHouse, selectedMode)}
          >
            Let's go →
          </button>
          <p className="text-[12px] text-[var(--muted)] font-bold text-center mt-3 leading-normal">
            🔒 Private by design · zero photos · anonymous House Cup<br />
            100% real personal health logs.
          </p>
        </div>
      </div>
    </div>
  );
};
