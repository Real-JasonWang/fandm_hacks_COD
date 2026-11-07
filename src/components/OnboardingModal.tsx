import React, { useState } from 'react';
import type { HouseId, ModeType } from '../types';
import { HOUSES } from '../data/appleData';

interface OnboardingModalProps {
  initialHouse: HouseId;
  initialMode: ModeType;
  onComplete: (house: HouseId, mode: ModeType) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  initialHouse,
  initialMode,
  onComplete,
}) => {
  const [selectedHouse, setSelectedHouse] = useState<HouseId>(initialHouse);
  const [selectedMode, setSelectedMode] = useState<ModeType>(initialMode);

  return (
    <div className="fixed inset-0 z-50 bg-[var(--bg)] overflow-auto px-6 py-10 flex flex-col justify-between">
      <div className="max-w-[440px] w-full mx-auto space-y-4">
        <img
          src="/icon-192.png"
          alt="App Icon"
          className="w-[76px] h-[76px] rounded-[22px] shadow-[var(--shadow)] object-cover mb-2"
        />

        <h1 className="text-[34px] font-black leading-[1.05] tracking-tight text-[var(--ink)]">
          Let's talk about gut health.<br />
          <span className="text-[var(--peach-d)]">Seriously.</span>
        </h1>

        <p className="text-[14.5px] font-semibold text-[var(--ink2)] leading-relaxed">
          Everyone does it, almost nobody tracks it — but stool motility and consistency are two of the clearest biometric indicators of student stress and recovery.
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
            <span className="text-[30px] block mb-1">🥗</span>
            Hydration
          </div>
        </div>

        {/* House Selection */}
        <div>
          <p className="text-[14px] font-black text-[var(--ink)] mb-2">
            Which F&amp;M College House are you in?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {HOUSES.map((h) => {
              const isSelected = selectedHouse === h.id;
              return (
                <button
                  key={h.id}
                  type="button"
                  className={`apple-card my-0 p-3 flex items-center gap-2.5 font-black text-[14px] text-left border-2 transition ${
                    isSelected ? 'border-[var(--ink)]' : 'border-transparent'
                  }`}
                  onClick={() => setSelectedHouse(h.id)}
                >
                  <span
                    className="w-3 h-3 rounded-full flex-none"
                    style={{ background: h.color }}
                  />
                  {h.id}
                </button>
              );
            })}
          </div>
        </div>

        {/* Vibe Selection */}
        <div>
          <p className="text-[14px] font-black text-[var(--ink)] mb-2">
            Pick a vibe
          </p>
          <div className="apple-seg">
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
        </div>

        <div className="pt-4">
          <button
            type="button"
            className="apple-btn text-[18px]"
            onClick={() => onComplete(selectedHouse, selectedMode)}
          >
            Let's go →
          </button>
          <p className="text-[12px] text-[var(--muted)] font-bold text-center mt-3 leading-normal">
            🔒 Private by design · zero photos · anonymous House Cup<br />
            Preloaded with 2 weeks of realistic health logs.
          </p>
        </div>
      </div>
    </div>
  );
};
