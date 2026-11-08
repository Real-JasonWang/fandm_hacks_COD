import React, { useState } from 'react';
import type { BristolNumber, CheckInEntry, ModeType } from '../types';
import { BRISTOL, ZONE, SYMPTOMS, STRESS, calculateCheckInPoints } from '../data/appleData';
import { AppleBristolSVG } from './AppleBristolSVG';
import {
  analyzeStoolImageWithGemma,
  parseNaturalLanguageLogWithGemini,
  getStoredApiKey,
  formatAiErrorMessage,
  type VisionAnalysisResult,
} from '../lib/geminiAI';

interface CheckInSheetProps {
  isOpen: boolean;
  mode: ModeType;
  lastSleep: number;
  lastWater: number;
  lastVeg: number;
  lastStress: number;
  onClose: () => void;
  onSave: (entry: Omit<CheckInEntry, 'id' | 'ts'>) => void;
  onOpenSettings: () => void;
}

type CheckInTab = 'manual' | 'vision' | 'nlp';

export const CheckInSheet: React.FC<CheckInSheetProps> = ({
  isOpen,
  mode,
  lastSleep,
  lastWater,
  lastVeg,
  lastStress,
  onClose,
  onSave,
  onOpenSettings,
}) => {
  const isPlayful = mode === 'playful';

  // Active check-in modality: manual (default), vision (opt-in), nlp (opt-in)
  const [activeTab, setActiveTab] = useState<CheckInTab>('manual');

  // Core Form State
  const [pooped, setPooped] = useState<boolean>(true);
  const [bristol, setBristol] = useState<BristolNumber | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [sleep, setSleep] = useState<number>(typeof lastSleep === 'number' ? lastSleep : 7);
  const [water, setWater] = useState<number>(typeof lastWater === 'number' ? lastWater : 5);
  const [veg, setVeg] = useState<number>(typeof lastVeg === 'number' ? lastVeg : 2);
  const [stress, setStress] = useState<number>(typeof lastStress === 'number' ? lastStress : 1);
  const [formError, setFormError] = useState<string | null>(null);

  // Vision AI State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isVisionLoading, setIsVisionLoading] = useState(false);
  const [visionResult, setVisionResult] = useState<VisionAnalysisResult | null>(null);
  const [visionError, setVisionError] = useState<string | null>(null);

  // NLP Semantic State
  const [nlpText, setNlpText] = useState('');
  const [isNlpLoading, setIsNlpLoading] = useState(false);
  const [nlpMessage, setNlpMessage] = useState<string | null>(null);
  const [nlpError, setNlpError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleSymptom = (id: string) => {
    setFormError(null);
    setSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const calculatePoints = () => {
    return calculateCheckInPoints({ water, sleep });
  };

  const handleSave = () => {
    if (pooped && !bristol) {
      setFormError('Please pick a stool type on the Bristol Scale first 👆');
      return;
    }
    setFormError(null);
    onSave({
      pooped,
      bristol: pooped ? bristol : null,
      symptoms,
      sleep,
      water,
      veg,
      stress,
    });
  };

  // Image Upload & Gemma 4 Analysis
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVisionError(null);
    setVisionResult(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);

      const hasApiKey = Boolean(getStoredApiKey());
      if (!hasApiKey) {
        setVisionError('Please configure your AI key in Settings.');
        return;
      }

      setIsVisionLoading(true);
      try {
        const res = await analyzeStoolImageWithGemma(base64, file.type || 'image/jpeg');
        setVisionResult(res);
        if (res.isValid && res.bristolType) {
          setPooped(true);
          setBristol(res.bristolType);
          if (res.detectedSymptoms?.length) {
            setSymptoms((prev) => Array.from(new Set([...prev, ...res.detectedSymptoms])));
          }
        }
      } catch (err: unknown) {
        setVisionError(formatAiErrorMessage(err));
      } finally {
        setIsVisionLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // NLP Semantic Parser
  const handleNlpParse = async () => {
    if (!nlpText.trim()) return;
    setNlpError(null);
    const hasApiKey = Boolean(getStoredApiKey());
    if (!hasApiKey) {
      setNlpError('Please configure your AI key in Settings first.');
      return;
    }

    setIsNlpLoading(true);
    setNlpMessage(null);
    try {
      const res = await parseNaturalLanguageLogWithGemini(nlpText);
      setPooped(res.pooped);
      if (res.bristol) setBristol(res.bristol);
      if (res.symptoms) setSymptoms(res.symptoms);
      setSleep(res.sleep);
      setWater(res.water);
      setVeg(res.veg);
      setStress(res.stress);
      setNlpMessage(res.summary);
      setFormError(null);
      setActiveTab('manual'); // return to review form
    } catch (err: unknown) {
      setNlpError(formatAiErrorMessage(err));
    } finally {
      setIsNlpLoading(false);
    }
  };

  const selectedZone = bristol ? ZONE[BRISTOL[bristol].zone] : null;

  return (
    <>
      <div className="apple-scrim on" onClick={onClose} />
      <div className="apple-sheet on" role="dialog" aria-modal="true">
        <div className="apple-grab" />

        {/* Sheet Header */}
        <div className="flex items-center justify-between pb-2 mb-2 sticky top-[-10px] bg-[var(--bg)] z-10 pt-2">
          <div>
            <h2 className="text-[21px] font-black tracking-tight text-[var(--ink)]">
              {isPlayful ? 'Daily Check-in 💩' : 'Wellness Check-in'}
            </h2>
            <small className="text-[12px] text-[var(--muted)] font-bold">
              Private check-in · Saved locally
            </small>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[var(--card)] shadow-[var(--shadow)] font-black text-[18px] grid place-items-center hover:bg-[#FFFDF9]"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Check-In Mode Switcher (Identical to "Did you poop today?" apple-seg) */}
        <div className="apple-seg tri mb-3">
          <button
            type="button"
            className={activeTab === 'manual' ? 'on' : ''}
            onClick={() => setActiveTab('manual')}
          >
            ✏️ Manual
          </button>
          <button
            type="button"
            className={activeTab === 'vision' ? 'on' : ''}
            onClick={() => setActiveTab('vision')}
          >
            📷 AI Vision
          </button>
          <button
            type="button"
            className={activeTab === 'nlp' ? 'on' : ''}
            onClick={() => setActiveTab('nlp')}
          >
            🎙️ Voice &amp; Chat
          </button>
        </div>

        {/* OPTION B: AI Photo Check (Optional) */}
        {activeTab === 'vision' && (
          <div className="apple-card p-4 space-y-3 my-2 border-2 border-[var(--peach-l)]">
            <div className="flex items-center gap-2">
              <span className="text-[22px]">🤖</span>
              <div>
                <b className="text-[15px] font-black text-[var(--ink)] block">
                  AI Photo Check (Optional)
                </b>
                <p className="text-[12px] text-[var(--ink2)] font-semibold">
                  Take a photo to check your stool type. Quick, private, and not saved.
                </p>
              </div>
            </div>

            {!getStoredApiKey() && (
              <div className="p-3 bg-[var(--sun-l)] rounded-xl text-[12.5px] font-bold text-[#7A5300] flex justify-between items-center">
                <span>⚠️ AI key not configured</span>
                <button
                  type="button"
                  className="underline ml-2 flex-none font-black"
                  onClick={onOpenSettings}
                >
                  Set up in Settings →
                </button>
              </div>
            )}

            <div className="bg-white rounded-[24px] p-5 text-center border-2 border-[#E8E0D5] shadow-sm">
              {selectedImage ? (
                <div className="space-y-3">
                  <div className="relative max-w-[340px] mx-auto rounded-2xl overflow-hidden border-2 border-[#E5DFD5] shadow-xs bg-[#FAF7F2]">
                    <img
                      src={selectedImage}
                      alt="Photo"
                      className="max-h-[190px] w-full object-cover filter blur-[40px] scale-120 opacity-20 contrast-50 brightness-95"
                    />

                    {/* Privacy Shield Overlay */}
                    <div className="absolute inset-0 bg-[#FFFDF9]/85 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center select-none">
                      <div className="w-11 h-11 rounded-2xl bg-white border border-[#E5DFD5] flex items-center justify-center text-[22px] mb-2 shadow-xs">
                        🛡️
                      </div>
                      <b className="text-[14px] font-black text-[var(--ink)] block tracking-tight">
                        Photo Shielded
                      </b>
                      <p className="text-[11.5px] text-[var(--ink2)] font-semibold max-w-[250px] mt-0.5 leading-snug">
                        Blurred right away. Never saved to your phone or cloud.
                      </p>
                      <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--mint-l)] text-[#11634C] text-[11px] font-black rounded-full">
                        <span>✓</span> Type Detected
                      </div>
                    </div>
                  </div>

                  <label className="apple-chip cursor-pointer text-[12.5px] font-extrabold inline-flex items-center gap-1.5">
                    <span>🔄</span> Retake Photo
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleImageFileChange}
                    />
                  </label>
                </div>
              ) : (
                <label className="cursor-pointer block py-3">
                  <div className="text-[34px] mb-1.5">📸</div>
                  <b className="text-[15px] font-black text-[var(--ink)] block">
                    Take or upload a photo
                  </b>
                  <p className="text-[12.5px] text-[var(--muted)] font-semibold mt-1 max-w-[280px] mx-auto">
                    Blurred right away for privacy. Nothing is saved to disk.
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleImageFileChange}
                  />
                </label>
              )}
            </div>

            {isVisionLoading && (
              <div className="text-center py-3 text-[14px] font-black text-[var(--peach-d)] animate-pulse">
                ⏳ Checking shape and texture...
              </div>
            )}

            {visionError && (
              <div className="p-3 bg-[var(--danger-l)] text-[var(--danger)] rounded-xl text-[12.5px] font-bold">
                ✕ {visionError}
              </div>
            )}

            {visionResult && (
              <div className="apple-card my-3 p-4 space-y-3.5 border-2 border-[var(--mint)] bg-[#F4FBF8]">
                {/* Header Banner */}
                <div className="flex items-center justify-between border-b border-[var(--mint-l)] pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-[var(--mint)] text-white font-black text-[15px] flex items-center justify-center shadow-sm flex-none">
                      {visionResult.bristolType || '✓'}
                    </span>
                    <div>
                      <b className="text-[15px] font-black text-[#11634C] block leading-snug">
                        Bristol Type {visionResult.bristolType || '-'}
                      </b>
                      <span className="text-[11.5px] font-extrabold text-[var(--ink2)]">
                        Match: {(visionResult.confidenceScore * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <span className="apple-tag t-mint">
                    Auto-filled ✓
                  </span>
                </div>

                {/* Tip */}
                <div className="p-3 bg-white rounded-xl border border-[var(--line)] text-[12.5px] font-bold text-[var(--ink)] leading-relaxed">
                  💡 <b>Tip:</b> {visionResult.quickTip}
                </div>

                {/* Reasoning */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <b className="text-[13px] font-black text-[var(--ink)] flex items-center gap-1.5">
                      <span>🧠</span> How the AI Decided
                    </b>
                    <span className="text-[10.5px] font-bold text-[var(--muted)]">Quick Breakdown</span>
                  </div>

                  <div className="space-y-2 text-[12.5px]">
                    {/* Step 1 */}
                    <div className="p-3 bg-white rounded-xl border border-[var(--line)] shadow-sm space-y-1">
                      <div className="flex items-center gap-1.5 font-black text-[#2A2238]">
                        <span className="text-[14px]">🔍</span>
                        <span>Step 1 · Shape &amp; Texture</span>
                      </div>
                      <p className="text-[12px] font-semibold text-[var(--ink2)] leading-relaxed pl-5">
                        {visionResult.chainOfThought?.morphologyAnalysis}
                      </p>
                    </div>

                    {/* Step 2 */}
                    <div className="p-3 bg-white rounded-xl border border-[var(--line)] shadow-sm space-y-1">
                      <div className="flex items-center gap-1.5 font-black text-[#2A2238]">
                        <span className="text-[14px]">💧</span>
                        <span>Step 2 · Moisture</span>
                      </div>
                      <p className="text-[12px] font-semibold text-[var(--ink2)] leading-relaxed pl-5">
                        {visionResult.chainOfThought?.moistureAnalysis}
                      </p>
                    </div>

                    {/* Step 3 */}
                    <div className="p-3 bg-[#FFFDF9] rounded-xl border-2 border-[var(--peach-l)] shadow-sm space-y-1">
                      <div className="flex items-center gap-1.5 font-black text-[var(--peach-d)]">
                        <span className="text-[14px]">⚖️</span>
                        <span>Step 3 · Why this Type?</span>
                      </div>
                      <p className="text-[12px] font-bold text-[var(--ink)] leading-relaxed pl-5">
                        {visionResult.chainOfThought?.differentialDiagnosis}
                      </p>
                    </div>

                    {/* Step 4 */}
                    <div className="p-3 bg-white rounded-xl border border-[var(--line)] shadow-sm space-y-1">
                      <div className="flex items-center gap-1.5 font-black text-[#11634C]">
                        <span className="text-[14px]">🩺</span>
                        <span>Step 4 · Digestion Speed</span>
                      </div>
                      <p className="text-[12px] font-semibold text-[var(--ink2)] leading-relaxed pl-5">
                        {visionResult.chainOfThought?.speedAssessment}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Confirm Button */}
                <button
                  type="button"
                  className="apple-btn text-[14px] mt-1"
                  onClick={() => setActiveTab('manual')}
                >
                  Confirm and Use →
                </button>
              </div>
            )}
          </div>
        )}

        {/* OPTION C: Natural Language Semantic Log (Opt-in) */}
        {activeTab === 'nlp' && (
          <div className="apple-card p-4 space-y-3 my-2 border-2 border-[var(--lav-l)]">
            <div className="flex items-center gap-2">
              <span className="text-[22px]">💬</span>
              <div>
                <b className="text-[15px] font-black text-[var(--ink)] block">
                  Voice &amp; Chat Log
                </b>
                <p className="text-[12px] text-[var(--ink2)] font-semibold">
                  Type or speak how you feel to fill out today's check-in.
                </p>
              </div>
            </div>

            <textarea
              className="w-full h-24 p-3 bg-[#FFFDF9] border border-[var(--line)] rounded-xl text-[14px] font-semibold text-[var(--ink)] focus:outline-none focus:border-[var(--lav)] resize-none"
              placeholder="e.g. Slept 7.5 hours last night, drank 6 glasses of water today, smooth stool like a banana, slight bloating, mild exam stress..."
              value={nlpText}
              onChange={(e) => setNlpText(e.target.value)}
            />

            <button
              type="button"
              className="apple-btn ghost bg-[var(--lav-l)] text-[var(--lav)] font-black"
              disabled={isNlpLoading || !nlpText.trim()}
              onClick={handleNlpParse}
            >
              {isNlpLoading ? '⏳ AI extracting health parameters...' : '✨ Parse & Auto-fill Form'}
            </button>

            {nlpMessage && (
              <p className="text-[12.5px] font-bold text-[var(--mint)] text-center">
                ✓ {nlpMessage}
              </p>
            )}

            {nlpError && (
              <div className="p-3 bg-[var(--danger-l)] text-[var(--danger)] rounded-xl text-[12.5px] font-bold flex items-center gap-2">
                <span>⚠️</span>
                <div>{nlpError}</div>
              </div>
            )}
          </div>
        )}

        {/* Standard Manual Form (Always viewable and verifiable) */}
        <div className="text-[15px] font-black text-[var(--ink)] my-2">
          {isPlayful ? 'Did you poop today?' : 'Bowel movement'}
        </div>
        <div className="apple-seg">
          <button
            type="button"
            className={pooped ? 'on' : ''}
            onClick={() => {
              setPooped(true);
              setFormError(null);
            }}
          >
            {isPlayful ? 'Yes 💩' : 'Yes'}
          </button>
          <button
            type="button"
            className={!pooped ? 'on' : ''}
            onClick={() => {
              setPooped(false);
              setBristol(null);
              setFormError(null);
            }}
          >
            Not today
          </button>
        </div>

        {/* Bristol Scale Selector */}
        {pooped && (
          <div className="mt-3">
            <div className="text-[15px] font-black text-[var(--ink)] mb-2">
              What did it look like?{' '}
              <span className="text-[12px] text-[var(--muted)] font-bold">
                (Bristol Stool Scale)
              </span>
            </div>

            <div className="apple-bgrid">
              {([1, 2, 3, 4, 5, 6, 7] as BristolNumber[]).map((t) => {
                const b = BRISTOL[t];
                const isSelected = bristol === t;
                return (
                  <button
                    key={t}
                    type="button"
                    className={`apple-bt ${isSelected ? 'on' : ''} ${
                      t === 7 ? 'apple-bt wide' : ''
                    }`}
                    onClick={() => {
                      setBristol(t);
                      setFormError(null);
                    }}
                  >
                    <AppleBristolSVG type={t} eyes={isPlayful} />
                    <div>
                      <b>Type {t}</b>
                      <i>{isPlayful ? b.fun : b.name}</i>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedZone && (
              <div className="apple-banner mt-2.5">
                <span className={`apple-tag ${selectedZone.tag}`}>
                  {selectedZone.label}
                </span>
                <div className="text-[13px] font-bold text-[var(--ink2)] leading-tight">
                  {selectedZone.tip}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Symptoms */}
        <div className="mt-4">
          <div className="text-[15px] font-black text-[var(--ink)] mb-2">
            Anything feel off?
          </div>
          <div className="flex flex-wrap gap-2">
            {SYMPTOMS.map((s) => {
              const isOn = symptoms.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`apple-chip ${s.flag ? 'flag-chip' : ''} ${isOn ? 'on' : ''}`}
                  onClick={() => toggleSymptom(s.id)}
                >
                  {s.flag ? '⚠️ ' : ''}
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sleep Stepper */}
        <div className="mt-4">
          <div className="text-[15px] font-black text-[var(--ink)] mb-2">
            😴 Sleep last night
          </div>
          <div className="apple-stepper">
            <button
              type="button"
              onClick={() => setSleep((s) => Math.max(0, +(s - 0.5).toFixed(1)))}
              aria-label="Less sleep"
            >
              −
            </button>
            <div className="val">
              {sleep} h
              <small>{sleep >= 7 ? '✓ meets 7h goal' : 'goal: 7+ hours'}</small>
            </div>
            <button
              type="button"
              onClick={() => setSleep((s) => Math.min(14, +(s + 0.5).toFixed(1)))}
              aria-label="More sleep"
            >
              +
            </button>
          </div>
        </div>

        {/* Water 10 Glasses */}
        <div className="mt-4">
          <div className="text-[15px] font-black text-[var(--ink)] mb-2">
            💧 Water today{' '}
            <span className="text-[12px] text-[var(--muted)] font-bold">
              (glasses)
            </span>
          </div>
          <div className="apple-glasses">
            {Array.from({ length: 10 }, (_, i) => {
              const glassNum = i + 1;
              return (
                <button
                  key={glassNum}
                  type="button"
                  className={glassNum <= water ? 'on' : ''}
                  onClick={() => setWater((w) => (w === glassNum ? glassNum - 1 : glassNum))}
                  aria-label={`${glassNum} glasses`}
                >
                  💧
                </button>
              );
            })}
          </div>
        </div>

        {/* Fruit & Veg Stepper */}
        <div className="mt-4">
          <div className="text-[15px] font-black text-[var(--ink)] mb-2">
            🥗 Fruit &amp; veg servings
          </div>
          <div className="apple-stepper">
            <button
              type="button"
              onClick={() => setVeg((v) => Math.max(0, v - 1))}
              aria-label="Fewer servings"
            >
              −
            </button>
            <div className="val">
              {veg}
              <small>{veg >= 5 ? '✓ great fiber intake' : 'aim for 5'}</small>
            </div>
            <button
              type="button"
              onClick={() => setVeg((v) => Math.min(12, v + 1))}
              aria-label="More servings"
            >
              +
            </button>
          </div>
        </div>

        {/* Stress Faces */}
        <div className="mt-4">
          <div className="text-[15px] font-black text-[var(--ink)] mb-2">
            🧠 Stress level
          </div>
          <div className="apple-faces">
            {STRESS.map((s, idx) => (
              <button
                key={idx}
                type="button"
                className={stress === idx ? 'on' : ''}
                onClick={() => setStress(idx)}
              >
                <span>{s[0]}</span>
                <small>{s[1]}</small>
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 mb-2">
          {formError && (
            <div className="p-3 bg-[var(--danger-l)] text-[var(--danger)] rounded-xl text-[12.5px] font-bold mb-3 flex items-center gap-2">
              <span>⚠️</span>
              <div>{formError}</div>
            </div>
          )}
          <button
            type="button"
            className="apple-btn"
            style={pooped && !bristol ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
            aria-disabled={pooped && !bristol}
            onClick={handleSave}
          >
            Save check-in · +{calculatePoints()} pts
          </button>
          <p className="text-[12px] text-[var(--muted)] font-bold text-center mt-2.5">
            🔒 Saved locally in this browser. Zero photos stored on disk.
          </p>
        </div>
      </div>
    </>
  );
};
