import React, { useState } from 'react';
import {
  SUPPORTED_UNIVERSITIES,
  validateCampusEmail,
  registerAccount,
  loginAccount,
  type UserAccount,
} from '../lib/authDatabase';

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

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentUni = SUPPORTED_UNIVERSITIES[0]; // Franklin & Marshall College
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
          className="w-16 h-16 rounded-2xl mx-auto mb-2.5 shadow-md object-cover"
        />
        <h1 className="text-[24px] font-black tracking-tight text-[var(--ink)]">
          Call of Doodie
        </h1>
        <p className="text-[13px] font-bold text-[var(--muted)]">
          Franklin &amp; Marshall College · House Cup &amp; Wellness
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="apple-seg">
        <button
          type="button"
          className={tab === 'login' ? 'on' : ''}
          onClick={() => {
            setTab('login');
            setErrorMessage(null);
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
            if (!email.includes('@fandm.edu')) {
              setEmail('newstudent@fandm.edu');
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
              <label className="text-[12.5px] font-extrabold text-[var(--ink)] block mb-1">
                Your Full Name or Codename
              </label>
              <input
                type="text"
                className="w-full py-2.5 px-3 bg-white border border-[var(--line)] rounded-xl text-[14px] font-bold text-[var(--ink)] focus:outline-none focus:border-[var(--peach)]"
                placeholder="e.g. Alex Diplomat"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-[12.5px] font-extrabold text-[var(--ink)] block mb-1">
                Select Your F&amp;M College House
              </label>
              <div className="grid grid-cols-2 gap-2">
                {currentUni.houses.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    className={`p-2.5 rounded-xl border-2 text-left font-extrabold text-[13px] flex items-center gap-2 transition ${
                      houseId === h.id
                        ? 'border-[var(--ink)] bg-[#FFFDF9]'
                        : 'border-transparent bg-white'
                    }`}
                    onClick={() => setHouseId(h.id)}
                  >
                    <span
                      className="w-3 h-3 rounded-full flex-none"
                      style={{ background: h.color }}
                    />
                    <span className="truncate">{h.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Institutional Email Field with Live @fandm.edu Verification */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[12.5px] font-extrabold text-[var(--ink)]">
              F&amp;M Institutional Email
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
            type="email"
            required
            className="w-full py-2.5 px-3 bg-white border border-[var(--line)] rounded-xl text-[14px] font-mono text-[var(--ink)] focus:outline-none focus:border-[var(--peach)]"
            placeholder="username@fandm.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password Field */}
        <div>
          <label className="text-[12.5px] font-extrabold text-[var(--ink)] block mb-1">
            Password (min 6 characters)
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              className="w-full py-2.5 px-3 pr-10 bg-white border border-[var(--line)] rounded-xl text-[14px] font-mono text-[var(--ink)] focus:outline-none focus:border-[var(--peach)]"
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
            ? 'Verifying F&M credentials...'
            : tab === 'login'
            ? 'Sign In to F&M House Cup →'
            : 'Register with Verified @fandm.edu →'}
        </button>
      </form>

      {/* One-Tap Demo Access */}
      <div className="pt-3 border-t border-[var(--line)]">
        <p className="text-[12px] font-bold text-[var(--muted)] text-center mb-2">
          Fast Demo Accounts (F&amp;M Hackathon Judges):
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="apple-btn ghost flex-1 text-[12px] py-2"
            onClick={() => handleQuickDemo('diplomat@fandm.edu')}
          >
            🎓 Ware Diplomat Demo
          </button>
          <button
            type="button"
            className="apple-btn ghost flex-1 text-[12px] py-2"
            onClick={() => handleQuickDemo('ben@fandm.edu')}
          >
            🏛️ Bonchek Ben Demo
          </button>
        </div>
      </div>
    </div>
  );

  // If Full-Screen Mode (User is not logged in):
  if (isFullScreen) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
        <div className="max-w-[460px] w-full bg-[var(--card)] rounded-[28px] p-6 shadow-[var(--shadow-hover)] border border-[var(--line)]">
          {formContent}
          <p className="text-[11.5px] text-[var(--muted)] font-bold text-center mt-4">
            🔒 Private student database · Verification required for campus challenges
          </p>
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
              className="w-9 h-9 rounded-xl bg-[var(--card)] shadow-[var(--shadow)] font-black text-[18px] grid place-items-center hover:bg-[#FFFDF9]"
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
