import React from 'react';
import type { ModeType } from '../types';

interface AppleTopBarProps {
  mode: ModeType;
  onOpenSettings: () => void;
}

export const AppleTopBar: React.FC<AppleTopBarProps> = ({ mode, onOpenSettings }) => {
  const isPlayful = mode === 'playful';

  return (
    <div className="flex items-center justify-between py-2 mb-3">
      <div className="flex items-center gap-2.5">
        <img
          src="/icon-192.png"
          alt="Call of Doodie Icon"
          className="w-[38px] h-[38px] rounded-[11px] shadow-sm object-cover"
          style={isPlayful ? undefined : { filter: 'grayscale(1)', opacity: 0.7 }}
        />
        <div>
          <b className="text-[18px] font-black tracking-tight block leading-tight text-[var(--ink)]">
            {isPlayful ? 'Call of Doodie' : 'Gut Log'}
          </b>
          <small className="text-[11.5px] text-[var(--muted)] font-bold">
            {isPlayful ? 'F&M Gut Health & House Cup 💩' : 'F&M Wellness Check-in'}
          </small>
        </div>
      </div>

      <button
        onClick={onOpenSettings}
        className="w-[42px] h-[42px] rounded-[14px] bg-[var(--card)] shadow-[var(--shadow)] grid place-items-center text-[20px] transition active:scale-95 hover:bg-[#FFFDF9]"
        aria-label="Settings and privacy"
      >
        ⚙️
      </button>
    </div>
  );
};
