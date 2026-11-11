import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';

interface HelpModalProps {
  visible: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ visible, onClose }) => {
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
          accessibilityLabel="Close User Guide"
          accessibilityRole="button"
        />
        <View style={[styles.sheetContainer, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
          {/* Drag Handle */}
          <View style={styles.dragHandleContainer}>
            <View style={[styles.dragHandle, { backgroundColor: colors.borderSubtle }]} />
          </View>

          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
            <View style={styles.headerTitleRow}>
              <View style={[styles.helpIconBadge, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="help" size={scaleFont(20)} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.headerTitle, { color: colors.text, fontSize: scaleFont(19) }]}>
                  How to Use GroceryTab PH
                </Text>
                <Text style={[styles.headerSub, { color: colors.textSecondary, fontSize: scaleFont(12) }]}>
                  Quick Guide for Palengke Stall Procurement
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              style={[styles.closeButton, { backgroundColor: colors.surfaceHighlight, borderColor: colors.cardBorder }]}
              accessibilityLabel="Close help guide"
              accessibilityRole="button"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Guide Content */}
          <ScrollView style={styles.contentScroll} contentContainerStyle={styles.scrollContent}>
            {/* Section 1: Procure Tab */}
            <View style={[styles.guideCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.guideCardHeader}>
                <Text style={{ fontSize: scaleFont(26), marginRight: 10 }}>📋</Text>
                <Text style={[styles.guideCardTitle, { color: colors.text, fontSize: scaleFont(17) }]}>
                  1. Procure Tab (Restock Tally)
                </Text>
              </View>
              <Text style={[styles.guideText, { color: colors.textSecondary, fontSize: scaleFont(14) }]}>
                Use this screen when buying wholesale vegetables at the market or bagsakan:
              </Text>
              <View style={styles.bulletList}>
                <Text style={[styles.bulletItem, { color: colors.text, fontSize: scaleFont(14) }]}>
                  • <Text style={{ fontWeight: '800' }}>Add Items:</Text> Tap "+ Pick from Catalog" to choose vegetables with pictures, or tap "+ Custom Item".
                </Text>
                <Text style={[styles.bulletItem, { color: colors.text, fontSize: scaleFont(14) }]}>
                  • <Text style={{ fontWeight: '800' }}>Quantity Stepper:</Text> Tap <Text style={{ fontWeight: '900' }}>[+]</Text> or <Text style={{ fontWeight: '900' }}>[-]</Text> to adjust. Tap the number to type directly.
                </Text>
                <Text style={[styles.bulletItem, { color: colors.text, fontSize: scaleFont(14) }]}>
                  • <Text style={{ fontWeight: '800' }}>Remove Item:</Text> Tap the red trash icon on any row to delete it from the sheet.
                </Text>
                <Text style={[styles.bulletItem, { color: colors.text, fontSize: scaleFont(14) }]}>
                  • <Text style={{ fontWeight: '800' }}>Cash & Change (Sukli):</Text> Tap "+ Enter Cash" at the bottom to enter how much money you gave the supplier, and see your exact change due.
                </Text>
                <Text style={[styles.bulletItem, { color: colors.text, fontSize: scaleFont(14) }]}>
                  • <Text style={{ fontWeight: '800' }}>Save & Record:</Text> Tap the big blue button at the bottom to save your restock tally to History.
                </Text>
              </View>
            </View>

            {/* Section 2: Inventory Catalog */}
            <View style={[styles.guideCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.guideCardHeader}>
                <Text style={{ fontSize: scaleFont(26), marginRight: 10 }}>📦</Text>
                <Text style={[styles.guideCardTitle, { color: colors.text, fontSize: scaleFont(17) }]}>
                  2. Inventory Tab (Pictures & Icons)
                </Text>
              </View>
              <Text style={[styles.guideText, { color: colors.textSecondary, fontSize: scaleFont(14) }]}>
                Your pre-saved vegetable list with pictures and remembered wholesale prices:
              </Text>
              <View style={styles.bulletList}>
                <Text style={[styles.bulletItem, { color: colors.text, fontSize: scaleFont(14) }]}>
                  • <Text style={{ fontWeight: '800' }}>Picture First:</Text> Large tiles let you identify vegetables visually without squinting at text.
                </Text>
                <Text style={[styles.bulletItem, { color: colors.text, fontSize: scaleFont(14) }]}>
                  • <Text style={{ fontWeight: '800' }}>Take Real Photos:</Text> Tap "Edit" or "+ Add Item", then tap "Take Photo" with your camera or "Pick Photo" from your phone gallery.
                </Text>
                <Text style={[styles.bulletItem, { color: colors.text, fontSize: scaleFont(14) }]}>
                  • <Text style={{ fontWeight: '800' }}>Automatic Price Memory:</Text> Whenever you change a price while buying at the market, the app automatically remembers that new price for the next time!
                </Text>
                <Text style={[styles.bulletItem, { color: colors.text, fontSize: scaleFont(14) }]}>
                  • <Text style={{ fontWeight: '800' }}>Delete Items:</Text> Tap the red trash icon on any tile or tap "Delete Item" inside the edit form to remove it permanently.
                </Text>
              </View>
            </View>

            {/* Section 3: History & Export */}
            <View style={[styles.guideCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.guideCardHeader}>
                <Text style={{ fontSize: scaleFont(26), marginRight: 10 }}>🕒</Text>
                <Text style={[styles.guideCardTitle, { color: colors.text, fontSize: scaleFont(17) }]}>
                  3. History Tab (Procurement Logs)
                </Text>
              </View>
              <Text style={[styles.guideText, { color: colors.textSecondary, fontSize: scaleFont(14) }]}>
                All your past market purchases are saved safely on your phone:
              </Text>
              <View style={styles.bulletList}>
                <Text style={[styles.bulletItem, { color: colors.text, fontSize: scaleFont(14) }]}>
                  • <Text style={{ fontWeight: '800' }}>Expand Record:</Text> Tap any past receipt to view the full itemized list with prices and quantities.
                </Text>
                <Text style={[styles.bulletItem, { color: colors.text, fontSize: scaleFont(14) }]}>
                  • <Text style={{ fontWeight: '800' }}>Send to Supplier:</Text> Tap "Copy" to paste into SMS or Viber, or tap "Share" to send directly to your wholesaler.
                </Text>
                <Text style={[styles.bulletItem, { color: colors.text, fontSize: scaleFont(14) }]}>
                  • <Text style={{ fontWeight: '800' }}>Reload:</Text> Tap "Reload" to copy all items from an old restock into your active sheet.
                </Text>
              </View>
            </View>

            {/* Section 4: Accessibility */}
            <View style={[styles.guideCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.guideCardHeader}>
                <Text style={{ fontSize: scaleFont(26), marginRight: 10 }}>👁️</Text>
                <Text style={[styles.guideCardTitle, { color: colors.text, fontSize: scaleFont(17) }]}>
                  4. Display & Text Sizing (`Aa`)
                </Text>
              </View>
              <Text style={[styles.guideText, { color: colors.textSecondary, fontSize: scaleFont(14) }]}>
                Tap the <Text style={{ fontWeight: '900' }}>Aa 👁️</Text> button in the top right header anytime to:
              </Text>
              <View style={styles.bulletList}>
                <Text style={[styles.bulletItem, { color: colors.text, fontSize: scaleFont(14) }]}>
                  • Switch between <Text style={{ fontWeight: '800' }}>Normal</Text>, <Text style={{ fontWeight: '800' }}>Large</Text>, and <Text style={{ fontWeight: '800' }}>Extra Large</Text> text.
                </Text>
                <Text style={[styles.bulletItem, { color: colors.text, fontSize: scaleFont(14) }]}>
                  • Choose <Text style={{ fontWeight: '800' }}>Warm Cream</Text> to reduce eye strain, or <Text style={{ fontWeight: '800' }}>High-Contrast Dark</Text> for night markets.
                </Text>
              </View>
            </View>

            {/* Done Button */}
            <TouchableOpacity
              onPress={handleClose}
              style={[styles.doneButton, { backgroundColor: colors.primary }]}
              accessibilityRole="button"
              accessibilityLabel="Got it, close help guide"
            >
              <Text style={[styles.doneButtonText, { color: colors.primaryText, fontSize: scaleFont(18) }]}>
                Got it (Close Guide)
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
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
    elevation: 10
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 2
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1.5
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10
  },
  helpIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  headerTitle: {
    fontWeight: '800'
  },
  headerSub: {
    marginTop: 2
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  contentScroll: {
    paddingHorizontal: 16
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 40
  },
  guideCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 16
  },
  guideCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  guideCardTitle: {
    fontWeight: '800'
  },
  guideText: {
    lineHeight: 22,
    marginBottom: 8
  },
  bulletList: {
    gap: 8,
    paddingLeft: 4
  },
  bulletItem: {
    lineHeight: 22
  },
  doneButton: {
    marginTop: 10,
    minHeight: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  doneButtonText: {
    fontWeight: '800'
  }
});
