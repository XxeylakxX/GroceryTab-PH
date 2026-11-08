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
    <View style={[styles.receiptWrapper, { shadowColor: colors.text }]}>
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
          <Text style={[styles.storeTitle, { color: colors.receiptText, fontSize: scaleFont(20) }]}>
            PALENGKE PROCUREMENT
          </Text>
          <Text style={[styles.storeSubtitle, { color: colors.receiptSubtext, fontSize: scaleFont(12) }]}>
            STALL RESTOCK & WHOLESALE PURCHASE SHEET
          </Text>
          {supplierName ? (
            <Text style={[styles.supplierText, { color: colors.primary, fontSize: scaleFont(14) }]}>
              Source: {supplierName}
            </Text>
          ) : null}
          <Text style={[styles.metaInfo, { color: colors.receiptSubtext, fontSize: scaleFont(13) }]}>
            {dateStr} • {timeStr}
          </Text>
          <Text style={[styles.receiptNumber, { color: colors.receiptText, fontSize: scaleFont(12) }]}>
            REF #: {receiptNumber}
          </Text>

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
            Palengke Stall Inventory Procurement Log
          </Text>
          <Text style={[styles.footerText, { color: colors.receiptSubtext, fontSize: scaleFont(11), marginTop: 2 }]}>
            Accurate Capital & Price Procurement
          </Text>
        </View>
      </View>

      {/* Decorative Perforated Jagged Edge */}
      <View style={styles.zigzagRow}>
        {Array.from({ length: 24 }).map((_, idx) => (
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5
  },
  paperCard: {
    borderWidth: 2,
    borderBottomWidth: 1,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 14
  },
  header: {
    alignItems: 'center',
    marginBottom: 8
  },
  storeTitle: {
    fontWeight: '900',
    letterSpacing: 1.5,
    textAlign: 'center'
  },
  storeSubtitle: {
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 3,
    textAlign: 'center'
  },
  supplierText: {
    fontWeight: '800',
    marginTop: 4
  },
  metaInfo: {
    marginTop: 2,
    fontWeight: '600'
  },
  receiptNumber: {
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: 0.5
  },
  dividerContainer: {
    width: '100%',
    overflow: 'hidden',
    alignItems: 'center',
    marginVertical: 10
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
    fontWeight: '600',
    textAlign: 'center'
  },
  zigzagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
    marginTop: -1
  },
  zigzagTeeth: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10
  }
});
