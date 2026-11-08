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
import { AppTheme, FontScale } from '../types';

export const AccessibilityModal: React.FC = () => {
  const {
    isAccessibilityModalOpen,
    closeAccessibilityModal,
    theme,
    setTheme,
    fontScale,
    setFontScale,
    viewMode,
    setViewMode,
    settings,
    toggleHaptics,
    colors,
    scaleFont,
    triggerHapticFeedback
  } = useAppTheme();

  const themes: { id: AppTheme; label: string; desc: string; icon: string }[] = [
    {
      id: 'light',
      label: 'High-Contrast Light',
      desc: 'Crisp white paper with deep black ink (Default)',
      icon: 'sunny'
    },
    {
      id: 'warm',
      label: 'Warm Cream',
      desc: 'Soft cream tone that reduces glare and eye strain',
      icon: 'cafe'
    },
    {
      id: 'dark',
      label: 'High-Contrast Dark',
      desc: 'AMOLED black with bright clear text',
      icon: 'moon'
    }
  ];

  const fontScales: { id: FontScale; label: string; desc: string; previewSize: number }[] = [
    { id: 'normal', label: 'Normal Size', desc: 'Standard 100% text scale', previewSize: 16 },
    { id: 'large', label: 'Large Size', desc: 'Enlarged 118% for comfortable reading', previewSize: 19 },
    { id: 'extra-large', label: 'Extra Large', desc: 'Maximum 135% visibility', previewSize: 22 }
  ];

  return (
    <Modal
      visible={isAccessibilityModalOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={closeAccessibilityModal}
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={closeAccessibilityModal}
          accessibilityLabel="Close Settings"
          accessibilityRole="button"
        />
        <View style={[styles.sheetContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="eye-outline" size={scaleFont(24)} color={colors.text} />
              <Text
                style={[
                  styles.headerTitle,
                  { color: colors.text, fontSize: scaleFont(20) }
                ]}
              >
                Display & Accessibility
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                triggerHapticFeedback('light');
                closeAccessibilityModal();
              }}
              style={[styles.closeButton, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}
              accessibilityLabel="Close accessibility window"
              accessibilityRole="button"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={26} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.contentScroll} contentContainerStyle={styles.scrollContent}>
            {/* Display Mode: Pictures & Icons vs Compact List */}
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: scaleFont(17) }]}>
              1. INVENTORY DISPLAY STYLE
            </Text>
            <Text style={[styles.sectionSub, { color: colors.textSecondary, fontSize: scaleFont(14) }]}>
              Show items as visual picture cards with large icons, or a traditional list:
            </Text>

            <View style={styles.viewModeRow}>
              <TouchableOpacity
                onPress={() => setViewMode('visual-grid')}
                style={[
                  styles.viewModeBtn,
                  {
                    backgroundColor: viewMode === 'visual-grid' ? colors.primary : colors.card,
                    borderColor: viewMode === 'visual-grid' ? colors.primary : colors.cardBorder
                  }
                ]}
                accessibilityRole="button"
                accessibilityLabel="Visual Pictures and Icons Grid"
              >
                <Text style={{ fontSize: 26, marginBottom: 4 }}>🖼️</Text>
                <Text
                  style={[
                    styles.viewModeBtnText,
                    {
                      color: viewMode === 'visual-grid' ? colors.primaryText : colors.text,
                      fontSize: scaleFont(14)
                    }
                  ]}
                >
                  Pictures & Icons
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setViewMode('list')}
                style={[
                  styles.viewModeBtn,
                  {
                    backgroundColor: viewMode === 'list' ? colors.primary : colors.card,
                    borderColor: viewMode === 'list' ? colors.primary : colors.cardBorder
                  }
                ]}
                accessibilityRole="button"
                accessibilityLabel="Text List View"
              >
                <Text style={{ fontSize: 26, marginBottom: 4 }}>📋</Text>
                <Text
                  style={[
                    styles.viewModeBtnText,
                    {
                      color: viewMode === 'list' ? colors.primaryText : colors.text,
                      fontSize: scaleFont(14)
                    }
                  ]}
                >
                  Compact List
                </Text>
              </TouchableOpacity>
            </View>

            {/* Font Scale Section */}
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: scaleFont(17), marginTop: 20 }]}>
              2. FONT & TEXT SIZE
            </Text>
            <Text style={[styles.sectionSub, { color: colors.textSecondary, fontSize: scaleFont(14) }]}>
              Choose the most comfortable text size for checking prices and tally totals:
            </Text>

            <View style={styles.optionsList}>
              {fontScales.map(fs => {
                const isSelected = fontScale === fs.id;
                return (
                  <TouchableOpacity
                    key={fs.id}
                    onPress={() => setFontScale(fs.id)}
                    style={[
                      styles.optionCard,
                      {
                        backgroundColor: isSelected ? colors.surfaceHighlight : colors.card,
                        borderColor: isSelected ? colors.primary : colors.cardBorder,
                        borderWidth: isSelected ? 3 : 2
                      }
                    ]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={`${fs.label}, ${fs.desc}`}
                  >
                    <View style={styles.radioRow}>
                      <View
                        style={[
                          styles.radioCircle,
                          {
                            borderColor: isSelected ? colors.primary : colors.textMuted,
                            backgroundColor: isSelected ? colors.primary : 'transparent'
                          }
                        ]}
                      >
                        {isSelected && <View style={styles.radioInnerDot} />}
                      </View>
                      <View style={styles.optionTextContainer}>
                        <Text style={[styles.optionLabel, { color: colors.text, fontSize: fs.previewSize }]}>
                          {fs.label}
                        </Text>
                        <Text style={[styles.optionDesc, { color: colors.textMuted, fontSize: scaleFont(13) }]}>
                          {fs.desc}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.sampleText,
                        {
                          color: isSelected ? colors.primary : colors.textSecondary,
                          fontSize: fs.previewSize,
                          fontWeight: '700'
                        }
                      ]}
                    >
                      ₱240.00
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Theme Section */}
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: scaleFont(17), marginTop: 20 }]}>
              3. HIGH-CONTRAST THEME
            </Text>
            <Text style={[styles.sectionSub, { color: colors.textSecondary, fontSize: scaleFont(14) }]}>
              Select the best contrast background for indoor or outdoor palengke light:
            </Text>

            <View style={styles.optionsList}>
              {themes.map(t => {
                const isSelected = theme === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => setTheme(t.id)}
                    style={[
                      styles.optionCard,
                      {
                        backgroundColor: isSelected ? colors.surfaceHighlight : colors.card,
                        borderColor: isSelected ? colors.primary : colors.cardBorder,
                        borderWidth: isSelected ? 3 : 2
                      }
                    ]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={`${t.label}, ${t.desc}`}
                  >
                    <View style={styles.radioRow}>
                      <View
                        style={[
                          styles.radioCircle,
                          {
                            borderColor: isSelected ? colors.primary : colors.textMuted,
                            backgroundColor: isSelected ? colors.primary : 'transparent'
                          }
                        ]}
                      >
                        {isSelected && <View style={styles.radioInnerDot} />}
                      </View>
                      <View style={styles.optionTextContainer}>
                        <View style={styles.themeTitleRow}>
                          <Ionicons
                            name={t.icon as any}
                            size={scaleFont(18)}
                            color={isSelected ? colors.primary : colors.text}
                            style={{ marginRight: 6 }}
                          />
                          <Text style={[styles.optionLabel, { color: colors.text, fontSize: scaleFont(16) }]}>
                            {t.label}
                          </Text>
                        </View>
                        <Text style={[styles.optionDesc, { color: colors.textMuted, fontSize: scaleFont(13) }]}>
                          {t.desc}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Haptic Feedback Toggle */}
            <TouchableOpacity
              onPress={() => {
                triggerHapticFeedback('medium');
                toggleHaptics();
              }}
              style={[
                styles.toggleCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder
                }
              ]}
              accessibilityRole="switch"
              accessibilityState={{ checked: settings.hapticFeedback }}
              accessibilityLabel="Vibration / Tactile Haptic Feedback on button press"
            >
              <View style={styles.toggleRow}>
                <Ionicons
                  name={settings.hapticFeedback ? 'phone-portrait' : 'phone-portrait-outline'}
                  size={scaleFont(22)}
                  color={colors.text}
                  style={{ marginRight: 10 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionLabel, { color: colors.text, fontSize: scaleFont(16) }]}>
                    Tactile Button Vibration
                  </Text>
                  <Text style={[styles.optionDesc, { color: colors.textMuted, fontSize: scaleFont(13) }]}>
                    Gentle physical feedback on every tap and stepper adjustment
                  </Text>
                </View>
                <View
                  style={[
                    styles.toggleSwitch,
                    {
                      backgroundColor: settings.hapticFeedback ? colors.primary : colors.surfaceHighlight,
                      borderColor: colors.border
                    }
                  ]}
                >
                  <View
                    style={[
                      styles.toggleKnob,
                      {
                        alignSelf: settings.hapticFeedback ? 'flex-end' : 'flex-start',
                        backgroundColor: settings.hapticFeedback ? '#FFFFFF' : colors.textMuted
                      }
                    ]}
                  />
                </View>
              </View>
            </TouchableOpacity>

            {/* Done Button */}
            <TouchableOpacity
              onPress={() => {
                triggerHapticFeedback('success');
                closeAccessibilityModal();
              }}
              style={[styles.doneButton, { backgroundColor: colors.primary }]}
              accessibilityRole="button"
              accessibilityLabel="Apply and Close Settings"
            >
              <Text style={[styles.doneButtonText, { color: colors.primaryText, fontSize: scaleFont(18) }]}>
                Done (Apply Settings)
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 2,
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 2
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  headerTitle: {
    fontWeight: '800'
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  contentScroll: {
    paddingHorizontal: 18
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 40
  },
  sectionTitle: {
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 0.5
  },
  sectionSub: {
    marginBottom: 12,
    lineHeight: 20
  },
  viewModeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 6
  },
  viewModeBtn: {
    flex: 1,
    minWidth: 130,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    minHeight: 70
  },
  viewModeBtnText: {
    fontWeight: '800'
  },
  optionsList: {
    gap: 10
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    rowGap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    minHeight: 58
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12
  },
  radioCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF'
  },
  optionTextContainer: {
    flex: 1
  },
  themeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  optionLabel: {
    fontWeight: '700'
  },
  optionDesc: {
    marginTop: 2
  },
  sampleText: {
    marginLeft: 8
  },
  toggleCard: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 2
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  toggleSwitch: {
    width: 54,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    padding: 2,
    justifyContent: 'center'
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12
  },
  doneButton: {
    marginTop: 24,
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
