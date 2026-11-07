import React, { useState, useEffect } from 'react';
import type { AppSettings, HouseId, ModeType } from '../types';
import { HOUSES } from '../data/appleData';
import {
  getStoredApiKey,
  setStoredApiKey,
  getStoredModel,
  setStoredModel,
  testGeminiApiKey,
} from '../lib/geminiAI';

interface SettingsSheetProps {
  isOpen: boolean;
  settings: AppSettings;
  onClose: () => void;
  onUpdateMode: (mode: ModeType) => void;
  onUpdateHouse: (house: HouseId) => void;
  onOpenAI: () => void;
  onOpenScience: () => void;
  onOpenFacilities: () => void;
  onOpenStealth: () => void;
  onResetDemo: () => void;
  onWipeData: () => void;
}

export const SettingsSheet: React.FC<SettingsSheetProps> = ({
  isOpen,
  settings,
  onClose,
  onUpdateMode,
  onUpdateHouse,
  onOpenAI,
  onOpenScience,
  onOpenFacilities,
  onOpenStealth,
  onResetDemo,
  onWipeData,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemma-4-26b-a4b-it');
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredApiKey());
      setModel(getStoredModel());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveApiKey = () => {
    setStoredApiKey(apiKey);
    setStoredModel(model);
    setTestResult({ success: true, message: 'Settings saved locally.' });
  };

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: 'Please enter an API key first.' });
      return;
    }
    setIsTestingKey(true);
    setTestResult(null);
    const res = await testGeminiApiKey(apiKey.trim());
    setIsTestingKey(false);
    setTestResult(res);
    if (res.success) {
      setStoredApiKey(apiKey);
      setStoredModel(model);
    }
  };

  return (
    <>
      <div className="apple-scrim on" onClick={onClose} />
      <div className="apple-sheet on" role="dialog" aria-modal="true">
        <div className="apple-grab" />

        <div className="flex items-center justify-between pb-2 mb-2 sticky top-[-10px] bg-[var(--bg)] z-10 pt-2">
          <h2 className="text-[21px] font-black tracking-tight text-[var(--ink)]">
            Settings &amp; privacy
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[var(--card)] shadow-[var(--shadow)] font-black text-[18px] grid place-items-center hover:bg-[#FFFDF9]"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Style / Vibe */}
        <div className="text-[15px] font-black text-[var(--ink)] mb-1.5">
          Interface Vibe
        </div>
        <div className="apple-seg">
          <button
            type="button"
            className={settings.mode === 'playful' ? 'on' : ''}
            onClick={() => onUpdateMode('playful')}
          >
            💩 Playful
          </button>
          <button
            type="button"
            className={settings.mode === 'discreet' ? 'on' : ''}
            onClick={() => onUpdateMode('discreet')}
          >
            🌿 Discreet
          </button>
        </div>
        <p className="text-[12px] text-[var(--muted)] font-bold mt-1.5 mb-4">
          Discreet mode removes emoji &amp; jokes and renames the app "Gut Log" — for anyone who'd rather keep it low-key in class.
        </p>

        {/* College House Grid */}
        <div className="text-[15px] font-black text-[var(--ink)] mb-2">
          Your College House
        </div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {HOUSES.map((h) => {
            const isSelected = settings.house === h.id;
            return (
              <button
                key={h.id}
                type="button"
                className={`apple-card my-0 p-3 flex items-center gap-2.5 font-black text-[14px] text-left border-2 transition ${
                  isSelected ? 'border-[var(--ink)]' : 'border-transparent'
                }`}
                onClick={() => onUpdateHouse(h.id)}
              >
                <span
                  className="w-3 h-3 rounded-full flex-none"
                  style={{ background: h.color }}
                />
                {h.id}
              </button>
            );
          })}
        </div>

        {/* Google AI Studio API Key & Gemma 4 Panel */}
        <div className="apple-card p-3.5 space-y-3 mb-4 border-2 border-[var(--peach-l)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[20px]">✨</span>
              <b className="text-[14.5px] font-black text-[var(--ink)]">
                Google AI Studio / Gemma 4
              </b>
            </div>
            <span
              className={`apple-tag ${
                apiKey ? 'bg-[var(--mint-l)] text-[#11634C]' : 'bg-[var(--sun-l)] text-[#7A5300]'
              }`}
            >
              {apiKey ? 'Key configured' : 'Optional'}
            </span>
          </div>

          <p className="text-[12px] text-[var(--ink2)] font-semibold">
            用于“Gemma 4 视觉辅助识别”与“一句话智能记账”。所有处理均在内存端到端完成，不写入任何磁盘。
          </p>

          <div className="space-y-2">
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                className="w-full py-2 px-3 pr-10 text-[13px] font-mono bg-[#FFFDF9] border border-[var(--line)] rounded-xl focus:outline-none focus:border-[var(--peach)]"
                placeholder="AIzaSy... (Google AI Studio Key)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-[14px] opacity-60 hover:opacity-100"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? '🙈' : '👁️'}
              </button>
            </div>

            <div className="flex gap-2">
              <select
                className="flex-1 py-1.5 px-2.5 text-[12.5px] font-extrabold bg-[#FFFDF9] border border-[var(--line)] rounded-xl text-[var(--ink)] focus:outline-none"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              >
                <option value="gemma-4-26b-a4b-it">gemma-4-26b-a4b-it (Multimodal MoE)</option>
                <option value="gemini-2.5-flash">gemini-2.5-flash (High speed)</option>
                <option value="gemini-2.0-flash">gemini-2.0-flash (General)</option>
              </select>

              <button
                type="button"
                className="apple-chip text-[12px] flex-none"
                onClick={handleSaveApiKey}
              >
                Save
              </button>
              <button
                type="button"
                className="apple-chip text-[12px] flex-none"
                disabled={isTestingKey}
                onClick={handleTestKey}
              >
                {isTestingKey ? 'Testing...' : 'Test Key'}
              </button>
            </div>

            {testResult && (
              <div
                className={`p-2 rounded-xl text-[12px] font-bold ${
                  testResult.success
                    ? 'bg-[var(--mint-l)] text-[#11634C]'
                    : 'bg-[var(--danger-l)] text-[var(--danger)]'
                }`}
              >
                {testResult.success ? '✓ ' : '✕ '}
                {testResult.message}
              </div>
            )}
          </div>
        </div>

        {/* Stealth Disguise Trigger */}
        <div className="apple-card p-3 my-0 flex items-center justify-between mb-4 bg-[#F8F9FA]">
          <div className="flex items-center gap-2.5">
            <span className="text-[20px]">🕵️</span>
            <div>
              <b className="text-[13.5px] font-black text-[var(--ink)] block">
                Stealth Privacy Shield (隐蔽盾)
              </b>
              <p className="text-[11.5px] text-[var(--muted)] font-bold">
                快捷方式：在屏幕任意处快速双击
              </p>
            </div>
          </div>
          <button
            type="button"
            className="apple-chip text-[12px]"
            onClick={() => {
              onClose();
              onOpenStealth();
            }}
          >
            开启微积分伪装 →
          </button>
        </div>

        {/* Navigation / Action buttons */}
        <div className="space-y-2 mt-4">
          <button
            className="apple-btn ghost"
            onClick={() => {
              onClose();
              onOpenAI();
            }}
          >
            ✨ How the AI works
          </button>
          <button
            className="apple-btn ghost"
            onClick={() => {
              onClose();
              onOpenScience();
            }}
          >
            📚 The clinical science
          </button>
          <button
            className="apple-btn ghost"
            onClick={() => {
              onClose();
              onOpenFacilities();
            }}
          >
            🧽 Facilities view (staff queue)
          </button>
          <button className="apple-btn ghost" onClick={onResetDemo}>
            ↺ Reset demo dataset
          </button>
          <button
            className="apple-btn ghost text-[var(--danger)] border-[var(--danger-l)] hover:bg-[var(--danger-l)]"
            onClick={onWipeData}
          >
            🗑 Delete all my data
          </button>
        </div>

        <p className="text-[12px] text-[var(--muted)] font-bold text-center mt-4">
          Franklin &amp; Marshall College Hackathon (FandMHacks) · Social Good Track
        </p>
      </div>
    </>
  );
};
