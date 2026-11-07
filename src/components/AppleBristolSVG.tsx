import React from 'react';
import type { BristolNumber } from '../types';

interface AppleBristolSVGProps {
  type: BristolNumber;
  eyes?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const AppleBristolSVG: React.FC<AppleBristolSVGProps> = ({
  type,
  eyes = true,
  className = "w-16 h-10 flex-none",
  style,
}) => {
  const c = "#8B5A3C";
  const c2 = "#A87249";
  const c3 = "#C49167";

  const renderShape = () => {
    switch (type) {
      case 1:
        return (
          <>
            <circle cx="12" cy="22" r="6" fill={c} />
            <circle cx="25" cy="13" r="6" fill={c} />
            <circle cx="38" cy="24" r="6.5" fill={c} />
            <circle cx="51" cy="15" r="5.5" fill={c} />
            <circle cx="28" cy="31" r="4" fill={c} />
          </>
        );
      case 2:
        return (
          <>
            <rect x="10" y="13" width="44" height="15" rx="7.5" fill={c} />
            <circle cx="12" cy="20" r="8" fill={c} />
            <circle cx="22" cy="17" r="8" fill={c} />
            <circle cx="32" cy="22" r="8" fill={c} />
            <circle cx="42" cy="17" r="8" fill={c} />
            <circle cx="52" cy="21" r="7.5" fill={c} />
          </>
        );
      case 3:
        return (
          <>
            <rect x="6" y="11" width="52" height="18" rx="9" fill={c} />
            <path
              d="M18 11l2 5-2 3M30 29l-1-5 2-3M44 11l1 5-2 2"
              stroke={c3}
              strokeWidth="1.6"
              fill="none"
              strokeLinecap="round"
            />
          </>
        );
      case 4:
        return (
          <path
            d="M8 27C16 12 26 32 38 20S54 13 57 19"
            stroke={c}
            strokeWidth="11"
            fill="none"
            strokeLinecap="round"
          />
        );
      case 5:
        return (
          <>
            <ellipse cx="15" cy="21" rx="10" ry="8" fill={c2} />
            <ellipse cx="34" cy="23" rx="8.5" ry="7" fill={c2} />
            <ellipse cx="51" cy="18" rx="7.5" ry="6.5" fill={c2} />
          </>
        );
      case 6:
        return (
          <>
            <circle cx="14" cy="22" r="6" fill={c3} />
            <circle cx="22" cy="17" r="6.5" fill={c3} />
            <circle cx="30" cy="23" r="7" fill={c3} />
            <circle cx="38" cy="17" r="6" fill={c3} />
            <circle cx="46" cy="22" r="6.5" fill={c3} />
            <circle cx="53" cy="18" r="5" fill={c3} />
            <circle cx="26" cy="28" r="4.5" fill={c3} />
            <circle cx="42" cy="28" r="4.5" fill={c3} />
            <path d="M8 22l3-2M56 24l3 1" stroke={c3} strokeWidth="3" strokeLinecap="round" />
          </>
        );
      case 7:
        return (
          <path
            d="M6 26c4-7 13-9 20-6s12-4 20-2 13 5 12 9-9 6-18 5-14 2-22 1-15-3-12-7z"
            fill={c3}
            opacity="0.85"
          />
        );
      default:
        return null;
    }
  };

  const epMap: Record<BristolNumber, [number, number, number]> = {
    1: [25, 13, 4.3],
    2: [32, 20, 5],
    3: [32, 19, 5],
    4: [39, 19, 5],
    5: [15, 20, 5],
    6: [30, 21, 5],
    7: [32, 26, 5],
  };

  const renderEyes = () => {
    if (!eyes) return null;
    const [x, y, sp] = epMap[type] || [32, 20, 5];
    const r = type === 1 ? 2 : 2.4;
    return (
      <>
        {/* Left eye */}
        <circle cx={x - sp / 2} cy={y} r={r} fill="#fff" />
        <circle cx={x - sp / 2 + 0.4} cy={y + 0.4} r={r * 0.5} fill="#2a1e1e" />
        {/* Right eye */}
        <circle cx={x + sp / 2} cy={y} r={r} fill="#fff" />
        <circle cx={x + sp / 2 + 0.4} cy={y + 0.4} r={r * 0.5} fill="#2a1e1e" />
        {/* Smile on type 3 & 4 */}
        {(type === 3 || type === 4) && (
          <path
            d={`M${x - 2.2} ${y + 3.6}q2.2 2 4.4 0`}
            stroke="#2a1e1e"
            strokeWidth="1.1"
            fill="none"
            strokeLinecap="round"
          />
        )}
      </>
    );
  };

  return (
    <svg viewBox="0 0 64 40" aria-hidden="true" className={className} style={style}>
      {renderShape()}
      {renderEyes()}
    </svg>
  );
};
