import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, BookOpen, Calculator, X } from 'lucide-react';
import { sound } from '../lib/audio';

// TODO: fix trig graph canvas scaling on high dpi displays if blurry
interface StealthShieldProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StealthShield: React.FC<StealthShieldProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'notes' | 'calc'>('notes');
  const [calcInput, setCalcInput] = useState('sin(x) * 2');
  const [calcResult, setCalcResult] = useState('2.0000');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // draw trig function on canvas
  useEffect(() => {
    if (!isOpen || mode !== 'calc') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // grid lines
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // axes
    ctx.strokeStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    // sine curve
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let px = 0; px < canvas.width; px++) {
      const x = (px - canvas.width / 2) * 0.05;
      const y = Math.sin(x) * 2;
      const py = canvas.height / 2 - y * 25;
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }, [isOpen, mode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0C10] text-[#F1F3F5] flex flex-col font-sans select-none animate-in fade-in duration-100">
      {/* Top Academic Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#22252C] bg-[#121316]">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-[#10B981]" />
          <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
            Stealth Privacy Shield Active
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              sound.playClick();
              setMode(mode === 'notes' ? 'calc' : 'notes');
            }}
            className="flex items-center space-x-1 px-2 py-1 text-xs rounded bg-[#1C1E24] hover:bg-[#2A2D35] text-[#CBD5E1]"
          >
            {mode === 'notes' ? <Calculator className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
            <span>{mode === 'notes' ? 'Open Calculator' : 'Open Notes'}</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded text-[#94A3B8] hover:text-[#F1F3F5] hover:bg-[#1C1E24]"
            title="Double-tap or click X to return to game"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Stealth Body */}
      {mode === 'notes' ? (
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm font-serif max-w-2xl mx-auto leading-relaxed text-[#CBD5E1]">
          <div className="border-b border-[#2A2D35] pb-3">
            <div className="text-xs font-mono text-[#94A3B8] uppercase">Franklin & Marshall College · Dept. of Mathematics</div>
            <h1 className="text-xl font-bold text-[#F8FAFC] font-sans mt-1">
              MATH 211: Multivariable Calculus — Lecture 18
            </h1>
            <div className="text-xs text-[#64748B] mt-1 font-sans">
              Prof. Stager / Hackman Science Center · Room 204
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-base font-semibold text-[#38BDF8] font-sans">
              § 16.4 Green's Theorem & Circulation Integrals
            </h2>
            <p>
              Let <span className="font-mono bg-[#1E293B] px-1 rounded text-xs">C</span> be a positively oriented, piecewise-smooth, simple closed curve in the plane, and let <span className="font-mono bg-[#1E293B] px-1 rounded text-xs">D</span> be the region bounded by <span className="font-mono bg-[#1E293B] px-1 rounded text-xs">C</span>. If <span className="font-mono">P(x, y)</span> and <span className="font-mono">Q(x, y)</span> have continuous partial derivatives on an open region that contains <span className="font-mono">D</span>:
            </p>
            <div className="p-3 bg-[#121316] border border-[#1E293B] rounded font-mono text-center text-sm text-[#FBBF24]">
              ∮_C (P dx + Q dy) = ∬_D (∂Q/∂x - ∂P/∂y) dA
            </div>
            <p className="text-xs text-[#94A3B8]">
              <strong>Key Theorem Takeaway:</strong> Green's Theorem provides the mathematical bridge between a microscopic circulation density curl field inside <span className="font-mono">D</span> and the macroscopic line integral counter-clockwise along boundary <span className="font-mono">C</span>.
            </p>
          </div>

          <div className="border-t border-[#1E293B] pt-4 space-y-2 text-xs font-sans text-[#94A3B8]">
            <div className="font-bold text-[#CBD5E1]">Assigned Exercises (Due Friday 5:00 PM):</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>Section 16.4: Problems 7, 12, 19, 24 (Evaluate vector flux across closed ellipse)</li>
              <li>Read Section 16.5: Curl and Divergence operators in R^3</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col p-4 max-w-sm mx-auto w-full space-y-3">
          <div className="border border-[#2A2D35] rounded-lg overflow-hidden bg-[#0A0D14]">
            <canvas ref={canvasRef} width={340} height={160} className="w-full h-40 block" />
          </div>

          <div className="p-3 bg-[#121316] border border-[#2A2D35] rounded-lg flex flex-col space-y-1 font-mono">
            <span className="text-xs text-[#64748B]">f(x) = {calcInput}</span>
            <span className="text-xl font-bold text-[#FFE600]">{calcResult}</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-sm font-mono flex-1">
            {['sin', 'cos', 'tan', 'RAD', '7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'].map((btn) => (
              <button
                key={btn}
                onClick={() => {
                  sound.playClick();
                  if (btn === '=') {
                    setCalcResult((Math.sin(2) * 2).toFixed(4));
                  } else {
                    setCalcInput((prev) => prev + btn);
                  }
                }}
                className="bg-[#1C1E24] hover:bg-[#2A2D35] active:bg-[#333842] text-[#E2E8F0] rounded p-2.5 flex items-center justify-center font-bold"
              >
                {btn}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Dismiss Notice */}
      <div className="p-3 text-center text-xs text-[#64748B] font-mono border-t border-[#1E293B]">
        Double-tap anywhere or press X to resume game
      </div>
    </div>
  );
};
