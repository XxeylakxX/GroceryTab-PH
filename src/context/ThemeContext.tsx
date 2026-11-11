import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Haptics from 'expo-haptics';
import { AppTheme, FontScale, ThemeColors, AccessibilitySettings } from '../types';
import { StorageService, DEFAULT_ACCESSIBILITY_SETTINGS } from '../services/StorageService';

export const THEME_PALETTES: Record<AppTheme, ThemeColors> = {
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceHighlight: '#F1F5F9',
    card: '#FFFFFF',
    cardInner: '#F8FAFC',
    cardBorder: '#CBD5E1',
    borderSubtle: '#E2E8F0',
    text: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#64748B',
    primary: '#047857', // High-contrast Market Emerald
    primaryLight: '#ECFDF5',
    primaryGlow: 'rgba(4, 120, 87, 0.14)',
    primaryText: '#FFFFFF',
    accent: '#0D9488', // Teal accent
    accentLight: '#CCFBF1',
    danger: '#DC2626',
    dangerSurface: '#FEF2F2',
    success: '#16A34A',
    successSurface: '#F0FDF4',
    warning: '#D97706',
    border: '#64748B',
    receiptPaper: '#FFFFFF',
    receiptBorder: '#94A3B8',
    receiptText: '#0F172A',
    receiptSubtext: '#475569',
    tabBarBg: '#FFFFFF',
    tabBarActive: '#047857',
    tabBarInactive: '#64748B',
    badgeBg: '#047857',
    badgeText: '#FFFFFF',
    shadowColor: '#0F172A'
  },
  warm: {
    background: '#FAF7F2',
    surface: '#F4EFE6',
    surfaceHighlight: '#EBDDC9',
    card: '#FFFDF9',
    cardInner: '#F7F2E9',
    cardBorder: '#A89F91',
    borderSubtle: '#DDD4C7',
    text: '#292524',
    textSecondary: '#44403C',
    textMuted: '#78716C',
    primary: '#7C2D12', // Rich Roasted Barako
    primaryLight: '#FEF2F2',
    primaryGlow: 'rgba(124, 45, 18, 0.14)',
    primaryText: '#FFFFFF',
    accent: '#166534',
    accentLight: '#DCFCE7',
    danger: '#B91C1C',
    dangerSurface: '#FEF2F2',
    success: '#15803D',
    successSurface: '#DCFCE7',
    warning: '#B45309',
    border: '#78716C',
    receiptPaper: '#FFFDF8',
    receiptBorder: '#8C827A',
    receiptText: '#292524',
    receiptSubtext: '#57534E',
    tabBarBg: '#F4EFE6',
    tabBarActive: '#7C2D12',
    tabBarInactive: '#78716C',
    badgeBg: '#7C2D12',
    badgeText: '#FFFFFF',
    shadowColor: '#44403C'
  },
  dark: {
    background: '#07090E',
    surface: '#111622',
    surfaceHighlight: '#1A2234',
    card: '#141A29',
    cardInner: '#0E131F',
    cardBorder: '#2E3A52',
    borderSubtle: '#1E273A',
    text: '#F8FAFC',
    textSecondary: '#E2E8F0',
    textMuted: '#94A3B8',
    primary: '#10B981', // High-contrast Night Market Mint
    primaryLight: '#064E3B',
    primaryGlow: 'rgba(16, 185, 129, 0.22)',
    primaryText: '#022C22',
    accent: '#34D399',
    accentLight: '#065F46',
    danger: '#F87171',
    dangerSurface: '#450A0A',
    success: '#34D399',
    successSurface: '#064E3B',
    warning: '#FBBF24',
    border: '#475569',
    receiptPaper: '#0F1420',
    receiptBorder: '#334155',
    receiptText: '#F8FAFC',
    receiptSubtext: '#94A3B8',
    tabBarBg: '#111622',
    tabBarActive: '#10B981',
    tabBarInactive: '#94A3B8',
    badgeBg: '#10B981',
    badgeText: '#022C22',
    shadowColor: '#000000'
  }
};

interface ThemeContextType {
  settings: AccessibilitySettings;
  theme: AppTheme;
  colors: ThemeColors;
  fontScale: FontScale;
  viewMode: 'visual-grid' | 'list';
  scaleFactor: number;
  scaleFont: (baseSize: number) => number;
  setTheme: (theme: AppTheme) => void;
  setFontScale: (scale: FontScale) => void;
  setViewMode: (mode: 'visual-grid' | 'list') => void;
  toggleViewMode: () => void;
  toggleHighContrast: () => void;
  toggleHaptics: () => void;
  triggerHapticFeedback: (type?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => void;
  isAccessibilityModalOpen: boolean;
  openAccessibilityModal: () => void;
  closeAccessibilityModal: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_ACCESSIBILITY_SETTINGS);
  const [isAccessibilityModalOpen, setIsAccessibilityModalOpen] = useState(false);

  useEffect(() => {
    StorageService.getAccessibilitySettings().then(saved => {
      setSettings(saved);
    });
  }, []);

  const updateSettings = (newSettings: AccessibilitySettings) => {
    setSettings(newSettings);
    StorageService.saveAccessibilitySettings(newSettings);
  };

  const setTheme = (theme: AppTheme) => {
    updateSettings({ ...settings, theme });
    triggerHapticFeedback('light');
  };

  const setFontScale = (fontScale: FontScale) => {
    updateSettings({ ...settings, fontScale });
    triggerHapticFeedback('medium');
  };

  const setViewMode = (viewMode: 'visual-grid' | 'list') => {
    updateSettings({ ...settings, viewMode });
    triggerHapticFeedback('light');
  };

  const toggleViewMode = () => {
    const nextMode = settings.viewMode === 'visual-grid' ? 'list' : 'visual-grid';
    setViewMode(nextMode);
  };

  const toggleHighContrast = () => {
    updateSettings({ ...settings, highContrast: !settings.highContrast });
    triggerHapticFeedback('light');
  };

  const toggleHaptics = () => {
    updateSettings({ ...settings, hapticFeedback: !settings.hapticFeedback });
  };

  const triggerHapticFeedback = (
    type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light'
  ) => {
    if (!settings.hapticFeedback) return;
    try {
      if (type === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      else if (type === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      else if (type === 'heavy') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      else if (type === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      else if (type === 'warning') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      else if (type === 'error') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {
      // Ignored on unsupported platforms
    }
  };

  const scaleFactor = settings.fontScale === 'extra-large' ? 1.35 : settings.fontScale === 'large' ? 1.18 : 1.0;

  const scaleFont = (baseSize: number): number => {
    return Math.round(baseSize * scaleFactor);
  };

  const colors = THEME_PALETTES[settings.theme];

  return (
    <ThemeContext.Provider
      value={{
        settings,
        theme: settings.theme,
        colors,
        fontScale: settings.fontScale,
        viewMode: settings.viewMode || 'visual-grid',
        scaleFactor,
        scaleFont,
        setTheme,
        setFontScale,
        setViewMode,
        toggleViewMode,
        toggleHighContrast,
        toggleHaptics,
        triggerHapticFeedback,
        isAccessibilityModalOpen,
        openAccessibilityModal: () => setIsAccessibilityModalOpen(true),
        closeAccessibilityModal: () => setIsAccessibilityModalOpen(false)
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
};
