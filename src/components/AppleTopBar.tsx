import React from 'react';
import type { ModeType } from '../types';
import type { UserAccount } from '../lib/authDatabase';
import { HOUSES } from '../data/appleData';

interface AppleTopBarProps {
  mode: ModeType;
  currentUser: UserAccount | null;
  onOpenSettings: () => void;
}

export const AppleTopBar: React.FC<AppleTopBarProps> = ({
  mode,
  currentUser,
  onOpenSettings,
}) => {
  const isPlayful = mode === 'playful';
  const userHouse = currentUser ? HOUSES.find((h) => h.id === currentUser.houseId) : undefined;

  return (
    <div className="flex items-center justify-between py-2 mb-3">
      <div className="flex items-center gap-2.5 min-w-0">
        {/* User / Diplomat Avatar (Replaces poop logo) */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="w-[40px] h-[40px] rounded-[13px] flex items-center justify-center text-[22px] shadow-xs border transition-transform hover:scale-105 cursor-pointer flex-none"
          style={{
            backgroundColor: userHouse?.color ? `${userHouse.color}18` : '#F3E9DC',
            borderColor: userHouse?.color ? `${userHouse.color}45` : 'var(--line)',
          }}
          title={currentUser ? `${currentUser.displayName} · Settings` : 'Diplomat Profile · Settings'}
          aria-label="User profile and settings"
        >
          <span>{currentUser?.avatar || '🧑‍🎓'}</span>
        </button>

        <div className="min-w-0">
          <b className="text-[18px] font-black tracking-tight block leading-tight text-[var(--ink)] truncate">
            {isPlayful ? 'Call of Doodie' : 'Gut Log'}
          </b>
          <small className="text-[11.5px] text-[var(--muted)] font-bold block truncate">
            {isPlayful
              ? 'Gut health tracker for yourself and the whole campus :)'
              : 'Gut health tracker for campus'}
          </small>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-none ml-2">
        <button
          onClick={onOpenSettings}
          className="apple-chip text-[12.5px] py-1.5 px-3 font-extrabold flex items-center gap-1.5 hover:border-[var(--ink2)]"
          title="Settings and Preferences"
        >
          <span>⚙️</span>
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
};
