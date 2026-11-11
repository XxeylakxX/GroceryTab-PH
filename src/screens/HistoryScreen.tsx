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
    if (r.supplierName && r.supplierName.trim()) {
      text += `Supplier / Source: ${r.supplierName.trim()}\n`;
    }
    text += `------------------------------------\n`;
    text += `ITEMS PROCURED:\n`;

    r.items.forEach((item, idx) => {
      const icon = item.icon ? `${item.icon} ` : '';
      text += `${idx + 1}. ${icon}${item.name}\n`;
      text += `   ${item.quantity} ${item.unit || 'kg'} x ${formatPHP(item.unitPrice)} = ${formatPHP(item.subtotal)}\n`;
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
      <View
        style={[
          styles.receiptCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
            shadowColor: colors.shadowColor
          }
        ]}
      >
        <TouchableOpacity
          onPress={() => toggleExpand(r.id)}
          style={styles.cardHeader}
          accessibilityRole="button"
          accessibilityLabel={`Procurement on ${dateStr} at ${timeStr}. Total: ${formatPHP(r.totalProcurement)}`}
          activeOpacity={0.75}
        >
          <View style={styles.cardHeaderLeft}>
            <View style={styles.dateRow}>
              <View style={[styles.calendarIconBubble, { backgroundColor: colors.surfaceHighlight }]}>
                <Ionicons name="calendar-outline" size={scaleFont(14)} color={colors.primary} />
              </View>
              <Text style={[styles.dateText, { color: colors.text, fontSize: scaleFont(14) }]}>
                {dateStr}
              </Text>
              <Text style={[styles.timeText, { color: colors.textMuted, fontSize: scaleFont(12) }]}>
                • {timeStr}
              </Text>
            </View>

            {r.supplierName && r.supplierName.trim() ? (
              <View style={[styles.supplierPill, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
                <Text style={[styles.supplierSubtitle, { color: colors.primary, fontSize: scaleFont(11) }]}>
                  Vendor: {r.supplierName.trim()}
                </Text>
              </View>
            ) : null}

            <Text style={[styles.receiptNumberText, { color: colors.textMuted, fontSize: scaleFont(12) }]}>
              #{r.receiptNumber} • {r.items.length} {r.items.length === 1 ? 'item line' : 'item lines'}
            </Text>
          </View>

          <View style={styles.cardHeaderRight}>
            <Text style={[styles.totalAmount, { color: colors.primary, fontSize: scaleFont(19) }]}>
              {formatPHP(r.totalProcurement)}
            </Text>
            <View style={[styles.chevronBubble, { backgroundColor: colors.surfaceHighlight }]}>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={scaleFont(16)}
                color={colors.primary}
              />
            </View>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={[styles.expandedContent, { borderTopColor: colors.borderSubtle }]}>
            {/* Column Headers */}
            <View style={[styles.itemizedHeader, { borderBottomColor: colors.receiptBorder }]}>
              <Text style={[styles.itemizedColTitle, { color: colors.textSecondary, fontSize: scaleFont(11), flex: 2 }]}>
                ITEM & QUANTITY
              </Text>
              <Text style={[styles.itemizedColTitle, { color: colors.textSecondary, fontSize: scaleFont(11), flex: 1, textAlign: 'right' }]}>
                SUBTOTAL
              </Text>
            </View>

            {/* Item Rows */}
            {r.items.map((it, idx) => (
              <View key={`${it.id}-${idx}`} style={[styles.itemizedRow, { borderBottomColor: colors.surfaceHighlight }]}>
                <View style={styles.itemWithVisualRow}>
                  <View style={[styles.tinyVisualBox, { backgroundColor: colors.cardInner, borderColor: colors.borderSubtle }]}>
                    {it.imageUri ? (
                      <Image source={{ uri: it.imageUri }} style={styles.tinyImage} />
                    ) : (
                      <Text style={{ fontSize: scaleFont(18) }}>{it.icon || '🛒'}</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itName, { color: colors.text, fontSize: scaleFont(14) }]}>
                      {it.name}
                    </Text>
                    <Text style={[styles.itSub, { color: colors.textMuted, fontSize: scaleFont(12) }]}>
                      {it.quantity} {it.unit || 'kg'} @ {formatPHP(it.unitPrice)}
                    </Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', minWidth: 80 }}>
                  <Text style={[styles.itSubtotal, { color: colors.text, fontSize: scaleFont(14) }]}>
                    {formatPHP(it.subtotal)}
                  </Text>
                </View>
              </View>
            ))}

            {/* Calculations Breakdown */}
            <View style={styles.calcSummaryBox}>
              <View style={[styles.calcRow, styles.finalCalcRow]}>
                <Text style={[styles.finalLabel, { color: colors.text, fontSize: scaleFont(14) }]}>
                  TOTAL PROCUREMENT:
                </Text>
                <Text style={[styles.finalVal, { color: colors.primary, fontSize: scaleFont(19) }]}>
                  {formatPHP(r.totalProcurement)}
                </Text>
              </View>

              {r.cashPaid && r.cashPaid > 0 ? (
                <View style={styles.tenderedBox}>
                  <View style={styles.calcRow}>
                    <Text style={[styles.calcLabel, { color: colors.textMuted, fontSize: scaleFont(12) }]}>
                      Cash Handed:
                    </Text>
                    <Text style={[styles.calcVal, { color: colors.text, fontSize: scaleFont(13) }]}>
                      {formatPHP(r.cashPaid)}
                    </Text>
                  </View>
                  {r.changeReceived !== undefined && (
                    <View style={styles.calcRow}>
                      <Text style={[styles.calcLabel, { color: colors.success, fontSize: scaleFont(13), fontWeight: '700' }]}>
                        Sukli (Change):
                      </Text>
                      <Text style={[styles.calcVal, { color: colors.success, fontSize: scaleFont(15), fontWeight: '900' }]}>
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
                style={[styles.receiptActionBtn, { backgroundColor: colors.surfaceHighlight, borderColor: colors.borderSubtle }]}
                accessibilityRole="button"
                accessibilityLabel="Copy procurement sheet text"
              >
                <Ionicons name="copy-outline" size={scaleFont(15)} color={colors.text} style={{ marginRight: 4 }} />
                <Text style={[styles.actionBtnText, { color: colors.text, fontSize: scaleFont(12) }]}>
                  Copy
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleShareReceipt(r)}
                style={[styles.receiptActionBtn, { backgroundColor: colors.surfaceHighlight, borderColor: colors.borderSubtle }]}
                accessibilityRole="button"
                accessibilityLabel="Share procurement sheet via Viber, SMS, or Messenger"
              >
                <Ionicons name="share-social-outline" size={scaleFont(15)} color={colors.text} style={{ marginRight: 4 }} />
                <Text style={[styles.actionBtnText, { color: colors.text, fontSize: scaleFont(12) }]}>
                  Share
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleReloadToCart(r)}
                style={[styles.receiptActionBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
                accessibilityRole="button"
                accessibilityLabel="Reload items into active procurement sheet"
              >
                <Ionicons name="receipt-outline" size={scaleFont(15)} color={colors.primaryText} style={{ marginRight: 4 }} />
                <Text style={[styles.actionBtnText, { color: colors.primaryText, fontSize: scaleFont(12) }]}>
                  Reload
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDeleteReceipt(r)}
                style={[styles.deleteBtn, { backgroundColor: colors.dangerSurface, borderColor: colors.danger }]}
                accessibilityRole="button"
                accessibilityLabel="Delete this procurement record"
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name="trash-outline" size={scaleFont(16)} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Top Section Header */}
      <View style={[styles.headerBar, { borderBottomColor: colors.borderSubtle, backgroundColor: colors.surface }]}>
        <View style={styles.headerInfoCol}>
          <Text style={[styles.headerTitle, { color: colors.text, fontSize: scaleFont(16) }]}>
            Procurement Logs
          </Text>
          <Text style={[styles.headerSub, { color: colors.textMuted, fontSize: scaleFont(12) }]}>
            {receipts.length} {receipts.length === 1 ? 'record saved' : 'records saved in history'}
          </Text>
        </View>

        {receipts.length > 0 && (
          <TouchableOpacity
            onPress={handleClearAllHistory}
            style={[styles.clearAllBtn, { borderColor: colors.danger, backgroundColor: colors.dangerSurface }]}
            accessibilityRole="button"
            accessibilityLabel="Clear all procurement logs"
          >
            <Ionicons name="trash-outline" size={scaleFont(14)} color={colors.danger} style={{ marginRight: 4 }} />
            <Text style={[styles.clearAllBtnText, { color: colors.danger, fontSize: scaleFont(12) }]}>
              Clear History
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main List */}
      {receipts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: scaleFont(46), marginBottom: 12 }}>📜</Text>
          <Text style={[styles.emptyTitle, { color: colors.text, fontSize: scaleFont(19) }]}>
            No Procurement Records Yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary, fontSize: scaleFont(14) }]}>
            When you complete and save a restock sheet in the Procure tab, it will be safely archived here for your records.
          </Text>

          <TouchableOpacity
            onPress={onNavigateToReceipt}
            style={[styles.startProcureBtn, { backgroundColor: colors.primary }]}
            accessibilityRole="button"
            accessibilityLabel="Open Procure tab"
          >
            <Ionicons name="receipt-outline" size={scaleFont(18)} color={colors.primaryText} style={{ marginRight: 8 }} />
            <Text style={[styles.startProcureBtnText, { color: colors.primaryText, fontSize: scaleFont(15) }]}>
              Start Procurement Sheet
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={receipts}
          keyExtractor={item => item.id}
          renderItem={renderReceiptCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  headerInfoCol: {
    flex: 1
  },
  headerTitle: {
    fontWeight: '800'
  },
  headerSub: {
    fontWeight: '500',
    marginTop: 1
  },
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1
  },
  clearAllBtnText: {
    fontWeight: '700'
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32
  },
  receiptCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14
  },
  cardHeaderLeft: {
    flex: 1,
    gap: 4
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  calendarIconBubble: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  dateText: {
    fontWeight: '800'
  },
  timeText: {
    fontWeight: '500'
  },
  supplierPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 2
  },
  supplierSubtitle: {
    fontWeight: '700'
  },
  receiptNumberText: {
    fontWeight: '500',
    marginTop: 2
  },
  cardHeaderRight: {
    alignItems: 'flex-end',
    gap: 8,
    marginLeft: 10
  },
  totalAmount: {
    fontWeight: '900'
  },
  chevronBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  expandedContent: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  itemizedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 6
  },
  itemizedColTitle: {
    fontWeight: '800',
    letterSpacing: 0.5
  },
  itemizedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  itemWithVisualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10
  },
  tinyVisualBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  tinyImage: {
    width: '100%',
    height: '100%'
  },
  itName: {
    fontWeight: '700'
  },
  itSub: {
    fontWeight: '500',
    marginTop: 1
  },
  itSubtotal: {
    fontWeight: '800'
  },
  calcSummaryBox: {
    marginTop: 10,
    gap: 4
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2
  },
  finalCalcRow: {
    paddingVertical: 6
  },
  finalLabel: {
    fontWeight: '800'
  },
  finalVal: {
    fontWeight: '900'
  },
  tenderedBox: {
    paddingTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)'
  },
  calcLabel: {
    fontWeight: '500'
  },
  calcVal: {
    fontWeight: '700'
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14
  },
  receiptActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 40
  },
  actionBtnText: {
    fontWeight: '700'
  },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 40
  },
  emptyTitle: {
    fontWeight: '800',
    marginBottom: 6
  },
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20
  },
  startProcureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    minHeight: 48
  },
  startProcureBtnText: {
    fontWeight: '800'
  }
});
