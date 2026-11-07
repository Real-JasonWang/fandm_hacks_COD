import React, { useMemo } from 'react';
import type { AppSettings } from '../types';
import { HOUSES, calculateCheckInPoints } from '../data/appleData';

interface HouseTabProps {
  settings: AppSettings;
}

export const HouseTab: React.FC<HouseTabProps> = ({ settings }) => {
  const currentHouse = HOUSES.find((h) => h.id === settings.house) || HOUSES[0];

  const {
    userLoggedDays,
    hydrationDays,
    userPts,
    streak,
    sortedHouses,
    rank,
  } = useMemo(() => {
    // Headcount map from plan.md Section 7.1
    const dormHeadcounts: Record<string, number> = {
      Weis: 210,
      Bonchek: 220,
      Roschel: 230,
      Brooks: 240,
      Ware: 260,
    };

    const getHandicapMultiplier = (houseId: string) => {
      const n = dormHeadcounts[houseId] || 250;
      return +(Math.sqrt(250 / n)).toFixed(2);
    };

    const dayKeyOf = (ts: number) => {
      const d = new Date(ts);
      return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    };

    const map: Record<string, typeof settings.logs[0]> = {};
    for (const l of settings.logs) {
      map[dayKeyOf(l.ts)] = l;
    }

    const now = new Date();
    let userLoggedDays = 0;
    let hydrationDays = 0;

    for (let i = 0; i < 7; i++) {
      const d = new Date(now.getTime());
      d.setDate(d.getDate() - i);
      const k = dayKeyOf(d.getTime());
      if (map[k]) {
        userLoggedDays++;
        if (map[k].water >= 6) {
          hydrationDays++;
        }
      }
    }

    const sevenDaysAgo = now.getTime() - 7 * 864e5;
    const recentLogs = settings.logs.filter((l) => l.ts >= sevenDaysAgo);
    const userPts = recentLogs.reduce((acc, cur) => acc + calculateCheckInPoints(cur), 0);

    // Streak
    let streak = 0;
    const d = new Date(now.getTime());
    if (!map[dayKeyOf(d.getTime())]) {
      d.setDate(d.getDate() - 1);
    }
    while (map[dayKeyOf(d.getTime())]) {
      streak++;
      d.setDate(d.getDate() - 1);
    }

    const mineBonus = userLoggedDays >= 3 ? 0.4 : 0;
    const sortedHouses = HOUSES.map((h) => ({
      ...h,
      headcount: dormHeadcounts[h.id] || 240,
      multiplier: getHandicapMultiplier(h.id),
      part: h.id === currentHouse.id ? +(h.part + mineBonus).toFixed(1) : h.part,
    })).sort((a, b) => b.part - a.part);

    const rank = sortedHouses.findIndex((h) => h.id === currentHouse.id) + 1;

    return {
      userLoggedDays,
      hydrationDays,
      userPts,
      streak,
      sortedHouses,
      rank,
    };
  }, [settings.logs, currentHouse.id]);

  return (
    <div className="apple-view space-y-3">
      <div>
        <h1 className="text-[27px] font-black tracking-tight text-[var(--ink)]">
          House Cup 🏆
        </h1>
        <p className="text-[14px] font-semibold text-[var(--ink2)]">
          Anonymous College House challenge. Only House totals are shown — never names or health logs.
        </p>
      </div>

      {/* User's House Status Card */}
      <div
        className="apple-card"
        style={{
          background: `linear-gradient(135deg, ${currentHouse.color}22, #FFFFFF)`,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-full flex-none"
              style={{ background: currentHouse.color }}
            />
            <h3 className="font-black text-[17px] text-[var(--ink)]">
              {currentHouse.name}
            </h3>
          </div>
          <span className="apple-tag t-sun font-extrabold">
            #{rank} of {HOUSES.length}
          </span>
        </div>

        <div className="flex items-center gap-6 mt-3.5">
          <div>
            <div className="text-[26px] font-black leading-none text-[var(--ink)]">
              {userPts}
            </div>
            <div className="text-[12px] text-[var(--muted)] font-bold mt-1">
              your pts this week
            </div>
          </div>

          <div>
            <div className="text-[26px] font-black leading-none text-[var(--ink)]">
              {userLoggedDays}/7
            </div>
            <div className="text-[12px] text-[var(--muted)] font-bold mt-1">
              days checked in
            </div>
          </div>

          <div>
            <div className="text-[26px] font-black leading-none text-[var(--ink)]">
              🔥{streak}
            </div>
            <div className="text-[12px] text-[var(--muted)] font-bold mt-1">
              day streak
            </div>
          </div>
        </div>
      </div>

      {/* Hydration Week Challenge Card */}
      <div className="apple-card">
        <div className="flex items-center gap-3">
          <span className="text-[26px]">💧</span>
          <div>
            <h3 className="font-black text-[15px]">This week: Hydration Week</h3>
            <p className="text-[13px] text-[var(--ink2)] font-semibold">
              Drink 6+ glasses of water on 5 separate days. Every member who does it adds +25 bonus points to their House!
            </p>
          </div>
        </div>

        <div className="h-[10px] rounded-full bg-[#F3E9DC] overflow-hidden mt-3">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, (hydrationDays / 5) * 100)}%`,
              background: '#3D7BE0',
            }}
          />
        </div>
        <p className="text-[12px] text-[var(--muted)] font-bold mt-1.5">
          Your progress: {hydrationDays} of 5 days completed
        </p>
      </div>

      {/* Leaderboard Card with Sub-linear population balancing */}
      <div className="apple-card">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-black text-[16px]">F&amp;M Leaderboard</h3>
          <span className="apple-tag t-lav font-bold">Sub-Linear Handicap</span>
        </div>
        <p className="text-[12px] text-[var(--muted)] font-bold mt-0.5 mb-3">
          % of residents who checked in 3+ days this week — balanced mathematically by dorm size ($N$).
        </p>

        <div className="space-y-2.5">
          {sortedHouses.map((h) => {
            const isMe = h.id === currentHouse.id;
            return (
              <div key={h.id} className="space-y-0.5">
                <div className="flex items-center gap-2.5 text-[14px]">
                  <span className="w-[84px] font-extrabold text-[var(--ink)] truncate">
                    {h.id}
                  </span>
                  <div className="flex-1 h-[22px] bg-[#F6EEE4] rounded-[6px] relative overflow-hidden">
                    <div
                      className="absolute left-0 top-0 bottom-0 rounded-r-[4px] transition-all duration-500"
                      style={{
                        width: `${h.part}%`,
                        background: h.color,
                        outline: isMe ? '2.5px solid var(--ink)' : 'none',
                        outlineOffset: '-1px',
                      }}
                    />
                  </div>
                  <span className="w-[48px] text-right font-black tabular-nums text-[var(--ink)]">
                    {h.part}%
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-[var(--muted)] font-bold pl-[94px] pr-1">
                  <span>{h.headcount} residents</span>
                  <span>Handicap: {h.multiplier}×</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How Points Work */}
      <div className="apple-card">
        <h3 className="font-black text-[15px] mb-2">How points work</h3>
        <div className="space-y-2.5">
          <div className="flex items-center gap-3 py-1.5 border-b border-[var(--line)]">
            <div className="w-9 h-9 rounded-[12px] bg-[var(--peach-l)] grid place-items-center text-[17px] flex-none">
              ✅
            </div>
            <div className="flex-1">
              <b className="text-[14px] font-extrabold text-[var(--ink)] block">
                Daily Check-in
              </b>
              <p className="text-[12px] text-[var(--ink2)] font-semibold">
                Any check-in counts, even "no poop today"
              </p>
            </div>
            <b className="text-[15px] font-black text-[var(--ink)]">+10</b>
          </div>

          <div className="flex items-center gap-3 py-1.5 border-b border-[var(--line)]">
            <div className="w-9 h-9 rounded-[12px] bg-[#E3F1FF] grid place-items-center text-[17px] flex-none">
              💧
            </div>
            <div className="flex-1">
              <b className="text-[14px] font-extrabold text-[var(--ink)] block">
                6+ glasses of water
              </b>
              <p className="text-[12px] text-[var(--ink2)] font-semibold">
                Daily hydration milestone
              </p>
            </div>
            <b className="text-[15px] font-black text-[var(--ink)]">+5</b>
          </div>

          <div className="flex items-center gap-3 py-1.5 border-b border-[var(--line)]">
            <div className="w-9 h-9 rounded-[12px] bg-[var(--lav-l)] grid place-items-center text-[17px] flex-none">
              😴
            </div>
            <div className="flex-1">
              <b className="text-[14px] font-extrabold text-[var(--ink)] block">
                7+ hours of sleep
              </b>
              <p className="text-[12px] text-[var(--ink2)] font-semibold">
                Sleep recovery goal
              </p>
            </div>
            <b className="text-[15px] font-black text-[var(--ink)]">+5</b>
          </div>

          <div className="flex items-center gap-3 py-1.5">
            <div className="w-9 h-9 rounded-[12px] bg-[var(--sun-l)] grid place-items-center text-[17px] flex-none">
              🔥
            </div>
            <div className="flex-1">
              <b className="text-[14px] font-extrabold text-[var(--ink)] block">
                Daily Consistency
              </b>
              <p className="text-[12px] text-[var(--ink2)] font-semibold">
                Boosts your House participation % and unlocks weekly badges
              </p>
            </div>
            <b className="text-[14px] font-black text-[var(--ink)]">Active</b>
          </div>
        </div>

        <div className="apple-banner mt-3 bg-[#FFF3E8] text-[#8A4317]">
          <span>🤝</span>
          <div className="text-[13px] leading-snug">
            We reward <b>healthy habits, not biological perfection</b>. Your stool type never penalizes points, ensuring students with IBS, Crohn's, or acute stress compete completely on equal footing.
          </div>
        </div>
      </div>
    </div>
  );
};
