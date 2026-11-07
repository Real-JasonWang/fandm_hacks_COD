// TODO: refactor this shit later, glove mode and checklist are super handy for facilities
import React, { useState } from 'react';
import type { RestroomNode } from '../types';
import { Sparkles, Navigation, Clock, AlertTriangle, CheckSquare, Square, Send } from 'lucide-react';
import { sound } from '../lib/audio';

interface CustodialHeatmapProps {
  restrooms: RestroomNode[];
  onSanitizeRestroom: (id: string) => void;
  onSelectNode: (node: RestroomNode) => void;
  selectedNode: RestroomNode | null;
}

export const CustodialHeatmap: React.FC<CustodialHeatmapProps> = ({
  restrooms,
  onSanitizeRestroom,
  onSelectNode,
  selectedNode,
}) => {
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    tp: true,
    soap: true,
    sanitizer: true,
    mop: false,
  });

  const toggleCheck = (key: string) => {
    sound.playClick();
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Calculate dynamic urgency metric
  const sortedRestrooms = [...restrooms].sort((a, b) => {
    const urgencyA = 0.35 * (a.trafficCount / 15) + 0.45 * a.soilingIndex + 0.2 * (a.lastCleanedMinutesAgo / 240);
    const urgencyB = 0.35 * (b.trafficCount / 15) + 0.45 * b.soilingIndex + 0.2 * (b.lastCleanedMinutesAgo / 240);
    return urgencyB - urgencyA;
  });

  return (
    <div className="flex flex-col h-full bg-[#121316] text-[#F1F3F5] font-sans overflow-hidden border-l border-[#22252C]">
      {/* Custodial Header */}
      <div className="p-4 border-b border-[#22252C] bg-[#16171B] flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] animate-pulse" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#F8FAFC]">
              F&M Facility Custodial Heatmap
            </h2>
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5 font-mono">
            Demand-Driven Route Dispatch · 64px Glove-Ready
          </p>
        </div>
      </div>

      {/* Suggested TSP Walking Loop Notice */}
      <div className="px-4 py-2.5 bg-[#1C1917] border-b border-[#F59E0B]/20 flex items-center space-x-2 text-xs text-[#FBBF24]">
        <Navigation className="w-4 h-4 flex-shrink-0" />
        <span>
          <strong>Optimized Walking Route:</strong> Steinman Ctr → Shadek Lib → Hackman Labs → Barshinger
        </span>
      </div>

      {/* Ranked Queue */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="text-xs font-mono uppercase text-[#64748B] tracking-wider">
          Priority Sanitation Queue ({sortedRestrooms.length} Facilities)
        </div>

        {sortedRestrooms.map((r, index) => {
          const isSelected = selectedNode?.id === r.id;
          const urgencyScore = (
            0.35 * (r.trafficCount / 15) +
            0.45 * r.soilingIndex +
            0.2 * (r.lastCleanedMinutesAgo / 240)
          ).toFixed(1);

          return (
            <div
              key={r.id}
              onClick={() => {
                sound.playClick();
                onSelectNode(r);
              }}
              className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#F59E0B] bg-[#1F1E1A]'
                  : r.soilingIndex >= 3
                  ? 'border-[#EF4444]/40 bg-[#1C1215]'
                  : 'border-[#22252C] bg-[#16171B] hover:border-[#383C47]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs text-[#64748B]">#{index + 1}</span>
                    <h3 className="text-sm font-bold text-[#F1F3F5]">{r.buildingName}</h3>
                    <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-[#1C1E24] text-[#CBD5E1]">
                      {r.roomCode}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 mt-1.5 text-xs text-[#94A3B8]">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>{r.lastCleanedMinutesAgo}m ago</span>
                    </span>
                    <span>Foot Traffic: {r.trafficCount}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      r.soilingIndex >= 3
                        ? 'bg-[#EF4444]/20 text-[#EF4444]'
                        : r.soilingIndex >= 1
                        ? 'bg-[#F59E0B]/20 text-[#F59E0B]'
                        : 'bg-[#10B981]/20 text-[#10B981]'
                    }`}
                  >
                    Urgency: {urgencyScore}
                  </div>
                  {r.soilingIndex >= 3 && (
                    <div className="flex items-center space-x-1 text-[10px] text-[#EF4444] mt-1 justify-end font-bold">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Urgent Soiling Flag</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 64px Glove-Ready Sanitation Action Button & Restock Checklist */}
              {isSelected && (
                <div className="mt-3 pt-3 border-t border-[#2A2D35] space-y-3">
                  <div className="text-[10px] font-mono uppercase text-[#64748B] tracking-wider">
                    Sanitation Protocol Checklist:
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCheck('tp');
                      }}
                      className="flex items-center space-x-2 p-2 rounded bg-[#16171B] border border-[#262A33] text-left cursor-pointer"
                    >
                      {checklist.tp ? (
                        <CheckSquare className="w-4 h-4 text-[#10B981]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#64748B]" />
                      )}
                      <span className={checklist.tp ? 'text-white' : 'text-[#64748B]'}>2-Ply TP Stocked</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCheck('soap');
                      }}
                      className="flex items-center space-x-2 p-2 rounded bg-[#16171B] border border-[#262A33] text-left cursor-pointer"
                    >
                      {checklist.soap ? (
                        <CheckSquare className="w-4 h-4 text-[#10B981]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#64748B]" />
                      )}
                      <span className={checklist.soap ? 'text-white' : 'text-[#64748B]'}>Soap Refilled</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCheck('sanitizer');
                      }}
                      className="flex items-center space-x-2 p-2 rounded bg-[#16171B] border border-[#262A33] text-left cursor-pointer"
                    >
                      {checklist.sanitizer ? (
                        <CheckSquare className="w-4 h-4 text-[#10B981]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#64748B]" />
                      )}
                      <span className={checklist.sanitizer ? 'text-white' : 'text-[#64748B]'}>Bleach Disinfected</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCheck('mop');
                      }}
                      className="flex items-center space-x-2 p-2 rounded bg-[#16171B] border border-[#262A33] text-left cursor-pointer"
                    >
                      {checklist.mop ? (
                        <CheckSquare className="w-4 h-4 text-[#10B981]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#64748B]" />
                      )}
                      <span className={checklist.mop ? 'text-white' : 'text-[#64748B]'}>Mop Sanitized</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playCapture();
                        onSanitizeRestroom(r.id);
                      }}
                      className="flex-1 h-12 bg-[#F59E0B] hover:bg-[#D97706] active:bg-[#B45309] text-black font-bold text-xs uppercase tracking-wider rounded-md flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-[#F59E0B]/20"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Complete Sanitization</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playClick();
                        alert(`Radio dispatch sent to Floor Crew for ${r.buildingName}`);
                      }}
                      className="h-12 px-3 bg-[#1C1E24] hover:bg-[#2A2D35] text-[#CBD5E1] rounded-md flex items-center justify-center cursor-pointer"
                      title="Dispatch Floor Crew"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
