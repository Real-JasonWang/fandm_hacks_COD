import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sound } from './lib/audio';
import type {
  AppSettings,
  TabType,
  HouseId,
  ModeType,
  Restroom,
  CheckInEntry,
} from './types';
import { loadSettings, saveSettings, seedLogs, seedReports } from './data/appleData';

import { AppleTopBar } from './components/AppleTopBar';
import { AppleBottomNav } from './components/AppleBottomNav';
import { TodayTab } from './components/TodayTab';
import { InsightsTab } from './components/InsightsTab';
import { MapTab } from './components/MapTab';
import { HouseTab } from './components/HouseTab';
import { FacilitiesView } from './components/FacilitiesView';
import { CheckInSheet } from './components/CheckInSheet';
import { RestroomSheet } from './components/RestroomSheet';
import { SettingsSheet } from './components/SettingsSheet';
import { RedFlagModal, AIInfoModal, ScienceModal } from './components/InfoModals';
import { OnboardingModal } from './components/OnboardingModal';
import { StealthShield } from './components/StealthShield';

export function App() {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [activeTab, setActiveTab] = useState<TabType>('today');

  // Modals & Sheets
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRedFlagOpen, setIsRedFlagOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isScienceOpen, setIsScienceOpen] = useState(false);
  const [isStealthOpen, setIsStealthOpen] = useState(false);
  const [selectedRestroom, setSelectedRestroom] = useState<Restroom | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Save to localStorage whenever settings change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Double-tap on mobile detector for stealth mode
  useEffect(() => {
    let lastTap = 0;
    const handleTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTap < 300) {
        // Double tap detected!
        const target = e.target as HTMLElement;
        if (!target.closest('button, input, textarea, select')) {
          sound.playClick();
          setIsStealthOpen((prev) => !prev);
        }
      }
      lastTap = now;
    };
    window.addEventListener('touchend', handleTouchEnd);
    return () => window.removeEventListener('touchend', handleTouchEnd);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  const triggerHaptic = (pattern = [15]) => {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      // ignore
    }
  };

  // Tab change handler
  const handleTabChange = (tab: TabType) => {
    sound.playClick();
    triggerHaptic();
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save Check-in handler
  const handleSaveCheckIn = (entryData: Omit<CheckInEntry, 'id' | 'ts'>) => {
    sound.playCapture();
    triggerHaptic([20, 40, 60]);

    const newEntry: CheckInEntry = {
      ...entryData,
      id: 'u' + Date.now(),
      ts: Date.now(),
    };

    setSettings((prev) => ({
      ...prev,
      logs: [...prev.logs, newEntry],
    }));

    setIsCheckInOpen(false);

    // Calculate points
    let pts = 10;
    if (newEntry.water >= 6) pts += 5;
    if (newEntry.sleep >= 7) pts += 5;

    // Confetti celebration
    confetti({
      particleCount: 65,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#FF9F6B', '#23A27E', '#6E5FE6', '#FFC94A'],
    });

    const isRedFlag = newEntry.symptoms.some((s) =>
      ['blood', 'black', 'pain'].includes(s)
    );

    if (isRedFlag) {
      setTimeout(() => {
        setIsRedFlagOpen(true);
      }, 350);
    } else {
      showToast(
        `+${pts} pts for ${settings.house} House! ${
          settings.mode === 'playful' ? '🎉💩' : '🎉'
        }`
      );
    }
  };

  // Restroom Crowd-sourced Report handler
  const handleReportRestroom = (
    restroomId: string,
    type: 'clean' | 'supplies' | 'ok'
  ) => {
    sound.playClick();
    triggerHaptic();

    setSettings((prev) => {
      const existing = prev.reports[restroomId] || {
        clean: 0,
        supplies: 0,
        ok: 0,
        ts: Date.now(),
      };

      const updated = { ...existing, ts: Date.now() };
      if (type === 'ok') {
        updated.clean = 0;
        updated.supplies = 0;
        updated.ok += 1;
      } else if (type === 'clean') {
        updated.clean += 1;
      } else if (type === 'supplies') {
        updated.supplies += 1;
      }

      return {
        ...prev,
        reports: {
          ...prev.reports,
          [restroomId]: updated,
        },
      };
    });

    setSelectedRestroom(null);
    showToast('Report received! Routed to F&M Facilities 🧽');
  };

  // Facilities mark clean
  const handleMarkCleaned = (restroomId: string) => {
    sound.playCapture();
    triggerHaptic();

    setSettings((prev) => ({
      ...prev,
      reports: {
        ...prev.reports,
        [restroomId]: {
          clean: 0,
          supplies: 0,
          ok: 1,
          ts: Date.now(),
        },
      },
    }));

    showToast('Marked clean & restocked ✓ — campus map updated');
  };

  const lastEntry = settings.logs[settings.logs.length - 1];

  return (
    <div
      className="min-h-screen bg-[var(--bg)] text-[var(--ink)]"
      onDoubleClick={(e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('button, input, textarea, select')) {
          sound.playClick();
          setIsStealthOpen(true);
        }
      }}
    >
      {/* Onboarding Modal if not completed */}
      {!settings.onboarded && (
        <OnboardingModal
          initialHouse={settings.house}
          initialMode={settings.mode}
          onComplete={(house: HouseId, mode: ModeType) => {
            sound.playCapture();
            confetti({ particleCount: 50, spread: 50 });
            setSettings((prev) => ({
              ...prev,
              onboarded: true,
              house,
              mode,
            }));
          }}
        />
      )}

      {/* Main Container */}
      <div className="apple-app-container">
        {/* Top Header Bar */}
        <AppleTopBar
          mode={settings.mode}
          onOpenSettings={() => {
            sound.playClick();
            setIsSettingsOpen(true);
          }}
        />

        {/* Tab Content */}
        {activeTab === 'today' && (
          <TodayTab
            settings={settings}
            onOpenCheckIn={() => {
              sound.playClick();
              setIsCheckInOpen(true);
            }}
            onOpenRedFlag={() => setIsRedFlagOpen(true)}
            onGoToHouse={() => handleTabChange('house')}
            onHideInstall={() => {
              setSettings((prev) => ({ ...prev, installHidden: true }));
            }}
          />
        )}

        {activeTab === 'insights' && (
          <InsightsTab
            settings={settings}
            onOpenAIInfo={() => setIsAIOpen(true)}
            onOpenScience={() => setIsScienceOpen(true)}
          />
        )}

        {activeTab === 'map' && (
          <MapTab
            settings={settings}
            onOpenRestroom={(r) => {
              sound.playClick();
              setSelectedRestroom(r);
            }}
          />
        )}

        {activeTab === 'house' && <HouseTab settings={settings} />}

        {activeTab === 'facilities' && (
          <FacilitiesView
            settings={settings}
            onBack={() => handleTabChange('today')}
            onMarkCleaned={handleMarkCleaned}
          />
        )}
      </div>

      {/* Floating Bottom Bar (visible unless viewing facilities staff mode) */}
      {activeTab !== 'facilities' && (
        <AppleBottomNav
          activeTab={activeTab}
          onChangeTab={handleTabChange}
          onOpenCheckIn={() => {
            sound.playClick();
            setIsCheckInOpen(true);
          }}
        />
      )}

      {/* Sheets & Dialogs */}
      <CheckInSheet
        isOpen={isCheckInOpen}
        mode={settings.mode}
        lastSleep={lastEntry ? lastEntry.sleep : 7}
        lastWater={lastEntry ? lastEntry.water : 5}
        lastVeg={lastEntry ? lastEntry.veg : 2}
        lastStress={lastEntry ? lastEntry.stress : 1}
        onClose={() => setIsCheckInOpen(false)}
        onSave={handleSaveCheckIn}
        onOpenSettings={() => {
          setIsCheckInOpen(false);
          setIsSettingsOpen(true);
        }}
      />

      <RestroomSheet
        restroom={selectedRestroom}
        report={selectedRestroom ? settings.reports[selectedRestroom.id] : undefined}
        onClose={() => setSelectedRestroom(null)}
        onReport={handleReportRestroom}
      />

      <SettingsSheet
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateMode={(mode) => {
          sound.playClick();
          setSettings((prev) => ({ ...prev, mode }));
        }}
        onUpdateHouse={(house) => {
          sound.playClick();
          setSettings((prev) => ({ ...prev, house }));
          showToast(`Switched to ${house} House!`);
        }}
        onOpenAI={() => setIsAIOpen(true)}
        onOpenScience={() => setIsScienceOpen(true)}
        onOpenFacilities={() => {
          setIsSettingsOpen(false);
          setActiveTab('facilities');
        }}
        onOpenStealth={() => setIsStealthOpen(true)}
        onResetDemo={() => {
          sound.playCapture();
          setSettings((prev) => ({
            ...prev,
            logs: seedLogs(),
            reports: seedReports(),
          }));
          setIsSettingsOpen(false);
          showToast('Demo dataset reset to 2-week history');
        }}
        onWipeData={() => {
          if (confirm('Are you sure you want to delete all your personal check-ins?')) {
            setSettings((prev) => ({
              ...prev,
              logs: [],
              reports: {},
            }));
            setIsSettingsOpen(false);
            showToast('All personal logs deleted');
          }
        }}
      />

      <RedFlagModal
        isOpen={isRedFlagOpen}
        onClose={() => setIsRedFlagOpen(false)}
      />

      <AIInfoModal isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />

      <ScienceModal isOpen={isScienceOpen} onClose={() => setIsScienceOpen(false)} />

      {/* Dual-Mode Stealth Privacy Shield (Double-tap to open/close) */}
      <StealthShield
        isOpen={isStealthOpen}
        onClose={() => setIsStealthOpen(false)}
      />

      {/* Apple Toast */}
      <div className={`apple-toast ${toastMessage ? 'on' : ''}`}>
        {toastMessage}
      </div>
    </div>
  );
}

export default App;
