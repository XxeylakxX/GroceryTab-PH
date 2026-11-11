import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useAppTheme } from '../context/ThemeContext';
import { ThermalReceiptPaper } from '../components/ThermalReceiptPaper';
import { ReceiptItemRow } from '../components/ReceiptItemRow';
import { PRESET_ICONS } from '../services/seedData';
import { formatPHP, parsePHP } from '../utils/currency';

interface ReceiptScreenProps {
  onNavigateToDictionary: () => void;
  onNavigateToHistory: () => void;
}

export const ReceiptScreen: React.FC<ReceiptScreenProps> = ({
  onNavigateToDictionary,
  onNavigateToHistory
}) => {
  const {
    cartItems,
    supplierName,
    setSupplierName,
    removeFromCart,
    incrementCartItem,
    decrementCartItem,
    updateCartItemQty,
    updateCartItemPrice,
    clearCart,
    addToCart,
    totalProcurement,
    cashPaid,
    setCashPaid,
    changeReceived,
    finalizeAndSaveReceipt
  } = useApp();

  const { colors, scaleFont, triggerHapticFeedback } = useAppTheme();

  // Custom Item Modal State
  const [isAddCustomOpen, setIsAddCustomOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customUnit, setCustomUnit] = useState('kg');
  const [customIcon, setCustomIcon] = useState('🛒');

  // Supplier Name Modal State
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [supplierInput, setSupplierInput] = useState(supplierName);

  // Cash Paid Modal State
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [cashInput, setCashInput] = useState('');

  // Clear Procurement Sheet Confirmation
  const handleConfirmClear = () => {
    triggerHapticFeedback('warning');
    Alert.alert(
      'Clear Procurement Sheet?',
      'This will remove all items currently listed on this restock tally. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => clearCart()
        }
      ]
    );
  };

  // Finalize Procurement
  const handleFinalize = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Sheet', 'Please add items to your procurement tally before saving.');
      return;
    }

    try {
      const saved = await finalizeAndSaveReceipt();
      Alert.alert(
        'Procurement Recorded! 📋',
        `Ref #${saved.receiptNumber}\nTotal Cost: ${formatPHP(saved.totalProcurement)}\nSupplier: ${saved.supplierName}\n\nAll updated prices have been remembered in your inventory catalog.`,
        [
          { text: 'Start New Sheet', style: 'cancel' },
          {
            text: 'View in History',
            onPress: () => onNavigateToHistory()
          }
        ]
      );
    } catch {
      Alert.alert('Error', 'Failed to save procurement sheet.');
    }
  };

  // Save Custom Item
  const handleSaveCustomItem = () => {
    const trimmed = customName.trim();
    const price = parsePHP(customPrice);
    if (!trimmed) {
      Alert.alert('Missing Name', 'Please enter an item name.');
      return;
    }
    if (price <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid wholesale unit price in ₱.');
      return;
    }

    addToCart({
      name: trimmed,
      unitPrice: price,
      unit: customUnit.trim() || 'kg',
      icon: customIcon
    });

    setCustomName('');
    setCustomPrice('');
    setCustomUnit('kg');
    setCustomIcon('🛒');
    setIsAddCustomOpen(false);
    triggerHapticFeedback('success');
  };

  // Save Cash Paid
  const handleSaveCash = () => {
    const parsed = parsePHP(cashInput);
    setCashPaid(parsed);
    setIsCashModalOpen(false);
    triggerHapticFeedback('light');
  };

  // Save Supplier Name
  const handleSaveSupplier = () => {
    const trimmed = supplierInput.trim();
    if (trimmed) {
      setSupplierName(trimmed);
    }
    setIsSupplierModalOpen(false);
    triggerHapticFeedback('light');
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Quick Actions Bar */}
        <View style={styles.topActionBar}>
          <TouchableOpacity
            onPress={onNavigateToDictionary}
            style={[styles.actionChip, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
            accessibilityRole="button"
            accessibilityLabel="Pick items from Inventory Catalog"
          >
            <View style={[styles.chipIconBox, { backgroundColor: colors.surfaceHighlight }]}>
              <Ionicons name="apps" size={scaleFont(16)} color={colors.primary} />
            </View>
            <Text style={[styles.actionChipText, { color: colors.text, fontSize: scaleFont(14) }]}>
              Pick from Catalog
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              triggerHapticFeedback('light');
              setIsAddCustomOpen(true);
            }}
            style={[styles.actionChip, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
            accessibilityRole="button"
            accessibilityLabel="Add custom unlisted item"
          >
            <View style={[styles.chipIconBox, { backgroundColor: colors.surfaceHighlight }]}>
              <Ionicons name="add" size={scaleFont(18)} color={colors.text} />
            </View>
            <Text style={[styles.actionChipText, { color: colors.text, fontSize: scaleFont(14) }]}>
              Custom Item
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setSupplierInput(supplierName);
              setIsSupplierModalOpen(true);
            }}
            style={[
              styles.actionChip,
              supplierName
                ? { backgroundColor: colors.primaryLight, borderColor: colors.primary }
                : { backgroundColor: colors.surface, borderColor: colors.cardBorder }
            ]}
            accessibilityRole="button"
            accessibilityLabel="Set Supplier / Market Source"
          >
            <View
              style={[
                styles.chipIconBox,
                { backgroundColor: supplierName ? colors.primary : colors.surfaceHighlight }
              ]}
            >
              <Ionicons
                name="business"
                size={scaleFont(15)}
                color={supplierName ? colors.primaryText : colors.text}
              />
            </View>
            <Text
              style={[
                styles.actionChipText,
                { color: supplierName ? colors.primary : colors.text, fontSize: scaleFont(14) }
              ]}
            >
              {supplierName ? supplierName : '+ Supplier'}
            </Text>
          </TouchableOpacity>

          {cartItems.length > 0 && (
            <TouchableOpacity
              onPress={handleConfirmClear}
              style={[styles.actionChip, { backgroundColor: colors.dangerSurface, borderColor: colors.danger }]}
              accessibilityRole="button"
              accessibilityLabel="Clear current procurement sheet"
            >
              <View style={[styles.chipIconBox, { backgroundColor: 'rgba(220, 38, 38, 0.15)' }]}>
                <Ionicons name="trash-outline" size={scaleFont(16)} color={colors.danger} />
              </View>
              <Text style={[styles.actionChipText, { color: colors.danger, fontSize: scaleFont(14) }]}>
                Clear
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Thermal Procurement Paper */}
        <ThermalReceiptPaper
          receiptNumber="ACTIVE TALLY"
          supplierName={supplierName}
        >
          {cartItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconCircle, { backgroundColor: colors.surfaceHighlight, borderColor: colors.borderSubtle }]}>
                <Text style={{ fontSize: scaleFont(44) }}>🧺</Text>
              </View>
              <Text style={[styles.emptyTitle, { color: colors.receiptText, fontSize: scaleFont(20) }]}>
                No Items on Procurement Sheet
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.receiptSubtext, fontSize: scaleFont(14) }]}>
                Pick vegetable staples from your inventory catalog, or tap "+ Custom Item" above to add new restock stock.
              </Text>

              <TouchableOpacity
                onPress={onNavigateToDictionary}
                style={[styles.browseButton, { backgroundColor: colors.primary }]}
                accessibilityRole="button"
                accessibilityLabel="Open Inventory Catalog"
              >
                <Text style={[styles.browseButtonText, { color: colors.primaryText, fontSize: scaleFont(15) }]}>
                  Browse Inventory Catalog
                </Text>
                <View style={styles.browseIconCircle}>
                  <Ionicons name="arrow-forward" size={scaleFont(16)} color={colors.primaryText} />
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              {/* Column Headers */}
              <View style={[styles.tableHeader, { borderBottomColor: colors.receiptBorder }]}>
                <Text style={[styles.colHeader, { color: colors.receiptSubtext, fontSize: scaleFont(12), flex: 2.2 }]}>
                  ITEM & SPECIFICATION
                </Text>
                <Text
                  style={[
                    styles.colHeader,
                    { color: colors.receiptSubtext, fontSize: scaleFont(12), flex: 1.3, textAlign: 'right' }
                  ]}
                >
                  COST (₱)
                </Text>
              </View>

              {/* Item Rows with Visual Icons and Steppers */}
              {cartItems.map(item => (
                <ReceiptItemRow
                  key={item.id}
                  item={item}
                  onIncrement={() => incrementCartItem(item.id)}
                  onDecrement={() => decrementCartItem(item.id)}
                  onRemove={() => removeFromCart(item.id)}
                  onUpdateQty={qty => updateCartItemQty(item.id, qty)}
                  onUpdatePrice={price => updateCartItemPrice(item.id, price)}
                />
              ))}

              {/* Calculations Section (NO DISCOUNTS) */}
              <View style={styles.summarySection}>
                {/* Total Procurement Cost Ledger Row */}
                <View style={[styles.finalTotalRow, { backgroundColor: colors.surfaceHighlight, borderColor: colors.borderSubtle }]}>
                  <View>
                    <Text style={[styles.finalTotalLabel, { color: colors.receiptText, fontSize: scaleFont(16) }]}>
                      TOTAL PROCUREMENT:
                    </Text>
                    <Text style={[styles.finalTotalSub, { color: colors.receiptSubtext, fontSize: scaleFont(12) }]}>
                      {cartItems.length} {cartItems.length === 1 ? 'item line' : 'item lines to restock'}
                    </Text>
                  </View>
                  <Text style={[styles.finalTotalAmount, { color: colors.receiptText, fontSize: scaleFont(26) }]}>
                    {formatPHP(totalProcurement)}
                  </Text>
                </View>

                {/* Cash Paid to Supplier & Change Calculator */}
                <View style={[styles.cashCalculatorCard, { backgroundColor: colors.cardInner, borderColor: colors.cardBorder }]}>
                  <View style={styles.cashHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cashCardTitle, { color: colors.text, fontSize: scaleFont(14) }]}>
                        CASH PAID & CHANGE (SUKLI)
                      </Text>
                      <Text style={[styles.cashCardSub, { color: colors.textMuted, fontSize: scaleFont(12) }]}>
                        Calculate cash handed to bagsakan wholesaler
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        triggerHapticFeedback('light');
                        setCashInput(cashPaid > 0 ? cashPaid.toString() : '');
                        setIsCashModalOpen(true);
                      }}
                      style={[styles.enterCashBtn, { backgroundColor: colors.primary }]}
                      accessibilityRole="button"
                      accessibilityLabel="Enter cash handed to supplier"
                    >
                      <Ionicons name="cash-outline" size={scaleFont(15)} color={colors.primaryText} style={{ marginRight: 4 }} />
                      <Text style={[styles.enterCashBtnText, { color: colors.primaryText, fontSize: scaleFont(13) }]}>
                        {cashPaid > 0 ? 'Edit Cash' : '+ Enter Cash'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {cashPaid > 0 && (
                    <View style={styles.cashBreakdown}>
                      <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: colors.textSecondary, fontSize: scaleFont(14) }]}>
                          Cash Handed to Supplier:
                        </Text>
                        <Text style={[styles.summaryValue, { color: colors.text, fontSize: scaleFont(16) }]}>
                          {formatPHP(cashPaid)}
                        </Text>
                      </View>

                      <View style={styles.summaryRow}>
                        <Text
                          style={[
                            styles.summaryLabel,
                            {
                              color: cashPaid >= totalProcurement ? colors.success : colors.danger,
                              fontSize: scaleFont(16),
                              fontWeight: '800'
                            }
                          ]}
                        >
                          {cashPaid >= totalProcurement ? 'Change (Sukli) Due:' : 'Short by (Kulang):'}
                        </Text>
                        <Text
                          style={[
                            styles.summaryValue,
                            {
                              color: cashPaid >= totalProcurement ? colors.success : colors.danger,
                              fontSize: scaleFont(20),
                              fontWeight: '900'
                            }
                          ]}
                        >
                          {cashPaid >= totalProcurement
                            ? formatPHP(changeReceived)
                            : formatPHP(totalProcurement - cashPaid)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}
        </ThermalReceiptPaper>

        {/* Primary Action Button: Save & Finalize */}
        {cartItems.length > 0 && (
          <View style={styles.bottomButtonsContainer}>
            <TouchableOpacity
              onPress={handleFinalize}
              style={[
                styles.finalizeButton,
                {
                  backgroundColor: colors.primary,
                  borderColor: colors.cardBorder,
                  shadowColor: colors.shadowColor
                }
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Save and record procurement. Total: ${formatPHP(totalProcurement)}`}
            >
              <View style={styles.finalizeTextCol}>
                <Text style={[styles.finalizeButtonText, { color: colors.primaryText, fontSize: scaleFont(18) }]}>
                  Save & Record Procurement
                </Text>
                <Text style={[styles.finalizeSubtext, { color: colors.primaryText, fontSize: scaleFont(12) }]}>
                  Total Cost: {formatPHP(totalProcurement)} • Remembers Latest Prices
                </Text>
              </View>
              <View style={[styles.finalizeIconBubble, { backgroundColor: 'rgba(255,255,255,0.22)' }]}>
                <Ionicons name="checkmark-sharp" size={scaleFont(22)} color={colors.primaryText} />
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Add Custom Item Modal */}
      <Modal
        visible={isAddCustomOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsAddCustomOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setIsAddCustomOpen(false)} />
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={[styles.modalTitle, { color: colors.text, fontSize: scaleFont(19) }]}>
                Add Custom Procurement Item
              </Text>
              <Text style={[styles.modalSub, { color: colors.textSecondary, fontSize: scaleFont(14) }]}>
                Add a quick restock item not in your inventory catalog
              </Text>

              {/* Icon Picker Row */}
              <Text style={[styles.inputLabel, { color: colors.text, fontSize: scaleFont(14) }]}>
                Choose Picture / Icon:
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScrollRow}>
                {PRESET_ICONS.slice(0, 16).map(icon => (
                  <TouchableOpacity
                    key={icon}
                    onPress={() => setCustomIcon(icon)}
                    style={[
                      styles.iconPickTile,
                      {
                        backgroundColor: customIcon === icon ? colors.primary : colors.card,
                        borderColor: customIcon === icon ? colors.primary : colors.border
                      }
                    ]}
                  >
                    <Text style={{ fontSize: 24 }}>{icon}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text, fontSize: scaleFont(14) }]}>
                  Item Name:
                </Text>
                <TextInput
                  value={customName}
                  onChangeText={setCustomName}
                  placeholder="e.g. Sayote or Ampalaya"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.modalInput,
                    { backgroundColor: colors.card, color: colors.text, borderColor: colors.border, fontSize: scaleFont(16) }
                  ]}
                  autoFocus
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text, fontSize: scaleFont(14) }]}>
                  Wholesale Price in ₱:
                </Text>
                <TextInput
                  value={customPrice}
                  onChangeText={setCustomPrice}
                  placeholder="e.g. 60.00"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="decimal-pad"
                  style={[
                    styles.modalInput,
                    { backgroundColor: colors.card, color: colors.text, borderColor: colors.border, fontSize: scaleFont(16) }
                  ]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text, fontSize: scaleFont(14) }]}>
                  Unit (kg, tray, sack, box, pc):
                </Text>
                <TextInput
                  value={customUnit}
                  onChangeText={setCustomUnit}
                  placeholder="e.g. kg or sack"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.modalInput,
                    { backgroundColor: colors.card, color: colors.text, borderColor: colors.border, fontSize: scaleFont(16) }
                  ]}
                />
              </View>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  onPress={() => setIsAddCustomOpen(false)}
                  style={[styles.modalActionBtn, styles.modalCancelBtn, { borderColor: colors.border }]}
                >
                  <Text style={[styles.modalCancelText, { color: colors.text, fontSize: scaleFont(16) }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveCustomItem}
                  style={[styles.modalActionBtn, { backgroundColor: colors.primary }]}
                >
                  <Text style={[styles.modalSaveText, { color: colors.primaryText, fontSize: scaleFont(16) }]}>
                    Add to Sheet
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Supplier Name Modal */}
      <Modal
        visible={isSupplierModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsSupplierModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setIsSupplierModalOpen(false)} />
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={[styles.modalTitle, { color: colors.text, fontSize: scaleFont(19) }]}>
                Set Supplier / Market Source
              </Text>
              <Text style={[styles.modalSub, { color: colors.textSecondary, fontSize: scaleFont(14) }]}>
                Name of wholesale bagsakan or vendor
              </Text>

              <View style={styles.inputGroup}>
                <TextInput
                  value={supplierInput}
                  onChangeText={setSupplierInput}
                  placeholder="e.g. Divisoria, Balintawak, or Suki Farm"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.modalInput,
                    { backgroundColor: colors.card, color: colors.text, borderColor: colors.border, fontSize: scaleFont(16) }
                  ]}
                  autoFocus
                />
              </View>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  onPress={() => setIsSupplierModalOpen(false)}
                  style={[styles.modalActionBtn, styles.modalCancelBtn, { borderColor: colors.border }]}
                >
                  <Text style={[styles.modalCancelText, { color: colors.text, fontSize: scaleFont(16) }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveSupplier}
                  style={[styles.modalActionBtn, { backgroundColor: colors.primary }]}
                >
                  <Text style={[styles.modalSaveText, { color: colors.primaryText, fontSize: scaleFont(16) }]}>
                    Save Supplier
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Cash Paid Modal */}
      <Modal
        visible={isCashModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsCashModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setIsCashModalOpen(false)} />
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={[styles.modalTitle, { color: colors.text, fontSize: scaleFont(19) }]}>
                Cash Handed to Supplier
              </Text>
              <Text style={[styles.modalSub, { color: colors.textSecondary, fontSize: scaleFont(14) }]}>
                Total Procurement: {formatPHP(totalProcurement)}
              </Text>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text, fontSize: scaleFont(14) }]}>
                  Cash amount in ₱:
                </Text>
                <TextInput
                  value={cashInput}
                  onChangeText={setCashInput}
                  placeholder="e.g. 5000 or 10000"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="decimal-pad"
                  style={[
                    styles.modalInput,
                    { backgroundColor: colors.card, color: colors.text, borderColor: colors.border, fontSize: scaleFont(18) }
                  ]}
                  autoFocus
                />
              </View>

              <Text style={[styles.quickBillLabel, { color: colors.textMuted, fontSize: scaleFont(13) }]}>
                Quick Philippine Banknotes:
              </Text>
              <View style={styles.quickBillsGrid}>
                {[500, 1000, 2000, 5000].map(bill => {
                  const isSelected = cashInput === bill.toString();
                  return (
                    <TouchableOpacity
                      key={bill}
                      onPress={() => {
                        triggerHapticFeedback('light');
                        setCashInput(bill.toString());
                      }}
                      style={[
                        styles.quickBillBtn,
                        isSelected
                          ? { backgroundColor: colors.primaryLight, borderColor: colors.primary }
                          : { backgroundColor: colors.surfaceHighlight, borderColor: colors.borderSubtle }
                      ]}
                    >
                      <Text
                        style={[
                          styles.quickBillBtnText,
                          { color: isSelected ? colors.primary : colors.text, fontSize: scaleFont(14) }
                        ]}
                      >
                        ₱{bill.toLocaleString()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  onPress={() => setIsCashModalOpen(false)}
                  style={[styles.modalActionBtn, styles.modalCancelBtn, { borderColor: colors.border }]}
                >
                  <Text style={[styles.modalCancelText, { color: colors.text, fontSize: scaleFont(16) }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveCash}
                  style={[styles.modalActionBtn, { backgroundColor: colors.primary }]}
                >
                  <Text style={[styles.modalSaveText, { color: colors.primaryText, fontSize: scaleFont(16) }]}>
                    Calculate
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 50 },
  topActionBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    minHeight: 48
  },
  chipIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  actionChipText: {
    fontWeight: '800'
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  emptyTitle: {
    fontWeight: '900',
    marginTop: 4
  },
  emptySubtitle: {
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 12,
    paddingLeft: 20,
    paddingRight: 14,
    borderRadius: 16,
    minHeight: 52,
    gap: 10
  },
  browseButtonText: {
    fontWeight: '800'
  },
  browseIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1.5,
    marginBottom: 6
  },
  colHeader: {
    fontWeight: '800',
    letterSpacing: 0.5
  },
  summarySection: {
    marginTop: 14,
    paddingTop: 6
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    rowGap: 4,
    paddingVertical: 6
  },
  summaryLabel: {
    fontWeight: '600',
    flexShrink: 1
  },
  summaryValue: {
    fontWeight: '700'
  },
  finalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    rowGap: 6,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5
  },
  finalTotalLabel: {
    fontWeight: '900',
    letterSpacing: 0.5
  },
  finalTotalSub: {
    fontWeight: '600',
    marginTop: 2
  },
  finalTotalAmount: {
    fontWeight: '900'
  },
  cashCalculatorCard: {
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14
  },
  cashHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    rowGap: 8
  },
  cashCardTitle: {
    fontWeight: '900',
    letterSpacing: 0.5
  },
  cashCardSub: {
    marginTop: 2
  },
  enterCashBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    minHeight: 46,
    justifyContent: 'center'
  },
  enterCashBtnText: {
    fontWeight: '800'
  },
  cashBreakdown: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)'
  },
  bottomButtonsContainer: {
    paddingHorizontal: 16,
    marginTop: 14
  },
  finalizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    rowGap: 6,
    paddingVertical: 14,
    paddingLeft: 20,
    paddingRight: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    minHeight: 68,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  finalizeTextCol: {
    flex: 1,
    minWidth: 180
  },
  finalizeIconBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  finalizeButtonText: {
    fontWeight: '900'
  },
  finalizeSubtext: {
    marginTop: 2,
    opacity: 0.95
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    padding: 16
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 20
  },
  modalTitle: {
    fontWeight: '800'
  },
  modalSub: {
    marginTop: 4,
    marginBottom: 14
  },
  iconScrollRow: {
    flexDirection: 'row',
    marginBottom: 14
  },
  iconPickTile: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  inputGroup: {
    marginBottom: 14
  },
  inputLabel: {
    fontWeight: '700',
    marginBottom: 6
  },
  modalInput: {
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 14,
    minHeight: 52,
    fontWeight: '700'
  },
  modalBtnRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 14
  },
  modalActionBtn: {
    flex: 1,
    minWidth: 120,
    minHeight: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalCancelBtn: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalCancelText: {
    fontWeight: '700'
  },
  modalSaveText: {
    fontWeight: '800'
  },
  quickBillLabel: {
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 8
  },
  quickBillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14
  },
  quickBillBtn: {
    flex: 1,
    minWidth: 70,
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  quickBillBtnText: {
    fontWeight: '800'
  }
});
