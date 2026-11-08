import React, { useMemo } from 'react';
import type { AppSettings } from '../types';
import { HOUSES, calculateCheckInPoints } from '../data/appleData';
import { getAllUsers, getCurrentSession, isDemoUser } from '../lib/authDatabase';

interface HouseTabProps {
  settings: AppSettings;
}

export const HouseTab: React.FC<HouseTabProps> = ({ settings }) => {
  const currentHouse = HOUSES.find((h) => h.id === settings.house) || HOUSES[0];
  const session = getCurrentSession();

  const {
    userLoggedDays,
    hydrationDays,
    userPts,
    streak,
    sortedHouses,
    rank,
  } = useMemo(() => {
    // Official F&M residential communities headcounts (5 College Houses + 3 Traditional Halls)
    const dormHeadcounts: Record<string, number> = {
      Ware: 260,
      Brooks: 240,
      Roschel: 230,
      Bonchek: 220,
      Weis: 210,
      Schnader: 185,
      Thomas: 175,
      Dietz: 40,
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

    const allUsers = getAllUsers();
    const session = getCurrentSession();
    const currentUserId = session?.id;
    const isDemo = isDemoUser(session);

    // Demo Mode: Balanced, close competition data where every community has similar active resident participation
    const DEMO_COMMUNITIES: Record<string, { registered: number; active: number; checks: number; part: number }> = {
      Ware:     { registered: 210, active: 156, checks: 462, part: 74.3 },
      Bonchek:  { registered: 180, active: 131, checks: 435, part: 72.8 },
      Weis:     { registered: 172, active: 123, checks: 418, part: 71.5 },
      Schnader: { registered: 152, active: 107, checks: 358, part: 70.4 },
      Brooks:   { registered: 195, active: 135, checks: 442, part: 69.2 },
      Roschel:  { registered: 188, active: 128, checks: 425, part: 68.1 },
      Thomas:   { registered: 142, active: 95,  checks: 334, part: 66.9 },
      Dietz:    { registered: 32,  active: 22,  checks: 68,  part: 68.8 },
    };

    const sortedHouses = HOUSES.map((h) => {
      const multiplier = getHandicapMultiplier(h.id);

      if (isDemo) {
        // In Demo Mode: realistic close participation for every house
        const demo = DEMO_COMMUNITIES[h.id] || { registered: 150, active: 100, checks: 350, part: 66.7 };
        const isCurrentHouse = currentHouse.id === h.id;
        const checks = demo.checks + (isCurrentHouse ? recentLogs.length : 0);
        const part = demo.part;
        const score = +(part * multiplier).toFixed(1);

        return {
          ...h,
          checks,
          headcount: dormHeadcounts[h.id] || 200,
          registeredCount: demo.registered,
          activeCount: demo.active,
          multiplier,
          part,
          score,
        };
      } else {
        // In Real Login Mode: STRICTLY real database users & actual check-ins, ZERO fake data!
        const realUsers = allUsers.filter((u) => !isDemoUser(u));
        const houseUsers = realUsers.filter((u) => u.houseId === h.id);

        const usersList = houseUsers.map((u) => {
          if (currentUserId && u.id === currentUserId) {
            return { ...u, logs: settings.logs };
          }
          return u;
        });

        if (currentHouse.id === h.id && currentUserId && !usersList.some((u) => u.id === currentUserId)) {
          usersList.push({
            id: currentUserId,
            email: session?.email || '',
            displayName: session?.displayName || '',
            universityId: 'fandm',
            houseId: h.id,
            salt: '',
            passwordHash: '',
            createdAt: Date.now(),
            logs: settings.logs,
            streak,
            totalPoints: userPts,
            isDemo: false,
          });
        }

        const checks = usersList.reduce((acc, u) => {
          return acc + u.logs.filter((l) => l.ts >= sevenDaysAgo).length;
        }, 0);

        const activeResidents = usersList.filter((u) => {
          const distinctDays = new Set(
            u.logs.filter((l) => l.ts >= sevenDaysAgo).map((l) => dayKeyOf(l.ts))
          );
          return distinctDays.size >= 3;
        }).length;

        const registeredCount = usersList.length;
        const rawPart = registeredCount > 0 ? (activeResidents / registeredCount) * 100 : 0;
        const part = +rawPart.toFixed(1);
        const score = registeredCount > 0 ? +(part * multiplier).toFixed(1) : 0;

        return {
          ...h,
          checks,
          headcount: dormHeadcounts[h.id] || 200,
          registeredCount,
          activeCount: activeResidents,
          multiplier,
          part,
          score,
        };
      }
    }).sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.part !== a.part) return b.part - a.part;
      return b.checks - a.checks;
    });

    const rank = sortedHouses.findIndex((h) => h.id === currentHouse.id) + 1;

    return {
      userLoggedDays,
      hydrationDays,
      userPts,
      streak,
      sortedHouses,
      rank,
    };
  }, [settings.logs, settings.house, currentHouse]);

  return (
    <div className="apple-view space-y-3">
      <div className="select-none">
        <h1 className="text-[27px] font-black tracking-tight text-[var(--ink)] select-none">
          House Cup 🏆
        </h1>
        <p className="text-[14px] font-semibold text-[var(--ink2)] select-none">
          Anonymous College House challenge.
        </p>
      </div>

      {/* User's House Status Card */}
      <div
        className="apple-card"
        style={{
          background: `linear-gradient(135deg, ${currentHouse.color}25, var(--card))`,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[19px] flex-none shadow-xs border"
              style={{
                background: `${currentHouse.color}25`,
                borderColor: `${currentHouse.color}50`,
              }}
            >
              {session?.avatar || '🧑‍🎓'}
            </span>
            <div>
              <h3 className="font-black text-[16px] text-[var(--ink)] leading-tight">
                {currentHouse.name}
              </h3>
              <span className="text-[11.5px] font-bold text-[var(--muted)]">
                {session ? `${session.displayName} · Active Contributor` : 'Your Residence'}
              </span>
            </div>
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
          <span className="apple-tag t-lav font-bold">Adjusted for Dorm Size</span>
        </div>
        <p className="text-[12px] text-[var(--muted)] font-bold mt-0.5 mb-3">
          % of students logging 3+ days this week, balanced fairly for dorm size.
        </p>

        <div className="space-y-2.5">
          {sortedHouses.map((h) => {
            const isMe = h.id === currentHouse.id;
            return (
              <div key={h.id} className="space-y-0.5">
                <div className="flex items-center gap-2.5 text-[14px]">
                  <div className="w-[84px] flex items-center gap-1.5 font-extrabold text-[var(--ink)] truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-none"
                      style={{ background: h.color }}
                    />
                    <span className="truncate">{h.id}</span>
                  </div>
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
                  <span className="w-[58px] text-right font-black tabular-nums text-[var(--ink)]">
                    {h.score}%
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-[var(--muted)] font-bold pl-[94px] pr-1">
                  <span>{h.activeCount}/{h.registeredCount} active ({h.checks} check-ins) · Raw: {h.part}%</span>
                  <span>Size factor: {h.multiplier}×</span>
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

        <div className="apple-banner mt-3 bg-[var(--sun-l)] text-[var(--ink)]">
          <span>🤝</span>
          <div className="text-[13px] leading-snug">
            We reward <b>healthy habits, not perfect digestion</b>. Your stool type never loses points, so everyone competes fairly even with stomach conditions or stress.
          </div>
        </div>
      </div>
    </div>
  );
};
