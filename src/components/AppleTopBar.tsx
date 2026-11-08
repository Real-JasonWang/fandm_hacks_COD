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
  const houseObj = currentUser ? HOUSES.find((h) => h.id === currentUser.houseId) : null;
  const houseName = houseObj ? houseObj.name : currentUser?.houseId || '';

  return (
    <div className="flex items-center justify-between py-2 mb-3">
      <div className="flex items-center gap-2.5 min-w-0">
        {currentUser ? (
          <span
            className="w-[38px] h-[38px] rounded-[12px] shadow-xs flex items-center justify-center text-[22px] flex-none border border-[var(--line)] bg-[var(--card)]"
            title={`${currentUser.displayName}'s Avatar`}
          >
            {currentUser.avatar || '🧑‍🎓'}
          </span>
        ) : (
          <img
            src="/icon-192.png"
            alt="Call of Doodie Logo"
            className="w-[38px] h-[38px] rounded-[12px] shadow-xs object-contain p-0.5 bg-[var(--card)] border border-[var(--line)] flex-none"
            style={isPlayful ? undefined : { filter: 'grayscale(1)', opacity: 0.7 }}
          />
        )}
        <div className="min-w-0 select-none">
          <b className="text-[18px] font-black tracking-tight block leading-tight text-[var(--ink)] truncate select-none">
            {currentUser ? `Welcome, ${currentUser.displayName}!` : isPlayful ? 'Call of Doodie' : 'Gut Log'}
          </b>
          <small className="text-[11.5px] text-[var(--muted)] font-bold block truncate select-none">
            {currentUser
              ? `${houseName} · Active Contributor`
              : isPlayful
              ? 'F&M Gut Health & House Cup 💩'
              : 'F&M Wellness Check-in'}
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
