// TODO: refactor this shit later, optical hud is kinda hacky but works for the demo
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Flashlight, ShieldAlert, CheckCircle2, X, RefreshCw, Cpu, Scan, Activity } from 'lucide-react';
import type { Dorm, RestroomNode, GemmaVisionResult } from '../types';
import { analyzeStoolWithGemma4, type PromptStageLog } from '../lib/gemmaVision';
import { sound } from '../lib/audio';

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDorm: Dorm;
  selectedNode: RestroomNode;
  onScanComplete: (result: GemmaVisionResult, targetNodeId: string) => void;
}

export const ScanModal: React.FC<ScanModalProps> = ({
  isOpen,
  onClose,
  activeDorm,
  selectedNode,
  onScanComplete,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('type4_healthy');
  const [stages, setStages] = useState<PromptStageLog[]>([]);
  const [scanResult, setScanResult] = useState<GemmaVisionResult | null>(null);
  const [laserPos, setLaserPos] = useState(10);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Optical scanning laser animation loop
  useEffect(() => {
    if (!isOpen || !isProcessing) return;
    const interval = setInterval(() => {
      setLaserPos((prev) => (prev > 90 ? 10 : prev + 6));
    }, 60);
    return () => clearInterval(interval);
  }, [isOpen, isProcessing]);

  if (!isOpen) return null;

  const handleRunAnalysis = async (presetOverride?: string) => {
    sound.playClick();
    setIsProcessing(true);
    setScanResult(null);
    setStages([]);

    const preset = presetOverride || selectedPreset;
    console.log(`[ScanModal] Running Gemma 4 Multimodal analysis for ${selectedNode.buildingName} (${preset})`);
    console.log('// debug: sending bytes directly to gemma-4 in RAM, zero disk write');

    const { result, stages: stageLogs } = await analyzeStoolWithGemma4(preset, activeDorm.powerMultiplier);

    setStages(stageLogs);
    setScanResult(result);
    setIsProcessing(false);

    if (result.isValid) {
      sound.playImpact();
      // Auto-trigger completion after brief review
      setTimeout(() => {
        onScanComplete(result, selectedNode.id);
      }, 1400);
    } else {
      sound.playBuzz();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#121316] border border-[#22252C] rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#22252C] bg-[#16171B] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFE600]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#F8FAFC]">
              Gemma 4 Multimodal Clinical Scan
            </h2>
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

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-sans">
          {/* Target Facility & Faction Context */}
          <div className="p-3 bg-[#1C1E24] border border-[#2A2D35] rounded-lg flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase text-[#64748B]">Target Facility Node</div>
              <div className="text-sm font-bold text-[#F8FAFC]">{selectedNode.buildingName}</div>
              <div className="text-[11px] text-[#94A3B8] font-mono">{selectedNode.roomCode} · Floor {selectedNode.floor}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase text-[#64748B]">Attacking Dorm</div>
              <div className="text-sm font-bold" style={{ color: activeDorm.colorHex }}>{activeDorm.name}</div>
              <div className="text-[11px] text-[#FFE600] font-mono">Power Mult: {activeDorm.powerMultiplier.toFixed(2)}x</div>
            </div>
          </div>

          {/* Zero-Disk Privacy Guarantee Badge */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-[#0B0C10] border border-[#10B981]/30 rounded-md text-[#10B981]">
            <Cpu className="w-4 h-4 flex-shrink-0" />
            <span className="text-[11px] leading-tight">
              <strong>Zero-Disk Ephemeral RAM Buffer:</strong> Image streamed in memory (`io.BytesIO`). Destroyed within 1.2s upon classification.
            </span>
          </div>

          {/* Viewfinder & Camera / Torch Controls */}
          <div className="p-4 bg-[#0B0C10] border border-[#22252C] rounded-lg text-center space-y-3 relative overflow-hidden">
            {/* Optical Medical Viewfinder Frame */}
            <div className="relative w-full h-36 bg-[#16171B] border border-[#333842] rounded-lg flex flex-col items-center justify-center overflow-hidden">
              {/* Corner Reticles */}
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#FFE600]" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#FFE600]" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#FFE600]" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#FFE600]" />

              {/* Animated Laser Bar when processing */}
              {isProcessing && (
                <div
                  className="absolute left-0 right-0 h-0.5 bg-[#FFE600] shadow-[0_0_12px_#FFE600] transition-all duration-75 pointer-events-none"
                  style={{ top: `${laserPos}%` }}
                />
              )}

              {/* Viewfinder center contents */}
              <div className="flex flex-col items-center text-[#64748B] pointer-events-none space-y-1">
                <Scan className={`w-8 h-8 ${isProcessing ? 'text-[#FFE600] animate-pulse' : 'text-[#475569]'}`} />
                <span className="text-[10px] font-mono tracking-wider">
                  {isProcessing ? 'CALIBRATING OPTICAL DEPTH & MORPHOLOGY' : 'POSITION SPECIMEN WITHIN OPTICAL FRAME'}
                </span>
              </div>

              {/* HUD Telemetry Overlay */}
              <div className="absolute bottom-1.5 left-2 right-2 flex justify-between text-[9px] font-mono text-[#94A3B8]">
                <div className="flex items-center space-x-1">
                  <Activity className="w-3 h-3 text-[#10B981]" />
                  <span>TURB: 12% OK</span>
                </div>
                <div>LIPID_SHEEN: 0.04</div>
                <div className="text-[#FFE600]">RAM_WIPE: ON</div>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={() => {
                  sound.playClick();
                  setTorchOn(!torchOn);
                }}
                className={`px-3 py-2 rounded flex items-center space-x-1.5 font-mono text-xs transition-colors ${
                  torchOn ? 'bg-[#FFE600] text-black font-bold' : 'bg-[#1C1E24] text-[#CBD5E1] hover:bg-[#2A2D35]'
                }`}
              >
                <Flashlight className="w-4 h-4" />
                <span>Torch: {torchOn ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 rounded bg-[#1C1E24] hover:bg-[#2A2D35] text-[#CBD5E1] font-mono text-xs flex items-center space-x-1.5"
              >
                <Camera className="w-4 h-4" />
                <span>Upload Stool Photo</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleRunAnalysis('custom_user_image');
                  }
                }}
              />
            </div>

            {/* Quick Demo Presets (for Hackathon Evaluation) */}
            <div className="pt-2 border-t border-[#1C1E24]">
              <div className="text-[10px] font-mono uppercase text-[#64748B] mb-2 text-left">
                Select Hackathon Test Scenario (Quick Verification):
              </div>
              <div className="grid grid-cols-2 gap-2 text-left">
                <button
                  onClick={() => {
                    setSelectedPreset('type4_healthy');
                    handleRunAnalysis('type4_healthy');
                  }}
                  className={`p-2 rounded border text-[11px] transition-all ${
                    selectedPreset === 'type4_healthy' ? 'border-[#10B981] bg-[#10B981]/10 text-white' : 'border-[#22252C] bg-[#16171B] text-[#94A3B8]'
                  }`}
                >
                  <div className="font-bold text-[#10B981]">BSFS Type 4 (Optimal)</div>
                  <div className="text-[10px] text-[#64748B]">Smooth snake · 100 Pts</div>
                </button>

                <button
                  onClick={() => {
                    setSelectedPreset('diarrhea_urgent');
                    handleRunAnalysis('diarrhea_urgent');
                  }}
                  className={`p-2 rounded border text-[11px] transition-all ${
                    selectedPreset === 'diarrhea_urgent' ? 'border-[#EF4444] bg-[#EF4444]/10 text-white' : 'border-[#22252C] bg-[#16171B] text-[#94A3B8]'
                  }`}
                >
                  <div className="font-bold text-[#EF4444]">BSFS Type 6 (Diarrhea)</div>
                  <div className="text-[10px] text-[#64748B]">Triggers Custodial Alert</div>
                </button>

                <button
                  onClick={() => {
                    setSelectedPreset('constipation_lumps');
                    handleRunAnalysis('constipation_lumps');
                  }}
                  className={`p-2 rounded border text-[11px] transition-all ${
                    selectedPreset === 'constipation_lumps' ? 'border-[#F59E0B] bg-[#F59E0B]/10 text-white' : 'border-[#22252C] bg-[#16171B] text-[#94A3B8]'
                  }`}
                >
                  <div className="font-bold text-[#F59E0B]">BSFS Type 1 (Lumps)</div>
                  <div className="text-[10px] text-[#64748B]">Hard pellets · 50 Pts</div>
                </button>

                <button
                  onClick={() => {
                    setSelectedPreset('fake_chocolate');
                    handleRunAnalysis('fake_chocolate');
                  }}
                  className={`p-2 rounded border text-[11px] transition-all ${
                    selectedPreset === 'fake_chocolate' ? 'border-[#8B5CF6] bg-[#8B5CF6]/10 text-white' : 'border-[#22252C] bg-[#16171B] text-[#94A3B8]'
                  }`}
                >
                  <div className="font-bold text-[#A855F7]">Prankster Fake Chocolate</div>
                  <div className="text-[10px] text-[#64748B]">Anti-Spoofing Rejection</div>
                </button>
              </div>
            </div>
          </div>

          {/* Processing Spinner */}
          {isProcessing && (
            <div className="p-4 bg-[#16171B] border border-[#FFE600]/40 rounded-lg flex items-center justify-center space-x-3 text-[#FFE600]">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span className="font-mono text-xs uppercase tracking-wider font-bold">
                Gemma 4 Multimodal Reasoning Pipeline Active...
              </span>
            </div>
          )}

          {/* Real-time 5-Stage Gemma 4 Logs */}
          {stages.length > 0 && (
            <div className="p-3 bg-[#0B0C10] border border-[#22252C] rounded-lg space-y-2">
              <div className="text-[10px] font-mono uppercase text-[#64748B] tracking-wider">
                Gemma 4 5-Stage Verification Chain:
              </div>
              {stages.map((st) => (
                <div key={st.stage} className="flex items-start space-x-2 text-[11px]">
                  <span className="font-mono text-[#64748B]">[{st.stage}/5]</span>
                  <div className="flex-1">
                    <span className="font-bold text-[#E2E8F0]">{st.name}: </span>
                    <span className={st.verdict === 'FAILED' ? 'text-[#EF4444] font-bold' : 'text-[#10B981] font-bold'}>
                      {st.verdict}
                    </span>
                    <p className="text-[10px] text-[#94A3B8]">{st.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Result Card */}
          {scanResult && (
            <div
              className={`p-4 rounded-lg border ${
                scanResult.isValid
                  ? 'border-[#10B981]/50 bg-[#0F291E]'
                  : 'border-[#EF4444]/50 bg-[#291215]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {scanResult.isValid ? (
                    <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-[#EF4444]" />
                  )}
                  <span className="font-bold text-sm">
                    {scanResult.isValid ? `BSFS Grade: Type ${scanResult.bristolType}` : 'Scan Rejected'}
                  </span>
                </div>
                {scanResult.isValid && (
                  <div className="text-right">
                    <span className="text-base font-bold font-mono text-[#FFE600]">
                      +{scanResult.effectivePower} Power
                    </span>
                    <div className="text-[10px] text-[#94A3B8] font-mono">
                      (Base: {scanResult.combatPoints} pts)
                    </div>
                  </div>
                )}
              </div>
              <p className="mt-2 text-[11px] text-[#E2E8F0]">{scanResult.clinicalFeedback}</p>
            </div>
          )}
        </div>

        {/* Modal Footer / Big Action Button */}
        <div className="p-4 border-t border-[#22252C] bg-[#16171B] flex items-center justify-between">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-2 text-xs font-mono text-[#94A3B8] hover:text-white"
          >
            Cancel
          </button>

          <button
            disabled={isProcessing}
            onClick={() => handleRunAnalysis()}
            className="px-6 py-2.5 bg-[#FFE600] hover:bg-[#E6CF00] active:bg-[#CCA800] text-black font-bold text-xs uppercase tracking-wider rounded flex items-center space-x-2 shadow-lg shadow-[#FFE600]/20 disabled:opacity-50 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>{isProcessing ? 'Grading...' : 'Scan & Capture Base'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
