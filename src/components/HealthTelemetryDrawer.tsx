// TODO: refactor this shit later, personal telemetry drawer looks sick with apple watch rings
import React from 'react';
import { X, Activity, Droplets, Apple, ShieldCheck, Download, Sparkles } from 'lucide-react';
import { sound } from '../lib/audio';

interface HealthTelemetryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  dormName: string;
}

export const HealthTelemetryDrawer: React.FC<HealthTelemetryDrawerProps> = ({
  isOpen,
  onClose,
  dormName,
}) => {
  if (!isOpen) return null;

  // 7-day Bristol history simulation
  const weekData = [
    { day: 'Mon', type: 3, label: 'Normal', score: 85 },
    { day: 'Tue', type: 4, label: 'Optimal', score: 100 },
    { day: 'Wed', type: 4, label: 'Optimal', score: 100 },
    { day: 'Thu', type: 2, label: 'Constipated', score: 65 },
    { day: 'Fri', type: 4, label: 'Optimal', score: 100 },
    { day: 'Sat', type: 5, label: 'Soft', score: 75 },
    { day: 'Sun', type: 4, label: 'Optimal', score: 100 },
  ];

  console.log(`[HealthDrawer] Rendering telemetry for ${dormName} student. RAM buffer clean.`);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#121316] border border-[#22252C] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#22252C] bg-[#16171B] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-[#FFE600]" />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#F8FAFC]">
                Clinical Stoolware Telemetry
              </h2>
              <p className="text-[10px] text-[#94A3B8] font-mono">
                Encrypted Anonymous Profile · {dormName}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded text-[#94A3B8] hover:text-[#F1F3F5] hover:bg-[#1C1E24]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs font-sans">
          {/* Apple Watch-Style Triple Ring Metric Card */}
          <div className="p-4 bg-[#0B0C10] border border-[#22252C] rounded-xl flex items-center justify-between">
            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase text-[#64748B] tracking-wider">
                Daily Biomarker Goals
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                  <span className="text-[#E2E8F0] font-mono text-[11px]">Fiber Intake: 28g / 35g (80%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
                  <span className="text-[#E2E8F0] font-mono text-[11px]">Hydration: 2.4L / 3.0L (80%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FFE600]" />
                  <span className="text-[#E2E8F0] font-mono text-[11px]">House Power: 100 / 100 Pts (100%)</span>
                </div>
              </div>
            </div>

            {/* SVG Concentric Rings */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Outer Ring - Fiber */}
                <circle cx="50" cy="50" r="42" stroke="#162E23" strokeWidth="6" fill="transparent" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#10B981"
                  strokeWidth="6"
                  strokeDasharray="263"
                  strokeDashoffset={263 * (1 - 0.8)}
                  strokeLinecap="round"
                  fill="transparent"
                />
                {/* Middle Ring - Hydration */}
                <circle cx="50" cy="50" r="32" stroke="#0F293E" strokeWidth="6" fill="transparent" />
                <circle
                  cx="50"
                  cy="50"
                  r="32"
                  stroke="#38BDF8"
                  strokeWidth="6"
                  strokeDasharray="201"
                  strokeDashoffset={201 * (1 - 0.74)}
                  strokeLinecap="round"
                  fill="transparent"
                />
                {/* Inner Ring - House Points */}
                <circle cx="50" cy="50" r="22" stroke="#383207" strokeWidth="6" fill="transparent" />
                <circle
                  cx="50"
                  cy="50"
                  r="22"
                  stroke="#FFE600"
                  strokeWidth="6"
                  strokeDasharray="138"
                  strokeDashoffset={138 * (1 - 0.92)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute text-center">
                <Sparkles className="w-4 h-4 text-[#FFE600] mx-auto animate-pulse" />
              </div>
            </div>
          </div>

          {/* 7-Day Bristol Stool Scale Curve */}
          <div className="p-4 bg-[#16171B] border border-[#22252C] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-[#64748B] tracking-wider">
                7-Day Bristol Scale Motility Trend
              </span>
              <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/30">
                Normal Transit Speed
              </span>
            </div>

            {/* Bar chart representation */}
            <div className="grid grid-cols-7 gap-2 pt-2">
              {weekData.map((d, i) => (
                <div key={i} className="flex flex-col items-center space-y-1">
                  <div className="text-[9px] font-mono text-[#94A3B8]">T{d.type}</div>
                  <div className="w-full bg-[#0B0C10] h-20 rounded-md relative flex items-end p-1">
                    <div
                      className={`w-full rounded transition-all duration-300 ${
                        d.type === 4 ? 'bg-[#10B981]' : d.type === 3 ? 'bg-[#38BDF8]' : 'bg-[#F59E0B]'
                      }`}
                      style={{ height: `${(d.score / 100) * 100}%` }}
                    />
                  </div>
                  <div className="text-[10px] font-mono text-[#CBD5E1]">{d.day}</div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              <strong>Clinical Benchmark:</strong> 5 of 7 days logged at optimal Bristol Type 4 (soft, smooth cylindrical contour). No steatorrhea or occult blood indications found.
            </p>
          </div>

          {/* Aggregated Anonymous Campus Gut Advisory */}
          <div className="p-4 bg-[#1C1E24] border border-[#2A2D35] rounded-xl space-y-2">
            <div className="flex items-center space-x-2 text-[#FFE600]">
              <Droplets className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                F&M Campus Health Advisory
              </span>
            </div>
            <p className="text-[11px] text-[#CBD5E1] leading-relaxed">
              Aggregated anonymized sensor data from <strong>Shadek Library 2F</strong> and <strong>Stager Hall</strong> indicates a 14% uptick in Type 1-2 stool consistency (early dehydration). Students are encouraged to use the Steinman Center hydration stations.
            </p>
          </div>

          {/* Zero-Disk Cryptographic Proof */}
          <div className="p-3 bg-[#0B0C10] border border-[#10B981]/30 rounded-lg flex items-center space-x-3 text-[#10B981]">
            <ShieldCheck className="w-5 h-5 flex-shrink-0" />
            <div className="text-[10px] font-mono leading-tight">
              <div>SESSION HASH: e4a7...99b2 (Zero-Disk Memory Ingestion)</div>
              <div className="text-[#64748B]">All camera bytes discarded immediately after classification.</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#22252C] bg-[#16171B] flex items-center justify-between">
          <button
            onClick={() => {
              sound.playClick();
              alert('Exporting anonymous FHIR-compliant digestion log (JSON/PDF)...');
            }}
            className="px-3 py-2 bg-[#1C1E24] hover:bg-[#2A2D35] text-[#CBD5E1] font-mono text-xs rounded flex items-center space-x-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Health Summary</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 bg-[#FFE600] text-black font-bold text-xs uppercase tracking-wider rounded cursor-pointer hover:bg-[#E6CF00]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
