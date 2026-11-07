import { useState, useEffect } from 'react';
import {
  Shield,
  Smartphone,
  Monitor,
  Tv,
  Sparkles,
  Volume2,
  VolumeX,
  Trophy,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Dorm, RestroomNode, DormId, GemmaVisionResult, ConquestEvent } from './types';
import { INITIAL_DORMS, INITIAL_RESTROOMS } from './data/campusData';
import { CampusMap } from './components/CampusMap';
import { CustodialHeatmap } from './components/CustodialHeatmap';
import { ScanModal } from './components/ScanModal';
import { StealthShield } from './components/StealthShield';
import { sound } from './lib/audio';

// TODO: refactor this shit later, hackathon speed is all that matters
export function App() {
  const [dorms, setDorms] = useState<Dorm[]>(INITIAL_DORMS);
  const [restrooms, setRestrooms] = useState<RestroomNode[]>(INITIAL_RESTROOMS);
  const [activeDormId, setActiveDormId] = useState<DormId>('ware');
  const [selectedNode, setSelectedNode] = useState<RestroomNode>(INITIAL_RESTROOMS[0]);

  // Screen View Mode: Mobile PWA vs Desktop War Room vs Wall Kiosk
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop' | 'kiosk'>('mobile');
  const [custodialMode, setCustodialMode] = useState<boolean>(false);

  // Modals & Overlays
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isStealthOpen, setIsStealthOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Battle Vector & Live Sequence Animation
  const [activeVector, setActiveVector] = useState<{
    fromDormId: DormId;
    toNodeId: string;
    progress: number;
  } | null>(null);
  const [latestConquest, setLatestConquest] = useState<ConquestEvent | null>(null);

  // Double-tap detector on mobile screen for stealth shield
  const lastTapRef = useState(0);

  const activeDorm = dorms.find((d) => d.id === activeDormId) || dorms[0];

  // Handle double-tap anywhere for stealth privacy
  const handleTouchStart = () => {
    const now = Date.now();
    if (now - lastTapRef[0] < 320) {
      console.log("[Stealth] Double tap detected! Activating privacy shield.");
      setIsStealthOpen(true);
    }
    lastTapRef[1](now);
  };

  // Keyboard navigation for Desktop War Room (Cmd+K / WASD)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        sound.playClick();
        const nextIdx = (restrooms.findIndex((r) => r.id === selectedNode.id) + 1) % restrooms.length;
        setSelectedNode(restrooms[nextIdx]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [restrooms, selectedNode]);

  // Kiosk Auto-Orbit Mode (cycles nodes every 6 seconds)
  useEffect(() => {
    if (viewMode !== 'kiosk') return;
    const interval = setInterval(() => {
      setSelectedNode((prev) => {
        const idx = restrooms.findIndex((r) => r.id === prev.id);
        return restrooms[(idx + 1) % restrooms.length];
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [viewMode, restrooms]);

  // Execute the 2.5-second live action battle sequence!
  const handleScanComplete = (result: GemmaVisionResult, targetNodeId: string) => {
    setIsScanModalOpen(false);

    console.log(`[Battle Engine] Starting 2.5s sequence for ${targetNodeId} (+${result.effectivePower} power)`);

    // Step 1: Start Vector March (0.0s - 0.8s)
    let p = 0;
    const interval = setInterval(() => {
      p += 0.05;
      if (p >= 1) {
        clearInterval(interval);
        // Step 2: Node Impact (0.8s)
        sound.playImpact();
        if (navigator.vibrate) {
          navigator.vibrate([40]);
        }

        // Apply health & conquest math
        setRestrooms((prev) =>
          prev.map((r) => {
            if (r.id === targetNodeId) {
              const newHp = Math.min(100, r.baseHp + result.effectivePower);
              return {
                ...r,
                controllingDormId: activeDormId,
                baseHp: newHp,
                cleanlinessAlert: result.cleanlinessAlert,
                soilingIndex: Math.min(5, r.soilingIndex + result.soilingSeverity),
                trafficCount: r.trafficCount + 1,
                lastCleanedMinutesAgo: 0
              };
            }
            return r;
          })
        );

        // Step 3: Consolidation & Victory Chime (1.8s)
        setTimeout(() => {
          sound.playCapture();
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.85 },
            colors: ['#FFE600', activeDorm.colorHex, '#FFFFFF']
          });

          const conquest: ConquestEvent = {
            id: Date.now().toString(),
            dormId: activeDormId,
            dormName: activeDorm.name,
            restroomName: selectedNode.buildingName,
            effectivePower: result.effectivePower,
            timestamp: 'Just now'
          };
          setLatestConquest(conquest);

          // Update dorm territory percentages
          setDorms((prev) => {
            return prev.map((d) => ({
              ...d,
              territoryPercentage: d.id === activeDormId ? Math.min(45, d.territoryPercentage + 4) : Math.max(10, d.territoryPercentage - 1)
            }));
          });

          // Reset vector
          setActiveVector(null);
        }, 600);
      } else {
        setActiveVector({
          fromDormId: activeDormId,
          toNodeId: targetNodeId,
          progress: p
        });
      }
    }, 35);
  };

  // Custodial Clean Action
  const handleSanitizeRestroom = (id: string) => {
    setRestrooms((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            soilingIndex: 0,
            cleanlinessAlert: false,
            lastCleanedMinutesAgo: 0
          };
        }
        return r;
      })
    );
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      className="w-screen h-screen bg-[#0B0C10] text-[#F1F3F5] flex flex-col font-sans select-none overflow-hidden"
    >
      {/* Stealth Privacy Shield Modal */}
      <StealthShield isOpen={isStealthOpen} onClose={() => setIsStealthOpen(false)} />

      {/* Gemma 4 Scanning Modal */}
      <ScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        activeDorm={activeDorm}
        selectedNode={selectedNode}
        onScanComplete={handleScanComplete}
      />

      {/* TOP BAR: Title, Dynamic Island, Multi-Screen & Custodial Switcher */}
      <header className="h-14 bg-[#121316] border-b border-[#22252C] px-4 flex items-center justify-between z-30 flex-shrink-0">
        {/* Brand Lockup */}
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded bg-[#FFE600] flex items-center justify-center font-bold text-black text-xs font-mono shadow-md shadow-[#FFE600]/20">
            COD
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-tight text-[#F8FAFC]">
              Call of Doodie: <span className="text-[#FFE600]">Modern Stoolware</span>
            </h1>
            <div className="text-[10px] text-[#64748B] font-mono leading-none">
              F&M Edition · Gemma 4 Vision
            </div>
          </div>
        </div>

        {/* Dynamic Island Banner / Live Alert */}
        {latestConquest && (
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-[#1C1E24] border border-[#FFE600]/30 rounded-full animate-in slide-in-from-top duration-300">
            <span className="w-2 h-2 rounded-full bg-[#FFE600] animate-ping" />
            <span className="text-xs text-[#F1F3F5]">
              <strong>{latestConquest.dormName}</strong> captured {latestConquest.restroomName} (+{latestConquest.effectivePower})
            </span>
          </div>
        )}

        {/* Triple Screen & Custodial Controls */}
        <div className="flex items-center space-x-2">
          {/* Faction Selector */}
          <select
            value={activeDormId}
            onChange={(e) => {
              sound.playClick();
              setActiveDormId(e.target.value as DormId);
            }}
            className="hidden md:block bg-[#1C1E24] border border-[#2A2D35] text-xs font-mono px-2 py-1 rounded text-[#E2E8F0] focus:outline-none"
          >
            {dorms.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.powerMultiplier.toFixed(2)}x)
              </option>
            ))}
          </select>

          {/* Custodial View Switcher */}
          <button
            onClick={() => {
              sound.playClick();
              setCustodialMode(!custodialMode);
            }}
            className={`px-2.5 py-1 text-xs rounded font-mono font-bold flex items-center space-x-1.5 transition-colors ${
              custodialMode
                ? 'bg-[#F59E0B] text-black shadow-md shadow-[#F59E0B]/20'
                : 'bg-[#1C1E24] text-[#94A3B8] hover:text-[#F1F3F5]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{custodialMode ? 'Custodial View' : 'Dorm Game View'}</span>
          </button>

          {/* Form Factor Toggle */}
          <div className="hidden lg:flex items-center bg-[#1C1E24] border border-[#2A2D35] rounded p-0.5 space-x-0.5">
            <button
              onClick={() => {
                sound.playClick();
                setViewMode('mobile');
              }}
              className={`p-1 rounded ${viewMode === 'mobile' ? 'bg-[#FFE600] text-black' : 'text-[#64748B]'}`}
              title="Mobile PWA Field Agent"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setViewMode('desktop');
              }}
              className={`p-1 rounded ${viewMode === 'desktop' ? 'bg-[#FFE600] text-black' : 'text-[#64748B]'}`}
              title="Desktop War Room (3-Column)"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setViewMode('kiosk');
              }}
              className={`p-1 rounded ${viewMode === 'kiosk' ? 'bg-[#FFE600] text-black' : 'text-[#64748B]'}`}
              title="55-inch Wall Kiosk Mode"
            >
              <Tv className="w-4 h-4" />
            </button>
          </div>

          {/* Stealth Trigger Button */}
          <button
            onClick={() => {
              sound.playClick();
              setIsStealthOpen(true);
            }}
            className="p-1.5 rounded bg-[#1C1E24] text-[#94A3B8] hover:text-white"
            title="Emergency Stealth Shield (Double-Tap Screen)"
          >
            <Shield className="w-4 h-4" />
          </button>

          {/* Audio Mute */}
          <button
            onClick={() => {
              sound.playClick();
              setSoundEnabled(!soundEnabled);
            }}
            className="p-1.5 rounded bg-[#1C1E24] text-[#94A3B8] hover:text-white"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* MAIN VIEWPORT LAYOUT */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* DESKTOP LEFT SIDEBAR: Dorm Leaderboard (Shown in desktop mode) */}
        {viewMode === 'desktop' && !custodialMode && (
          <aside className="w-72 bg-[#121316] border-r border-[#22252C] flex flex-col p-4 space-y-4 flex-shrink-0 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#64748B] flex items-center space-x-1">
                <Trophy className="w-3.5 h-3.5 text-[#FFE600]" />
                <span>F&M College Cup</span>
              </span>
              <span className="text-[10px] font-mono text-[#10B981]">Live Season</span>
            </div>

            <div className="space-y-3">
              {dorms.map((d, index) => (
                <div
                  key={d.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveDormId(d.id);
                  }}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                    activeDormId === d.id ? 'border-[#FFE600] bg-[#1C1E24]' : 'border-[#22252C] bg-[#16171B] hover:border-[#383C47]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center space-x-1.5">
                      <span className="text-[#64748B] font-mono">#{index + 1}</span>
                      <span style={{ color: d.colorHex }}>{d.name}</span>
                    </span>
                    <span className="font-mono text-[#F8FAFC]">{d.territoryPercentage}%</span>
                  </div>
                  <div className="mt-2 w-full h-1.5 bg-[#0B0C10] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${d.territoryPercentage * 2.2}%`, backgroundColor: d.colorHex }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-[#64748B] font-mono">
                    <span>{d.residentCount} students</span>
                    <span>Power: {d.powerMultiplier.toFixed(2)}x</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Habit Streak Notice */}
            <div className="p-3 bg-[#16171B] border border-[#22252C] rounded-lg mt-auto flex items-center space-x-3 text-xs">
              <Flame className="w-5 h-5 text-[#F59E0B]" />
              <div>
                <div className="font-bold text-[#F1F3F5]">4-Day Habit Streak</div>
                <div className="text-[10px] text-[#94A3B8] font-mono">+15% Tenacity Multiplier</div>
              </div>
            </div>
          </aside>
        )}

        {/* CENTER VIEWPORT: The 2.5D Campus Map Canvas */}
        <section className="flex-1 relative flex flex-col bg-[#0B0C10] overflow-hidden">
          <CampusMap
            dorms={dorms}
            restrooms={restrooms}
            selectedNode={selectedNode}
            onSelectNode={(node) => {
              sound.playClick();
              setSelectedNode(node);
            }}
            activeVector={activeVector}
            custodialMode={custodialMode}
          />

          {/* MOBILE / FIELD AGENT FLOATING FOOTER (The 10% Yellow Action Token) */}
          {!custodialMode && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-20 flex flex-col items-center space-y-2 pointer-events-auto">
              <button
                onClick={() => {
                  sound.playClick();
                  setIsScanModalOpen(true);
                }}
                className="w-full h-14 bg-[#FFE600] hover:bg-[#E6CF00] active:scale-95 text-black font-extrabold text-sm tracking-wider uppercase rounded-xl flex items-center justify-center space-x-2 shadow-2xl shadow-[#FFE600]/30 transition-transform cursor-pointer border border-[#FFF04D]"
              >
                <span>Log Stool</span>
                <span className="text-xs font-mono font-normal opacity-75">· {selectedNode.buildingName}</span>
              </button>

              <div className="flex items-center space-x-2 text-[11px] text-[#94A3B8] bg-[#0B0C10]/80 backdrop-blur px-3 py-1 rounded-full border border-white/5 font-mono">
                <span>Selected: {selectedNode.roomCode}</span>
                <span>·</span>
                <span className="text-[#10B981]">{selectedNode.baseHp} HP</span>
                <span>·</span>
                <span>Double-tap for Stealth</span>
              </div>
            </div>
          )}
        </section>

        {/* RIGHT SIDEBAR: Building Telemetry Inspector OR Custodial Queue */}
        <aside className="w-80 bg-[#121316] border-l border-[#22252C] flex flex-col flex-shrink-0 z-10">
          {custodialMode ? (
            <CustodialHeatmap
              restrooms={restrooms}
              onSanitizeRestroom={handleSanitizeRestroom}
              onSelectNode={(n) => setSelectedNode(n)}
              selectedNode={selectedNode}
            />
          ) : (
            <div className="flex flex-col h-full p-4 space-y-4 overflow-y-auto text-xs">
              <div className="flex items-center justify-between border-b border-[#22252C] pb-3">
                <div className="font-mono uppercase text-[#64748B] text-[10px] tracking-wider">Facility Telemetry</div>
                <button
                  onClick={() => {
                    sound.playClick();
                    setIsScanModalOpen(true);
                  }}
                  className="px-2 py-1 bg-[#FFE600] text-black font-bold text-[10px] uppercase rounded"
                >
                  Attack Node
                </button>
              </div>

              {/* Building Card */}
              <div className="p-3.5 bg-[#16171B] border border-[#22252C] rounded-lg space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#F8FAFC]">{selectedNode.buildingName}</h3>
                    <div className="text-[11px] text-[#94A3B8] font-mono">{selectedNode.roomCode} · Floor {selectedNode.floor}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-[#10B981]">{selectedNode.baseHp} / 100 HP</span>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-[#0B0C10] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#10B981] transition-all"
                    style={{ width: `${selectedNode.baseHp}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#22252C] text-[10px] font-mono text-[#94A3B8]">
                  <div>Controlling Dorm:</div>
                  <div className="text-right font-bold text-[#F1F3F5]">
                    {dorms.find((d) => d.id === selectedNode.controllingDormId)?.name || 'Neutral'}
                  </div>
                  <div>Foot Traffic:</div>
                  <div className="text-right font-bold text-[#F1F3F5]">{selectedNode.trafficCount} scans</div>
                  <div>Cleanliness Alert:</div>
                  <div className={`text-right font-bold ${selectedNode.cleanlinessAlert ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
                    {selectedNode.cleanlinessAlert ? 'URGENT SOIL' : 'CLEAN'}
                  </div>
                </div>
              </div>

              {/* Quick Facility Switcher */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono uppercase text-[#64748B]">Quick Jump to Campus Restroom:</div>
                {restrooms.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedNode(r);
                    }}
                    className={`w-full p-2 rounded text-left border flex items-center justify-between text-[11px] ${
                      selectedNode.id === r.id ? 'border-[#FFE600] bg-[#1C1E24] text-white' : 'border-[#22252C] bg-[#16171B] text-[#94A3B8] hover:text-[#F1F3F5]'
                    }`}
                  >
                    <span>{r.buildingName} ({r.roomCode})</span>
                    <span className="font-mono text-[10px]">{r.baseHp} HP</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
