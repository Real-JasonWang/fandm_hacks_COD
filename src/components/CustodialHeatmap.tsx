import React from 'react';
import { RestroomNode } from '../types';
import { Sparkles, MapPin, Navigation, Clock, AlertTriangle } from 'lucide-react';
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

              {/* 64px Glove-Ready Sanitation Action Button */}
              {isSelected && (
                <div className="mt-3 pt-3 border-t border-[#2A2D35] flex items-center justify-between">
                  <div className="text-xs text-[#94A3B8]">
                    Reset facility status and clear alerts
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playCapture();
                      onSanitizeRestroom(r.id);
                    }}
                    className="h-12 px-5 bg-[#F59E0B] hover:bg-[#D97706] active:bg-[#B45309] text-black font-bold text-xs uppercase tracking-wider rounded-md flex items-center space-x-2 transition-transform active:scale-95 cursor-pointer shadow-lg shadow-[#F59E0B]/20"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Mark Sanitized & Restocked</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
