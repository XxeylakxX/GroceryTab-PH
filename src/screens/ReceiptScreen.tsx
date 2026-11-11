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

// Quick cash bill presets common in Philippine wet markets
const PHILIPPINE_BILLS = [100, 200, 500, 1000, 2000, 5000];

// Common palengke source suggestions
const MARKET_SOURCES = [
  'Divisoria Bagsakan',
  'Balintawak Cloverleaf',
  'Mega Q-Mart',
  'La Trinidad Trucking',
  'Local Farmer Direct'
];

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
      triggerHapticFeedback('success');
      Alert.alert(
        'Procurement Recorded! 📋',
        `Ref #${saved.receiptNumber}\nTotal Cost: ${formatPHP(saved.totalProcurement)}${saved.supplierName ? `\nSupplier: ${saved.supplierName}` : ''}\n\nAll updated prices have been remembered in your inventory catalog.`,
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

  // Preset cash quick click
  const handleSelectCashPreset = (amount: number) => {
    triggerHapticFeedback('light');
    setCashInput(amount.toString());
  };

  // Save Supplier Name
  const handleSaveSupplier = () => {
    const trimmed = supplierInput.trim();
    setSupplierName(trimmed);
    setIsSupplierModalOpen(false);
    triggerHapticFeedback('light');
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* iOS Inset Grouped Quick Actions Strip */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            onPress={() => {
              triggerHapticFeedback('light');
              onNavigateToDictionary();
            }}
            style={[
              styles.quickActionCard,
              { backgroundColor: colors.surface, borderColor: colors.cardBorder }
            ]}
            accessibilityRole="button"
            accessibilityLabel="Pick items from Inventory Catalog"
          >
            <View style={[styles.actionIconBubble, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="apps" size={scaleFont(18)} color={colors.primary} />
            </View>
            <View style={styles.actionTextCol}>
              <Text style={[styles.actionTitle, { color: colors.text, fontSize: scaleFont(14) }]}>
                Pick from Catalog
              </Text>
              <Text style={[styles.actionSub, { color: colors.textSecondary, fontSize: scaleFont(11) }]}>
                Browse vegetables with pictures
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={scaleFont(16)} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.actionRowTwoCol}>
            <TouchableOpacity
              onPress={() => {
                triggerHapticFeedback('light');
                setIsAddCustomOpen(true);
              }}
              style={[
                styles.halfActionCard,
                { backgroundColor: colors.surface, borderColor: colors.cardBorder }
              ]}
              accessibilityRole="button"
              accessibilityLabel="Add custom unlisted item"
            >
              <View style={[styles.halfIconBubble, { backgroundColor: colors.surfaceHighlight }]}>
                <Ionicons name="add-circle" size={scaleFont(18)} color={colors.primary} />
              </View>
              <Text style={[styles.halfActionTitle, { color: colors.text, fontSize: scaleFont(13) }]}>
                + Custom Item
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                triggerHapticFeedback('light');
                setSupplierInput(supplierName);
                setIsSupplierModalOpen(true);
              }}
              style={[
                styles.halfActionCard,
                supplierName
                  ? { backgroundColor: colors.primaryLight, borderColor: colors.primary }
                  : { backgroundColor: colors.surface, borderColor: colors.cardBorder }
              ]}
              accessibilityRole="button"
              accessibilityLabel="Set Supplier or Market Source"
            >
              <View
                style={[
                  styles.halfIconBubble,
                  { backgroundColor: supplierName ? colors.primary : colors.surfaceHighlight }
                ]}
              >
                <Ionicons
                  name="business"
                  size={scaleFont(16)}
                  color={supplierName ? colors.primaryText : colors.text}
                />
              </View>
              <Text
                style={[
                  styles.halfActionTitle,
                  { color: supplierName ? colors.primary : colors.text, fontSize: scaleFont(13) }
                ]}
                numberOfLines={1}
              >
                {supplierName ? supplierName : '+ Supplier'}
              </Text>
            </TouchableOpacity>
          </View>

          {cartItems.length > 0 && (
            <View style={styles.clearRowContainer}>
              <TouchableOpacity
                onPress={handleConfirmClear}
                style={[styles.clearSheetBtn, { backgroundColor: colors.dangerSurface, borderColor: colors.danger }]}
                accessibilityRole="button"
                accessibilityLabel="Clear current procurement sheet"
              >
                <Ionicons name="trash-outline" size={scaleFont(15)} color={colors.danger} style={{ marginRight: 6 }} />
                <Text style={[styles.clearSheetText, { color: colors.danger, fontSize: scaleFont(13) }]}>
                  Clear Procurement Sheet ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                </Text>
              </TouchableOpacity>
            </View>
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
                <Text style={{ fontSize: scaleFont(42) }}>🧺</Text>
              </View>
              <Text style={[styles.emptyTitle, { color: colors.receiptText, fontSize: scaleFont(20) }]}>
                No Items on Sheet
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.receiptSubtext, fontSize: scaleFont(14) }]}>
                Add vegetable staples from your inventory catalog or add a custom restock item above.
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
                <Text style={[styles.colHeader, { color: colors.receiptSubtext, fontSize: scaleFont(11), flex: 2.2 }]}>
                  ITEM & SPECIFICATION
                </Text>
                <Text
                  style={[
                    styles.colHeader,
                    { color: colors.receiptSubtext, fontSize: scaleFont(11), flex: 1.3, textAlign: 'right' }
                  ]}
                >
                  COST (₱)
                </Text>
              </View>

              {/* Item Rows */}
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

              {/* Ledger Summary */}
              <View style={styles.summarySection}>
                {/* Total Procurement Cost */}
                <View style={[styles.finalTotalRow, { backgroundColor: colors.surfaceHighlight, borderColor: colors.borderSubtle }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.finalTotalLabel, { color: colors.receiptText, fontSize: scaleFont(15) }]}>
                      TOTAL PROCUREMENT:
                    </Text>
                    <Text style={[styles.finalTotalSub, { color: colors.receiptSubtext, fontSize: scaleFont(12) }]}>
                      {cartItems.length} {cartItems.length === 1 ? 'item line' : 'item lines to restock'}
                    </Text>
                  </View>
                  <Text style={[styles.finalTotalAmount, { color: colors.receiptText, fontSize: scaleFont(24) }]}>
                    {formatPHP(totalProcurement)}
                  </Text>
                </View>

                {/* Cash Paid to Supplier & Change (Sukli) Calculator */}
                <View style={[styles.cashCalculatorCard, { backgroundColor: colors.cardInner, borderColor: colors.cardBorder }]}>
                  <View style={styles.cashHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cashCardTitle, { color: colors.text, fontSize: scaleFont(13) }]}>
                        CASH PAID & CHANGE (SUKLI)
                      </Text>
                      <Text style={[styles.cashCardSub, { color: colors.textMuted, fontSize: scaleFont(11) }]}>
                        Track cash handed to wholesaler
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
                        <Text style={[styles.summaryLabel, { color: colors.textSecondary, fontSize: scaleFont(13) }]}>
                          Cash Handed:
                        </Text>
                        <Text style={[styles.summaryValue, { color: colors.text, fontSize: scaleFont(15) }]}>
                          {formatPHP(cashPaid)}
                        </Text>
                      </View>

                      <View style={styles.summaryRow}>
                        <Text
                          style={[
                            styles.summaryLabel,
                            {
                              color: cashPaid >= totalProcurement ? colors.success : colors.danger,
                              fontSize: scaleFont(15),
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
                              fontSize: scaleFont(19),
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
              activeOpacity={0.85}
            >
              <View style={styles.finalizeTextCol}>
                <Text style={[styles.finalizeButtonText, { color: colors.primaryText, fontSize: scaleFont(17) }]}>
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

      {/* ==================================================================== */}
      {/* NATIVE iOS FORM SHEET: Add Custom Item */}
      {/* ==================================================================== */}
      <Modal
        visible={isAddCustomOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsAddCustomOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.sheetOverlay}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
          <Pressable style={styles.sheetBackdrop} onPress={() => setIsAddCustomOpen(false)} />
          <View style={[styles.sheetCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
            {/* Grabber Drag Handle */}
            <View style={styles.sheetGrabberContainer}>
              <View style={[styles.sheetGrabber, { backgroundColor: colors.borderSubtle }]} />
            </View>

            {/* iOS Navigation Header (Cancel - Title - Add) */}
            <View style={[styles.sheetNavBar, { borderBottomColor: colors.borderSubtle }]}>
              <TouchableOpacity
                onPress={() => setIsAddCustomOpen(false)}
                style={styles.sheetNavBtn}
                accessibilityRole="button"
                accessibilityLabel="Cancel adding custom item"
              >
                <Text style={[styles.sheetNavBtnText, { color: colors.textSecondary, fontSize: scaleFont(16) }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text style={[styles.sheetNavTitle, { color: colors.text, fontSize: scaleFont(17) }]}>
                Custom Item
              </Text>
              <TouchableOpacity
                onPress={handleSaveCustomItem}
                style={styles.sheetNavBtn}
                accessibilityRole="button"
                accessibilityLabel="Add custom item to procurement sheet"
              >
                <Text style={[styles.sheetNavBtnBold, { color: colors.primary, fontSize: scaleFont(16) }]}>
                  Add
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.sheetContentContainer}
            >
              <Text style={[styles.sheetSectionTitle, { color: colors.textSecondary, fontSize: scaleFont(12) }]}>
                ITEM DETAILS
              </Text>

              {/* Inset Grouped Form Container */}
              <View style={[styles.insetGroupedCard, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
                {/* Item Name */}
                <View style={[styles.formRow, { borderBottomColor: colors.borderSubtle }]}>
                  <Text style={[styles.formRowLabel, { color: colors.text, fontSize: scaleFont(15) }]}>
                    Name
                  </Text>
                  <TextInput
                    value={customName}
                    onChangeText={setCustomName}
                    placeholder="e.g. Siling Labuyo"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.formRowInput, { color: colors.text, fontSize: scaleFont(15) }]}
                  />
                </View>

                {/* Unit Price */}
                <View style={[styles.formRow, { borderBottomColor: colors.borderSubtle }]}>
                  <Text style={[styles.formRowLabel, { color: colors.text, fontSize: scaleFont(15) }]}>
                    Price (₱)
                  </Text>
                  <TextInput
                    value={customPrice}
                    onChangeText={setCustomPrice}
                    placeholder="0.00"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="decimal-pad"
                    style={[styles.formRowInput, { color: colors.text, fontSize: scaleFont(15) }]}
                  />
                </View>

                {/* Unit */}
                <View style={styles.formRow}>
                  <Text style={[styles.formRowLabel, { color: colors.text, fontSize: scaleFont(15) }]}>
                    Unit
                  </Text>
                  <TextInput
                    value={customUnit}
                    onChangeText={setCustomUnit}
                    placeholder="kg, bundle, tali"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.formRowInput, { color: colors.text, fontSize: scaleFont(15) }]}
                  />
                </View>
              </View>

              {/* Emoji Icon Picker */}
              <Text style={[styles.sheetSectionTitle, { color: colors.textSecondary, fontSize: scaleFont(12), marginTop: 16 }]}>
                ICON EMOJI
              </Text>
              <View style={[styles.insetGroupedCard, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
                <View style={styles.iconGrid}>
                  {PRESET_ICONS.slice(0, 16).map((icon, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => {
                        triggerHapticFeedback('light');
                        setCustomIcon(icon);
                      }}
                      style={[
                        styles.iconTile,
                        customIcon === icon && [styles.iconTileSelected, { borderColor: colors.primary, backgroundColor: colors.primaryLight }]
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Select icon ${icon}`}
                    >
                      <Text style={{ fontSize: scaleFont(22) }}>{icon}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ==================================================================== */}
      {/* NATIVE iOS FORM SHEET: Supplier Name */}
      {/* ==================================================================== */}
      <Modal
        visible={isSupplierModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsSupplierModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.sheetOverlay}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
          <Pressable style={styles.sheetBackdrop} onPress={() => setIsSupplierModalOpen(false)} />
          <View style={[styles.sheetCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
            {/* Grabber */}
            <View style={styles.sheetGrabberContainer}>
              <View style={[styles.sheetGrabber, { backgroundColor: colors.borderSubtle }]} />
            </View>

            {/* iOS Nav Header */}
            <View style={[styles.sheetNavBar, { borderBottomColor: colors.borderSubtle }]}>
              <TouchableOpacity
                onPress={() => setIsSupplierModalOpen(false)}
                style={styles.sheetNavBtn}
                accessibilityRole="button"
                accessibilityLabel="Cancel setting supplier"
              >
                <Text style={[styles.sheetNavBtnText, { color: colors.textSecondary, fontSize: scaleFont(16) }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text style={[styles.sheetNavTitle, { color: colors.text, fontSize: scaleFont(17) }]}>
                Supplier / Source
              </Text>
              <TouchableOpacity
                onPress={handleSaveSupplier}
                style={styles.sheetNavBtn}
                accessibilityRole="button"
                accessibilityLabel="Done setting supplier"
              >
                <Text style={[styles.sheetNavBtnBold, { color: colors.primary, fontSize: scaleFont(16) }]}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.sheetContentContainer}
            >
              <Text style={[styles.sheetSectionTitle, { color: colors.textSecondary, fontSize: scaleFont(12) }]}>
                SUPPLIER OR MARKET SOURCE
              </Text>

              <View style={[styles.insetGroupedCard, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
                <View style={styles.formRow}>
                  <Text style={[styles.formRowLabel, { color: colors.text, fontSize: scaleFont(15) }]}>
                    Name
                  </Text>
                  <TextInput
                    value={supplierInput}
                    onChangeText={setSupplierInput}
                    placeholder="e.g. Divisoria Bagsakan #4"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.formRowInput, { color: colors.text, fontSize: scaleFont(15) }]}
                    autoFocus
                  />
                  {supplierInput.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setSupplierInput('')}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Quick suggestions */}
              <Text style={[styles.sheetSectionTitle, { color: colors.textSecondary, fontSize: scaleFont(12), marginTop: 16 }]}>
                COMMON SOURCES
              </Text>
              <View style={styles.chipCluster}>
                {MARKET_SOURCES.map((src, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      triggerHapticFeedback('light');
                      setSupplierInput(src);
                    }}
                    style={[
                      styles.sourceChip,
                      {
                        backgroundColor: supplierInput === src ? colors.primaryLight : colors.card,
                        borderColor: supplierInput === src ? colors.primary : colors.cardBorder
                      }
                    ]}
                  >
                    <Text
                      style={[
                        styles.sourceChipText,
                        {
                          color: supplierInput === src ? colors.primary : colors.text,
                          fontSize: scaleFont(13)
                        }
                      ]}
                    >
                      {src}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {supplierName ? (
                <TouchableOpacity
                  onPress={() => {
                    setSupplierName('');
                    setSupplierInput('');
                    setIsSupplierModalOpen(false);
                  }}
                  style={[styles.removeSupplierBtn, { backgroundColor: colors.dangerSurface, borderColor: colors.danger }]}
                >
                  <Ionicons name="trash-outline" size={scaleFont(15)} color={colors.danger} style={{ marginRight: 6 }} />
                  <Text style={[styles.removeSupplierText, { color: colors.danger, fontSize: scaleFont(13) }]}>
                    Clear Supplier (Leave Blank)
                  </Text>
                </TouchableOpacity>
              ) : null}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ==================================================================== */}
      {/* NATIVE iOS FORM SHEET: Cash Handed & Sukli */}
      {/* ==================================================================== */}
      <Modal
        visible={isCashModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsCashModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.sheetOverlay}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
          <Pressable style={styles.sheetBackdrop} onPress={() => setIsCashModalOpen(false)} />
          <View style={[styles.sheetCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
            {/* Grabber */}
            <View style={styles.sheetGrabberContainer}>
              <View style={[styles.sheetGrabber, { backgroundColor: colors.borderSubtle }]} />
            </View>

            {/* iOS Nav Header */}
            <View style={[styles.sheetNavBar, { borderBottomColor: colors.borderSubtle }]}>
              <TouchableOpacity
                onPress={() => setIsCashModalOpen(false)}
                style={styles.sheetNavBtn}
                accessibilityRole="button"
                accessibilityLabel="Cancel cash entry"
              >
                <Text style={[styles.sheetNavBtnText, { color: colors.textSecondary, fontSize: scaleFont(16) }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text style={[styles.sheetNavTitle, { color: colors.text, fontSize: scaleFont(17) }]}>
                Cash & Sukli
              </Text>
              <TouchableOpacity
                onPress={handleSaveCash}
                style={styles.sheetNavBtn}
                accessibilityRole="button"
                accessibilityLabel="Done entering cash"
              >
                <Text style={[styles.sheetNavBtnBold, { color: colors.primary, fontSize: scaleFont(16) }]}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.sheetContentContainer}
            >
              {/* Due notice */}
              <View style={[styles.dueNoticeBox, { backgroundColor: colors.surfaceHighlight, borderColor: colors.borderSubtle }]}>
                <Text style={[styles.dueNoticeLabel, { color: colors.textSecondary, fontSize: scaleFont(12) }]}>
                  TOTAL PROCUREMENT COST DUE:
                </Text>
                <Text style={[styles.dueNoticeAmount, { color: colors.text, fontSize: scaleFont(22) }]}>
                  {formatPHP(totalProcurement)}
                </Text>
              </View>

              <Text style={[styles.sheetSectionTitle, { color: colors.textSecondary, fontSize: scaleFont(12), marginTop: 12 }]}>
                CASH HANDED (₱)
              </Text>
              <View style={[styles.insetGroupedCard, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
                <View style={styles.formRow}>
                  <Text style={[styles.formRowLabel, { color: colors.text, fontSize: scaleFont(15) }]}>
                    ₱ Amount
                  </Text>
                  <TextInput
                    value={cashInput}
                    onChangeText={setCashInput}
                    placeholder="e.g. 2000"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    style={[styles.formRowInput, { color: colors.text, fontSize: scaleFont(17), fontWeight: '700' }]}
                    autoFocus
                  />
                  {cashInput.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setCashInput('')}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Philippine Banknote Presets */}
              <Text style={[styles.sheetSectionTitle, { color: colors.textSecondary, fontSize: scaleFont(12), marginTop: 16 }]}>
                TAP PHILIPPINE BANKNOTE
              </Text>
              <View style={styles.billGrid}>
                {PHILIPPINE_BILLS.map(bill => (
                  <TouchableOpacity
                    key={bill}
                    onPress={() => handleSelectCashPreset(bill)}
                    style={[
                      styles.billChip,
                      {
                        backgroundColor: cashInput === bill.toString() ? colors.primaryLight : colors.card,
                        borderColor: cashInput === bill.toString() ? colors.primary : colors.cardBorder
                      }
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ₱${bill.toLocaleString()} banknote`}
                  >
                    <Text
                      style={[
                        styles.billChipText,
                        {
                          color: cashInput === bill.toString() ? colors.primary : colors.text,
                          fontSize: scaleFont(14)
                        }
                      ]}
                    >
                      ₱{bill.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Exact amount button */}
              <TouchableOpacity
                onPress={() => {
                  triggerHapticFeedback('light');
                  setCashInput(totalProcurement.toString());
                }}
                style={[styles.exactAmountBtn, { backgroundColor: colors.surfaceHighlight, borderColor: colors.borderSubtle }]}
              >
                <Ionicons name="checkmark-circle-outline" size={scaleFont(16)} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.exactAmountText, { color: colors.primary, fontSize: scaleFont(13) }]}>
                  Exact Amount ({formatPHP(totalProcurement)})
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 36
  },
  quickActionsContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12
  },
  actionIconBubble: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionTextCol: {
    flex: 1
  },
  actionTitle: {
    fontWeight: '800'
  },
  actionSub: {
    fontWeight: '500',
    marginTop: 1
  },
  actionRowTwoCol: {
    flexDirection: 'row',
    gap: 8
  },
  halfActionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    minHeight: 48
  },
  halfIconBubble: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  halfActionTitle: {
    fontWeight: '700',
    flexShrink: 1
  },
  clearRowContainer: {
    marginTop: 2
  },
  clearSheetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 44
  },
  clearSheetText: {
    fontWeight: '700'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  emptyTitle: {
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6
  },
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 10,
    minHeight: 48
  },
  browseButtonText: {
    fontWeight: '800'
  },
  browseIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    marginBottom: 8
  },
  colHeader: {
    fontWeight: '800',
    letterSpacing: 0.5
  },
  summarySection: {
    marginTop: 14,
    gap: 10
  },
  finalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1
  },
  finalTotalLabel: {
    fontWeight: '900',
    letterSpacing: 0.3
  },
  finalTotalSub: {
    fontWeight: '500',
    marginTop: 2
  },
  finalTotalAmount: {
    fontWeight: '900'
  },
  cashCalculatorCard: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1
  },
  cashHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8
  },
  cashCardTitle: {
    fontWeight: '800',
    letterSpacing: 0.3
  },
  cashCardSub: {
    fontWeight: '500',
    marginTop: 1
  },
  enterCashBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    minHeight: 40
  },
  enterCashBtnText: {
    fontWeight: '800'
  },
  cashBreakdown: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
    gap: 6
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  summaryLabel: {
    fontWeight: '600'
  },
  summaryValue: {
    fontWeight: '700'
  },
  bottomButtonsContainer: {
    paddingHorizontal: 16,
    marginTop: 16
  },
  finalizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4
  },
  finalizeTextCol: {
    flex: 1
  },
  finalizeButtonText: {
    fontWeight: '900',
    letterSpacing: -0.2
  },
  finalizeSubtext: {
    fontWeight: '600',
    marginTop: 3,
    opacity: 0.9
  },
  finalizeIconBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12
  },
  /* Native iOS Form Sheet styling */
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)'
  },
  sheetCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16
  },
  sheetGrabberContainer: {
    alignItems: 'center',
    paddingVertical: 8
  },
  sheetGrabber: {
    width: 36,
    height: 5,
    borderRadius: 2.5
  },
  sheetNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  sheetNavBtn: {
    minWidth: 64,
    minHeight: 40,
    justifyContent: 'center'
  },
  sheetNavBtnText: {
    fontWeight: '600'
  },
  sheetNavBtnBold: {
    fontWeight: '800',
    textAlign: 'right'
  },
  sheetNavTitle: {
    fontWeight: '700'
  },
  sheetContentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  sheetSectionTitle: {
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginLeft: 4
  },
  insetGroupedCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden'
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48
  },
  formRowLabel: {
    width: 80,
    fontWeight: '600'
  },
  formRowInput: {
    flex: 1,
    padding: 0
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 8,
    justifyContent: 'space-between'
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconTileSelected: {
    borderWidth: 2
  },
  chipCluster: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  sourceChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 38,
    justifyContent: 'center'
  },
  sourceChipText: {
    fontWeight: '700'
  },
  removeSupplierBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 20,
    minHeight: 44
  },
  removeSupplierText: {
    fontWeight: '700'
  },
  dueNoticeBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 6
  },
  dueNoticeLabel: {
    fontWeight: '700',
    letterSpacing: 0.5
  },
  dueNoticeAmount: {
    fontWeight: '900',
    marginTop: 2
  },
  billGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  billChip: {
    flexBasis: '31%',
    flexGrow: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48
  },
  billChipText: {
    fontWeight: '800'
  },
  exactAmountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
    minHeight: 46
  },
  exactAmountText: {
    fontWeight: '700'
  }
});
