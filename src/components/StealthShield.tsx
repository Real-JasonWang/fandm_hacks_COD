import React, { useState, useEffect, useRef } from 'react';

interface StealthShieldProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StealthShield: React.FC<StealthShieldProps> = ({ isOpen, onClose }) => {
  const [subMode, setSubMode] = useState<'notes' | 'calculator'>('notes');
  const [calcInput, setCalcInput] = useState<string>('sin(x) * 1.5');
  const [calcResult, setCalcResult] = useState<string>('0.8414');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastTapRef = useRef<number>(0);

  const handleTouchEnd = (e: React.TouchEvent) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      const target = e.target as HTMLElement;
      if (!target.closest('button, input, textarea, select')) {
        onClose();
      }
    }
    lastTapRef.current = now;
  };

  // Draw graphing calculator function on canvas
  useEffect(() => {
    if (!isOpen || subMode !== 'calculator') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = '#27272A';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#71717A';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();

    // Plot trigonometric curve
    ctx.strokeStyle = '#22C55E';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let px = 0; px < w; px++) {
      const x = (px - w / 2) * 0.05;
      const y = Math.sin(x) * Math.cos(x * 0.4) * 45;
      const py = h / 2 - y;
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }, [isOpen, subMode]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-[#18181B] text-[#E4E4E7] font-mono select-none overflow-y-auto p-4 sm:p-6"
      onDoubleClick={onClose}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Bar disguise */}
      <div className="max-w-[540px] mx-auto">
        <div className="flex items-center justify-between border-b border-[#27272A] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
            <span className="text-[12px] font-bold text-[#A1A1AA] ml-2">
              {subMode === 'notes' ? 'Canvas LMS — MATH 211' : 'TI-84 Graphing Simulation'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSubMode(subMode === 'notes' ? 'calculator' : 'notes')}
              className="text-[11px] px-2.5 py-1 rounded bg-[#27272A] text-[#D4D4D8] hover:bg-[#3F3F46]"
            >
              Switch: {subMode === 'notes' ? 'Calculator' : 'Course Notes'}
            </button>
            <button
              onClick={onClose}
              className="text-[11px] px-2.5 py-1 rounded bg-[#3B82F6]/20 text-[#60A5FA] font-bold hover:bg-[#3B82F6]/30"
            >
              Exit Disguise ✕
            </button>
          </div>
        </div>

        {/* Mode A: Course Notes */}
        {subMode === 'notes' && (
          <div className="space-y-4 font-sans text-[#D4D4D8]">
            <div className="bg-[#27272A]/40 p-4 rounded-xl border border-[#27272A]">
              <span className="text-[11px] font-mono tracking-widest text-[#38BDF8] uppercase font-bold">
                Franklin &amp; Marshall College · Fall 2026
              </span>
              <h1 className="text-[20px] font-bold text-white mt-1">
                MATH 211: Multivariable Calculus &amp; Vector Fields
              </h1>
              <p className="text-[13px] text-[#A1A1AA]">
                Instructor: Prof. Reynolds · Stager Hall Room 204
              </p>
            </div>

            <div className="space-y-3 text-[14px] leading-relaxed">
              <h2 className="text-[16px] font-bold text-[#F43F5E] font-mono">
                § 14.4 Green's Theorem &amp; Flux Integrals
              </h2>
              <div className="bg-[#09090B] p-3.5 rounded-lg border border-[#27272A] font-mono text-[13px] text-[#34D399]">
                ∮_C (L dx + M dy) = ∬_D (∂M/∂x - ∂L/∂y) dA
              </div>
              <p>
                Let <i>C</i> be a positively oriented, piecewise smooth, simple closed curve in a plane, and let <i>D</i> be the region bounded by <i>C</i>.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[13.5px] text-[#A1A1AA]">
                <li>Verification of conservative vector fields where curl F = 0.</li>
                <li>Applications to circulation and fluid flux across planar boundaries.</li>
                <li>Homework #7 due this Friday at 5:00 PM via Canvas LMS.</li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-[#27272A]/30 border border-[#27272A] text-[12px] text-[#71717A] text-center">
              💡 Tip: Double-tap anywhere to quickly exit stealth disguise.
            </div>
          </div>
        )}

        {/* Mode B: Graphing Calculator */}
        {subMode === 'calculator' && (
          <div className="space-y-3 font-mono">
            <div className="bg-[#09090B] p-3 rounded-xl border border-[#27272A]">
              <div className="flex justify-between text-[11px] text-[#A1A1AA] mb-1">
                <span>RAD  DEG</span>
                <span>f(x) = {calcInput}</span>
              </div>
              <canvas
                ref={canvasRef}
                width={480}
                height={160}
                className="w-full h-[150px] bg-[#09090B] rounded border border-[#27272A]"
              />
              <div className="text-right text-[18px] text-[#22C55E] font-bold mt-2 font-mono">
                = {calcResult}
              </div>
            </div>

            {/* Calculator Keypad */}
            <div className="grid grid-cols-4 gap-1.5 text-[14px]">
              {['sin', 'cos', 'tan', 'RAD', '7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', '.', '=', '+'].map(
                (btn) => (
                  <button
                    key={btn}
                    onClick={() => {
                      if (btn === '=') {
                        setCalcResult((Math.random() * 2 + 0.5).toFixed(4));
                      } else {
                        setCalcInput((prev) => prev + btn);
                      }
                    }}
                    className="p-3 bg-[#27272A] hover:bg-[#3F3F46] active:bg-[#52525B] rounded-lg text-center font-bold"
                  >
                    {btn}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
