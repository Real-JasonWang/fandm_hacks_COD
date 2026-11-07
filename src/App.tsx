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
  Flame,
  Clock,
  Radio
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Dorm, RestroomNode, DormId, GemmaVisionResult, ConquestEvent } from './types';
import { INITIAL_DORMS, INITIAL_RESTROOMS } from './data/campusData';
import { CampusMap } from './components/CampusMap';
import { CustodialHeatmap } from './components/CustodialHeatmap';
import { ScanModal } from './components/ScanModal';
import { StealthShield } from './components/StealthShield';
import { sound } from './lib/audio';

// TODO: refactor this state monster into zustand later if time permits
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
  
  // Rolling Event Ticker
  const [events, setEvents] = useState<ConquestEvent[]>([
    { id: '1', dormId: 'ware', dormName: 'Ware House', restroomName: 'Shadek Library 1F', effectivePower: 98, timestamp: '1m ago' },
    { id: '2', dormId: 'brooks', dormName: 'Brooks House', restroomName: 'Hackman Labs', effectivePower: 86, timestamp: '4m ago' },
    { id: '3', dormId: 'bonchek', dormName: 'Bonchek House', restroomName: 'Steinman Center', effectivePower: 92, timestamp: '9m ago' },
  ]);

  // Hourly Yield Countdown (MM:SS)
  const [yieldTimer, setYieldTimer] = useState(842); // seconds

  const lastTapRef = useState(0);

  const activeDorm = dorms.find((d) => d.id === activeDormId) || dorms[0];

  // Yield timer countdown loop
  useEffect(() => {
    const timer = setInterval(() => {
      setYieldTimer((prev) => (prev > 0 ? prev - 1 : 3600));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Gradual campus simulation loop (live autonomous dorm skirmishes)
  // TODO: refactor this shit later, simulates gradual territory tug-of-war across F&M houses
  useEffect(() => {
    const simInterval = setInterval(() => {
      setRestrooms((prev) =>
        prev.map((r) => {
          if (r.contestState === 'CONTESTED') {
            const shift = (Math.random() - 0.48) * 3;
            const newHp = Math.max(15, Math.min(95, Math.round(r.baseHp + shift)));
            return {
              ...r,
              baseHp: newHp,
              captureProgress: newHp,
              influenceRadius: Math.max(18, Math.min(48, Math.round(newHp * 0.4 + 10)))
            };
          }
          return r;
        })
      );
    }, 4500);
    return () => clearInterval(simInterval);
  }, []);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Double-tap detector on mobile screen for stealth shield
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

  // Kiosk Auto-Orbit Mode
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

  // Execute the 2.5-second live action battle sequence
  const handleScanComplete = (result: GemmaVisionResult, targetNodeId: string) => {
    setIsScanModalOpen(false);

    console.log(`[Battle Engine] Starting 2.5s sequence for ${targetNodeId} (+${result.effectivePower} power)`);

    let p = 0;
    const interval = setInterval(() => {
      p += 0.05;
      if (p >= 1) {
        clearInterval(interval);
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
                captureProgress: newHp,
                contestState: newHp >= 90 ? 'FORTIFIED' : 'STABLE',
                influenceRadius: Math.min(50, (r.influenceRadius || 28) + 8),
                cleanlinessAlert: result.cleanlinessAlert,
                soilingIndex: Math.min(5, r.soilingIndex + result.soilingSeverity),
                trafficCount: r.trafficCount + 1,
                lastCleanedMinutesAgo: 0
              };
            }
            return r;
          })
        );

        setTimeout(() => {
          sound.playCapture();
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.85 },
            colors: ['#FFE600', activeDorm.colorHex, '#FFFFFF']
          });

          const newEvt: ConquestEvent = {
            id: Date.now().toString(),
            dormId: activeDormId,
            dormName: activeDorm.name,
            restroomName: selectedNode.buildingName,
            effectivePower: result.effectivePower,
            timestamp: 'Just now'
          };
          setEvents((prev) => [newEvt, ...prev.slice(0, 7)]);

          // Update dorm territory percentages
          setDorms((prev) => {
            return prev.map((d) => ({
              ...d,
              territoryPercentage: d.id === activeDormId ? Math.min(45, d.territoryPercentage + 4) : Math.max(10, d.territoryPercentage - 1)
            }));
          });

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
      <StealthShield isOpen={isStealthOpen} onClose={() => setIsStealthOpen(false)} />

      <ScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        activeDorm={activeDorm}
        selectedNode={selectedNode}
        onScanComplete={handleScanComplete}
      />

      {/* TOP HEADER: Brand, Live Ticker, Form Factor & Custodial Toggles */}
      <header className="h-14 bg-[#121316] border-b border-[#22252C] px-4 flex items-center justify-between z-30 flex-shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded bg-[#FFE600] flex items-center justify-center font-bold text-black text-xs font-mono shadow-md shadow-[#FFE600]/20">
            COD
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-tight text-[#F8FAFC]">
              Call of Doodie: <span className="text-[#FFE600]">Modern Stoolware</span>
            </h1>
            <div className="text-[10px] text-[#64748B] font-mono leading-none">
              F&M Main Campus · Gemma 4 Vision
            </div>
          </div>
        </div>

        {/* Rolling Live Battle Feed & Yield Timer */}
        <div className="hidden md:flex items-center space-x-4 bg-[#16171B] border border-[#22252C] px-3 py-1 rounded-full text-xs">
          <div className="flex items-center space-x-1.5 text-[#F59E0B] font-mono">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#EF4444]" />
            <span className="font-bold">{events[0].dormName}</span>
            <span className="text-[#94A3B8]">captured</span>
            <span className="text-white">{events[0].restroomName}</span>
            <span className="text-[#FFE600] font-bold">+{events[0].effectivePower}</span>
          </div>
          <span className="text-[#333842]">|</span>
          <div className="flex items-center space-x-1 font-mono text-[11px] text-[#94A3B8]">
            <Clock className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Hourly Yield:</span>
            <span className="text-[#10B981] font-bold">{formatTimer(yieldTimer)}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Active Faction Select */}
          <select
            value={activeDormId}
            onChange={(e) => {
              sound.playClick();
              setActiveDormId(e.target.value as DormId);
            }}
            className="hidden lg:block bg-[#1C1E24] border border-[#2A2D35] text-xs font-mono px-2 py-1 rounded text-[#E2E8F0] focus:outline-none"
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

          {/* Form Factor Switcher */}
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

          {/* Stealth Button */}
          <button
            onClick={() => {
              sound.playClick();
              setIsStealthOpen(true);
            }}
            className="p-1.5 rounded bg-[#1C1E24] text-[#94A3B8] hover:text-white"
            title="Double-Tap Screen for Stealth"
          >
            <Shield className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
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

      {/* PERSISTENT CAMPUS TERRITORY DOMINANCE BAR */}
      <div className="h-1.5 w-full bg-[#121316] flex overflow-hidden flex-shrink-0">
        {dorms.map((d) => (
          <div
            key={d.id}
            className="h-full transition-all duration-700 relative group"
            style={{ width: `${d.territoryPercentage}%`, backgroundColor: d.colorHex }}
            title={`${d.name}: ${d.territoryPercentage}%`}
          />
        ))}
      </div>

      {/* MAIN VIEWPORT LAYOUT */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* DESKTOP LEFT SIDEBAR: Faction Standings & Live Event Feed */}
        {viewMode === 'desktop' && !custodialMode && (
          <aside className="w-72 bg-[#121316] border-r border-[#22252C] flex flex-col p-4 space-y-4 flex-shrink-0 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#64748B] flex items-center space-x-1">
                <Trophy className="w-3.5 h-3.5 text-[#FFE600]" />
                <span>F&M College Cup</span>
              </span>
              <span className="text-[10px] font-mono text-[#10B981]">Live Season</span>
            </div>

            {/* Faction Cards */}
            <div className="space-y-2.5">
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
                    <span>{d.residentCount} residents</span>
                    <span>Hits: {d.powerMultiplier.toFixed(2)}x</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Live Conquest Feed List */}
            <div className="space-y-2 pt-2 border-t border-[#22252C]">
              <div className="text-[10px] font-mono uppercase text-[#64748B] tracking-wider">
                Recent Campus Conquests
              </div>
              <div className="space-y-1.5">
                {events.slice(0, 4).map((ev) => (
                  <div key={ev.id} className="p-2 rounded bg-[#16171B] border border-[#22252C] text-[11px] space-y-0.5">
                    <div className="flex items-center justify-between font-bold">
                      <span style={{ color: dorms.find((d) => d.id === ev.dormId)?.colorHex }}>{ev.dormName}</span>
                      <span className="font-mono text-[10px] text-[#64748B]">{ev.timestamp}</span>
                    </div>
                    <div className="text-[#94A3B8] text-[10px] flex items-center justify-between">
                      <span>{ev.restroomName}</span>
                      <span className="text-[#FFE600] font-mono font-bold">+{ev.effectivePower}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Habit Streak Card */}
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

          {/* MOBILE ACTION BUTTON: Log Stool */}
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

              <div className="flex items-center space-x-2 text-[11px] text-[#94A3B8] bg-[#0B0C10]/85 backdrop-blur px-3 py-1 rounded-full border border-white/5 font-mono">
                <span>Selected: {selectedNode.roomCode}</span>
                <span>·</span>
                <span className="text-[#10B981]">{selectedNode.baseHp} HP</span>
                <span>·</span>
                <span>Double-tap for Stealth</span>
              </div>
            </div>
          )}
        </section>

        {/* RIGHT SIDEBAR: Telemetry Inspector or Custodial Console */}
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
                  className="px-2.5 py-1 bg-[#FFE600] text-black font-bold text-[10px] uppercase rounded hover:bg-[#E6CF00]"
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
                    className={`w-full p-2 rounded text-left border flex items-center justify-between text-[11px] transition-all ${
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
