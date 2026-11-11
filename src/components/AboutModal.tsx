import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { BUILD_INFO } from '../constants/buildInfo';

interface AboutModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ visible, onClose }) => {
  const { colors, scaleFont, triggerHapticFeedback } = useAppTheme();

  const handleClose = () => {
    triggerHapticFeedback('light');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={handleClose}
          accessibilityLabel="Close About GroceryTab"
          accessibilityRole="button"
        />
        <View style={[styles.sheetContainer, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
          {/* iOS Sheet Grabber */}
          <View style={styles.dragHandleContainer}>
            <View style={[styles.dragHandle, { backgroundColor: colors.borderSubtle }]} />
          </View>

          {/* iOS Navigation Header */}
          <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
            <View style={{ width: 60 }} />
            <Text style={[styles.headerTitle, { color: colors.text, fontSize: scaleFont(17) }]}>
              About
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.doneNavBtn}
              accessibilityLabel="Close About screen"
              accessibilityRole="button"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.doneNavBtnText, { color: colors.primary, fontSize: scaleFont(16) }]}>
                Done
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Concentric Double-Bezel App Icon Vessel */}
            <View style={styles.heroSection}>
              <View style={[styles.iconOuterBezel, { backgroundColor: colors.surfaceHighlight, borderColor: colors.borderSubtle }]}>
                <View style={[styles.iconInnerBezel, { backgroundColor: colors.primary }]}>
                  <Ionicons name="storefront" size={scaleFont(38)} color={colors.primaryText} />
                </View>
              </View>

              <Text style={[styles.appTitle, { color: colors.text, fontSize: scaleFont(24) }]}>
                GroceryTab PH
              </Text>
              <Text style={[styles.appTagline, { color: colors.primary, fontSize: scaleFont(13) }]}>
                Palengke Wholesale Restock & Capital Ledger
              </Text>

              {/* Version & Commit Pill */}
              <View style={[styles.versionPill, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
                <Ionicons name="git-commit-outline" size={scaleFont(15)} color={colors.primary} style={{ marginRight: 5 }} />
                <Text style={[styles.versionPillText, { color: colors.primary, fontSize: scaleFont(13) }]}>
                  v{BUILD_INFO.version} • Commit #{BUILD_INFO.commitCount} ({BUILD_INFO.commitHash})
                </Text>
              </View>
            </View>

            {/* Build Specifications: iOS Inset Grouped Table */}
            <Text style={[styles.sectionTitle, { color: colors.textSecondary, fontSize: scaleFont(12) }]}>
              APPLICATION & COMMIT INFO
            </Text>
            <View style={[styles.insetGroupedCard, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
              <View style={[styles.infoRow, { borderBottomColor: colors.borderSubtle }]}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary, fontSize: scaleFont(14) }]}>
                  Version
                </Text>
                <Text style={[styles.infoValue, { color: colors.text, fontSize: scaleFont(14) }]}>
                  v{BUILD_INFO.version}
                </Text>
              </View>

              <View style={[styles.infoRow, { borderBottomColor: colors.borderSubtle }]}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary, fontSize: scaleFont(14) }]}>
                  Commit Number
                </Text>
                <View style={[styles.buildBadge, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.buildBadgeText, { color: colors.primary, fontSize: scaleFont(13) }]}>
                    Commit #{BUILD_INFO.commitCount}
                  </Text>
                </View>
              </View>

              <View style={[styles.infoRow, { borderBottomColor: colors.borderSubtle }]}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary, fontSize: scaleFont(14) }]}>
                  Git Commit Hash
                </Text>
                <View style={[styles.hashBadge, { backgroundColor: colors.surfaceHighlight }]}>
                  <Text style={[styles.infoValueCode, { color: colors.text, fontSize: scaleFont(13) }]}>
                    {BUILD_INFO.commitHash}
                  </Text>
                </View>
              </View>

              <View style={[styles.infoRow, { borderBottomColor: colors.borderSubtle }]}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary, fontSize: scaleFont(14) }]}>
                  Commit Date
                </Text>
                <Text style={[styles.infoValue, { color: colors.text, fontSize: scaleFont(14) }]}>
                  {BUILD_INFO.commitDate}
                </Text>
              </View>

              <View style={[styles.infoRow, { borderBottomColor: colors.borderSubtle }]}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary, fontSize: scaleFont(14) }]}>
                  Bundle Identifier
                </Text>
                <Text style={[styles.infoValueCode, { color: colors.text, fontSize: scaleFont(13) }]}>
                  ph.grocerytab.app
                </Text>
              </View>

              <View style={[styles.infoRow, { borderBottomColor: colors.borderSubtle }]}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary, fontSize: scaleFont(14) }]}>
                  Target Environment
                </Text>
                <Text style={[styles.infoValue, { color: colors.text, fontSize: scaleFont(14) }]}>
                  iOS 18+ (iPhone & Sideload)
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary, fontSize: scaleFont(14) }]}>
                  Architecture
                </Text>
                <Text style={[styles.infoValue, { color: colors.text, fontSize: scaleFont(14) }]}>
                  React Native 0.88 • Hermes
                </Text>
              </View>
            </View>

            {/* Purpose & Invariants */}
            <Text style={[styles.sectionTitle, { color: colors.textSecondary, fontSize: scaleFont(12), marginTop: 20 }]}>
              CORE INVARIANTS & CAPABILITIES
            </Text>
            <View style={[styles.insetGroupedCard, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
              <View style={[styles.featureRow, { borderBottomColor: colors.borderSubtle }]}>
                <Ionicons name="cloud-offline" size={scaleFont(20)} color={colors.primary} style={styles.featureIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.featureTitle, { color: colors.text, fontSize: scaleFont(14) }]}>
                    100% Offline-First
                  </Text>
                  <Text style={[styles.featureDesc, { color: colors.textMuted, fontSize: scaleFont(12) }]}>
                    Works with zero internet connection inside wet markets and bagsakan trucks.
                  </Text>
                </View>
              </View>

              <View style={[styles.featureRow, { borderBottomColor: colors.borderSubtle }]}>
                <Ionicons name="calculator" size={scaleFont(20)} color={colors.primary} style={styles.featureIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.featureTitle, { color: colors.text, fontSize: scaleFont(14) }]}>
                    No-Discount Palengke Pricing
                  </Text>
                  <Text style={[styles.featureDesc, { color: colors.textMuted, fontSize: scaleFont(12) }]}>
                    Strict raw wholesale tally without retail percentages or hidden discounts.
                  </Text>
                </View>
              </View>

              <View style={[styles.featureRow, { borderBottomColor: colors.borderSubtle }]}>
                <Ionicons name="pricetag" size={scaleFont(20)} color={colors.primary} style={styles.featureIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.featureTitle, { color: colors.text, fontSize: scaleFont(14) }]}>
                    Automatic Price Memory
                  </Text>
                  <Text style={[styles.featureDesc, { color: colors.textMuted, fontSize: scaleFont(12) }]}>
                    Adjusting vegetable prices in restock automatically updates your catalog.
                  </Text>
                </View>
              </View>

              <View style={styles.featureRow}>
                <Ionicons name="accessibility" size={scaleFont(20)} color={colors.primary} style={styles.featureIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.featureTitle, { color: colors.text, fontSize: scaleFont(14) }]}>
                    Senior-Friendly High Contrast
                  </Text>
                  <Text style={[styles.featureDesc, { color: colors.textMuted, fontSize: scaleFont(12) }]}>
                    48x48dp minimum targets, 135% font scale support, and OLED night market themes.
                  </Text>
                </View>
              </View>
            </View>

            {/* Copyright & Signoff */}
            <View style={styles.footerSection}>
              <Text style={[styles.footerText, { color: colors.textMuted, fontSize: scaleFont(12) }]}>
                GroceryTab PH • Philippine Wet Market Tool
              </Text>
              <Text style={[styles.footerSub, { color: colors.textMuted, fontSize: scaleFont(11) }]}>
                Designed for Filipino stall owners & wholesalers
              </Text>
            </View>

            {/* Dismiss Button */}
            <TouchableOpacity
              onPress={handleClose}
              style={[styles.closeButton, { backgroundColor: colors.primary }]}
              accessibilityRole="button"
              accessibilityLabel="Dismiss About dialog"
            >
              <Text style={[styles.closeButtonText, { color: colors.primaryText, fontSize: scaleFont(16) }]}>
                Close
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.65)'
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.4)'
  },
  sheetContainer: {
    maxHeight: '90%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 2
  },
  dragHandle: {
    width: 36,
    height: 5,
    borderRadius: 2.5
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  headerTitle: {
    fontWeight: '800'
  },
  doneNavBtn: {
    minWidth: 60,
    alignItems: 'flex-end',
    justifyContent: 'center',
    minHeight: 40
  },
  doneNavBtnText: {
    fontWeight: '800'
  },
  contentScroll: {
    paddingHorizontal: 18
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 40
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24
  },
  iconOuterBezel: {
    width: 80,
    height: 80,
    borderRadius: 24,
    borderWidth: 2,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  iconInnerBezel: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  appTitle: {
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 2
  },
  appTagline: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12
  },
  versionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.2
  },
  versionPillText: {
    fontWeight: '800'
  },
  sectionTitle: {
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginLeft: 4
  },
  insetGroupedCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden'
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 46
  },
  infoLabel: {
    fontWeight: '600'
  },
  infoValue: {
    fontWeight: '700'
  },
  infoValueCode: {
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace'
  },
  buildBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  buildBadgeText: {
    fontWeight: '800'
  },
  hashBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12
  },
  featureIcon: {
    width: 24,
    textAlign: 'center'
  },
  featureTitle: {
    fontWeight: '800',
    marginBottom: 2
  },
  featureDesc: {
    lineHeight: 16
  },
  footerSection: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
    gap: 4
  },
  footerText: {
    fontWeight: '600'
  },
  footerSub: {
    fontWeight: '500'
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    minHeight: 50
  },
  closeButtonText: {
    fontWeight: '800'
  }
});
