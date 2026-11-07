// TODO: refactor this shit later, architectural floor cutaway for shadek/steinman
import React, { useState } from 'react';
import { X, Layers, CheckCircle2, AlertTriangle, Shield, Check } from 'lucide-react';
import type { RestroomNode } from '../types';
import { sound } from '../lib/audio';

interface FloorCutawayModalProps {
  isOpen: boolean;
  onClose: () => void;
  node: RestroomNode;
}

export const FloorCutawayModal: React.FC<FloorCutawayModalProps> = ({
  isOpen,
  onClose,
  node,
}) => {
  const [selectedFloor, setSelectedFloor] = useState<number>(node.floor);
  const [selectedStall, setSelectedStall] = useState<string>('stall_2');

  if (!isOpen) return null;

  const stalls = [
    { id: 'stall_1', code: 'Stall 1 (Standard)', status: 'CLEAN', tp: '95%', odor: 'Neutral' },
    { id: 'stall_2', code: 'Stall 2 (Standard)', status: 'NEEDS_RESTOCK', tp: '15%', odor: 'Mild' },
    { id: 'stall_3', code: 'Stall 3 (ADA Accessible)', status: 'CLEAN', tp: '80%', odor: 'Neutral' },
    { id: 'stall_4', code: 'Stall 4 (Express)', status: node.soilingIndex >= 3 ? 'SOILED' : 'CLEAN', tp: '60%', odor: node.soilingIndex >= 3 ? 'High' : 'Neutral' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#121316] border border-[#22252C] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#22252C] bg-[#16171B] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-[#FFE600]" />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#F8FAFC]">
                {node.buildingName} · Architectural Cutaway
              </h2>
              <p className="text-[10px] text-[#94A3B8] font-mono">
                Multi-Floor Schematic & Individual Stall Telemetry
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

        {/* Content */}
        <div className="p-5 space-y-4 text-xs font-sans">
          {/* Floor Level Selector Tabs */}
          <div className="flex items-center space-x-2 bg-[#0B0C10] p-1 rounded-lg border border-[#22252C]">
            {[1, 2, 3].map((fl) => (
              <button
                key={fl}
                onClick={() => {
                  sound.playClick();
                  setSelectedFloor(fl);
                }}
                className={`flex-1 py-1.5 rounded font-mono text-xs transition-colors cursor-pointer ${
                  selectedFloor === fl
                    ? 'bg-[#FFE600] text-black font-bold'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Level 0{fl} {fl === node.floor ? '(Active Node)' : ''}
              </button>
            ))}
          </div>

          {/* Isometric Cutaway Graphic / Stall Grid */}
          <div className="p-4 bg-[#16171B] border border-[#22252C] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-[#64748B] tracking-wider">
                Restroom Stalls Layout ({node.roomCode} · Level 0{selectedFloor})
              </span>
              <span className="text-[10px] font-mono text-[#10B981] flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>HEPA Filtration Active</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {stalls.map((s) => {
                const isPicked = selectedStall === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedStall(s.id);
                    }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isPicked
                        ? 'border-[#FFE600] bg-[#1F1E1A]'
                        : s.status === 'SOILED'
                        ? 'border-[#EF4444]/40 bg-[#1C1215]'
                        : 'border-[#22252C] bg-[#0B0C10] hover:border-[#383C47]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#E2E8F0]">{s.code}</span>
                      {isPicked && <Check className="w-3.5 h-3.5 text-[#FFE600]" />}
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-[#94A3B8]">TP Level:</span>
                      <span className={s.tp === '15%' ? 'text-[#EF4444] font-bold' : 'text-[#10B981]'}>
                        {s.tp}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-[#94A3B8]">Status:</span>
                      <span className="flex items-center space-x-1">
                        {s.status === 'SOILED' ? (
                          <>
                            <AlertTriangle className="w-3 h-3 text-[#EF4444]" />
                            <span className="text-[#EF4444] font-bold">Alert</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                            <span className="text-[#10B981]">Ready</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Building Ventilation & Water Pressure Gauge */}
          <div className="p-3 bg-[#0B0C10] border border-[#22252C] rounded-lg flex items-center justify-between font-mono text-[11px]">
            <div>
              <span className="text-[#64748B]">FLUSH WATER PSI: </span>
              <span className="text-[#38BDF8] font-bold">58 PSI</span>
            </div>
            <div>
              <span className="text-[#64748B]">EXHAUST CFM: </span>
              <span className="text-[#10B981] font-bold">420 CFM</span>
            </div>
            <div>
              <span className="text-[#64748B]">OCCUPANCY: </span>
              <span className="text-[#FFE600] font-bold">1 / 4 Stalls</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#22252C] bg-[#16171B] flex items-center justify-end space-x-2">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 bg-[#FFE600] text-black font-bold text-xs uppercase tracking-wider rounded cursor-pointer hover:bg-[#E6CF00]"
          >
            Confirm Target Stall
          </button>
        </div>
      </div>
    </div>
  );
};
