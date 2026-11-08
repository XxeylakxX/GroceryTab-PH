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
  const { cartItems, receipts } = useApp();

  const handleTabPress = (tab: ActiveTab) => {
    triggerHapticFeedback('light');
    setActiveTab(tab);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

      {/* Persistent App Header */}
      <View style={[styles.topHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.brandRow}>
          <View style={[styles.brandIconBox, { backgroundColor: colors.primary }]}>
            <Ionicons name="cart" size={scaleFont(22)} color={colors.primaryText} />
          </View>
          <View style={styles.brandTextContainer}>
            <Text style={[styles.brandTitle, { color: colors.text, fontSize: scaleFont(19) }]}>
              GroceryTab <Text style={{ color: colors.primary }}>PH</Text>
            </Text>
            <Text style={[styles.brandTagline, { color: colors.textSecondary, fontSize: scaleFont(12) }]}>
              Palengke Stall Procurement Tab
            </Text>
          </View>
        </View>

        {/* Header Action Buttons: Help & Accessibility */}
        <View style={styles.headerRightActions}>
          <TouchableOpacity
            onPress={() => {
              triggerHapticFeedback('light');
              setIsHelpOpen(true);
            }}
            style={[styles.headerActionBtn, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}
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
            style={[styles.headerActionBtn, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}
            accessibilityRole="button"
            accessibilityLabel="Open Display & Accessibility Settings: change font size, pictures view, and color theme"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="text" size={scaleFont(16)} color={colors.text} style={{ marginRight: 3 }} />
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

      {/* Accessible Bottom Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: colors.tabBarBg, borderTopColor: colors.border }]}>
        {/* Tab 1: Procure (Active Restock Sheet) */}
        <TouchableOpacity
          onPress={() => handleTabPress('receipt')}
          style={[
            styles.tabItem,
            activeTab === 'receipt' && {
              backgroundColor: colors.surfaceHighlight,
              borderTopWidth: 4,
              borderTopColor: colors.primary
            }
          ]}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'receipt' }}
          accessibilityLabel={`Procure tab. ${cartItems.length} items on tally.`}
        >
          <View style={styles.tabIconWrapper}>
            <Ionicons
              name={activeTab === 'receipt' ? 'receipt' : 'receipt-outline'}
              size={scaleFont(26)}
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
                fontSize: scaleFont(14),
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
            activeTab === 'dictionary' && {
              backgroundColor: colors.surfaceHighlight,
              borderTopWidth: 4,
              borderTopColor: colors.primary
            }
          ]}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'dictionary' }}
          accessibilityLabel="Inventory Catalog tab. Browse goods with pictures and set wholesale prices."
        >
          <View style={styles.tabIconWrapper}>
            <Ionicons
              name={activeTab === 'dictionary' ? 'grid' : 'grid-outline'}
              size={scaleFont(26)}
              color={activeTab === 'dictionary' ? colors.primary : colors.tabBarInactive}
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              {
                color: activeTab === 'dictionary' ? colors.primary : colors.tabBarInactive,
                fontSize: scaleFont(14),
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
            activeTab === 'history' && {
              backgroundColor: colors.surfaceHighlight,
              borderTopWidth: 4,
              borderTopColor: colors.primary
            }
          ]}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'history' }}
          accessibilityLabel={`History tab. ${receipts.length} past procurement records saved.`}
        >
          <View style={styles.tabIconWrapper}>
            <Ionicons
              name={activeTab === 'history' ? 'time' : 'time-outline'}
              size={scaleFont(26)}
              color={activeTab === 'history' ? colors.primary : colors.tabBarInactive}
            />
            {receipts.length > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.accent, borderColor: colors.surface }]}>
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
                fontSize: scaleFont(14),
                fontWeight: activeTab === 'history' ? '900' : '600'
              }
            ]}
          >
            History
          </Text>
        </TouchableOpacity>
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
    paddingVertical: 12,
    borderBottomWidth: 2
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 160,
    gap: 10
  },
  brandIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  brandTextContainer: {
    flexShrink: 1
  },
  brandTitle: {
    fontWeight: '900',
    letterSpacing: 0.5
  },
  brandTagline: {
    fontWeight: '600'
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
    borderRadius: 12,
    borderWidth: 2
  },
  screenContainer: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 2,
    minHeight: 72,
    paddingBottom: 6
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    paddingVertical: 6
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
    marginTop: 3,
    letterSpacing: 0.3
  }
});
