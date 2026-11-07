import React from 'react';
import type { AppSettings } from '../types';
import { RESTROOMS } from '../data/appleData';

interface FacilitiesViewProps {
  settings: AppSettings;
  onBack: () => void;
  onMarkCleaned: (restroomId: string) => void;
}

function formatMinutesAgo(t: number): string {
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return `${h} h ago`;
}

export const FacilitiesView: React.FC<FacilitiesViewProps> = ({
  settings,
  onBack,
  onMarkCleaned,
}) => {

  const queue = RESTROOMS.map((r) => ({
    r,
    rep: settings.reports[r.id],
  }))
    .filter((x) => x.rep && (x.rep.clean > 0 || x.rep.supplies > 0))
    .sort(
      (a, b) =>
        b.rep!.clean * 2 + b.rep!.supplies - (a.rep!.clean * 2 + a.rep!.supplies)
    );

  return (
    <div className="apple-view space-y-3">
      <button className="apple-chip" onClick={onBack}>
        ← Back to student app
      </button>

      <div>
        <h1 className="text-[27px] font-black tracking-tight text-[var(--ink)]">
          Facilities Queue 🧽
        </h1>
        <p className="text-[14px] font-semibold text-[var(--ink2)]">
          Dedicated dispatch console for F&amp;M custodial teams. Aggregated strictly from anonymous restroom reports.
        </p>
      </div>

      {queue.length === 0 ? (
        <div className="apple-card text-center py-8">
          <div className="text-[36px] mb-2">✨</div>
          <h3 className="font-black text-[18px]">All clear</h3>
          <p className="text-[13px] text-[var(--ink2)] font-semibold">
            Zero pending sanitation or supply reports across campus!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map((item, idx) => (
            <div key={item.r.id} className="apple-card space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-[13px] grid place-items-center font-black text-[17px] flex-none"
                  style={{
                    background: idx === 0 ? 'var(--peach-l)' : '#F3E9DC',
                    color: idx === 0 ? 'var(--peach-d)' : 'var(--ink)',
                  }}
                >
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <b className="text-[15px] font-black text-[var(--ink)] block truncate">
                    {item.r.b}
                  </b>
                  <p className="text-[12.5px] text-[var(--ink2)] font-semibold">
                    {item.r.f} · Reported {formatMinutesAgo(item.rep!.ts)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {item.rep!.clean > 0 && (
                  <span className="apple-tag t-peach">
                    🧽 {item.rep!.clean}× needs cleaning
                  </span>
                )}
                {item.rep!.supplies > 0 && (
                  <span className="apple-tag t-sun">
                    🧻 {item.rep!.supplies}× low supplies
                  </span>
                )}
              </div>

              <button
                className="apple-btn dark"
                onClick={() => onMarkCleaned(item.r.id)}
              >
                ✓ Mark cleaned & restocked
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
