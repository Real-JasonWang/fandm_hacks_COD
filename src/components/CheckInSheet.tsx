import React, { useState } from 'react';
import type { BristolNumber, CheckInEntry, ModeType } from '../types';
import { BRISTOL, ZONE, SYMPTOMS, STRESS } from '../data/appleData';
import { AppleBristolSVG } from './AppleBristolSVG';
import {
  analyzeStoolImageWithGemma,
  parseNaturalLanguageLogWithGemini,
  getStoredApiKey,
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

  // Active method: manual (default), vision (opt-in), nlp (opt-in)
  const [activeTab, setActiveTab] = useState<CheckInTab>('manual');

  // Core Form State
  const [pooped, setPooped] = useState<boolean>(true);
  const [bristol, setBristol] = useState<BristolNumber | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [sleep, setSleep] = useState<number>(lastSleep || 7);
  const [water, setWater] = useState<number>(lastWater || 5);
  const [veg, setVeg] = useState<number>(lastVeg || 2);
  const [stress, setStress] = useState<number>(lastStress || 1);

  // Vision AI State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isVisionLoading, setIsVisionLoading] = useState(false);
  const [visionResult, setVisionResult] = useState<VisionAnalysisResult | null>(null);
  const [visionError, setVisionError] = useState<string | null>(null);

  // NLP Semantic State
  const [nlpText, setNlpText] = useState('');
  const [isNlpLoading, setIsNlpLoading] = useState(false);
  const [nlpMessage, setNlpMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSymptom = (id: string) => {
    setSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const calculatePoints = () => {
    let pts = 10;
    if (water >= 6) pts += 5;
    if (sleep >= 7) pts += 5;
    return pts;
  };

  const handleSave = () => {
    if (pooped && !bristol) {
      alert('Please pick a stool type on the Bristol Scale first 👆');
      return;
    }
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
        setVisionError('Please set your Google Gemini / Gemma API key in Settings first.');
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
        setVisionError(err instanceof Error ? err.message : 'Visual analysis failed.');
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
      alert('Please set your Google Gemini API key in Settings first.');
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
      alert(err instanceof Error ? err.message : 'Semantic parsing failed.');
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
              {isPlayful ? 'Check-in 💩' : 'Check-in'}
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
            className={`flex-1 py-2 text-[13px] font-black rounded-xl transition ${
              activeTab === 'manual'
                ? 'bg-white text-[var(--ink)] shadow-sm'
                : 'text-[var(--ink2)] hover:text-[var(--ink)]'
            }`}
            onClick={() => setActiveTab('manual')}
          >
            ✍️ 手动打卡 (默认)
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-[13px] font-black rounded-xl transition ${
              activeTab === 'vision'
                ? 'bg-white text-[var(--ink)] shadow-sm'
                : 'text-[var(--ink2)] hover:text-[var(--ink)]'
            }`}
            onClick={() => setActiveTab('vision')}
          >
            📷 Gemma 4 视觉 (可选)
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-[13px] font-black rounded-xl transition ${
              activeTab === 'nlp'
                ? 'bg-white text-[var(--ink)] shadow-sm'
                : 'text-[var(--ink2)] hover:text-[var(--ink)]'
            }`}
            onClick={() => setActiveTab('nlp')}
          >
            💬 一句话记账
          </button>
        </div>

        {/* OPTION B: Gemma 4 Vision Tab (Opt-in) */}
        {activeTab === 'vision' && (
          <div className="apple-card p-4 space-y-3 my-2 border-2 border-[var(--peach-l)]">
            <div className="flex items-center gap-2">
              <span className="text-[22px]">🤖</span>
              <div>
                <b className="text-[15px] font-black text-[var(--ink)] block">
                  Gemma 4 Multimodal 视觉识别 (可选)
                </b>
                <p className="text-[12px] text-[var(--ink2)] font-semibold">
                  纯内存零盘流式处理（Zero-Disk），自动识别布里斯托分型并回填。
                </p>
              </div>
            </div>

            {!getStoredApiKey() && (
              <div className="p-3 bg-[var(--sun-l)] rounded-xl text-[12.5px] font-bold text-[#7A5300] flex justify-between items-center">
                <span>⚠️ 尚未配置 Google AI Studio API Key</span>
                <button
                  type="button"
                  className="underline ml-2 flex-none font-black"
                  onClick={onOpenSettings}
                >
                  去设置 →
                </button>
              </div>
            )}

            <div className="border-2 border-dashed border-[#E3D6C6] rounded-2xl p-4 text-center bg-[#FFFDF9]">
              {selectedImage ? (
                <div className="space-y-2">
                  <img
                    src={selectedImage}
                    alt="Preview"
                    className="max-h-[160px] mx-auto rounded-xl object-contain shadow-sm"
                  />
                  <label className="apple-chip cursor-pointer">
                    重新拍照/上传
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
                    拍摄或上传标本照片
                  </b>
                  <p className="text-[12px] text-[var(--muted)] font-semibold mt-0.5">
                    仅在内存暂存分析，判读完毕立即销毁
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
                ⏳ Gemma 4 视觉正在进行 5 阶段临床推理与防作弊校验...
              </div>
            )}

            {visionError && (
              <div className="p-3 bg-[var(--danger-l)] text-[var(--danger)] rounded-xl text-[12.5px] font-bold">
                ✕ {visionError}
              </div>
            )}

            {visionResult && (
              <div className="p-3.5 bg-[var(--mint-l)] text-[#11634C] rounded-2xl space-y-1.5 text-[13px] font-bold">
                <div className="flex justify-between items-center">
                  <span className="font-black text-[14px]">
                    ✓ 已自动识别并回填：Type {visionResult.bristolType || '—'}
                  </span>
                  <span className="text-[11px] opacity-80">
                    置信度: {(visionResult.confidenceScore * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-[12px] opacity-90 font-semibold">
                  {visionResult.clinicalTip}
                </p>
                <button
                  type="button"
                  className="apple-btn ghost mt-2 bg-white text-[13px] py-1.5"
                  onClick={() => setActiveTab('manual')}
                >
                  查看并确认表单数值 →
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
                  一句话 AI 智能记账 (Gemini 语义抽取)
                </b>
                <p className="text-[12px] text-[var(--ink2)] font-semibold">
                  说出或输入昨晚睡眠、饮水量与便便感受，AI 自动填写全表。
                </p>
              </div>
            </div>

            <textarea
              className="w-full h-24 p-3 bg-[#FFFDF9] border border-[var(--line)] rounded-xl text-[14px] font-semibold text-[var(--ink)] focus:outline-none focus:border-[var(--lav)] resize-none"
              placeholder="例：昨晚睡了7.5小时，喝了6杯水，便便很顺畅像香蕉，感觉稍微有点胀气，学业压力还好..."
              value={nlpText}
              onChange={(e) => setNlpText(e.target.value)}
            />

            <button
              type="button"
              className="apple-btn ghost bg-[var(--lav-l)] text-[var(--lav)] font-black"
              disabled={isNlpLoading || !nlpText.trim()}
              onClick={handleNlpParse}
            >
              {isNlpLoading ? '⏳ AI 正在智能解析参数...' : '✨ 一键语义解析并填充表单'}
            </button>

            {nlpMessage && (
              <p className="text-[12.5px] font-bold text-[var(--mint)] text-center">
                ✓ {nlpMessage}
              </p>
            )}
          </div>
        )}

        {/* Standard Manual Form (Always viewable and verifiable) */}
        {/* Poop Question */}
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
