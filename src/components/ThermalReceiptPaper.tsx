import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { formatDateTimePH } from '../utils/currency';

interface ThermalReceiptPaperProps {
  receiptNumber?: string;
  timestamp?: string;
  children: ReactNode;
  supplierName?: string;
}

export const ThermalReceiptPaper: React.FC<ThermalReceiptPaperProps> = ({
  receiptNumber = 'ACTIVE PROCUREMENT',
  timestamp = new Date().toISOString(),
  children,
  supplierName
}) => {
  const { colors, scaleFont } = useAppTheme();
  const { dateStr, timeStr } = formatDateTimePH(timestamp);

  return (
    <View style={[styles.receiptWrapper, { shadowColor: colors.shadowColor }]}>
      {/* Top Perforation / Paper Feed Slot */}
      <View style={styles.topFeedBar}>
        <View style={[styles.feedDot, { backgroundColor: colors.borderSubtle }]} />
        <View style={[styles.feedSlot, { backgroundColor: colors.borderSubtle }]} />
        <View style={[styles.feedDot, { backgroundColor: colors.borderSubtle }]} />
      </View>

      {/* Paper Card */}
      <View
        style={[
          styles.paperCard,
          {
            backgroundColor: colors.receiptPaper,
            borderColor: colors.receiptBorder
          }
        ]}
      >
        {/* Header Section */}
        <View style={styles.header}>
          {/* Eyebrow Pill */}
          <View style={[styles.headerEyebrowBadge, { backgroundColor: colors.surfaceHighlight, borderColor: colors.borderSubtle }]}>
            <Text style={[styles.headerEyebrowText, { color: colors.receiptSubtext, fontSize: scaleFont(10) }]}>
              OFFICIAL WHOLESALE PROCUREMENT
            </Text>
          </View>

          <Text style={[styles.storeTitle, { color: colors.receiptText, fontSize: scaleFont(21) }]}>
            PALENGKE TALLY
          </Text>
          <Text style={[styles.storeSubtitle, { color: colors.receiptSubtext, fontSize: scaleFont(12) }]}>
            Stall Restock & Capital Ledger
          </Text>

          {supplierName ? (
            <View style={[styles.supplierPill, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
              <Text style={[styles.supplierText, { color: colors.primary, fontSize: scaleFont(13) }]}>
                Vendor: {supplierName}
              </Text>
            </View>
          ) : null}

          <View style={styles.metaRow}>
            <Text style={[styles.metaInfo, { color: colors.receiptSubtext, fontSize: scaleFont(12) }]}>
              {dateStr} • {timeStr}
            </Text>
            <Text style={[styles.receiptNumber, { color: colors.receiptText, fontSize: scaleFont(12) }]}>
              REF #{receiptNumber}
            </Text>
          </View>

          {/* Thermal Dashed Divider */}
          <View style={styles.dividerContainer}>
            <Text
              style={[styles.dashedLine, { color: colors.receiptBorder, fontSize: scaleFont(14) }]}
              numberOfLines={1}
              ellipsizeMode="clip"
            >
              - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
            </Text>
          </View>
        </View>

        {/* Content Body */}
        <View style={styles.body}>{children}</View>

        {/* Thermal Dashed Divider */}
        <View style={styles.dividerContainer}>
          <Text
            style={[styles.dashedLine, { color: colors.receiptBorder, fontSize: scaleFont(14) }]}
            numberOfLines={1}
            ellipsizeMode="clip"
          >
            - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
          </Text>
        </View>

        {/* Footer Note */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.receiptSubtext, fontSize: scaleFont(12) }]}>
            GroceryTab PH • Philippine Wet Market Tool
          </Text>
          <Text style={[styles.footerSubText, { color: colors.receiptSubtext, fontSize: scaleFont(11) }]}>
            Accurate Capital & Price History Saved
          </Text>
        </View>
      </View>

      {/* Decorative Perforated Jagged Edge */}
      <View style={styles.zigzagRow}>
        {Array.from({ length: 26 }).map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.zigzagTeeth,
              {
                borderTopColor: colors.receiptPaper,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent'
              }
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  receiptWrapper: {
    marginHorizontal: 14,
    marginVertical: 10,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5
  },
  topFeedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 4
  },
  feedSlot: {
    width: 60,
    height: 4,
    borderRadius: 2
  },
  feedDot: {
    width: 4,
    height: 4,
    borderRadius: 2
  },
  paperCard: {
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14
  },
  header: {
    alignItems: 'center',
    marginBottom: 8
  },
  headerEyebrowBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 6
  },
  headerEyebrowText: {
    fontWeight: '800',
    letterSpacing: 0.8
  },
  storeTitle: {
    fontWeight: '900',
    letterSpacing: 1.2,
    textAlign: 'center'
  },
  storeSubtitle: {
    fontWeight: '600',
    letterSpacing: 0.4,
    marginTop: 2,
    textAlign: 'center'
  },
  supplierPill: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1.5
  },
  supplierText: {
    fontWeight: '800'
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
    paddingHorizontal: 4
  },
  metaInfo: {
    fontWeight: '600'
  },
  receiptNumber: {
    fontWeight: '800',
    letterSpacing: 0.5
  },
  dividerContainer: {
    width: '100%',
    overflow: 'hidden',
    alignItems: 'center',
    marginVertical: 8
  },
  dashedLine: {
    fontWeight: '900',
    letterSpacing: 3
  },
  body: {
    width: '100%'
  },
  footer: {
    alignItems: 'center',
    marginTop: 4
  },
  footerText: {
    fontWeight: '700',
    textAlign: 'center'
  },
  footerSubText: {
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2
  },
  zigzagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
    marginTop: -0.5
  },
  zigzagTeeth: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 9
  }
});
