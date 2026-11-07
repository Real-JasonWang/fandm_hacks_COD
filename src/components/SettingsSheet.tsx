import React, { useState } from 'react';
import type { AppSettings, HouseId, ModeType } from '../types';
import { HouseSelector } from './HouseSelector';
import {
  getStoredApiKey,
  setStoredApiKey,
  getStoredModel,
  setStoredModel,
  testGeminiApiKey,
  SUPPORTED_AI_MODELS,
} from '../lib/geminiAI';
import type { UserAccount } from '../lib/authDatabase';

interface SettingsSheetProps {
  isOpen: boolean;
  settings: AppSettings;
  currentUser: UserAccount | null;
  onClose: () => void;
  onUpdateMode: (mode: ModeType) => void;
  onUpdateHouse: (house: HouseId) => void;
  onOpenAI: () => void;
  onOpenScience: () => void;
  onOpenFacilities: () => void;
  onLogout: () => void;
  onResetDemo: () => void;
  onWipeData: () => void;
}

const SettingsModalContent: React.FC<Omit<SettingsSheetProps, 'isOpen'>> = ({
  settings,
  currentUser,
  onClose,
  onUpdateMode,
  onUpdateHouse,
  onOpenAI,
  onOpenScience,
  onOpenFacilities,
  onLogout,
  onResetDemo,
  onWipeData,
}) => {
  const [apiKey, setApiKey] = useState(() => getStoredApiKey());
  const [model, setModel] = useState(() => getStoredModel());
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showKey, setShowKey] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSaveApiKey = () => {
    setStoredApiKey(apiKey);
    setStoredModel(model);
    setTestResult({ success: true, message: 'API key & model preference saved locally.' });
  };

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: 'Please enter a valid API key first.' });
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
            Settings &amp; Preferences
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[var(--card)] shadow-[var(--shadow)] font-black text-[18px] grid place-items-center hover:bg-[#FFFDF9]"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* User Account Bar */}
        <div className="apple-card p-3 my-0 mb-3 bg-[#FAF8F5] border border-[var(--line)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-[22px]">🎓</span>
            <div>
              <b className="text-[14px] font-black text-[var(--ink)] block truncate">
                {currentUser ? currentUser.displayName : 'F&M Student'}
              </b>
              <p className="text-[12px] text-[var(--muted)] font-bold truncate">
                {currentUser ? currentUser.email : 'Local Session · @fandm.edu'}
              </p>
            </div>
          </div>
          {currentUser && (
            <button
              type="button"
              className="apple-chip text-[11px] py-1 text-[var(--danger)] border-[var(--danger-l)] hover:bg-[var(--danger-l)]"
              onClick={onLogout}
            >
              Sign Out
            </button>
          )}
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
          Discreet mode removes emoji &amp; jokes and renames the app "Gut Log" for discreet in-class check-ins.
        </p>

        {/* College House Grid */}
        <div className="text-[15px] font-black text-[var(--ink)] mb-2">
          Your College House Faction
        </div>
        <HouseSelector
          selectedHouse={settings.house}
          onSelect={onUpdateHouse}
          className="mb-4"
        />

        {/* Google AI Studio API Key & Gemma 4 Panel */}
        <div className="apple-card p-3.5 space-y-3 mb-4 border-2 border-[var(--peach-l)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[20px]">✨</span>
              <b className="text-[14.5px] font-black text-[var(--ink)]">
                Google Gemma 4 &amp; Gemini Engine
              </b>
            </div>
            <span
              className={`apple-tag ${
                apiKey ? 'bg-[var(--mint-l)] text-[#11634C]' : 'bg-[var(--sun-l)] text-[#7A5300]'
              }`}
            >
              {apiKey ? 'Pre-configured ✓' : 'Optional'}
            </span>
          </div>

          <p className="text-[12px] text-[var(--ink2)] font-semibold">
            Powers Gemma 4 Multimodal Vision and natural language logging. Features automatic real-time fallback cascade across Gemma 4 31B/26B, Gemini 3.5 Flash, and Gemini 3.8 Flash.
          </p>

          <div className="space-y-2">
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                className="w-full py-2 px-3 pr-10 text-[13px] font-mono bg-[#FFFDF9] border border-[var(--line)] rounded-xl focus:outline-none focus:border-[var(--peach)]"
                placeholder="Google AI Studio API Key (AQ.Ab8...)"
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

            <div className="space-y-1.5">
              <label className="text-[11.5px] font-extrabold text-[var(--ink2)] block">
                Primary Model (with automatic fallback cascade):
              </label>
              <select
                className="w-full py-2 px-2.5 text-[12.5px] font-extrabold bg-[#FFFDF9] border border-[var(--line)] rounded-xl text-[var(--ink)] focus:outline-none"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              >
                {SUPPORTED_AI_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} [{m.tag}]
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                className="apple-chip text-[12px] flex-1 justify-center"
                onClick={handleSaveApiKey}
              >
                Save Preferences
              </button>
              <button
                type="button"
                className="apple-chip text-[12px] flex-1 justify-center font-black"
                disabled={isTestingKey}
                onClick={handleTestKey}
              >
                {isTestingKey ? 'Connecting...' : 'Test Connection'}
              </button>
            </div>

            {testResult && (
              <div
                className={`p-2.5 rounded-xl text-[12px] font-bold ${
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
            🗑 Delete all personal data
          </button>
        </div>

        <p className="text-[12px] text-[var(--muted)] font-bold text-center mt-4">
          Franklin &amp; Marshall College Hackathon (FandMHacks) · Social Good Track
        </p>
      </div>
    </>
  );
};

export const SettingsSheet: React.FC<SettingsSheetProps> = (props) => {
  if (!props.isOpen) return null;
  return <SettingsModalContent {...props} />;
};
