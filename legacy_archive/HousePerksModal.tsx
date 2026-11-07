// TODO: refactor this shit later, college house perks and lore cards
import React from 'react';
import { X, Trophy, Shield, Zap, Moon, Flame } from 'lucide-react';
import type { Dorm, DormId } from '../types';
import { sound } from '../lib/audio';

interface HousePerksModalProps {
  isOpen: boolean;
  onClose: () => void;
  dorms: Dorm[];
  activeDormId: DormId;
  onSelectDorm: (id: DormId) => void;
}

export const HousePerksModal: React.FC<HousePerksModalProps> = ({
  isOpen,
  onClose,
  dorms,
  activeDormId,
  onSelectDorm,
}) => {
  if (!isOpen) return null;

  const houseLore: Record<DormId, { perk: string; description: string; icon: any }> = {
    bonchek: {
      perk: 'Hydration Fortitude',
      description: '+12% base HP defense against loose stool degradation. Shadek 1F yields 1.2x points.',
      icon: Shield,
    },
    brooks: {
      perk: 'Iron Motility',
      description: '+15% attack bonus on clinical BSFS Type 4 perfection. Steinman Dining bonus active.',
      icon: Trophy,
    },
    ware: {
      perk: 'Night Owl Infiltration',
      description: '1.30x capture multiplier between 10:00 PM and 5:00 AM. Hackman Labs territory shield.',
      icon: Moon,
    },
    weis: {
      perk: 'Sub-Linear Cohesion',
      description: 'Highest per-capita power multiplier (1.10x). Takes 20% fewer logs to capture nodes.',
      icon: Zap,
    },
    new_college: {
      perk: 'Swarm Mass Volume',
      description: '320 resident sheer headcount advantage. ASFC Gym facility automatically fortified.',
      icon: Flame,
    },
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[#121316] border border-[#22252C] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#22252C] bg-[#16171B] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-[#FFE600]" />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#F8FAFC]">
                Franklin & Marshall College Houses
              </h2>
              <p className="text-[10px] text-[#94A3B8] font-mono">
                Faction Perks, Population Handicaps & Special Abilities
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

        {/* Content list */}
        <div className="p-5 overflow-y-auto space-y-3 text-xs font-sans">
          {dorms.map((d) => {
            const lore = houseLore[d.id];
            const Icon = lore.icon;
            const isSelected = activeDormId === d.id;

            return (
              <div
                key={d.id}
                onClick={() => {
                  sound.playClick();
                  onSelectDorm(d.id);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#FFE600] bg-[#1F1E1A] shadow-md shadow-[#FFE600]/10'
                    : 'border-[#22252C] bg-[#16171B] hover:border-[#383C47]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: d.colorHex + '25', color: d.colorHex }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-bold text-[#F8FAFC]">{d.name}</h3>
                        {isSelected && (
                          <span className="text-[9px] font-mono font-bold bg-[#FFE600] text-black px-1.5 py-0.5 rounded">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#94A3B8] font-mono">
                        {d.quadName} · {d.residentCount} Residents
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-[#FFE600]">
                      {d.powerMultiplier.toFixed(2)}x Power
                    </div>
                    <div className="text-[10px] text-[#64748B] font-mono">
                      {d.territoryPercentage}% Map Share
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#22252C] flex items-center justify-between text-[11px]">
                  <div>
                    <span className="font-bold text-[#CBD5E1]">{lore.perk}: </span>
                    <span className="text-[#94A3B8]">{lore.description}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#22252C] bg-[#16171B] flex items-center justify-between">
          <span className="text-[11px] text-[#64748B] font-mono">
            Handicap Formula: Multiplier = (N_avg / sqrt(N_dorm)) / 15.5
          </span>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 bg-[#FFE600] text-black font-bold text-xs uppercase tracking-wider rounded cursor-pointer hover:bg-[#E6CF00]"
          >
            Confirm House Selection
          </button>
        </div>
      </div>
    </div>
  );
};
