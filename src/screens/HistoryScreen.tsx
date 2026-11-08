import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Share,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useApp } from '../context/AppContext';
import { useAppTheme } from '../context/ThemeContext';
import { ReceiptRecord } from '../types';
import { formatPHP, formatDateTimePH } from '../utils/currency';

interface HistoryScreenProps {
  onNavigateToReceipt: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onNavigateToReceipt }) => {
  const { receipts, deleteReceipt, clearAllReceipts, loadReceiptToCart } = useApp();
  const { colors, scaleFont, triggerHapticFeedback } = useAppTheme();

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    triggerHapticFeedback('light');
    setExpandedId(prev => (prev === id ? null : id));
  };

  const generateProcurementText = (r: ReceiptRecord): string => {
    const { dateStr, timeStr } = formatDateTimePH(r.timestamp);
    let text = `====================================\n`;
    text += `   PALENGKE PROCUREMENT TALLY\n`;
    text += `====================================\n`;
    text += `Ref #: ${r.receiptNumber}\n`;
    text += `Date: ${dateStr} • ${timeStr}\n`;
    text += `Supplier / Source: ${r.supplierName || 'Wholesale Bagsakan'}\n`;
    text += `------------------------------------\n`;
    text += `ITEMS PROCURED:\n`;

    r.items.forEach((item, idx) => {
      const icon = item.icon ? `${item.icon} ` : '';
      text += `${idx + 1}. ${icon}${item.name}\n`;
      text += `   ${item.quantity} ${item.unit || 'pc'} x ${formatPHP(item.unitPrice)} = ${formatPHP(item.subtotal)}\n`;
    });

    text += `------------------------------------\n`;
    text += `TOTAL PROCUREMENT: ${formatPHP(r.totalProcurement)}\n`;

    if (r.cashPaid && r.cashPaid > 0) {
      text += `Cash Handed to Supplier: ${formatPHP(r.cashPaid)}\n`;
      if (r.changeReceived !== undefined) {
        text += `Sukli / Change: ${formatPHP(r.changeReceived)}\n`;
      }
    }

    text += `====================================\n`;
    text += `Recorded via GroceryTab PH Stall Procurement\n`;
    return text;
  };

  const handleCopyReceipt = async (r: ReceiptRecord) => {
    try {
      const text = generateProcurementText(r);
      await Clipboard.setStringAsync(text);
      triggerHapticFeedback('success');
      Alert.alert(
        'Copied to Clipboard! 📋',
        'Procurement sheet copied. You can paste it into SMS, Viber, Messenger, or Notes.'
      );
    } catch {
      Alert.alert('Error', 'Failed to copy procurement sheet.');
    }
  };

  const handleShareReceipt = async (r: ReceiptRecord) => {
    try {
      triggerHapticFeedback('light');
      const text = generateProcurementText(r);
      await Share.share({
        title: `Procurement Sheet - ${r.receiptNumber}`,
        message: text
      });
    } catch {
      // Dismissed
    }
  };

  const handleReloadToCart = (r: ReceiptRecord) => {
    triggerHapticFeedback('medium');
    Alert.alert(
      'Reload into Active Sheet?',
      `Load these ${r.items.length} items back into your active procurement sheet?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reload to Sheet',
          onPress: () => {
            loadReceiptToCart(r);
            onNavigateToReceipt();
          }
        }
      ]
    );
  };

  const handleDeleteReceipt = (r: ReceiptRecord) => {
    triggerHapticFeedback('warning');
    Alert.alert(
      'Delete Record?',
      `Delete procurement record #${r.receiptNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteReceipt(r.id)
        }
      ]
    );
  };

  const handleClearAllHistory = () => {
    triggerHapticFeedback('warning');
    Alert.alert(
      'Clear All Procurement History?',
      'All past saved procurement sheets will be permanently removed. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => clearAllReceipts()
        }
      ]
    );
  };

  const renderReceiptCard = ({ item: r }: { item: ReceiptRecord }) => {
    const isExpanded = expandedId === r.id;
    const { dateStr, timeStr } = formatDateTimePH(r.timestamp);

    return (
      <View style={[styles.receiptCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <TouchableOpacity
          onPress={() => toggleExpand(r.id)}
          style={styles.cardHeader}
          accessibilityRole="button"
          accessibilityLabel={`Procurement on ${dateStr} at ${timeStr}. Total: ${formatPHP(r.totalProcurement)}`}
        >
          <View style={styles.cardHeaderLeft}>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={scaleFont(18)} color={colors.primary} />
              <Text style={[styles.dateText, { color: colors.text, fontSize: scaleFont(16) }]}>
                {dateStr}
              </Text>
              <Text style={[styles.timeText, { color: colors.textMuted, fontSize: scaleFont(14) }]}>
                • {timeStr}
              </Text>
            </View>

            <Text style={[styles.supplierSubtitle, { color: colors.primary, fontSize: scaleFont(13) }]}>
              {r.supplierName || 'Wholesale Bagsakan'}
            </Text>

            <Text style={[styles.receiptNumberText, { color: colors.textMuted, fontSize: scaleFont(12) }]}>
              #{r.receiptNumber} • {r.items.length} {r.items.length === 1 ? 'item' : 'items'}
            </Text>
          </View>

          <View style={styles.cardHeaderRight}>
            <Text style={[styles.totalAmount, { color: colors.text, fontSize: scaleFont(19) }]}>
              {formatPHP(r.totalProcurement)}
            </Text>
            <Ionicons
              name={isExpanded ? 'chevron-up-circle' : 'chevron-down-circle'}
              size={scaleFont(24)}
              color={colors.primary}
              style={{ marginTop: 2 }}
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={[styles.expandedContent, { borderTopColor: colors.border }]}>
            <View style={[styles.itemizedHeader, { borderBottomColor: colors.receiptBorder }]}>
              <Text style={[styles.itemizedColTitle, { color: colors.textSecondary, fontSize: scaleFont(12), flex: 2 }]}>
                ITEM & QUANTITY
              </Text>
              <Text style={[styles.itemizedColTitle, { color: colors.textSecondary, fontSize: scaleFont(12), flex: 1, textAlign: 'right' }]}>
                SUBTOTAL
              </Text>
            </View>

            {r.items.map((it, idx) => (
              <View key={`${it.id}-${idx}`} style={[styles.itemizedRow, { borderBottomColor: colors.surfaceHighlight }]}>
                <View style={styles.itemWithVisualRow}>
                  <View style={[styles.tinyVisualBox, { backgroundColor: colors.surfaceHighlight }]}>
                    {it.imageUri ? (
                      <Image source={{ uri: it.imageUri }} style={styles.tinyImage} />
                    ) : (
                      <Text style={{ fontSize: scaleFont(18) }}>{it.icon || '🛒'}</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itName, { color: colors.text, fontSize: scaleFont(15) }]}>
                      {it.name}
                    </Text>
                    <Text style={[styles.itSub, { color: colors.textMuted, fontSize: scaleFont(13) }]}>
                      {it.quantity} {it.unit || 'pc'} @ {formatPHP(it.unitPrice)}
                    </Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', minWidth: 80 }}>
                  <Text style={[styles.itSubtotal, { color: colors.text, fontSize: scaleFont(15) }]}>
                    {formatPHP(it.subtotal)}
                  </Text>
                </View>
              </View>
            ))}

            {/* Calculations Breakdown (NO DISCOUNTS) */}
            <View style={styles.calcSummaryBox}>
              <View style={[styles.calcRow, styles.finalCalcRow]}>
                <Text style={[styles.finalLabel, { color: colors.text, fontSize: scaleFont(16) }]}>
                  TOTAL PROCUREMENT:
                </Text>
                <Text style={[styles.finalVal, { color: colors.text, fontSize: scaleFont(20) }]}>
                  {formatPHP(r.totalProcurement)}
                </Text>
              </View>

              {r.cashPaid && r.cashPaid > 0 ? (
                <View style={styles.tenderedBox}>
                  <View style={styles.calcRow}>
                    <Text style={[styles.calcLabel, { color: colors.textMuted, fontSize: scaleFont(13) }]}>
                      Cash Handed to Supplier:
                    </Text>
                    <Text style={[styles.calcVal, { color: colors.text, fontSize: scaleFont(14) }]}>
                      {formatPHP(r.cashPaid)}
                    </Text>
                  </View>
                  {r.changeReceived !== undefined && (
                    <View style={styles.calcRow}>
                      <Text style={[styles.calcLabel, { color: colors.success, fontSize: scaleFont(14), fontWeight: '700' }]}>
                        Change (Sukli) Received:
                      </Text>
                      <Text style={[styles.calcVal, { color: colors.success, fontSize: scaleFont(16), fontWeight: '800' }]}>
                        {formatPHP(r.changeReceived)}
                      </Text>
                    </View>
                  )}
                </View>
              ) : null}
            </View>

            {/* Actions Toolbar */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                onPress={() => handleCopyReceipt(r)}
                style={[styles.receiptActionBtn, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}
                accessibilityRole="button"
                accessibilityLabel="Copy procurement sheet text"
              >
                <Ionicons name="copy-outline" size={scaleFont(18)} color={colors.text} />
                <Text style={[styles.actionBtnText, { color: colors.text, fontSize: scaleFont(13) }]}>
                  Copy
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleShareReceipt(r)}
                style={[styles.receiptActionBtn, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}
                accessibilityRole="button"
                accessibilityLabel="Share procurement sheet via Viber, SMS, or Messenger"
              >
                <Ionicons name="share-social-outline" size={scaleFont(18)} color={colors.text} />
                <Text style={[styles.actionBtnText, { color: colors.text, fontSize: scaleFont(13) }]}>
                  Share
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleReloadToCart(r)}
                style={[styles.receiptActionBtn, { backgroundColor: colors.primary, borderColor: colors.border }]}
                accessibilityRole="button"
                accessibilityLabel="Reload items into active procurement sheet"
              >
                <Ionicons name="cart-outline" size={scaleFont(18)} color={colors.primaryText} />
                <Text style={[styles.actionBtnText, { color: colors.primaryText, fontSize: scaleFont(13) }]}>
                  Reload
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDeleteReceipt(r)}
                style={[styles.deleteBtn, { backgroundColor: colors.dangerSurface, borderColor: colors.danger }]}
                accessibilityRole="button"
                accessibilityLabel="Delete this procurement record"
              >
                <Ionicons name="trash-outline" size={scaleFont(18)} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.headerBar, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text, fontSize: scaleFont(18) }]}>
            Procurement Logs
          </Text>
          <Text style={[styles.headerSub, { color: colors.textMuted, fontSize: scaleFont(13) }]}>
            {receipts.length} {receipts.length === 1 ? 'record saved' : 'records saved'}
          </Text>
        </View>

        {receipts.length > 0 && (
          <TouchableOpacity
            onPress={handleClearAllHistory}
            style={[styles.clearAllBtn, { borderColor: colors.danger, backgroundColor: colors.dangerSurface }]}
            accessibilityRole="button"
            accessibilityLabel="Clear all procurement logs"
          >
            <Ionicons name="trash" size={scaleFont(16)} color={colors.danger} />
            <Text style={[styles.clearAllBtnText, { color: colors.danger, fontSize: scaleFont(13) }]}>
              Clear All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={receipts}
        keyExtractor={item => item.id}
        renderItem={renderReceiptCard}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: scaleFont(52), marginBottom: 10 }}>📋</Text>
            <Text style={[styles.emptyTitle, { color: colors.text, fontSize: scaleFont(20) }]}>
              No Saved Procurement Records
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textMuted, fontSize: scaleFont(15) }]}>
              When you finalize a procurement sheet in the Procure tab, your wholesale purchase logs will appear here.
            </Text>
            <TouchableOpacity
              onPress={onNavigateToReceipt}
              style={[styles.goToReceiptBtn, { backgroundColor: colors.primary }]}
              accessibilityRole="button"
              accessibilityLabel="Go to Procurement Sheet"
            >
              <Ionicons name="receipt" size={scaleFont(20)} color={colors.primaryText} style={{ marginRight: 8 }} />
              <Text style={[styles.goToReceiptText, { color: colors.primaryText, fontSize: scaleFont(16) }]}>
                Go to Procurement
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1.5
  },
  headerTitle: { fontWeight: '800' },
  headerSub: { marginTop: 2 },
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    minHeight: 44,
    gap: 4
  },
  clearAllBtnText: { fontWeight: '700' },
  listContent: { padding: 16, paddingBottom: 40, gap: 12 },
  receiptCard: {
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    minHeight: 68
  },
  cardHeaderLeft: { flex: 1, paddingRight: 10 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontWeight: '800' },
  timeText: { fontWeight: '600' },
  supplierSubtitle: {
    fontWeight: '800',
    marginTop: 3
  },
  receiptNumberText: { marginTop: 2, fontWeight: '600' },
  cardHeaderRight: { alignItems: 'flex-end', justifyContent: 'center' },
  totalAmount: { fontWeight: '900' },
  expandedContent: { borderTopWidth: 1.5, padding: 16, paddingTop: 12 },
  itemizedHeader: {
    flexDirection: 'row',
    paddingBottom: 6,
    borderBottomWidth: 1,
    marginBottom: 8
  },
  itemizedColTitle: { fontWeight: '700' },
  itemizedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1
  },
  itemWithVisualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8
  },
  tinyVisualBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  tinyImage: {
    width: '100%',
    height: '100%'
  },
  itName: { fontWeight: '700' },
  itSub: { marginTop: 2 },
  itSubtotal: { fontWeight: '800' },
  calcSummaryBox: { marginTop: 10, paddingTop: 6 },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4
  },
  calcLabel: {},
  calcVal: { fontWeight: '700' },
  finalCalcRow: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)'
  },
  finalLabel: { fontWeight: '800' },
  finalVal: { fontWeight: '900' },
  tenderedBox: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)'
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)'
  },
  receiptActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
    minHeight: 48,
    paddingHorizontal: 8,
    gap: 6
  },
  deleteBtn: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionBtnText: { fontWeight: '800' },
  emptyContainer: { alignItems: 'center', paddingVertical: 50, paddingHorizontal: 24 },
  emptyTitle: { fontWeight: '800', marginTop: 8 },
  emptyDesc: { textAlign: 'center', marginTop: 8, lineHeight: 22 },
  goToReceiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 14,
    minHeight: 52
  },
  goToReceiptText: { fontWeight: '800' }
});
