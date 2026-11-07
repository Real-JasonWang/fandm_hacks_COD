import React from 'react';
import type { ModeType } from '../types';
import type { UserAccount } from '../lib/authDatabase';

interface AppleTopBarProps {
  mode: ModeType;
  currentUser: UserAccount | null;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
}

export const AppleTopBar: React.FC<AppleTopBarProps> = ({
  mode,
  currentUser,
  onOpenSettings,
  onOpenAuth,
}) => {
  const isPlayful = mode === 'playful';

  return (
    <div className="flex items-center justify-between py-2 mb-3">
      <div className="flex items-center gap-2.5">
        <img
          src="/icon-192.png"
          alt="Call of Doodie Logo"
          className="w-[38px] h-[38px] rounded-[11px] shadow-sm object-cover"
          style={isPlayful ? undefined : { filter: 'grayscale(1)', opacity: 0.7 }}
        />
        <div>
          <b className="text-[18px] font-black tracking-tight block leading-tight text-[var(--ink)]">
            {isPlayful ? 'Call of Doodie' : 'Gut Log'}
          </b>
          <small className="text-[11.5px] text-[var(--muted)] font-bold block">
            {currentUser
              ? `${currentUser.displayName} · ${currentUser.houseId}`
              : isPlayful
              ? 'F&M Gut Health & House Cup 💩'
              : 'F&M Wellness Check-in'}
          </small>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenAuth}
          className="apple-chip text-[12px] py-1 px-2.5 font-extrabold"
          title="Campus Account Database"
        >
          {currentUser ? '👤 Account' : '🔑 Sign In'}
        </button>

        <button
          onClick={onOpenSettings}
          className="w-[40px] h-[40px] rounded-[14px] bg-[var(--card)] shadow-[var(--shadow)] grid place-items-center text-[19px] transition active:scale-95 hover:bg-[#FFFDF9]"
          aria-label="Settings and privacy"
        >
          ⚙️
        </button>
      </div>
    </div>
  );
};
