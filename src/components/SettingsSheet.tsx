import React, { useState } from 'react';
import type { AppSettings, HouseId, ModeType, ThemeMode, ColorSchemeId } from '../types';
import { HouseSelector } from './HouseSelector';
import { COLOR_SCHEMES } from '../data/appleData';
import { useSheetDrag } from '../lib/useSheetDrag';
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
  onUpdateThemeMode: (themeMode: ThemeMode) => void;
  onUpdateColorScheme: (colorScheme: ColorSchemeId) => void;
  onUpdateHouse: (house: HouseId) => void;
  onUpdateAvatar?: (avatar: string) => void;
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
  onUpdateThemeMode,
  onUpdateColorScheme,
  onUpdateHouse,
  onUpdateAvatar,
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
  const { sheetRef, dragHandleProps } = useSheetDrag(onClose);

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
      <div ref={sheetRef} className="apple-sheet on" role="dialog" aria-modal="true">
        <div className="apple-grab" {...dragHandleProps} />

        <div className="flex items-center justify-between pb-2 mb-2 sticky top-[-10px] bg-[var(--bg)] z-10 pt-2" {...dragHandleProps}>
          <h2 className="text-[21px] font-black tracking-tight text-[var(--ink)]">
            Settings &amp; Preferences
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[var(--card)] shadow-[var(--shadow)] font-black text-[18px] grid place-items-center hover:bg-[var(--card)]"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* User Account Bar with Avatar Picker */}
        <div className="apple-card p-3 my-0 mb-3 bg-[var(--bg)] border border-[var(--line)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-10 h-10 rounded-xl bg-[var(--card)] shadow-xs border border-[var(--line)] grid place-items-center text-[22px] flex-none">
                {currentUser?.avatar || '🧑‍🎓'}
              </span>
              <div className="min-w-0">
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
                className="apple-chip text-[11px] py-1 text-[var(--danger)] border-[var(--danger-l)] hover:bg-[var(--danger-l)] flex-none ml-2"
                onClick={onLogout}
              >
                Sign Out
              </button>
            )}
          </div>

          {/* Quick Avatar Chooser for users */}
          {currentUser && onUpdateAvatar && (
            <div className="mt-2.5 pt-2 border-t border-[var(--line)] flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-[var(--muted)]">Your Avatar:</span>
              <div className="flex items-center gap-1.5">
                {['🧑‍🎓', '🦊', '🎓', '🦉', '🦁', '🐻', '🌟', '⚡'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={`w-7 h-7 rounded-lg text-[15px] flex items-center justify-center transition-all cursor-pointer ${
                      (currentUser.avatar || '🧑‍🎓') === emoji
                        ? 'bg-white shadow-xs border border-[var(--brand)] scale-110'
                        : 'opacity-70 hover:opacity-100 hover:scale-105'
                    }`}
                    onClick={() => onUpdateAvatar(emoji)}
                    title={`Select ${emoji} avatar`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Appearance Mode (Auto / Light / Dark) */}
        <div className="text-[15px] font-black text-[var(--ink)] mb-1.5 flex items-center justify-between">
          <span>Appearance Mode</span>
          <span className="text-[11.5px] font-extrabold text-[var(--muted)]">
            {(settings.themeMode || 'auto') === 'auto' ? 'Matches Device' : (settings.themeMode || 'auto') === 'dark' ? 'Dark Theme' : 'Light Theme'}
          </span>
        </div>
        <div className="apple-seg tri mb-1.5">
          <button
            type="button"
            className={(settings.themeMode || 'auto') === 'auto' ? 'on' : ''}
            onClick={() => onUpdateThemeMode('auto')}
          >
            📱 Auto
          </button>
          <button
            type="button"
            className={settings.themeMode === 'light' ? 'on' : ''}
            onClick={() => onUpdateThemeMode('light')}
          >
            ☀️ Light
          </button>
          <button
            type="button"
            className={settings.themeMode === 'dark' ? 'on' : ''}
            onClick={() => onUpdateThemeMode('dark')}
          >
            🌙 Dark
          </button>
        </div>
        <p className="text-[12px] text-[var(--muted)] font-bold mb-4">
          Auto adapts dynamically whenever your device switches between day and night mode.
        </p>

        {/* 7 Global Color Palettes */}
        <div className="text-[15px] font-black text-[var(--ink)] mb-1.5 flex items-center justify-between">
          <span>Color Palette</span>
          <span className="text-[11.5px] font-extrabold text-[var(--brand)]">
            {COLOR_SCHEMES.find((c) => c.id === (settings.colorScheme || 'peach'))?.name || 'Warm Peach'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {COLOR_SCHEMES.map((cs) => {
            const isSelected = (settings.colorScheme || 'peach') === cs.id;
            return (
              <button
                key={cs.id}
                type="button"
                onClick={() => onUpdateColorScheme(cs.id)}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[var(--brand)] bg-[var(--card)] shadow-xs scale-[1.02]'
                    : 'border-[var(--line)] bg-[var(--card)] hover:border-[var(--brand)] opacity-85 hover:opacity-100'
                }`}
                style={isSelected ? { outline: `2px solid ${cs.primary}` } : undefined}
              >
                <span
                  className="w-5 h-5 rounded-full flex-none shadow-xs border border-black/10 flex items-center justify-center text-[10px] text-white font-black"
                  style={{ background: cs.primary }}
                >
                  {isSelected ? '✓' : ''}
                </span>
                <span className="text-[13px] font-black text-[var(--ink)] block truncate">
                  {cs.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Style / Vibe */}
        <div className="text-[15px] font-black text-[var(--ink)] mb-1.5 flex items-center justify-between">
          <span>Interface Vibe</span>
          <span className="text-[11.5px] font-extrabold text-[var(--brand)]">
            {settings.mode === 'playful' ? 'Full Fun + AI' : 'Quiet (No AI)'}
          </span>
        </div>
        <div className="apple-seg mb-2">
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
        <div className="p-2.5 rounded-xl bg-[var(--card)] border border-[var(--line)] text-[12px] font-semibold text-[var(--ink2)] mb-4 leading-snug">
          {settings.mode === 'playful' ? (
            <span>💩 <b>Playful:</b> Shows emojis, friendly jokes, AI camera tools, and voice chat.</span>
          ) : (
            <span>🌿 <b>Discreet:</b> Renames app to <i>Gut Log</i>. Emojis and all camera and AI tools are turned off for class.</span>
          )}
        </div>

        {/* College House Grid */}
        <div className="text-[15px] font-black text-[var(--ink)] mb-2">
          Your College House or Hall
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
                Google AI Studio API Key
              </b>
            </div>
            <span
              className={`apple-tag ${
                apiKey ? 'bg-[var(--mint-l)] text-[#11634C]' : 'bg-[var(--sun-l)] text-[#7A5300]'
              }`}
            >
              {apiKey ? 'Configured ✓' : 'Optional'}
            </span>
          </div>

          <p className="text-[12px] text-[var(--ink2)] font-semibold">
            Powers the optional camera scanner and voice/chat logging. Stored locally on your device.
          </p>

          {settings.mode === 'discreet' && (
            <div className="p-2.5 bg-[var(--sun-l)] text-[#7A5300] rounded-xl text-[12px] font-bold flex items-center gap-1.5">
              <span>🌿</span>
              <span>Discreet mode is active. Camera and AI features are turned off.</span>
            </div>
          )}

          <div className="space-y-2">
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                className="w-full py-2 px-3 pr-10 text-[13px] font-mono bg-[var(--card)] border border-[var(--line)] rounded-xl focus:outline-none focus:border-[var(--peach)]"
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
                Preferred AI Model:
              </label>
              <select
                className="w-full py-2 px-2.5 text-[12.5px] font-extrabold bg-[var(--card)] border border-[var(--line)] rounded-xl text-[var(--ink)] focus:outline-none"
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
            📚 The science behind it
          </button>
          <button
            className="apple-btn ghost"
            onClick={() => {
              onClose();
              onOpenFacilities();
            }}
          >
            🧽 Campus cleaning queue
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
