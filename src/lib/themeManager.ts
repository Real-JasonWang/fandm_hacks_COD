import type { ThemeMode, ColorSchemeId } from '../types';

export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function getEffectiveTheme(themeMode: ThemeMode = 'auto'): 'light' | 'dark' {
  if (themeMode === 'auto') {
    return getSystemTheme();
  }
  return themeMode;
}

export function applyTheme(themeMode: ThemeMode = 'auto', colorScheme: ColorSchemeId = 'peach') {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const effectiveTheme = getEffectiveTheme(themeMode);

  root.setAttribute('data-theme', effectiveTheme);
  root.setAttribute('data-color-scheme', colorScheme);

  if (effectiveTheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Update mobile browser chrome status bar color
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    if (effectiveTheme === 'dark') {
      const darkBgs: Record<ColorSchemeId, string> = {
        peach: '#18141C',
        diplomat: '#0C1322',
        matcha: '#0C1A14',
        lavender: '#141022',
        amber: '#1A140C',
        blossom: '#1A0E17',
        teal: '#0A181C',
      };
      metaTheme.setAttribute('content', darkBgs[colorScheme] || '#18141C');
    } else {
      const lightBgs: Record<ColorSchemeId, string> = {
        peach: '#FFF8F0',
        diplomat: '#F2F7FD',
        matcha: '#F2FAF5',
        lavender: '#F7F4FE',
        amber: '#FFFBF2',
        blossom: '#FFF5F8',
        teal: '#F0FDFE',
      };
      metaTheme.setAttribute('content', lightBgs[colorScheme] || '#FFF8F0');
    }
  }
}
