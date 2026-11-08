import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItem } from '../types';
import { formatPHP, parsePHP } from '../utils/currency';
import { useAppTheme } from '../context/ThemeContext';

interface ReceiptItemRowProps {
  item: CartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
  onUpdateQty: (qty: number) => void;
  onUpdatePrice: (price: number) => void;
}

export const ReceiptItemRow: React.FC<ReceiptItemRowProps> = ({
  item,
  onIncrement,
  onDecrement,
  onRemove,
  onUpdateQty,
  onUpdatePrice
}) => {
  const { colors, scaleFont, triggerHapticFeedback } = useAppTheme();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editQty, setEditQty] = useState(item.quantity.toString());
  const [editPrice, setEditPrice] = useState(item.unitPrice.toString());

  const handleOpenEdit = () => {
    setEditQty(item.quantity.toString());
    setEditPrice(item.unitPrice.toString());
    setIsEditModalOpen(true);
    triggerHapticFeedback('light');
  };

  const handleSaveEdit = () => {
    const parsedQty = parseFloat(editQty);
    const parsedPrice = parsePHP(editPrice);
    if (!isNaN(parsedQty) && parsedQty > 0) {
      onUpdateQty(parsedQty);
    }
    if (!isNaN(parsedPrice) && parsedPrice >= 0) {
      onUpdatePrice(parsedPrice);
    }
    setIsEditModalOpen(false);
    triggerHapticFeedback('success');
  };

  const handleRemoveFromModal = () => {
    setIsEditModalOpen(false);
    onRemove();
  };

  return (
    <View style={[styles.container, { borderBottomColor: colors.receiptBorder }]}>
      {/* Top line: Icon/Picture + Item Name and Subtotal (wraps cleanly on Extra Large) */}
      <View style={styles.topRow}>
        <View style={[styles.visualBox, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
          {item.imageUri ? (
            <Image source={{ uri: item.imageUri }} style={styles.itemImage} resizeMode="cover" />
          ) : (
            <Text style={[styles.itemEmoji, { fontSize: scaleFont(24) }]}>
              {item.icon || '🛒'}
            </Text>
          )}
        </View>

        <View style={styles.nameContainer}>
          <Text
            style={[styles.itemName, { color: colors.receiptText, fontSize: scaleFont(16) }]}
          >
            {item.name}
          </Text>
          <Text style={[styles.unitSub, { color: colors.receiptSubtext, fontSize: scaleFont(12) }]}>
            Unit: {item.unit || 'kg'}
          </Text>
        </View>

        <View style={styles.subtotalContainer}>
          <Text style={[styles.subtotalLabel, { color: colors.receiptSubtext, fontSize: scaleFont(11) }]}>
            SUBTOTAL
          </Text>
          <Text style={[styles.subtotalValue, { color: colors.receiptText, fontSize: scaleFont(17) }]}>
            {formatPHP(item.subtotal)}
          </Text>
        </View>
      </View>

      {/* Control row: Unit Price (Tappable), Stepper [- QTY +], and Remove button */}
      <View style={styles.controlRow}>
        {/* Unit Price badge */}
        <TouchableOpacity
          onPress={handleOpenEdit}
          style={[styles.unitPriceBadge, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}
          accessibilityLabel={`Price per unit: ${formatPHP(item.unitPrice)}. Tap to edit.`}
          accessibilityRole="button"
        >
          <Text style={[styles.unitPriceText, { color: colors.text, fontSize: scaleFont(13) }]}>
            @{formatPHP(item.unitPrice)}
          </Text>
          <Ionicons name="pencil-sharp" size={12} color={colors.textMuted} style={{ marginLeft: 3 }} />
        </TouchableOpacity>

        {/* Stepper with minimum 48x48dp touch targets */}
        <View style={[styles.stepperContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <TouchableOpacity
            onPress={onDecrement}
            style={[styles.stepperButton, { backgroundColor: colors.card }]}
            accessibilityLabel={`Decrease quantity for ${item.name}`}
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="remove" size={scaleFont(20)} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleOpenEdit}
            style={styles.qtyDisplay}
            accessibilityLabel={`Current quantity: ${item.quantity}. Tap to type number.`}
            accessibilityRole="button"
          >
            <Text style={[styles.qtyText, { color: colors.text, fontSize: scaleFont(16) }]}>
              {item.quantity}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onIncrement}
            style={[styles.stepperButton, { backgroundColor: colors.card }]}
            accessibilityLabel={`Increase quantity for ${item.name}`}
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="add" size={scaleFont(20)} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Explicit Remove Button (minimum 48x48dp target) */}
        <TouchableOpacity
          onPress={onRemove}
          style={[styles.removeButton, { borderColor: colors.danger, backgroundColor: colors.dangerSurface }]}
          accessibilityLabel={`Remove ${item.name} from procurement list`}
          accessibilityRole="button"
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons name="trash-outline" size={scaleFont(20)} color={colors.danger} />
        </TouchableOpacity>
      </View>

      {/* Direct Edit Modal with KeyboardAvoidingView */}
      <Modal
        visible={isEditModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setIsEditModalOpen(false)} />
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 10 }}
            >
              <Text style={[styles.modalTitle, { color: colors.text, fontSize: scaleFont(19) }]}>
                Edit Quantity & Price
              </Text>
              <Text style={[styles.modalItemName, { color: colors.textSecondary, fontSize: scaleFont(15) }]}>
                {item.icon} {item.name}
              </Text>

              {/* Quantity Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text, fontSize: scaleFont(14) }]}>
                  Quantity to Buy ({item.unit || 'kg'}):
                </Text>
                <TextInput
                  value={editQty}
                  onChangeText={setEditQty}
                  keyboardType="numeric"
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.card,
                      color: colors.text,
                      borderColor: colors.border,
                      fontSize: scaleFont(18)
                    }
                  ]}
                  placeholder="e.g. 5"
                  placeholderTextColor={colors.textMuted}
                  selectTextOnFocus
                />
              </View>

              {/* Price Input (Remembers for next time) */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text, fontSize: scaleFont(14) }]}>
                  Wholesale Price in ₱ (per {item.unit || 'unit'}):
                </Text>
                <TextInput
                  value={editPrice}
                  onChangeText={setEditPrice}
                  keyboardType="decimal-pad"
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.card,
                      color: colors.text,
                      borderColor: colors.border,
                      fontSize: scaleFont(18)
                    }
                  ]}
                  placeholder="e.g. 52.00"
                  placeholderTextColor={colors.textMuted}
                  selectTextOnFocus
                />
                <Text style={[styles.priceMemoryNote, { color: colors.accent, fontSize: scaleFont(12) }]}>
                  ✓ Remembers this price for future restocks.
                </Text>
              </View>

              {/* Remove button inside modal */}
              <TouchableOpacity
                onPress={handleRemoveFromModal}
                style={[styles.modalRemoveBtn, { backgroundColor: colors.dangerSurface, borderColor: colors.danger }]}
                accessibilityRole="button"
                accessibilityLabel="Remove this item from sheet"
              >
                <Ionicons name="trash-outline" size={scaleFont(16)} color={colors.danger} style={{ marginRight: 6 }} />
                <Text style={[styles.modalRemoveBtnText, { color: colors.danger, fontSize: scaleFont(14) }]}>
                  Remove from Sheet
                </Text>
              </TouchableOpacity>

              {/* Modal Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={() => setIsEditModalOpen(false)}
                  style={[styles.modalBtn, styles.cancelBtn, { borderColor: colors.border }]}
                >
                  <Text style={[styles.cancelBtnText, { color: colors.text, fontSize: scaleFont(15) }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSaveEdit}
                  style={[styles.modalBtn, styles.saveBtn, { backgroundColor: colors.primary }]}
                >
                  <Text style={[styles.saveBtnText, { color: colors.primaryText, fontSize: scaleFont(15) }]}>
                    Save & Update
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
  container: {
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderStyle: 'dashed'
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    rowGap: 4,
    marginBottom: 8
  },
  visualBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    overflow: 'hidden'
  },
  itemImage: {
    width: '100%',
    height: '100%'
  },
  itemEmoji: {},
  nameContainer: {
    flex: 1,
    minWidth: 120,
    paddingRight: 6
  },
  itemName: {
    fontWeight: '700'
  },
  unitSub: {
    marginTop: 2
  },
  subtotalContainer: {
    alignItems: 'flex-end',
    minWidth: 85
  },
  subtotalLabel: {
    fontWeight: '700',
    letterSpacing: 0.5
  },
  subtotalValue: {
    fontWeight: '800'
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    rowGap: 8,
    columnGap: 6
  },
  unitPriceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    minHeight: 46
  },
  unitPriceText: {
    fontWeight: '700'
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 2,
    overflow: 'hidden'
  },
  stepperButton: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center'
  },
  qtyDisplay: {
    minWidth: 40,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4
  },
  qtyText: {
    fontWeight: '800'
  },
  removeButton: {
    width: 46,
    height: 46,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center'
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
    maxHeight: '85%',
    borderRadius: 20,
    borderWidth: 2,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8
  },
  modalTitle: {
    fontWeight: '800',
    marginBottom: 4
  },
  modalItemName: {
    marginBottom: 14,
    fontWeight: '700'
  },
  inputGroup: {
    marginBottom: 14
  },
  inputLabel: {
    fontWeight: '700',
    marginBottom: 6
  },
  textInput: {
    minHeight: 50,
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontWeight: '700'
  },
  priceMemoryNote: {
    marginTop: 4,
    fontWeight: '600'
  },
  modalRemoveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    marginBottom: 14,
    minHeight: 46
  },
  modalRemoveBtnText: {
    fontWeight: '800'
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4
  },
  modalBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8
  },
  cancelBtn: {
    borderWidth: 2
  },
  cancelBtnText: {
    fontWeight: '700'
  },
  saveBtn: {},
  saveBtnText: {
    fontWeight: '800'
  }
});
