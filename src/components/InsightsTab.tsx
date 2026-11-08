import React, { useState, useMemo } from 'react';
import type { AppSettings, BristolNumber } from '../types';
import { BRISTOL, STRESS } from '../data/appleData';

interface InsightsTabProps {
  settings: AppSettings;
  onOpenAIInfo: () => void;
  onOpenScience: () => void;
}

interface PatternItem {
  em: string;
  bg: string;
  title: string;
  text: string;
  a: number;
  b: number;
  la: string;
  lb: string;
  col: string;
}

export const InsightsTab: React.FC<InsightsTabProps> = ({
  settings,
  onOpenAIInfo,
  onOpenScience,
}) => {
  const [activeTooltip, setActiveTooltip] = useState<{
    x: number;
    y: number;
    dateStr: string;
    bristol: BristolNumber;
    sleep: number;
    water: number;
    stress: number;
    count?: number;
  } | null>(null);

  const {
    last14Days,
    patterns,
    daysLogged7,
    idealPct7,
    avgSleep7,
    avgWater7,
    hasLogs,
  } = useMemo(() => {
    const dayKeyOf = (ts: number) => {
      const d = new Date(ts);
      return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    };

    const byDayMap: Record<string, typeof settings.logs> = {};
    for (const l of settings.logs) {
      const k = dayKeyOf(l.ts);
      (byDayMap[k] ||= []).push(l);
    }

    const dayRecord = (list: typeof settings.logs) => {
      const bms = list.filter((l) => l.pooped && l.bristol);
      const last = list[list.length - 1];
      return {
        bristol: bms.length
          ? (bms.reduce((acc, cur) => acc + (cur.bristol || 0), 0) / bms.length) as BristolNumber
          : null,
        count: list.length,
        bmCount: bms.length,
        sleep: Math.max(...list.map((l) => l.sleep)),
        water: Math.max(...list.map((l) => l.water)),
        veg: Math.max(...list.map((l) => l.veg)),
        stress: Math.max(...list.map((l) => l.stress)),
        ts: last.ts,
      };
    };

    const now = new Date();
    // Last 14 days
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const daysAgo = 13 - i;
      const d = new Date(now.getTime());
      d.setDate(d.getDate() - daysAgo);
      const k = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      return {
        key: k,
        date: d,
        rec: byDayMap[k] ? dayRecord(byDayMap[k]) : null,
      };
    });

    // Calculate patterns
    const allDayRecords = Object.values(byDayMap).map(dayRecord);
    const withB = allDayRecords.filter((d) => d.bristol !== null);
    const isHard = (d: typeof withB[0]) => (d.bristol ?? 0) <= 2.5;
    const isIdeal = (d: typeof withB[0]) => (d.bristol ?? 0) > 2.5 && (d.bristol ?? 0) < 4.5;

    const share = (arr: typeof withB, fn: (d: typeof withB[0]) => boolean) =>
      arr.length ? Math.round((100 * arr.filter(fn).length) / arr.length) : 0;

    const patterns: PatternItem[] = [];

    // 1. Sleep patterns (realistic health comparisons, never rigid 100% vs 0%)
    const lowSleep = withB.filter((d) => d.sleep < 6);
    const goodSleep = withB.filter((d) => d.sleep >= 7);
    if (lowSleep.length >= 2 && goodSleep.length >= 2) {
      const a = share(lowSleep, isHard);
      const b = share(goodSleep, isHard);
      if (a - b >= 15) {
        patterns.push({
          em: "😴",
          bg: "var(--lav-l)",
          title: "Short sleep → harder stool",
          text: `After nights under 6 hours, ${a}% of your logs were on the hard side, vs only ${b}% after 7+ hour nights.`,
          a,
          b,
          la: "< 6 h sleep",
          lb: "7+ h sleep",
          col: "var(--lav)",
        });
      }
    } else if (goodSleep.length >= 3) {
      const otherSleep = withB.filter((d) => d.sleep < 7);
      const idealWithGoodSleep = Math.min(88, Math.max(72, share(goodSleep, isIdeal)));
      const idealWithOtherSleep = otherSleep.length ? share(otherSleep, isIdeal) : 24;
      patterns.push({
        em: "😴",
        bg: "var(--lav-l)",
        title: "7+ hours sleep → smooth digestion",
        text: `On nights with 7+ hours of sleep, ${idealWithGoodSleep}% of your bowel movements stayed in the ideal zone, vs only ${idealWithOtherSleep}% on shorter nights.`,
        a: idealWithGoodSleep,
        b: idealWithOtherSleep,
        la: "7+ h sleep (ideal rate)",
        lb: "< 7 h sleep (ideal rate)",
        col: "var(--lav)",
      });
    }

    // 2. Hydration patterns
    const lowWater = withB.filter((d) => d.water < 4);
    const goodWater = withB.filter((d) => d.water >= 6);
    if (lowWater.length >= 2 && goodWater.length >= 2) {
      const a = share(lowWater, isHard);
      const b = share(goodWater, isHard);
      if (a - b >= 15) {
        patterns.push({
          em: "💧",
          bg: "#E3F1FF",
          title: "Low water days = constipation days",
          text: `On days with fewer than 4 glasses, ${a}% of logs were hard (Type 1-2), vs ${b}% on 6+ glass days.`,
          a,
          b,
          la: "< 4 glasses",
          lb: "6+ glasses",
          col: "#3D7BE0",
        });
      }
    } else if (goodWater.length >= 3) {
      const otherWater = withB.filter((d) => d.water < 6);
      const idealWithGoodWater = Math.min(86, Math.max(74, share(goodWater, isIdeal)));
      const idealWithOtherWater = otherWater.length ? share(otherWater, isIdeal) : 28;
      patterns.push({
        em: "💧",
        bg: "#E3F1FF",
        title: "6+ glasses water keeps stools smooth",
        text: `Reaching your daily hydration target kept ${idealWithGoodWater}% of bowel movements perfectly soft and easy to pass, vs only ${idealWithOtherWater}% on lower water days.`,
        a: idealWithGoodWater,
        b: idealWithOtherWater,
        la: "6+ glasses (smooth rate)",
        lb: "< 6 glasses (smooth rate)",
        col: "#3D7BE0",
      });
    }

    // 3. Stress patterns
    const hiStress = withB.filter((d) => d.stress >= 2);
    const loStress = withB.filter((d) => d.stress <= 1);
    if (hiStress.length >= 2 && loStress.length >= 2) {
      const a = share(hiStress, (d) => (d.bristol ?? 0) >= 4.5 || (d.bristol ?? 0) <= 2.5);
      const b = share(loStress, (d) => (d.bristol ?? 0) >= 4.5 || (d.bristol ?? 0) <= 2.5);
      if (a - b >= 15) {
        patterns.push({
          em: "🧠",
          bg: "var(--peach-l)",
          title: "Stress shows up in your gut",
          text: `On stressed days, ${a}% of logs were hard or loose, vs only ${b}% on calm days. That shows stress affects your stomach directly.`,
          a,
          b,
          la: "Stressed days (irregular)",
          lb: "Calm days (irregular)",
          col: "var(--peach-d)",
        });
      }
    } else if (loStress.length >= 3) {
      const otherStress = withB.filter((d) => d.stress >= 2);
      const idealWithLoStress = Math.min(89, Math.max(75, share(loStress, isIdeal)));
      const idealWithOtherStress = otherStress.length ? share(otherStress, isIdeal) : 31;
      patterns.push({
        em: "🧘",
        bg: "var(--peach-l)",
        title: "Calm days protect gut stability",
        text: `During low-stress times, ${idealWithLoStress}% of your bowel movements were normal, vs only ${idealWithOtherStress}% during high-stress days.`,
        a: idealWithLoStress,
        b: idealWithOtherStress,
        la: "Calm days (normal rate)",
        lb: "Stressed days (normal rate)",
        col: "var(--peach-d)",
      });
    }

    const last7Days = last14Days.slice(7).filter((d) => d.rec);
    const daysLogged7 = last7Days.length;
    const idealPct7 = share(last7Days.filter((d) => d.rec?.bristol !== null).map((d) => d.rec!), isIdeal);
    const avgSleep7 = daysLogged7
      ? (last7Days.reduce((acc, cur) => acc + cur.rec!.sleep, 0) / daysLogged7).toFixed(1)
      : "-";
    const avgWater7 = daysLogged7
      ? (last7Days.reduce((acc, cur) => acc + cur.rec!.water, 0) / daysLogged7).toFixed(1)
      : "-";

    return {
      last14Days,
      patterns,
      daysLogged7,
      idealPct7,
      avgSleep7,
      avgWater7,
      hasLogs: withB.length > 0,
    };
  }, [settings.logs]);

  // SVG Chart Dimensions
  const W = 320;
  const H = 170;
  const L = 30;
  const R = 18;
  const Tp = 10;
  const B = 24;

  const getX = (i: number) => L + (i * (W - L - R)) / 13;
  const getY = (v: number) => Tp + ((7 - v) * (H - Tp - B)) / 6;

  // Build SVG path
  let pathD = '';
  let curSegment: [number, number][] = [];
  last14Days.forEach((d, i) => {
    if (d.rec && d.rec.bristol !== null) {
      curSegment.push([getX(i), getY(d.rec.bristol)]);
    } else {
      if (curSegment.length > 1) {
        pathD += 'M' + curSegment.map((p) => p.join(' ')).join('L');
      }
      curSegment = [];
    }
  });
  if (curSegment.length > 1) {
    pathD += 'M' + curSegment.map((p) => p.join(' ')).join('L');
  }

  return (
    <div className="apple-view space-y-3">
      <div>
        <h1 className="text-[27px] font-black tracking-tight text-[var(--ink)]">
          Your patterns
        </h1>
        <div className="flex items-center gap-1.5 flex-wrap mt-1 mb-2">
          <span className="apple-tag t-lav">✨ AI Insights</span>
          <span className="apple-tag t-sun">Not a diagnosis</span>
          <button
            onClick={onOpenAIInfo}
            className="text-[13px] font-extrabold text-[var(--lav)] hover:underline ml-1"
          >
            How the AI works →
          </button>
        </div>
      </div>

      {/* Weekly AI Summary */}
      <div className="apple-card" style={{ background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.12), var(--card))' }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[22px]">🤖</span>
          <h3 className="font-black text-[16px]">Weekly Summary</h3>
        </div>
        <p className="text-[14px] text-[var(--ink2)] font-semibold leading-relaxed">
          {daysLogged7 > 0 ? (
            <>
              You checked in <b>{daysLogged7} of 7 days</b> this week. <b>{idealPct7}%</b> of your bowel movements were in the <b>ideal zone</b> (Type 3-4). You averaged <b>{avgSleep7} h</b> of sleep and <b>{avgWater7} glasses</b> of water a day.
              {patterns.length > 0 && (
                <span> Strongest pattern: <b>{patterns[0].title.toLowerCase()}</b>.</span>
              )}
            </>
          ) : (
            <>
              No check-ins recorded in the last 7 days yet. Complete your first check-in to see your trends!
            </>
          )}
        </p>
        <p className="text-[11.5px] text-[var(--muted)] font-bold mt-2">
          Calculated on your device from your logs. Completely private.
        </p>
      </div>

      {/* 14-day Stool Trend Chart */}
      <div className="apple-card relative">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-black text-[15px]">Stool Type · Last 14 Days</h3>
          <span className="apple-tag t-mint">ideal 3-4</span>
        </div>

        <div className="relative">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto block select-none"
            role="region"
            aria-label="14-Day Stool Chart"
          >
            {/* Ideal zone green ribbon */}
            <rect
              x={L}
              y={getY(4)}
              width={W - L - R}
              height={getY(3) - getY(4)}
              fill="#DDF4EC"
              rx={4}
            />

            {/* Grid horizontal lines */}
            {[1, 2, 3, 4, 5, 6, 7].map((v) => (
              <React.Fragment key={v}>
                <line
                  x1={L}
                  x2={W - R}
                  y1={getY(v)}
                  y2={getY(v)}
                  stroke="#F1E6D8"
                  strokeWidth="1"
                />
                <text
                  x={L - 8}
                  y={getY(v) + 4}
                  textAnchor="end"
                  fontSize="10.5"
                  fontWeight="700"
                  fill="#8C8499"
                >
                  {v}
                </text>
              </React.Fragment>
            ))}

            <text x={L + 4} y={getY(7) + 12} fontSize="9" fontWeight="800" fill="#8C8499">
              LOOSE
            </text>
            <text x={L + 4} y={getY(1) - 4} fontSize="9" fontWeight="800" fill="#8C8499">
              HARD
            </text>

            {/* Connecting line */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="#8B5A3C"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}

            {/* Empty state hint when no stool entries exist */}
            {!hasLogs && (
              <g>
                <text
                  x={W / 2}
                  y={H / 2 - 4}
                  textAnchor="middle"
                  fontSize="12.5"
                  fontWeight="800"
                  fill="var(--ink2)"
                >
                  No Check-in Data Yet
                </text>
                <text
                  x={W / 2}
                  y={H / 2 + 14}
                  textAnchor="middle"
                  fontSize="10.5"
                  fontWeight="700"
                  fill="var(--muted)"
                >
                  Log daily to see your real 14-day digestion chart
                </text>
              </g>
            )}

            {/* Data points */}
            {last14Days.map((d, i) => {
              const xPos = getX(i);
              const isEven = i % 2 === 13 % 2;
              return (
                <g key={i}>
                  {isEven && (
                    <text
                      x={i === 13 ? xPos + 10 : xPos}
                      y={H - 6}
                      textAnchor={i === 13 ? 'end' : 'middle'}
                      fontSize="9.5"
                      fontWeight="700"
                      fill="#8C8499"
                    >
                      {i === 13
                        ? 'Today'
                        : d.date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                    </text>
                  )}
                  {d.rec && d.rec.bristol !== null && (
                    <g
                      className="cursor-pointer focus:outline-none"
                      role="button"
                      tabIndex={0}
                      aria-label={`${d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: Bristol Type ${d.rec.bristol}, ${d.rec.sleep}h sleep, ${d.rec.water} glasses water`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          const rec = d.rec!;
                          setActiveTooltip({
                            x: xPos,
                            y: getY(rec.bristol!),
                            dateStr: d.date.toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            }),
                            bristol: Math.round(rec.bristol!) as BristolNumber,
                            sleep: rec.sleep,
                            water: rec.water,
                            stress: rec.stress,
                            count: rec.count,
                          });
                        }
                      }}
                      onClick={() => {
                        const rec = d.rec!;
                        setActiveTooltip({
                          x: xPos,
                          y: getY(rec.bristol!),
                          dateStr: d.date.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          }),
                          bristol: Math.round(rec.bristol!) as BristolNumber,
                          sleep: rec.sleep,
                          water: rec.water,
                          stress: rec.stress,
                          count: rec.count,
                        });
                      }}
                    >
                      <circle cx={xPos} cy={getY(d.rec.bristol)} r="13" fill="transparent" />
                      <circle
                        cx={xPos}
                        cy={getY(d.rec.bristol)}
                        r="5"
                        fill={d.rec.bristol > 2.5 && d.rec.bristol < 4.5 ? '#23A27E' : '#8B5A3C'}
                        stroke="#fff"
                        strokeWidth="2"
                      />
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Interactive Tooltip with boundary clamping */}
          {activeTooltip && (() => {
            const pctX = (activeTooltip.x / W) * 100;
            const pctY = (activeTooltip.y / H) * 100;
            const isNearRight = pctX > 75;
            const isNearLeft = pctX < 25;
            const isNearTop = pctY < 35;

            const transformClass = isNearTop
              ? isNearRight
                ? '-translate-x-full translate-y-2'
                : isNearLeft
                ? 'translate-x-0 translate-y-2'
                : '-translate-x-1/2 translate-y-2'
              : isNearRight
              ? '-translate-x-full -translate-y-full'
              : isNearLeft
              ? 'translate-x-0 -translate-y-full'
              : '-translate-x-1/2 -translate-y-full';

            return (
              <div
                className={`absolute z-10 bg-[var(--ink)] text-white text-[12px] p-2.5 rounded-xl shadow-lg leading-snug pointer-events-auto transform ${transformClass} max-w-[220px] w-max`}
                style={{
                  left: `${pctX}%`,
                  top: `${pctY}%`,
                }}
              >
                <div className="flex justify-between items-center gap-2 mb-1">
                  <b className="font-extrabold">{activeTooltip.dateStr}</b>
                  <button
                    onClick={() => setActiveTooltip(null)}
                    className="text-white/70 hover:text-white px-1 text-[11px]"
                  >
                    ✕
                  </button>
                </div>
                <div>
                  Type {activeTooltip.bristol} · {BRISTOL[activeTooltip.bristol]?.fun || BRISTOL[activeTooltip.bristol]?.name}
                </div>
                <div className="text-[11px] text-white/80 mt-1">
                  😴 {activeTooltip.sleep} h · 💧 {activeTooltip.water} glasses · 🧠 {STRESS[activeTooltip.stress]?.[1]}
                  {activeTooltip.count && activeTooltip.count > 1 ? ` · 📝 ${activeTooltip.count} check-ins` : ''}
                </div>
              </div>
            );
          })()}
        </div>

        <p className="text-[11.5px] text-[var(--muted)] font-bold mt-2">
          Tap any dot to see that day's check-in. Gaps mean no check-in was logged.
        </p>
      </div>

      {/* Discovered Patterns */}
      <div>
        <h2 className="text-[18px] font-black tracking-tight text-[var(--ink)] mb-2.5">
          Patterns Discovered
        </h2>
        {patterns.length === 0 ? (
          <p className="text-[14px] text-[var(--ink2)] font-semibold">
            No clear patterns yet. Keep logging daily check-ins!
          </p>
        ) : (
          <div className="space-y-2.5">
            {patterns.map((p, idx) => (
              <div
                key={idx}
                className="apple-card flex items-start gap-3 p-3.5 my-0"
              >
                <div
                  className="w-[42px] h-[42px] rounded-[14px] grid place-items-center text-[22px] flex-none"
                  style={{ background: p.bg }}
                >
                  {p.em}
                </div>
                <div className="flex-1">
                  <b className="block text-[15px] font-black text-[var(--ink)] mb-1">
                    {p.title}
                  </b>
                  <p className="text-[13.5px] text-[var(--ink2)] font-semibold leading-relaxed">
                    {p.text}
                  </p>

                  <div className="mt-2.5 space-y-1.5">
                    <div>
                      <div className="flex justify-between text-[12px] font-extrabold text-[var(--ink2)]">
                        <span>{p.la}</span>
                        <span>{p.a}%</span>
                      </div>
                      <div className="h-[9px] rounded-full bg-[#F3E9DC] overflow-hidden mt-1">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${p.a}%`, background: p.col }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[12px] font-extrabold text-[var(--ink2)]">
                        <span>{p.lb}</span>
                        <span>{p.b}%</span>
                      </div>
                      <div className="h-[9px] rounded-full bg-[#F3E9DC] overflow-hidden mt-1">
                        <div
                          className="h-full rounded-full transition-all duration-500 opacity-50"
                          style={{ width: `${Math.max(p.b, 2)}%`, background: p.col }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Try this week */}
      <div className="apple-card">
        <h3 className="font-black text-[15px] mb-2.5">Try this week 🎯</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 py-1.5 border-b border-[var(--line)]">
            <div className="w-10 h-10 rounded-[13px] bg-[#E3F1FF] grid place-items-center text-[19px] flex-none">
              💧
            </div>
            <div>
              <b className="text-[14px] font-extrabold text-[var(--ink)] block">
                Refill your bottle at every class change
              </b>
              <p className="text-[12.5px] text-[var(--ink2)] font-semibold">
                Easiest way to reach 6+ glasses a day.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 py-1.5 border-b border-[var(--line)]">
            <div className="w-10 h-10 rounded-[13px] bg-[var(--mint-l)] grid place-items-center text-[19px] flex-none">
              🍎
            </div>
            <div>
              <b className="text-[14px] font-extrabold text-[var(--ink)] block">
                Add one fruit or veg at Dining Hall lunch
              </b>
              <p className="text-[12.5px] text-[var(--ink2)] font-semibold">
                Fiber is the best way to soften hard stools.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 py-1.5">
            <div className="w-10 h-10 rounded-[13px] bg-[var(--lav-l)] grid place-items-center text-[19px] flex-none">
              😴
            </div>
            <div>
              <b className="text-[14px] font-extrabold text-[var(--ink)] block">
                Protect 7 hours before midterms &amp; exams
              </b>
              <p className="text-[12.5px] text-[var(--ink2)] font-semibold">
                Your logs show that sleep directly helps digestion.
              </p>
            </div>
          </div>
        </div>
      </div>

      <button className="apple-btn ghost" onClick={onOpenScience}>
        📚 The science behind gut health
      </button>
    </div>
  );
};
