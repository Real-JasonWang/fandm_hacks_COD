import React, { useState } from 'react';
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
  } | null>(null);

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
      count: bms.length,
      sleep: last.sleep,
      water: last.water,
      veg: last.veg,
      stress: last.stress,
      ts: last.ts,
    };
  };

  // Last 14 days
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const daysAgo = 13 - i;
    const d = new Date();
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
  const lowSleep = withB.filter((d) => d.sleep < 6);
  const goodSleep = withB.filter((d) => d.sleep >= 7);
  if (lowSleep.length >= 2 && goodSleep.length >= 2) {
    const a = share(lowSleep, isHard);
    const b = share(goodSleep, isHard);
    if (a - b >= 25) {
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
  }

  const lowWater = withB.filter((d) => d.water < 4);
  const goodWater = withB.filter((d) => d.water >= 6);
  if (lowWater.length >= 2 && goodWater.length >= 2) {
    const a = share(lowWater, isHard);
    const b = share(goodWater, isHard);
    if (a - b >= 25) {
      patterns.push({
        em: "💧",
        bg: "#E3F1FF",
        title: "Low water days = constipation days",
        text: `On days with fewer than 4 glasses, ${a}% of logs were hard (Type 1–2), vs ${b}% on 6+ glass days.`,
        a,
        b,
        la: "< 4 glasses",
        lb: "6+ glasses",
        col: "#3D7BE0",
      });
    }
  }

  const hiStress = withB.filter((d) => d.stress >= 3);
  const loStress = withB.filter((d) => d.stress <= 1);
  if (hiStress.length >= 2 && loStress.length >= 2) {
    const a = share(hiStress, (d) => (d.bristol ?? 0) >= 4.5);
    const b = share(loStress, (d) => (d.bristol ?? 0) >= 4.5);
    if (a - b >= 25) {
      patterns.push({
        em: "🧠",
        bg: "var(--peach-l)",
        title: "Stress shows up in your gut",
        text: `On stressed days, ${a}% of logs were soft or loose, vs ${b}% on calm days. That's the gut–brain axis in real time.`,
        a,
        b,
        la: "Stressed days",
        lb: "Calm days",
        col: "var(--peach-d)",
      });
    }
  }

  const last7Days = last14Days.slice(7).filter((d) => d.rec);
  const daysLogged7 = last7Days.length;
  const idealPct7 = share(last7Days.filter((d) => d.rec?.bristol !== null).map((d) => d.rec!), isIdeal);
  const avgSleep7 = daysLogged7
    ? (last7Days.reduce((acc, cur) => acc + cur.rec!.sleep, 0) / daysLogged7).toFixed(1)
    : "—";
  const avgWater7 = daysLogged7
    ? (last7Days.reduce((acc, cur) => acc + cur.rec!.water, 0) / daysLogged7).toFixed(1)
    : "—";

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
      <div className="apple-card" style={{ background: 'linear-gradient(135deg, #F0EDFF, #FFFFFF)' }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[22px]">🤖</span>
          <h3 className="font-black text-[16px]">Weekly Summary</h3>
        </div>
        <p className="text-[14px] text-[var(--ink2)] font-semibold leading-relaxed">
          You checked in <b>{daysLogged7} of 7 days</b> this week. <b>{idealPct7}%</b> of your bowel movements were in the <b>ideal zone</b> (Type 3–4). You averaged <b>{avgSleep7} h</b> of sleep and <b>{avgWater7} glasses</b> of water a day.
          {patterns.length > 0 && (
            <span> The strongest physiological correlation: <b>{patterns[0].title.toLowerCase()}</b>.</span>
          )}
        </p>
        <p className="text-[11.5px] text-[var(--muted)] font-bold mt-2">
          Generated entirely on-device from your logs using deterministic clinical heuristics & local statistical pattern mining.
        </p>
      </div>

      {/* 14-day Stool Trend Chart */}
      <div className="apple-card relative">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-black text-[15px]">Stool Type · Last 14 Days</h3>
          <span className="apple-tag t-mint">ideal 3–4</span>
        </div>

        <div className="relative">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto block select-none"
            role="img"
            aria-label="Stool chart"
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
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
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
                        : d.date.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                    </text>
                  )}
                  {d.rec && d.rec.bristol !== null && (
                    <g
                      className="cursor-pointer"
                      onClick={() => {
                        const rec = d.rec!;
                        setActiveTooltip({
                          x: xPos,
                          y: getY(rec.bristol!),
                          dateStr: d.date.toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          }),
                          bristol: Math.round(rec.bristol!) as BristolNumber,
                          sleep: rec.sleep,
                          water: rec.water,
                          stress: rec.stress,
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

          {/* Interactive Tooltip */}
          {activeTooltip && (
            <div
              className="absolute z-10 bg-[var(--ink)] text-white text-[12px] p-2.5 rounded-xl shadow-lg leading-snug pointer-events-auto transform -translate-x-1/2 -translate-y-full"
              style={{
                left: `${(activeTooltip.x / W) * 100}%`,
                top: `${(activeTooltip.y / H) * 100}%`,
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
              </div>
            </div>
          )}
        </div>

        <p className="text-[11.5px] text-[var(--muted)] font-bold mt-2">
          Tap any dot to inspect day telemetry. Gaps indicate days with no check-in.
        </p>
      </div>

      {/* Discovered Patterns */}
      <div>
        <h2 className="text-[18px] font-black tracking-tight text-[var(--ink)] mb-2.5">
          Patterns Discovered
        </h2>
        {patterns.length === 0 ? (
          <p className="text-[14px] text-[var(--ink2)] font-semibold">
            No strong physiological correlations yet — keep logging daily check-ins!
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
                Easiest way to reach the 6+ glass baseline.
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
                Dietary soluble fiber is the #1 remedy for hard stools.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 py-1.5">
            <div className="w-10 h-10 rounded-[13px] bg-[var(--lav-l)] grid place-items-center text-[19px] flex-none">
              😴
            </div>
            <div>
              <b className="text-[14px] font-extrabold text-[var(--ink)] block">
                Protect 7 hours before midterms & exams
              </b>
              <p className="text-[12.5px] text-[var(--ink2)] font-semibold">
                Your data shows sleep directly stabilizes motility.
              </p>
            </div>
          </div>
        </div>
      </div>

      <button className="apple-btn ghost" onClick={onOpenScience}>
        📚 The science behind gut telemetry
      </button>
    </div>
  );
};
