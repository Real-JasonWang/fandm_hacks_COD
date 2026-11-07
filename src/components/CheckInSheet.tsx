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
  const [isSpecimenMasked, setIsSpecimenMasked] = useState<boolean>(true);
  const [isVisionLoading, setIsVisionLoading] = useState(false);
  const [visionResult, setVisionResult] = useState<VisionAnalysisResult | null>(null);
  const [visionError, setVisionError] = useState<string | null>(null);

  // NLP Semantic State
  const [nlpText, setNlpText] = useState('');
  const [isNlpLoading, setIsNlpLoading] = useState(false);
  const [nlpMessage, setNlpMessage] = useState<string | null>(null);

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
    setIsSpecimenMasked(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);

      const hasApiKey = Boolean(getStoredApiKey());
      if (!hasApiKey) {
        setVisionError('Please configure your Google Gemini / Gemma API key in Settings.');
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
    const hasApiKey = Boolean(getStoredApiKey());
    if (!hasApiKey) {
      setVisionError('Please configure your Google Gemini API key in Settings first.');
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
      setActiveTab('manual'); // return to review form
    } catch (err: unknown) {
      setVisionError(formatAiErrorMessage(err));
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

        {/* Check-In Mode Switcher (Manual / Optional Vision / Optional NLP) */}
        <div className="flex gap-1.5 p-1 bg-[#F3E9DC] rounded-2xl mb-3">
          <button
            type="button"
            className={`flex-1 py-2 text-[12.5px] font-black rounded-xl transition ${
              activeTab === 'manual'
                ? 'bg-white text-[var(--ink)] shadow-sm'
                : 'text-[var(--ink2)] hover:text-[var(--ink)]'
            }`}
            onClick={() => setActiveTab('manual')}
          >
            ✍️ Manual (Default)
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-[12.5px] font-black rounded-xl transition ${
              activeTab === 'vision'
                ? 'bg-white text-[var(--ink)] shadow-sm'
                : 'text-[var(--ink2)] hover:text-[var(--ink)]'
            }`}
            onClick={() => setActiveTab('vision')}
          >
            📷 Gemma 4 Vision
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-[12.5px] font-black rounded-xl transition ${
              activeTab === 'nlp'
                ? 'bg-white text-[var(--ink)] shadow-sm'
                : 'text-[var(--ink2)] hover:text-[var(--ink)]'
            }`}
            onClick={() => setActiveTab('nlp')}
          >
            💬 Smart Speech/Text
          </button>
        </div>

        {/* OPTION B: Gemma 4 Vision Tab (Opt-in) */}
        {activeTab === 'vision' && (
          <div className="apple-card p-4 space-y-3 my-2 border-2 border-[var(--peach-l)]">
            <div className="flex items-center gap-2">
              <span className="text-[22px]">🤖</span>
              <div>
                <b className="text-[15px] font-black text-[var(--ink)] block">
                  Gemma 4 Multimodal Vision (Opt-in)
                </b>
                <p className="text-[12px] text-[var(--ink2)] font-semibold">
                  Zero-Disk in-memory stream. Analyzes Bristol morphology and auto-populates telemetry.
                </p>
              </div>
            </div>

            {!getStoredApiKey() && (
              <div className="p-3 bg-[var(--sun-l)] rounded-xl text-[12.5px] font-bold text-[#7A5300] flex justify-between items-center">
                <span>⚠️ Google AI Studio API key not configured</span>
                <button
                  type="button"
                  className="underline ml-2 flex-none font-black"
                  onClick={onOpenSettings}
                >
                  Configure in Settings →
                </button>
              </div>
            )}

            <div className="border-2 border-dashed border-[#E3D6C6] rounded-2xl p-4 text-center bg-[#FFFDF9]">
              {selectedImage ? (
                <div className="space-y-3">
                  {/* Heavily Blurred Specimen Container with Medical Privacy Mask */}
                  <div className="relative max-w-[340px] mx-auto rounded-2xl overflow-hidden border-2 border-[var(--line)] shadow-sm bg-neutral-900">
                    <img
                      src={selectedImage}
                      alt="Stool Specimen"
                      className={`max-h-[190px] w-full object-cover transition-all duration-300 ${
                        isSpecimenMasked
                          ? 'filter blur-[32px] scale-115 brightness-[0.7] contrast-[1.2]'
                          : 'filter blur-0 scale-100'
                      }`}
                    />

                    {/* Heavy Dark/Frosted Privacy Shield Overlay */}
                    {isSpecimenMasked && (
                      <div className="absolute inset-0 bg-black/65 backdrop-blur-md flex flex-col items-center justify-center p-3 text-center select-none">
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-[22px] mb-1.5 shadow-md">
                          🙈
                        </div>
                        <b className="text-[13.5px] font-black text-white block tracking-wide">
                          生物敏感标本已重度模糊保护
                        </b>
                        <p className="text-[11px] text-white/80 font-bold max-w-[240px] mt-0.5 leading-snug">
                          系统已自动施加高斯模糊遮罩 · 视觉防不适保护
                        </p>
                        <button
                          type="button"
                          className="mt-2.5 px-3 py-1.5 bg-white/90 hover:bg-white text-[var(--ink)] text-[12px] font-black rounded-xl shadow-md flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                          onClick={() => setIsSpecimenMasked(false)}
                        >
                          <span>👁️</span> 点击临时查看原图
                        </button>
                      </div>
                    )}

                    {/* Re-shield Toggle Button */}
                    {!isSpecimenMasked && (
                      <button
                        type="button"
                        className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-black/75 hover:bg-black text-white text-[11px] font-black rounded-lg shadow backdrop-blur-sm flex items-center gap-1 transition select-none cursor-pointer"
                        onClick={() => setIsSpecimenMasked(true)}
                      >
                        <span>🙈</span> 重新施加模糊遮罩
                      </button>
                    )}
                  </div>

                  <label className="apple-chip cursor-pointer text-[12.5px] font-extrabold inline-flex items-center gap-1.5">
                    <span>🔄</span> 重新拍摄 / 选取其他照片
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
                  <div className="text-[32px] mb-1">📸</div>
                  <b className="text-[14px] font-black text-[var(--ink)] block">
                    拍摄或上传马桶便盆标本照片
                  </b>
                  <p className="text-[12px] text-[var(--muted)] font-semibold mt-0.5">
                    仅在内存中处理；评估后自动施加高斯模糊遮罩保护。
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
                ⏳ AI 正在执行 4 阶段临床全息形态学鉴别与防作伪分析...
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
                        AI 临床鉴别结论：布里斯托 Type {visionResult.bristolType || '—'}
                      </b>
                      <span className="text-[11.5px] font-extrabold text-[var(--ink2)]">
                        置信度：{(visionResult.confidenceScore * 100).toFixed(0)}% · 评估引擎：{visionResult.modelUsed}
                      </span>
                    </div>
                  </div>
                  <span className="apple-tag t-mint">
                    已自动填充
                  </span>
                </div>

                {/* Clinical Summary Tip */}
                <div className="p-3 bg-white rounded-xl border border-[var(--line)] text-[12.5px] font-bold text-[var(--ink)] leading-relaxed">
                  💡 <b>医学概述：</b>{visionResult.clinicalTip}
                </div>

                {/* Structured Chain-of-Thought / 详细思维链 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <b className="text-[13px] font-black text-[var(--ink)] flex items-center gap-1.5">
                      <span>🧠</span> AI 诊断思维链与判定依据 (Clinical Chain-of-Thought)
                    </b>
                    <span className="text-[10.5px] font-bold text-[var(--muted)]">4 阶段全息鉴别</span>
                  </div>

                  <div className="space-y-2 text-[12.5px]">
                    {/* Step 1: 形态与质地边缘 */}
                    <div className="p-3 bg-white rounded-xl border border-[var(--line)] shadow-sm space-y-1">
                      <div className="flex items-center gap-1.5 font-black text-[#2A2238]">
                        <span className="text-[14px]">🔍</span>
                        <span>阶段一 · 几何形态与质地边缘特征</span>
                      </div>
                      <p className="text-[12px] font-semibold text-[var(--ink2)] leading-relaxed pl-5">
                        {visionResult.chainOfThought?.morphologyAnalysis}
                      </p>
                    </div>

                    {/* Step 2: 水动力学与水体分散度 */}
                    <div className="p-3 bg-white rounded-xl border border-[var(--line)] shadow-sm space-y-1">
                      <div className="flex items-center gap-1.5 font-black text-[#2A2238]">
                        <span className="text-[14px]">💧</span>
                        <span>阶段二 · 水动力学与马桶水体分散度</span>
                      </div>
                      <p className="text-[12px] font-semibold text-[var(--ink2)] leading-relaxed pl-5">
                        {visionResult.chainOfThought?.moistureAnalysis}
                      </p>
                    </div>

                    {/* Step 3: 布里斯托量表鉴别排他逻辑 */}
                    <div className="p-3 bg-[#FFFDF9] rounded-xl border-2 border-[var(--peach-l)] shadow-sm space-y-1">
                      <div className="flex items-center gap-1.5 font-black text-[var(--peach-d)]">
                        <span className="text-[14px]">⚖️</span>
                        <span>阶段三 · 布里斯托量表鉴别排他判定依据</span>
                      </div>
                      <p className="text-[12px] font-bold text-[var(--ink)] leading-relaxed pl-5">
                        {visionResult.chainOfThought?.differentialDiagnosis}
                      </p>
                    </div>

                    {/* Step 4: 结肠生理动力学与护理建议 */}
                    <div className="p-3 bg-white rounded-xl border border-[var(--line)] shadow-sm space-y-1">
                      <div className="flex items-center gap-1.5 font-black text-[#11634C]">
                        <span className="text-[14px]">🩺</span>
                        <span>阶段四 · 胃肠生理动力学推断与建议</span>
                      </div>
                      <p className="text-[12px] font-semibold text-[var(--ink2)] leading-relaxed pl-5">
                        {visionResult.chainOfThought?.clinicalAssessment}
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
                  确认数据并返回表单检查 →
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
                  Natural Language Smart Log (Gemini)
                </b>
                <p className="text-[12px] text-[var(--ink2)] font-semibold">
                  Describe your sleep, water, and stool in one sentence. AI automatically extracts the parameters.
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
            onClick={() => setPooped(true)}
          >
            {isPlayful ? 'Yes 💩' : 'Yes'}
          </button>
          <button
            type="button"
            className={!pooped ? 'on' : ''}
            onClick={() => {
              setPooped(false);
              setBristol(null);
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
                    onClick={() => setBristol(t)}
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
                  className={`apple-chip ${s.flag ? 'border-[#F3C1BB]' : ''} ${
                    isOn
                      ? s.flag
                        ? 'bg-[var(--danger)] text-white border-[var(--danger)]'
                        : 'on'
                      : ''
                  }`}
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
            style={pooped && !bristol ? { opacity: 0.5 } : undefined}
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
