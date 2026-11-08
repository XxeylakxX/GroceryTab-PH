import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Haptics from 'expo-haptics';
import { AppTheme, FontScale, ThemeColors, AccessibilitySettings } from '../types';
import { StorageService, DEFAULT_ACCESSIBILITY_SETTINGS } from '../services/StorageService';

export const THEME_PALETTES: Record<AppTheme, ThemeColors> = {
  light: {
    background: '#FFFFFF',
    surface: '#F4F5F8',
    surfaceHighlight: '#E3E7EE',
    card: '#FFFFFF',
    cardBorder: '#2B2F38',
    text: '#000000',
    textSecondary: '#27272A',
    textMuted: '#52525B',
    primary: '#0D47A1', // High contrast Deep Navy Blue
    primaryText: '#FFFFFF',
    accent: '#007A3D', // Philippine Central Bank Green
    danger: '#B91C1C',
    dangerSurface: '#FEE2E2',
    success: '#15803D',
    successSurface: '#DCFCE7',
    warning: '#B45309',
    border: '#1E293B',
    receiptPaper: '#FCFCFD',
    receiptBorder: '#475569',
    receiptText: '#09090B',
    receiptSubtext: '#3F3F46',
    tabBarBg: '#FFFFFF',
    tabBarActive: '#0D47A1',
    tabBarInactive: '#52525B'
  },
  warm: {
    background: '#FDFBF7',
    surface: '#F5EFE6',
    surfaceHighlight: '#EBDDC9',
    card: '#FFFFFF',
    cardBorder: '#44403C',
    text: '#1C1917',
    textSecondary: '#292524',
    textMuted: '#57534E',
    primary: '#78350F', // Rich dark warm amber
    primaryText: '#FFFFFF',
    accent: '#166534',
    danger: '#991B1B',
    dangerSurface: '#FEE2E2',
    success: '#15803D',
    successSurface: '#DCFCE7',
    warning: '#92400E',
    border: '#44403C',
    receiptPaper: '#FFFDF9',
    receiptBorder: '#57534E',
    receiptText: '#1C1917',
    receiptSubtext: '#44403C',
    tabBarBg: '#F5EFE6',
    tabBarActive: '#78350F',
    tabBarInactive: '#78716C'
  },
  dark: {
    background: '#09090B',
    surface: '#18181B',
    surfaceHighlight: '#27272A',
    card: '#121215',
    cardBorder: '#D4D4D8',
    text: '#FFFFFF',
    textSecondary: '#F4F4F5',
    textMuted: '#A1A1AA',
    primary: '#38BDF8', // Bright accessible sky blue
    primaryText: '#000000',
    accent: '#4ADE80',
    danger: '#F87171',
    dangerSurface: '#450A0A',
    success: '#4ADE80',
    successSurface: '#052E16',
    warning: '#FBBF24',
    border: '#52525B',
    receiptPaper: '#18181B',
    receiptBorder: '#A1A1AA',
    receiptText: '#FAFAFA',
    receiptSubtext: '#D4D4D8',
    tabBarBg: '#121215',
    tabBarActive: '#38BDF8',
    tabBarInactive: '#A1A1AA'
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
