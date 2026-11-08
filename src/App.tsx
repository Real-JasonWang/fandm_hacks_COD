import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import type {
  AppSettings,
  TabType,
  HouseId,
  ModeType,
  ThemeMode,
  ColorSchemeId,
  Restroom,
  RestroomReportType,
  CheckInEntry,
} from './types';
import { loadSettings, saveSettings, seedReports, calculateCheckInPoints, HOUSES, COLOR_SCHEMES } from './data/appleData';
import {
  getCurrentSession,
  logoutSession,
  updateUserLogs,
  replaceUserLogs,
  updateUserHouse,
  updateUserAvatar,
  updateUserTheme,
  type UserAccount,
} from './lib/authDatabase';
import { applyTheme } from './lib/themeManager';

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
import { AuthModal } from './components/AuthModal';
import { PostCheckInModal } from './components/PostCheckInModal';

export function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => getCurrentSession());
  const [settings, setSettings] = useState<AppSettings>(() => {
    const s = loadSettings();
    const session = getCurrentSession();
    const userLogs = session ? session.logs : [];
    return {
      ...s,
      house: session ? (session.houseId as HouseId) : s.house,
      logs: userLogs,
    };
  });

  const [activeTab, setActiveTab] = useState<TabType>('today');

  // Modals & Sheets
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRedFlagOpen, setIsRedFlagOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isScienceOpen, setIsScienceOpen] = useState(false);
  const [selectedRestroom, setSelectedRestroom] = useState<Restroom | null>(null);

  // Post Check-in Health Analysis Modal
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [latestSavedEntry, setLatestSavedEntry] = useState<CheckInEntry | null>(null);
  const [earnedPoints, setEarnedPoints] = useState(0);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Save to localStorage whenever settings change (only if logged in)
  useEffect(() => {
    if (currentUser) {
      saveSettings(settings);
    }
  }, [settings, currentUser]);

  // Reactive theme application & system auto theme sync
  useEffect(() => {
    const tMode = settings.themeMode || 'auto';
    const cScheme = settings.colorScheme || 'peach';
    applyTheme(tMode, cScheme);

    if (tMode === 'auto' && typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handleMqChange = () => {
        applyTheme('auto', settings.colorScheme || 'peach');
      };
      mq.addEventListener('change', handleMqChange);
      return () => mq.removeEventListener('change', handleMqChange);
    }
  }, [settings.themeMode, settings.colorScheme]);

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
    triggerHaptic();
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth state handlers
  const handleAuthSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    const userThemeMode = user.themeMode || settings.themeMode || 'auto';
    const userColorScheme = user.colorScheme || settings.colorScheme || 'peach';

    setSettings((prev) => ({
      ...prev,
      onboarded: true,
      house: user.houseId as HouseId,
      themeMode: userThemeMode,
      colorScheme: userColorScheme,
      logs: user.logs, // Strictly real authentic user logs, never fall back to fake demo logs!
    }));

    applyTheme(userThemeMode, userColorScheme);

    // Directly land on the Today home page and ensure all sheets/modals are closed
    setActiveTab('today');
    setIsSettingsOpen(false);
    setIsCheckInOpen(false);
    setIsAnalysisOpen(false);
    setIsRedFlagOpen(false);
    setIsAIOpen(false);
    setIsScienceOpen(false);
    setSelectedRestroom(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (settings.mode === 'playful') {
      confetti({ particleCount: 50, spread: 55 });
    }
    showToast(`Signed in as ${user.displayName} (${user.email})`);
  };

  const handleLogout = () => {
    logoutSession();
    setCurrentUser(null);
    setSettings((prev) => ({
      ...prev,
      logs: [],
    }));
    try {
      localStorage.removeItem('cod_demo_v1');
    } catch {
      // ignore
    }
    showToast('Signed out of student session.');
  };

  // Save Check-in handler
  const handleSaveCheckIn = (entryData: Omit<CheckInEntry, 'id' | 'ts'>) => {
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

    if (currentUser) {
      updateUserLogs(currentUser.id, newEntry);
    }

    setIsCheckInOpen(false);

    const pts = calculateCheckInPoints(newEntry);
    setEarnedPoints(pts);
    setLatestSavedEntry(newEntry);
    setIsAnalysisOpen(true);

    // Confetti celebration only in playful mode
    if (settings.mode === 'playful') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#FF9F6B', '#23A27E', '#6E5FE6', '#FFC94A'],
      });
    }

    const isRedFlag = newEntry.symptoms.some((s) =>
      ['blood', 'black', 'pain'].includes(s)
    );

    const currentHouseObj = HOUSES.find((h) => h.id === settings.house);
    const houseLabel = currentHouseObj ? currentHouseObj.name : `${settings.house} House`;
    showToast(
      `+${pts} pts for ${houseLabel}! ${
        settings.mode === 'playful' ? '🎉💩' : '✓'
      }`
    );

    if (isRedFlag) {
      setTimeout(() => {
        setIsRedFlagOpen(true);
      }, 350);
    }
  };

  // Restroom Crowd-sourced Report handler
  const handleReportRestroom = (
    restroomId: string,
    type: RestroomReportType
  ) => {
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
        updated.maintenance = 0;
        updated.ok += 1;
      } else if (type === 'clean') {
        updated.clean += 1;
      } else if (type === 'supplies') {
        updated.supplies += 1;
      } else if (type === 'maintenance') {
        updated.maintenance = (updated.maintenance || 0) + 1;
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
    const msg =
      type === 'ok'
        ? 'Marked clean & stocked! ✓'
        : type === 'maintenance'
        ? 'Urgent repair report sent to campus staff 🔧'
        : 'Report sent to campus cleaning staff 🧽';
    showToast(msg);
  };

  // Facilities mark clean
  const handleMarkCleaned = (restroomId: string) => {
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

    showToast('Marked clean & restocked ✓: campus map updated');
  };

  // Strict Auth Gate: If user is not logged in, render only the F&M login/registration screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <AuthModal
          isOpen={true}
          isFullScreen={true}
          onAuthSuccess={handleAuthSuccess}
        />
        <div className={`apple-toast ${toastMessage ? 'on' : ''}`}>
          {toastMessage}
        </div>
      </div>
    );
  }

  const lastEntry = settings.logs[settings.logs.length - 1];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      {/* Onboarding Modal (only displayed once authenticated if onboarding not finished) */}
      {!settings.onboarded && (
        <OnboardingModal
          initialHouse={currentUser ? (currentUser.houseId as HouseId) : settings.house}
          initialMode={settings.mode}
          userName={currentUser?.displayName}
          onComplete={(house: HouseId, mode: ModeType) => {
            if (mode === 'playful') {
              confetti({ particleCount: 50, spread: 50 });
            }
            if (currentUser) {
              updateUserHouse(currentUser.id, house);
              setCurrentUser((prev) => (prev ? { ...prev, houseId: house } : null));
            }
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
          currentUser={currentUser}
          onOpenSettings={() => {
            setIsSettingsOpen(true);
          }}
        />

        {/* Tab Content */}
        {activeTab === 'today' && (
          <TodayTab
            settings={settings}
            onOpenCheckIn={() => {
              setIsCheckInOpen(true);
            }}
            onOpenRedFlag={() => setIsRedFlagOpen(true)}
            onDismissWarning={() => {
              triggerHaptic();
              setSettings((prev) => ({
                ...prev,
                warningDismissedTs: Date.now(),
              }));
              showToast('Warning acknowledged & dismissed ✓');
            }}
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
        currentUser={currentUser}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateMode={(mode) => {
          setSettings((prev) => ({ ...prev, mode }));
        }}
        onUpdateThemeMode={(themeMode: ThemeMode) => {
          triggerHaptic();
          setSettings((prev) => ({ ...prev, themeMode }));
          applyTheme(themeMode, settings.colorScheme || 'peach');
          if (currentUser) {
            updateUserTheme(currentUser.id, themeMode, settings.colorScheme || 'peach');
          }
          const label =
            themeMode === 'auto' ? 'Auto (Device)' : themeMode === 'dark' ? 'Dark Mode' : 'Light Mode';
          showToast(`Theme switched to ${label}`);
        }}
        onUpdateColorScheme={(colorScheme: ColorSchemeId) => {
          triggerHaptic();
          setSettings((prev) => ({ ...prev, colorScheme }));
          applyTheme(settings.themeMode || 'auto', colorScheme);
          if (currentUser) {
            updateUserTheme(currentUser.id, settings.themeMode || 'auto', colorScheme);
          }
          const csObj = COLOR_SCHEMES.find((c) => c.id === colorScheme);
          showToast(`Palette switched to ${csObj ? csObj.name : colorScheme} ${csObj ? csObj.emoji : ''}`);
        }}
        onUpdateHouse={(house) => {
          triggerHaptic();
          setSettings((prev) => ({ ...prev, house }));
          if (currentUser) {
            updateUserHouse(currentUser.id, house);
            setCurrentUser((prev) => (prev ? { ...prev, houseId: house } : null));
          }
          const chosen = HOUSES.find((h) => h.id === house);
          showToast(`Switched to ${chosen ? chosen.name : house}!`);
        }}
        onUpdateAvatar={(avatar) => {
          triggerHaptic();
          if (currentUser) {
            updateUserAvatar(currentUser.id, avatar);
            setCurrentUser((prev) => (prev ? { ...prev, avatar } : null));
            showToast(`Avatar updated! ${avatar}`);
          }
        }}
        onOpenAI={() => setIsAIOpen(true)}
        onOpenScience={() => setIsScienceOpen(true)}
        onOpenFacilities={() => {
          setIsSettingsOpen(false);
          setActiveTab('facilities');
        }}
        onLogout={handleLogout}
        onResetDemo={() => {
          const freshLogs: CheckInEntry[] = [];
          const freshReports = seedReports();
          setSettings((prev) => ({
            ...prev,
            logs: freshLogs,
            reports: freshReports,
          }));
          if (currentUser) {
            replaceUserLogs(currentUser.id, freshLogs);
            setCurrentUser((prev) => (prev ? { ...prev, logs: freshLogs } : null));
          }
          setIsSettingsOpen(false);
          showToast('Data reset to clean initial state (0 logs).');
        }}
        onWipeData={() => {
          if (confirm('Are you sure you want to delete all personal logs?')) {
            setSettings((prev) => ({
              ...prev,
              logs: [],
              reports: {},
            }));
            if (currentUser) {
              replaceUserLogs(currentUser.id, []);
              setCurrentUser((prev) => (prev ? { ...prev, logs: [], totalPoints: 0, streak: 0 } : null));
            }
            setIsSettingsOpen(false);
            showToast('Personal check-ins deleted.');
          }
        }}
      />

      <PostCheckInModal
        isOpen={isAnalysisOpen}
        entry={latestSavedEntry}
        mode={settings.mode}
        houseId={settings.house}
        pointsEarned={earnedPoints}
        onClose={() => setIsAnalysisOpen(false)}
        onOpenRedFlag={() => setIsRedFlagOpen(true)}
      />

      <RedFlagModal
        isOpen={isRedFlagOpen}
        onClose={() => setIsRedFlagOpen(false)}
        onDismissWarning={() => {
          triggerHaptic();
          setSettings((prev) => ({
            ...prev,
            warningDismissedTs: Date.now(),
          }));
          showToast('Warning acknowledged & dismissed ✓');
        }}
      />

      <AIInfoModal isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />

      <ScienceModal isOpen={isScienceOpen} onClose={() => setIsScienceOpen(false)} />

      {/* Apple Toast */}
      <div className={`apple-toast ${toastMessage ? 'on' : ''}`}>
        {toastMessage}
      </div>
    </div>
  );
}

export default App;
