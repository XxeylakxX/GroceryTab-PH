import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import { AppProvider, useApp } from './src/context/AppContext';
import { ReceiptScreen } from './src/screens/ReceiptScreen';
import { DictionaryScreen } from './src/screens/DictionaryScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { AccessibilityModal } from './src/components/AccessibilityModal';
import { HelpModal } from './src/components/HelpModal';
import { AboutModal } from './src/components/AboutModal';

type ActiveTab = 'receipt' | 'dictionary' | 'history';

const MainAppLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('receipt');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const { colors, theme, scaleFont, openAccessibilityModal, triggerHapticFeedback } = useAppTheme();
  const { cartItems, receipts } = useApp();

  const handleTabPress = (tab: ActiveTab) => {
    triggerHapticFeedback('light');
    setActiveTab(tab);
  };

  // Screen titles for iOS Large Title display
  const getScreenTitle = () => {
    switch (activeTab) {
      case 'receipt':
        return 'Procure';
      case 'dictionary':
        return 'Inventory';
      case 'history':
        return 'History';
    }
  };

  const getScreenSubtitle = () => {
    switch (activeTab) {
      case 'receipt':
        return 'Palengke Stall Restock Sheet';
      case 'dictionary':
        return 'Vegetable Catalog & Wholesale Rates';
      case 'history':
        return 'Archived Restock Records';
    }
  };

  return (
    <View style={[styles.rootContainer, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

      {/* iOS Top Navigation Bar with Safe Area Top Inset */}
      <View
        style={[
          styles.iosNavBar,
          {
            paddingTop: Math.max(insets.top, 12),
            backgroundColor: colors.surface,
            borderBottomColor: colors.borderSubtle
          }
        ]}
      >
        {/* Navigation Top Row: Brand & Actions */}
        <View style={styles.navTopRow}>
          {/* Brand Mark: Tap to open About & Build Info */}
          <TouchableOpacity
            onPress={() => {
              triggerHapticFeedback('light');
              setIsAboutOpen(true);
            }}
            style={styles.brandRow}
            accessibilityRole="button"
            accessibilityLabel="About GroceryTab PH: tap to view app version and build info"
            activeOpacity={0.7}
          >
            <View style={[styles.brandIconShell, { backgroundColor: colors.surfaceHighlight, borderColor: colors.borderSubtle }]}>
              <View style={[styles.brandIconInner, { backgroundColor: colors.primary }]}>
                <Ionicons name="storefront" size={scaleFont(18)} color={colors.primaryText} />
              </View>
            </View>
            <View style={styles.brandTextCol}>
              <View style={styles.eyebrowRow}>
                <Text style={[styles.brandEyebrow, { color: colors.primary, fontSize: scaleFont(9.5) }]}>
                  PALENGKE PROCUREMENT
                </Text>
              </View>
              <View style={styles.brandTitleRow}>
                <Text style={[styles.brandTitle, { color: colors.text, fontSize: scaleFont(18) }]}>
                  GroceryTab
                </Text>
                <View style={[styles.phBadge, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
                  <Text style={[styles.phBadgeText, { color: colors.primary, fontSize: scaleFont(9.5) }]}>
                    PH
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Right Bar Buttons: About, Help & Accessibility (48x48dp minimum targets) */}
          <View style={styles.navBarActions}>
            <TouchableOpacity
              onPress={() => {
                triggerHapticFeedback('light');
                setIsAboutOpen(true);
              }}
              style={[
                styles.navBarBtn,
                { backgroundColor: colors.surfaceHighlight, borderColor: colors.cardBorder }
              ]}
              accessibilityRole="button"
              accessibilityLabel="About GroceryTab PH: view version and build number"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="information-circle-outline" size={scaleFont(22)} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                triggerHapticFeedback('light');
                setIsHelpOpen(true);
              }}
              style={[
                styles.navBarBtn,
                { backgroundColor: colors.surfaceHighlight, borderColor: colors.cardBorder }
              ]}
              accessibilityRole="button"
              accessibilityLabel="Open User Guide and Help: learn how to use GroceryTab PH"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="help-circle-outline" size={scaleFont(22)} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                triggerHapticFeedback('medium');
                openAccessibilityModal();
              }}
              style={[
                styles.navBarBtn,
                { backgroundColor: colors.surfaceHighlight, borderColor: colors.cardBorder }
              ]}
              accessibilityRole="button"
              accessibilityLabel="Open Display & Accessibility Settings: change font size, view mode, and theme"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="text-outline" size={scaleFont(16)} color={colors.text} style={{ marginRight: 2 }} />
              <Ionicons name="eye-outline" size={scaleFont(16)} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* iOS Large Title Header Row */}
        <View style={styles.largeTitleContainer}>
          <View style={styles.titleInfo}>
            <Text
              style={[styles.largeTitleText, { color: colors.text, fontSize: scaleFont(28) }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {getScreenTitle()}
            </Text>
            <Text
              style={[styles.largeSubtitleText, { color: colors.textSecondary, fontSize: scaleFont(13) }]}
              numberOfLines={1}
            >
              {getScreenSubtitle()}
            </Text>
          </View>

          {/* Active tally indicator pill if items in cart & on another tab */}
          {cartItems.length > 0 && activeTab !== 'receipt' && (
            <TouchableOpacity
              onPress={() => {
                triggerHapticFeedback('light');
                setActiveTab('receipt');
              }}
              style={[
                styles.tallyPill,
                { backgroundColor: colors.primaryLight, borderColor: colors.primary }
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Return to active procurement sheet with ${cartItems.length} items`}
            >
              <Ionicons name="receipt" size={scaleFont(14)} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={[styles.tallyPillText, { color: colors.primary, fontSize: scaleFont(12) }]}>
                {cartItems.length} in sheet
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Screen Viewport */}
      <View style={styles.viewport}>
        {activeTab === 'receipt' && (
          <ReceiptScreen
            onNavigateToDictionary={() => setActiveTab('dictionary')}
            onNavigateToHistory={() => setActiveTab('history')}
          />
        )}
        {activeTab === 'dictionary' && (
          <DictionaryScreen
            onNavigateToReceipt={() => setActiveTab('receipt')}
          />
        )}
        {activeTab === 'history' && (
          <HistoryScreen
            onNavigateToReceipt={() => setActiveTab('receipt')}
          />
        )}
      </View>

      {/* iOS Native Edge-to-Edge Tab Bar */}
      <View
        style={[
          styles.iosTabBar,
          {
            backgroundColor: colors.tabBarBg,
            borderTopColor: colors.borderSubtle,
            paddingBottom: Math.max(insets.bottom, 10)
          }
        ]}
      >
        {/* Tab 1: Procure */}
        <TouchableOpacity
          onPress={() => handleTabPress('receipt')}
          style={styles.tabButton}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'receipt' }}
          accessibilityLabel={`Procure tab, ${cartItems.length} items on sheet`}
          activeOpacity={0.7}
        >
          <View style={styles.tabIconBox}>
            <Ionicons
              name={activeTab === 'receipt' ? 'receipt' : 'receipt-outline'}
              size={scaleFont(24)}
              color={activeTab === 'receipt' ? colors.primary : colors.tabBarInactive}
            />
            {cartItems.length > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.danger, borderColor: colors.surface }]}>
                <Text style={styles.badgeText}>
                  {cartItems.length > 99 ? '99+' : cartItems.length}
                </Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.tabLabel,
              {
                color: activeTab === 'receipt' ? colors.primary : colors.tabBarInactive,
                fontSize: scaleFont(11),
                fontWeight: activeTab === 'receipt' ? '800' : '600'
              }
            ]}
          >
            Procure
          </Text>
        </TouchableOpacity>

        {/* Tab 2: Inventory */}
        <TouchableOpacity
          onPress={() => handleTabPress('dictionary')}
          style={styles.tabButton}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'dictionary' }}
          accessibilityLabel="Inventory Catalog tab"
          activeOpacity={0.7}
        >
          <View style={styles.tabIconBox}>
            <Ionicons
              name={activeTab === 'dictionary' ? 'grid' : 'grid-outline'}
              size={scaleFont(24)}
              color={activeTab === 'dictionary' ? colors.primary : colors.tabBarInactive}
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              {
                color: activeTab === 'dictionary' ? colors.primary : colors.tabBarInactive,
                fontSize: scaleFont(11),
                fontWeight: activeTab === 'dictionary' ? '800' : '600'
              }
            ]}
          >
            Inventory
          </Text>
        </TouchableOpacity>

        {/* Tab 3: History */}
        <TouchableOpacity
          onPress={() => handleTabPress('history')}
          style={styles.tabButton}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'history' }}
          accessibilityLabel={`History records tab, ${receipts.length} past records saved`}
          activeOpacity={0.7}
        >
          <View style={styles.tabIconBox}>
            <Ionicons
              name={activeTab === 'history' ? 'time' : 'time-outline'}
              size={scaleFont(24)}
              color={activeTab === 'history' ? colors.primary : colors.tabBarInactive}
            />
            {receipts.length > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.primary, borderColor: colors.surface }]}>
                <Text style={styles.badgeText}>
                  {receipts.length > 99 ? '99+' : receipts.length}
                </Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.tabLabel,
              {
                color: activeTab === 'history' ? colors.primary : colors.tabBarInactive,
                fontSize: scaleFont(11),
                fontWeight: activeTab === 'history' ? '800' : '600'
              }
            ]}
          >
            History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Global Modals */}
      <AccessibilityModal />
      <HelpModal
        visible={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onOpenAbout={() => setIsAboutOpen(true)}
      />
      <AboutModal
        visible={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppProvider>
          <MainAppLayout />
        </AppProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1
  },
  iosNavBar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingBottom: 12
  },
  navTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  brandIconShell: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 2.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  brandIconInner: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  brandTextCol: {
    justifyContent: 'center'
  },
  eyebrowRow: {
    marginBottom: 1
  },
  brandEyebrow: {
    fontWeight: '800',
    letterSpacing: 0.8
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  brandTitle: {
    fontWeight: '900',
    letterSpacing: -0.4
  },
  phBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 5,
    borderWidth: 1.2
  },
  phBadgeText: {
    fontWeight: '900',
    letterSpacing: 0.4
  },
  navBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  navBarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 8
  },
  largeTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 4
  },
  titleInfo: {
    flex: 1
  },
  largeTitleText: {
    fontWeight: '900',
    letterSpacing: -0.6
  },
  largeSubtitleText: {
    fontWeight: '500',
    marginTop: 2
  },
  tallyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.2,
    marginBottom: 4
  },
  tallyPillText: {
    fontWeight: '800'
  },
  viewport: {
    flex: 1
  },
  iosTabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingVertical: 4
  },
  tabIconBox: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabLabel: {
    marginTop: 3,
    letterSpacing: -0.1
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -12,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900'
  }
});
