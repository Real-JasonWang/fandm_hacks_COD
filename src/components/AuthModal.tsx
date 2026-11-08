import React, { useState } from 'react';
import {
  validateCampusEmail,
  registerAccount,
  loginAccount,
  type UserAccount,
} from '../lib/authDatabase';
import { HouseSelector } from './HouseSelector';
import type { HouseId, ColorSchemeId, ThemeMode } from '../types';
import { COLOR_SCHEMES } from '../data/appleData';
import { applyTheme } from '../lib/themeManager';

interface AuthModalProps {
  isOpen: boolean;
  isFullScreen?: boolean;
  onClose?: () => void;
  onAuthSuccess: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  isFullScreen = false,
  onClose,
  onAuthSuccess,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Form states
  const [email, setEmail] = useState<string>('diplomat@fandm.edu');
  const [password, setPassword] = useState<string>('admin123');
  const [houseId, setHouseId] = useState<string>('Ware');
  const [displayName, setDisplayName] = useState<string>('');
  const [colorScheme, setColorScheme] = useState<ColorSchemeId>('peach');
  const [themeMode, setThemeMode] = useState<ThemeMode>('auto');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  React.useEffect(() => {
    if (!isOpen || !onClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const domainCheck = validateCampusEmail(email, 'fandm');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (tab === 'register') {
        const res = await registerAccount({
          email,
          password,
          universityId: 'fandm',
          houseId,
          displayName,
          themeMode,
          colorScheme,
        });
        if (!res.success || !res.user) {
          setErrorMessage(res.error || 'Registration failed.');
        } else {
          onAuthSuccess(res.user);
          if (onClose) onClose();
        }
      } else {
        const res = await loginAccount(email, password);
        if (!res.success || !res.user) {
          setErrorMessage(res.error || 'Authentication failed.');
        } else {
          onAuthSuccess(res.user);
          if (onClose) onClose();
        }
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    const res = await loginAccount(demoEmail, 'admin123');
    setIsLoading(false);
    if (res.success && res.user) {
      onAuthSuccess(res.user);
      if (onClose) onClose();
    }
  };

  const formContent = (
    <div className="space-y-4">
      {/* Brand Header */}
      <div className="text-center pt-2 pb-1">
        <img
          src="/icon-192.png"
          alt="Call of Doodie Logo"
          className="w-16 h-16 rounded-2xl mx-auto mb-2.5 shadow-md object-contain p-1.5 bg-[var(--card)] border border-[var(--line)]"
        />
        <h1 className="text-[24px] font-black tracking-tight text-[var(--ink)] select-none">
          Call of Doodie
        </h1>
      </div>

      {/* Tab Switcher */}
      <div className="apple-seg">
        <button
          type="button"
          className={tab === 'login' ? 'on' : ''}
          onClick={() => {
            setTab('login');
            setErrorMessage(null);
            if (!email) {
              setEmail('diplomat@fandm.edu');
              setPassword('admin123');
            }
          }}
        >
          Sign In
        </button>
        <button
          type="button"
          className={tab === 'register' ? 'on' : ''}
          onClick={() => {
            setTab('register');
            setErrorMessage(null);
            if (email === 'diplomat@fandm.edu') {
              setEmail('');
              setPassword('');
            }
          }}
        >
          Register (@fandm.edu)
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 bg-[var(--danger-l)] text-[var(--danger)] rounded-xl text-[12.5px] font-bold flex items-start gap-2">
          <span>⚠️</span>
          <div>{errorMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Registration Extra Fields */}
        {tab === 'register' && (
          <>
            <div>
              <label htmlFor="auth-name" className="text-[12.5px] font-extrabold text-[var(--ink)] block mb-1">
                Your Full Name or Codename
              </label>
              <input
                id="auth-name"
                type="text"
                className="w-full py-2.5 px-3 bg-white border border-[var(--line)] rounded-xl text-[14px] font-bold text-[var(--ink)] focus:outline-none focus:border-[var(--peach)]"
                placeholder="e.g. Alex Diplomat"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-[12.5px] font-extrabold text-[var(--ink)] block mb-1.5">
                Select Your F&amp;M College House
              </label>
              <HouseSelector
                selectedHouse={houseId}
                onSelect={(id: HouseId) => setHouseId(id)}
              />
            </div>

            {/* Color Scheme Preference */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[12.5px] font-extrabold text-[var(--ink)]">
                  Pick Your Color Style
                </label>
                <span className="text-[11px] font-extrabold text-[var(--muted)]">
                  7 Custom Palettes
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {COLOR_SCHEMES.map((cs) => {
                  const isSelected = colorScheme === cs.id;
                  return (
                    <button
                      key={cs.id}
                      type="button"
                      onClick={() => {
                        setColorScheme(cs.id);
                        applyTheme(themeMode, cs.id);
                      }}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[var(--brand)] bg-[var(--card)] shadow-xs scale-[1.02]'
                          : 'border-[var(--line)] bg-[var(--card)] hover:border-[var(--brand)] opacity-80 hover:opacity-100'
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
            </div>

            {/* Appearance Mode Picker */}
            <div>
              <label className="text-[12.5px] font-extrabold text-[var(--ink)] block mb-1.5">
                Appearance Mode
              </label>
              <div className="apple-seg tri">
                <button
                  type="button"
                  className={themeMode === 'auto' ? 'on' : ''}
                  onClick={() => {
                    setThemeMode('auto');
                    applyTheme('auto', colorScheme);
                  }}
                >
                  📱 Auto
                </button>
                <button
                  type="button"
                  className={themeMode === 'light' ? 'on' : ''}
                  onClick={() => {
                    setThemeMode('light');
                    applyTheme('light', colorScheme);
                  }}
                >
                  ☀️ Light
                </button>
                <button
                  type="button"
                  className={themeMode === 'dark' ? 'on' : ''}
                  onClick={() => {
                    setThemeMode('dark');
                    applyTheme('dark', colorScheme);
                  }}
                >
                  🌙 Dark
                </button>
              </div>
            </div>
          </>
        )}

        {/* Institutional Email Field with Live @fandm.edu Verification */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="auth-email" className="text-[12.5px] font-extrabold text-[var(--ink)]">
              F&amp;M College Email
            </label>
            <span
              className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                domainCheck.isValid
                  ? 'bg-[var(--mint-l)] text-[#11634C]'
                  : 'bg-[var(--danger-l)] text-[var(--danger)]'
              }`}
            >
              {domainCheck.isValid ? '✓ Valid @fandm.edu' : 'Must end in @fandm.edu'}
            </span>
          </div>
          <input
            id="auth-email"
            type="email"
            required
            className="w-full py-2.5 px-3 bg-white border border-[var(--line)] rounded-xl text-[14px] font-bold text-[var(--ink)] focus:outline-none focus:border-[var(--peach)]"
            placeholder="username@fandm.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="auth-password" className="text-[12.5px] font-extrabold text-[var(--ink)] block mb-1">
            Password (min 6 characters)
          </label>
          <div className="relative">
            <input
              id="auth-password"
              type={showPassword ? 'text' : 'password'}
              required
              className="w-full py-2.5 px-3 pr-10 bg-white border border-[var(--line)] rounded-xl text-[14px] font-bold text-[var(--ink)] focus:outline-none focus:border-[var(--peach)]"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-[14px] opacity-60 hover:opacity-100"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || (tab === 'register' && !domainCheck.isValid)}
          className="apple-btn text-[16px] mt-2"
          style={tab === 'register' && !domainCheck.isValid ? { opacity: 0.5 } : undefined}
        >
          {isLoading
            ? 'Signing in...'
            : tab === 'login'
            ? 'Sign In to F&M House Cup →'
            : 'Register with Verified @fandm.edu →'}
        </button>
      </form>

      {/* One-Tap Demo Access with Two Case Scenarios */}
      <div className="pt-3 border-t border-[var(--line)] space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-extrabold text-[var(--muted)] uppercase tracking-wider">
            Fast Demo Accounts
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {/* Case 1: Healthy Baseline Routine */}
          <button
            type="button"
            className="w-full text-left p-2.5 rounded-2xl border border-[var(--line)] bg-[var(--card)] hover:border-[var(--brand)] hover:bg-[var(--bg)] transition-all flex items-center gap-2.5 group"
            onClick={() => handleQuickDemo('diplomat@fandm.edu')}
          >
            <span className="text-[22px] flex-none group-hover:scale-110 transition-transform">🎓</span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <b className="text-[13px] font-black text-[var(--ink)]">Case 1: Ware Diplomat (Healthy Routine)</b>
                <span className="text-[11px] font-black text-[var(--brand)]">Sign In →</span>
              </div>
            </div>
          </button>

          {/* Case 2: Academic Exam Stress & Gut-Brain Axis */}
          <button
            type="button"
            className="w-full text-left p-2.5 rounded-2xl border border-[var(--line)] bg-[var(--card)] hover:border-[var(--brand)] hover:bg-[var(--bg)] transition-all flex items-center gap-2.5 group"
            onClick={() => handleQuickDemo('ben@fandm.edu')}
          >
            <span className="text-[22px] flex-none group-hover:scale-110 transition-transform">🏛️</span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <b className="text-[13px] font-black text-[var(--ink)]">Case 2: Bonchek Ben (Exam Stress &amp; IBS)</b>
                <span className="text-[11px] font-black text-[var(--brand)]">Sign In →</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  // If Full-Screen Mode (User is not logged in):
  if (isFullScreen) {
    return (
      <div className="rainbow-diffuse-bg min-h-screen flex items-center justify-center p-4 relative overflow-hidden py-10">
        {/* Multi-layer 7-Color Diffuse Fusion Mesh Aurora Orbs */}
        <div className="rainbow-aurora-orb rainbow-orb-1" />
        <div className="rainbow-aurora-orb rainbow-orb-2" />
        <div className="rainbow-aurora-orb rainbow-orb-3" />
        <div className="rainbow-aurora-orb rainbow-orb-4" />
        <div className="rainbow-aurora-orb rainbow-orb-5" />
        <div className="rainbow-aurora-orb rainbow-orb-6" />
        <div className="rainbow-aurora-orb rainbow-orb-7" />

        {/* Frosted Glass Floating Login Card */}
        <div className="max-w-[480px] w-full frosted-glass-card rounded-[32px] p-6 sm:p-7 relative z-10 animate-in fade-in zoom-in-95 duration-200">
          {formContent}
        </div>
      </div>
    );
  }

  // Modal Sheet Mode
  return (
    <>
      <div className="apple-scrim on" onClick={onClose} />
      <div className="apple-sheet on" role="dialog" aria-modal="true">
        <div className="apple-grab" />
        <div className="flex items-center justify-between pb-1 sticky top-[-10px] bg-[var(--bg)] z-10 pt-2">
          <h2 className="text-[20px] font-black tracking-tight text-[var(--ink)]">
            F&amp;M Student Session
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-[var(--card)] shadow-[var(--shadow)] font-black text-[18px] grid place-items-center hover:bg-[var(--card)]"
            >
              ×
            </button>
          )}
        </div>
        {formContent}
      </div>
    </>
  );
};
