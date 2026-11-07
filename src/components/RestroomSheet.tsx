import React from 'react';
import type { Restroom, RestroomReport } from '../types';

interface RestroomSheetProps {
  restroom: Restroom | null;
  report: RestroomReport | undefined;
  onClose: () => void;
  onReport: (restroomId: string, type: 'clean' | 'supplies' | 'ok') => void;
}

export const RestroomSheet: React.FC<RestroomSheetProps> = ({
  restroom,
  report,
  onClose,
  onReport,
}) => {
  if (!restroom) return null;

  const ago = (t: number) => {
    const m = Math.round((Date.now() - t) / 60000);
    if (m < 60) return `${m} min ago`;
    const h = Math.round(m / 60);
    return `${h} h ago`;
  };

  const getStatusText = () => {
    if (!report) return null;
    if (report.clean >= 2) {
      return `${report.clean} students reported it needs cleaning · ${ago(report.ts)}`;
    }
    if (report.supplies >= 1) {
      return `Reported low on supplies · ${ago(report.ts)}`;
    }
    if (report.ok >= 1) {
      return `Reported clean · ${ago(report.ts)}`;
    }
    return null;
  };

  const amenities: [boolean, string, string][] = [
    [restroom.all, '⚧ All-gender', 't-lav'],
    [restroom.acc, '♿ Accessible', 't-mint'],
    [restroom.per, '🌸 Period products', 't-peach'],
    [restroom.single, '🚪 Single-stall', 't-sun'],
    [restroom.baby, '🍼 Changing table', 't-mint'],
  ];
  const activeAmenities = amenities.filter((a) => a[0]);
  const statusStr = getStatusText();

  return (
    <>
      <div className="apple-scrim on" onClick={onClose} />
      <div className="apple-sheet on" role="dialog" aria-modal="true">
        <div className="apple-grab" />

        <div className="flex items-center justify-between pb-2 mb-2 sticky top-[-10px] bg-[var(--bg)] z-10 pt-2">
          <h2 className="text-[20px] font-black tracking-tight text-[var(--ink)] truncate pr-2">
            {restroom.b}
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[var(--card)] shadow-[var(--shadow)] font-black text-[18px] grid place-items-center hover:bg-[#FFFDF9] flex-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <p className="text-[14px] font-semibold text-[var(--ink2)] mb-2.5">
          {restroom.f}{' '}
          {restroom.all ? '· All-gender facility' : "· Women's & men's facilities"}
        </p>

        {/* Feature Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {activeAmenities.length > 0 ? (
            activeAmenities.map((a, i) => (
              <span key={i} className={`apple-tag ${a[2]}`}>
                {a[1]}
              </span>
            ))
          ) : (
            <span className="apple-tag t-sun">Standard Restroom</span>
          )}
        </div>

        {/* Status Callout Banner */}
        {statusStr ? (
          <div className="apple-banner bg-[#FFF3E8] text-[#8A4317] mb-4">
            <span className="text-[18px]">📣</span>
            <div className="text-[13px] font-bold">{statusStr}</div>
          </div>
        ) : (
          <p className="text-[12.5px] text-[var(--muted)] font-bold mb-4">
            No crowdsourced reports in the last few hours.
          </p>
        )}

        <div className="text-[15px] font-black text-[var(--ink)] mb-2">
          How is it right now?
        </div>

        <div className="space-y-2">
          <button
            className="apple-btn ghost"
            onClick={() => onReport(restroom.id, 'ok')}
          >
            ✨ Clean & fully stocked
          </button>
          <button
            className="apple-btn ghost"
            onClick={() => onReport(restroom.id, 'clean')}
          >
            🧽 Needs cleaning
          </button>
          <button
            className="apple-btn ghost"
            onClick={() => onReport(restroom.id, 'supplies')}
          >
            🧻 Out of soap / paper / period products
          </button>
        </div>

        <p className="text-[12px] text-[var(--muted)] font-bold mt-4 text-center">
          Reports are completely anonymous and route directly to the Facilities dispatch queue.
        </p>
      </div>
    </>
  );
};
