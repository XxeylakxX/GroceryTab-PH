import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import { AppProvider, useApp } from './src/context/AppContext';
import { ReceiptScreen } from './src/screens/ReceiptScreen';
import { DictionaryScreen } from './src/screens/DictionaryScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { AccessibilityModal } from './src/components/AccessibilityModal';
import { HelpModal } from './src/components/HelpModal';

type ActiveTab = 'receipt' | 'dictionary' | 'history';

const MainAppLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('receipt');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const { colors, theme, scaleFont, openAccessibilityModal, triggerHapticFeedback } = useAppTheme();
  const { cartItems, receipts, totalProcurement } = useApp();

  const handleTabPress = (tab: ActiveTab) => {
    triggerHapticFeedback('light');
    setActiveTab(tab);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

      {/* Modern High-End Header */}
      <View style={[styles.topHeader, { backgroundColor: colors.surface, borderBottomColor: colors.borderSubtle }]}>
        <View style={styles.brandRow}>
          {/* Double-Bezel Logo Icon */}
          <View style={[styles.brandIconShell, { backgroundColor: colors.surfaceHighlight, borderColor: colors.borderSubtle }]}>
            <View style={[styles.brandIconInner, { backgroundColor: colors.primary }]}>
              <Ionicons name="storefront" size={scaleFont(20)} color={colors.primaryText} />
            </View>
          </View>

          <View style={styles.brandTextContainer}>
            <View style={styles.eyebrowRow}>
              <Text style={[styles.brandEyebrow, { color: colors.primary, fontSize: scaleFont(10) }]}>
                PALENGKE PROCUREMENT
              </Text>
            </View>
            <View style={styles.titleRow}>
              <Text style={[styles.brandTitle, { color: colors.text, fontSize: scaleFont(20) }]}>
                GroceryTab
              </Text>
              <View style={[styles.phBadge, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
                <Text style={[styles.phBadgeText, { color: colors.primary, fontSize: scaleFont(10) }]}>
                  PH
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Live Procurement Tally Indicator (if items active) */}
        {cartItems.length > 0 && activeTab !== 'receipt' && (
          <TouchableOpacity
            onPress={() => setActiveTab('receipt')}
            style={[styles.headerTallyChip, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
            accessibilityRole="button"
            accessibilityLabel={`Active procurement tally: ${cartItems.length} items`}
          >
            <Ionicons name="receipt" size={scaleFont(14)} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={[styles.headerTallyText, { color: colors.primary, fontSize: scaleFont(12) }]}>
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Header Action Buttons: Help & Accessibility */}
        <View style={styles.headerRightActions}>
          <TouchableOpacity
            onPress={() => {
              triggerHapticFeedback('light');
              setIsHelpOpen(true);
            }}
            style={[
              styles.headerActionBtn,
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
              styles.headerActionBtn,
              { backgroundColor: colors.surfaceHighlight, borderColor: colors.cardBorder }
            ]}
            accessibilityRole="button"
            accessibilityLabel="Open Display & Accessibility Settings: change font size, pictures view, and color theme"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="text" size={scaleFont(16)} color={colors.text} style={{ marginRight: 2 }} />
            <Ionicons name="eye-outline" size={scaleFont(16)} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Screen Body */}
      <View style={styles.screenContainer}>
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

      {/* Floating Island Dock Tab Bar */}
      <View style={styles.tabBarWrapper}>
        <View
          style={[
            styles.floatingTabBar,
            {
              backgroundColor: colors.tabBarBg,
              borderColor: colors.cardBorder,
              shadowColor: colors.shadowColor
            }
          ]}
        >
          {/* Tab 1: Procure (Active Restock Sheet) */}
          <TouchableOpacity
            onPress={() => handleTabPress('receipt')}
            style={[
              styles.tabItem,
              activeTab === 'receipt' && [
                styles.tabItemActive,
                { backgroundColor: colors.primaryLight, borderColor: colors.primary }
              ]
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'receipt' }}
            accessibilityLabel={`Procure tab. ${cartItems.length} items on tally.`}
          >
            <View style={styles.tabIconWrapper}>
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
                  fontSize: scaleFont(13),
                  fontWeight: activeTab === 'receipt' ? '900' : '600'
                }
              ]}
            >
              Procure
            </Text>
          </TouchableOpacity>

          {/* Tab 2: Inventory (Visual Items & Icons Catalog) */}
          <TouchableOpacity
            onPress={() => handleTabPress('dictionary')}
            style={[
              styles.tabItem,
              activeTab === 'dictionary' && [
                styles.tabItemActive,
                { backgroundColor: colors.primaryLight, borderColor: colors.primary }
              ]
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'dictionary' }}
            accessibilityLabel="Inventory Catalog tab. Browse goods with pictures and set wholesale prices."
          >
            <View style={styles.tabIconWrapper}>
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
                  fontSize: scaleFont(13),
                  fontWeight: activeTab === 'dictionary' ? '900' : '600'
                }
              ]}
            >
              Inventory
            </Text>
          </TouchableOpacity>

          {/* Tab 3: History (Procurement Logs) */}
          <TouchableOpacity
            onPress={() => handleTabPress('history')}
            style={[
              styles.tabItem,
              activeTab === 'history' && [
                styles.tabItemActive,
                { backgroundColor: colors.primaryLight, borderColor: colors.primary }
              ]
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'history' }}
            accessibilityLabel={`History tab. ${receipts.length} past procurement records saved.`}
          >
            <View style={styles.tabIconWrapper}>
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
                  fontSize: scaleFont(13),
                  fontWeight: activeTab === 'history' ? '900' : '600'
                }
              ]}
            >
              History
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <AccessibilityModal />
      <HelpModal visible={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </SafeAreaView>
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
  safeArea: { flex: 1 },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1.5
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 160,
    gap: 10
  },
  brandIconShell: {
    width: 46,
    height: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center'
  },
  brandIconInner: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  brandTextContainer: {
    flexShrink: 1
  },
  eyebrowRow: {
    marginBottom: 1
  },
  brandEyebrow: {
    fontWeight: '800',
    letterSpacing: 0.8
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  brandTitle: {
    fontWeight: '900',
    letterSpacing: -0.3
  },
  phBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1.5
  },
  phBadgeText: {
    fontWeight: '900',
    letterSpacing: 0.5
  },
  headerTallyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.5
  },
  headerTallyText: {
    fontWeight: '800'
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  headerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    minHeight: 48,
    minWidth: 48,
    borderRadius: 14,
    borderWidth: 1.5
  },
  screenContainer: { flex: 1 },
  tabBarWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 4
  },
  floatingTabBar: {
    flexDirection: 'row',
    borderRadius: 26,
    borderWidth: 1.5,
    minHeight: 66,
    paddingHorizontal: 6,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    borderRadius: 20,
    paddingVertical: 4
  },
  tabItemActive: {
    borderWidth: 1.5
  },
  tabIconWrapper: { position: 'relative' },
  badge: {
    position: 'absolute',
    top: -4,
    right: -12,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900'
  },
  tabLabel: {
    marginTop: 2,
    letterSpacing: 0.2
  }
});
