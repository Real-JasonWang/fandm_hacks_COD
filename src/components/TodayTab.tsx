import React, { useMemo } from 'react';
import type { AppSettings } from '../types';
import { BRISTOL, ZONE, FACTS, HOUSES, calculateCheckInPoints } from '../data/appleData';
import { AppleBristolSVG } from './AppleBristolSVG';

interface TodayTabProps {
  settings: AppSettings;
  onOpenCheckIn: () => void;
  onOpenRedFlag: () => void;
  onGoToHouse: () => void;
  onHideInstall: () => void;
}

export const TodayTab: React.FC<TodayTabProps> = ({
  settings,
  onOpenCheckIn,
  onOpenRedFlag,
  onGoToHouse,
  onHideInstall,
}) => {
  const isPlayful = settings.mode === 'playful';

  const {
    greeting,
    dateStr,
    todayLogs,
    last,
    lastBM,
    lastZone,
    streakCount,
    weekPoints,
    isFlagged,
    fact,
    currentHouse,
  } = useMemo(() => {
    const now = new Date();
    const hours = now.getHours();
    const greeting = hours < 12 ? 'Good morning' : hours < 18 ? 'Good afternoon' : 'Good evening';
    const dateStr = now.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    const dayKeyOf = (ts: number) => {
      const d = new Date(ts);
      return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    };

    const todayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    const todayLogs = settings.logs.filter((l) => dayKeyOf(l.ts) === todayKey);
    const last = settings.logs[settings.logs.length - 1];
    const lastBM = [...settings.logs].reverse().find((l) => l.pooped && l.bristol);

    const currentHouse = HOUSES.find((h) => h.id === settings.house) || HOUSES[0];

    // Streak
    const map: Record<string, boolean> = {};
    for (const l of settings.logs) {
      map[dayKeyOf(l.ts)] = true;
    }
    let s = 0;
    const d = new Date(now.getTime());
    if (!map[dayKeyOf(d.getTime())]) {
      d.setDate(d.getDate() - 1);
    }
    while (map[dayKeyOf(d.getTime())]) {
      s++;
      d.setDate(d.getDate() - 1);
    }

    // Week points
    const sevenDaysAgo = now.getTime() - 7 * 864e5;
    const recent = settings.logs.filter((l) => l.ts >= sevenDaysAgo);
    const weekPoints = recent.reduce((acc, cur) => acc + calculateCheckInPoints(cur), 0);

    const isFlagged = settings.logs.some(
      (l) => now.getTime() - l.ts < 14 * 864e5 && (l.symptoms || []).some((sym) => ['blood', 'black', 'pain'].includes(sym))
    );

    const fact = FACTS[now.getDate() % FACTS.length];
    const lastZone = lastBM && lastBM.bristol ? ZONE[BRISTOL[lastBM.bristol].zone] : null;

    return {
      greeting,
      dateStr,
      todayLogs,
      last,
      lastBM,
      lastZone,
      streakCount: s,
      weekPoints,
      isFlagged,
      fact,
      currentHouse,
    };
  }, [settings.logs, settings.house]);

  return (
    <div className="apple-view space-y-3">
      <div>
        <h1 className="text-[27px] font-black tracking-tight text-[var(--ink)]">
          {greeting} 👋
        </h1>
        <p className="text-[14px] font-semibold text-[var(--ink2)]">{dateStr}</p>
      </div>

      {!settings.installHidden && (
        <div className="apple-banner">
          <span className="text-[20px]">📲</span>
          <div className="flex-1 text-[13.5px] leading-snug">
            <b>Use it like a native iOS/Android app.</b> On iPhone: Safari → Share →{' '}
            <b>Add to Home Screen</b>.
          </div>
          <button
            onClick={onHideInstall}
            className="text-[18px] opacity-70 hover:opacity-100 font-bold px-1"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {isFlagged && (
        <div className="apple-banner red">
          <span className="text-[20px]">❗</span>
          <div className="flex-1 text-[13.5px] leading-snug">
            <b>You logged a warning sign recently.</b> Blood, black stool, or severe abdominal pain should be checked by a healthcare provider.{' '}
            <button
              onClick={onOpenRedFlag}
              className="underline font-bold hover:opacity-80"
            >
              What to do →
            </button>
          </div>
        </div>
      )}

      {/* Hero CTA Card */}
      <div className="apple-hero">
        {todayLogs.length > 0 ? (
          <div>
            <div className="big">
              {isPlayful ? 'Logged today — nice! 🎉' : "Today's check-in is done ✓"}
            </div>
            <p className="text-[13px] text-[var(--ink2)] font-semibold mb-3">
              {todayLogs.length} check-in{todayLogs.length > 1 ? 's' : ''} · +
              {todayLogs.reduce((acc, cur) => acc + calculateCheckInPoints(cur), 0)} pts for {currentHouse.id}
            </p>
            <button className="apple-btn ghost" onClick={onOpenCheckIn}>
              + Add another check-in
            </button>
          </div>
        ) : (
          <div>
            <div className="big">
              {isPlayful ? "How's your gut today? 💩" : "How's your digestion today?"}
            </div>
            <p className="text-[13px] text-[var(--ink2)] font-semibold mb-3">
              {isPlayful
                ? '30 seconds. No photos. Totally private & local.'
                : '30-second private check-in. No cloud storage.'}
            </p>
            <button className="apple-btn" onClick={onOpenCheckIn}>
              {isPlayful ? 'Log today 💩' : 'Start check-in'}
            </button>
          </div>
        )}
      </div>

      {/* 3 Pillars */}
      <div className="apple-pillars">
        <button className="apple-pillar" onClick={onOpenCheckIn}>
          <div className="ic">
            {lastBM && lastBM.bristol ? (
              <AppleBristolSVG
                type={lastBM.bristol}
                eyes={isPlayful}
                className="w-11 h-7"
              />
            ) : (
              <span className="text-[22px]">{isPlayful ? '💩' : '◐'}</span>
            )}
          </div>
          <div className="lb">{isPlayful ? 'Poop' : 'Digestion'}</div>
          <div className="v">{lastBM && lastBM.bristol ? `Type ${lastBM.bristol}` : '—'}</div>
          <div className="s">
            {lastZone ? (
              <span className={`apple-tag ${lastZone.tag}`}>{lastZone.label}</span>
            ) : (
              'No logs yet'
            )}
          </div>
        </button>

        <button className="apple-pillar" onClick={onOpenCheckIn}>
          <div className="ic">😴</div>
          <div className="lb">Sleep</div>
          <div className="v">{last ? `${last.sleep} h` : '—'}</div>
          <div className="s">
            {last ? (last.sleep >= 7 ? '✓ 7h goal' : 'Goal: 7+ h') : 'No sleep data'}
          </div>
        </button>

        <button className="apple-pillar" onClick={onOpenCheckIn}>
          <div className="ic">🥗</div>
          <div className="lb">Hydration</div>
          <div className="v">{last ? `${last.water} 💧` : '—'}</div>
          <div className="s">
            {last ? `${last.veg} fruit/veg` : 'No diet data'}
          </div>
        </button>
      </div>

      {/* Streak & House Points */}
      <div className="apple-card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-[16px] text-[var(--ink)]">
              🔥 {streakCount}-day streak
            </h3>
            <p className="text-[13px] font-semibold text-[var(--ink2)]">
              {weekPoints} pts this week for{' '}
              <b style={{ color: currentHouse.color }}>{currentHouse.id} House</b>
            </p>
          </div>
          <button className="apple-chip" onClick={onGoToHouse}>
            See House →
          </button>
        </div>
        <p className="text-[12px] text-[var(--muted)] font-bold mt-2.5 leading-normal">
          Points come from checking in, sleep, and hydration — <b>never</b> from stool shape or medical conditions.
        </p>
      </div>

      {/* Did you know fact */}
      <div className="apple-card">
        <div className="flex items-start gap-3">
          <span className="text-[24px]">💡</span>
          <div>
            <h3 className="font-black text-[15px] mb-1">Did you know?</h3>
            <p className="text-[14px] text-[var(--ink2)] font-semibold leading-relaxed">
              {fact}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
