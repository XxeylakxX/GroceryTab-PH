import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  Pressable,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../context/AppContext';
import { useAppTheme } from '../context/ThemeContext';
import { CatalogItem } from '../types';
import { CATEGORIES, PRESET_ICONS } from '../services/seedData';
import { formatPHP, parsePHP } from '../utils/currency';

interface DictionaryScreenProps {
  onNavigateToReceipt: () => void;
}

export const DictionaryScreen: React.FC<DictionaryScreenProps> = ({ onNavigateToReceipt }) => {
  const {
    catalogItems,
    addCatalogItem,
    updateCatalogItem,
    deleteCatalogItem,
    resetCatalog,
    addToCart,
    incrementCartItem,
    decrementCartItem,
    cartItems
  } = useApp();

  const { colors, scaleFont, viewMode, toggleViewMode, triggerHapticFeedback } = useAppTheme();

  // Search and Category Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Vegetables');

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formUnit, setFormUnit] = useState('kg');
  const [formCategory, setFormCategory] = useState('Root & Bulb Crops');
  const [formIcon, setFormIcon] = useState('🧄');
  const [formImageUri, setFormImageUri] = useState<string | undefined>(undefined);
  const [formSupplier, setFormSupplier] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Count items in active procurement
  const cartItemCounts = useMemo(() => {
    const map = new Map<string, { qty: number; cartId: string }>();
    cartItems.forEach(ci => {
      map.set(ci.id, { qty: ci.quantity, cartId: ci.id });
      map.set(ci.name.toLowerCase().trim(), { qty: ci.quantity, cartId: ci.id });
    });
    return map;
  }, [cartItems]);

  // Filtered items
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return catalogItems.filter(item => {
      const matchesSearch =
        q === '' ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.supplier && item.supplier.toLowerCase().includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === 'All Vegetables' || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [catalogItems, searchQuery, selectedCategory]);

  const handleOpenAdd = () => {
    triggerHapticFeedback('light');
    setEditingItem(null);
    setFormName('');
    setFormPrice('');
    setFormUnit('kg');
    setFormCategory('Root & Bulb Crops');
    setFormIcon('🧄');
    setFormImageUri(undefined);
    setFormSupplier('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: CatalogItem) => {
    triggerHapticFeedback('light');
    setEditingItem(item);
    setFormName(item.name);
    setFormPrice(item.unitPrice.toString());
    setFormUnit(item.unit);
    setFormCategory(item.category);
    setFormIcon(item.icon || '🛒');
    setFormImageUri(item.imageUri);
    setFormSupplier(item.supplier || '');
    setFormNotes(item.notes || '');
    setIsModalOpen(true);
  };

  // Pick Image from Photo Library
  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Needed', 'Please allow camera roll access to pick photos for your grocery items.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFormImageUri(result.assets[0].uri);
        triggerHapticFeedback('success');
      }
    } catch {
      Alert.alert('Notice', 'Unable to pick photo from gallery.');
    }
  };

  // Take photo with camera
  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Needed', 'Please allow camera access to take a picture of this item.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFormImageUri(result.assets[0].uri);
        triggerHapticFeedback('success');
      }
    } catch {
      Alert.alert('Notice', 'Unable to open camera.');
    }
  };

  const handleSaveItem = async () => {
    const trimmedName = formName.trim();
    const parsedPrice = parsePHP(formPrice);

    if (!trimmedName) {
      Alert.alert('Missing Detail', 'Please enter an item name.');
      return;
    }
    if (parsedPrice <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid wholesale unit price in ₱.');
      return;
    }

    try {
      if (editingItem) {
        await updateCatalogItem({
          ...editingItem,
          name: trimmedName,
          unitPrice: parsedPrice,
          unit: formUnit.trim() || 'pc',
          category: formCategory,
          icon: formIcon,
          imageUri: formImageUri,
          supplier: formSupplier.trim(),
          notes: formNotes.trim()
        });
      } else {
        await addCatalogItem({
          name: trimmedName,
          unitPrice: parsedPrice,
          unit: formUnit.trim() || 'pc',
          category: formCategory,
          icon: formIcon,
          imageUri: formImageUri,
          supplier: formSupplier.trim(),
          notes: formNotes.trim()
        });
      }
      triggerHapticFeedback('success');
      setIsModalOpen(false);
    } catch {
      Alert.alert('Error', 'Failed to save item. Please try again.');
    }
  };

  const handleDeleteItem = (item: CatalogItem) => {
    triggerHapticFeedback('warning');
    Alert.alert(
      'Delete Item?',
      `Are you sure you want to remove "${item.name}" from your catalog?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteCatalogItem(item.id);
            setIsModalOpen(false);
          }
        }
      ]
    );
  };

  const handleResetDefaults = () => {
    triggerHapticFeedback('warning');
    Alert.alert(
      'Restore Default Catalog?',
      'This will reset your catalog back to the standard Philippine palengke staples with default wholesale prices.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Catalog',
          style: 'destructive',
          onPress: () => resetCatalog()
        }
      ]
    );
  };

  // Render Visual Grid Tile (Picture / Icon First with Double-Bezel Concentric Architecture)
  const renderGridCard = ({ item }: { item: CatalogItem }) => {
    const cartEntry = cartItemCounts.get(item.id) || cartItemCounts.get(item.name.toLowerCase().trim());
    const qtyInCart = cartEntry ? cartEntry.qty : 0;
    const cartId = cartEntry ? cartEntry.cartId : item.id;

    return (
      <View
        style={[
          styles.gridTile,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
            shadowColor: colors.shadowColor
          }
        ]}
      >
        {/* Concentric Image Chamber */}
        <TouchableOpacity
          onPress={() => {
            triggerHapticFeedback('light');
            addToCart(item);
          }}
          activeOpacity={0.8}
          style={[
            styles.gridImageWrapper,
            {
              backgroundColor: colors.cardInner,
              borderColor: colors.borderSubtle
            }
          ]}
          accessibilityLabel={`${item.name}, tap to add to procurement sheet`}
        >
          {item.imageUri ? (
            <Image source={{ uri: item.imageUri }} style={styles.gridImage} resizeMode="cover" />
          ) : (
            <Text style={[styles.gridEmoji, { fontSize: scaleFont(38) }]}>
              {item.icon || '🛒'}
            </Text>
          )}

          {/* Edit Pencil Pill */}
          <TouchableOpacity
            onPress={() => handleOpenEdit(item)}
            style={[styles.editIconBadge, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}
            accessibilityRole="button"
            accessibilityLabel={`Edit details for ${item.name}`}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="pencil" size={14} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Cart Quantity Pill Badge if active */}
          {qtyInCart > 0 && (
            <View style={[styles.gridCartBadge, { backgroundColor: colors.primary, borderColor: colors.surface }]}>
              <Text style={styles.gridCartBadgeText}>{qtyInCart}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Content Section */}
        <View style={styles.gridCardContent}>
          {/* Category Eyebrow */}
          <Text
            style={[styles.gridCategoryEyebrow, { color: colors.primary, fontSize: scaleFont(10) }]}
            numberOfLines={1}
          >
            {item.category.toUpperCase()}
          </Text>

          {/* Item Name */}
          <Text
            style={[styles.gridItemName, { color: colors.text, fontSize: scaleFont(15) }]}
            numberOfLines={2}
          >
            {item.name}
          </Text>

          {/* Price & Unit Line */}
          <View style={styles.gridPriceRow}>
            <Text style={[styles.gridPriceText, { color: colors.text, fontSize: scaleFont(16) }]}>
              {formatPHP(item.unitPrice)}
            </Text>
            <Text style={[styles.gridUnitText, { color: colors.textSecondary, fontSize: scaleFont(12) }]}>
              /{item.unit || 'kg'}
            </Text>
          </View>

          {/* Quick Add or Stepper Pill */}
          <View style={styles.gridActionArea}>
            {qtyInCart > 0 ? (
              <View style={[styles.gridStepperBox, { backgroundColor: colors.surfaceHighlight, borderColor: colors.primary }]}>
                <TouchableOpacity
                  onPress={() => {
                    triggerHapticFeedback('light');
                    decrementCartItem(cartId);
                  }}
                  style={styles.gridStepperBtn}
                  accessibilityLabel={`Decrease quantity for ${item.name}`}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Ionicons name="remove" size={scaleFont(16)} color={colors.text} />
                </TouchableOpacity>

                <Text style={[styles.gridStepperQty, { color: colors.text, fontSize: scaleFont(14) }]}>
                  {qtyInCart}
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    triggerHapticFeedback('light');
                    incrementCartItem(cartId);
                  }}
                  style={styles.gridStepperBtn}
                  accessibilityLabel={`Increase quantity for ${item.name}`}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Ionicons name="add" size={scaleFont(16)} color={colors.text} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  triggerHapticFeedback('light');
                  addToCart(item);
                }}
                style={[styles.gridAddBtn, { backgroundColor: colors.primary }]}
                accessibilityRole="button"
                accessibilityLabel={`Add ${item.name} to procurement sheet`}
              >
                <Ionicons name="add" size={scaleFont(16)} color={colors.primaryText} style={{ marginRight: 2 }} />
                <Text style={[styles.gridAddBtnText, { color: colors.primaryText, fontSize: scaleFont(13) }]}>
                  Add
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  // Render Compact Inset Grouped List Item
  const renderListItem = ({ item }: { item: CatalogItem }) => {
    const cartEntry = cartItemCounts.get(item.id) || cartItemCounts.get(item.name.toLowerCase().trim());
    const qtyInCart = cartEntry ? cartEntry.qty : 0;
    const cartId = cartEntry ? cartEntry.cartId : item.id;

    return (
      <View
        style={[
          styles.listRow,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
            shadowColor: colors.shadowColor
          }
        ]}
      >
        {/* Visual Box */}
        <TouchableOpacity
          onPress={() => {
            triggerHapticFeedback('light');
            addToCart(item);
          }}
          style={[styles.listVisualBox, { backgroundColor: colors.cardInner, borderColor: colors.borderSubtle }]}
        >
          {item.imageUri ? (
            <Image source={{ uri: item.imageUri }} style={styles.listImage} resizeMode="cover" />
          ) : (
            <Text style={{ fontSize: scaleFont(24) }}>{item.icon || '🛒'}</Text>
          )}
          {qtyInCart > 0 && (
            <View style={[styles.listBadge, { backgroundColor: colors.primary, borderColor: colors.surface }]}>
              <Text style={styles.listBadgeText}>{qtyInCart}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Text Information */}
        <TouchableOpacity
          onPress={() => handleOpenEdit(item)}
          style={styles.listInfoCol}
          accessibilityLabel={`Edit details for ${item.name}`}
        >
          <Text style={[styles.listCategoryEyebrow, { color: colors.primary, fontSize: scaleFont(10) }]}>
            {item.category.toUpperCase()}
          </Text>
          <Text style={[styles.listItemName, { color: colors.text, fontSize: scaleFont(15) }]}>
            {item.name}
          </Text>
          <Text style={[styles.listPriceText, { color: colors.textSecondary, fontSize: scaleFont(13) }]}>
            {formatPHP(item.unitPrice)} / {item.unit || 'kg'}
          </Text>
        </TouchableOpacity>

        {/* Stepper or Add Button */}
        <View style={styles.listActionArea}>
          {qtyInCart > 0 ? (
            <View style={[styles.listStepperBox, { backgroundColor: colors.surfaceHighlight, borderColor: colors.primary }]}>
              <TouchableOpacity
                onPress={() => {
                  triggerHapticFeedback('light');
                  decrementCartItem(cartId);
                }}
                style={styles.listStepperBtn}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name="remove" size={scaleFont(16)} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.listStepperQty, { color: colors.text, fontSize: scaleFont(14) }]}>
                {qtyInCart}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  triggerHapticFeedback('light');
                  incrementCartItem(cartId);
                }}
                style={styles.listStepperBtn}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name="add" size={scaleFont(16)} color={colors.text} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => {
                triggerHapticFeedback('light');
                addToCart(item);
              }}
              style={[styles.listAddBtn, { backgroundColor: colors.primary }]}
              accessibilityRole="button"
              accessibilityLabel={`Add ${item.name} to procurement sheet`}
            >
              <Ionicons name="add" size={scaleFont(16)} color={colors.primaryText} style={{ marginRight: 2 }} />
              <Text style={[styles.listAddBtnText, { color: colors.primaryText, fontSize: scaleFont(13) }]}>
                Add
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Top Search & Filter Bar */}
      <View style={[styles.searchFilterContainer, { backgroundColor: colors.surface, borderBottomColor: colors.borderSubtle }]}>
        {/* iOS Search Bar */}
        <View style={styles.searchBarRow}>
          <View style={[styles.iosSearchBar, { backgroundColor: colors.surfaceHighlight, borderColor: colors.borderSubtle }]}>
            <Ionicons name="search" size={scaleFont(18)} color={colors.textMuted} style={styles.searchIcon} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search vegetables..."
              placeholderTextColor={colors.textMuted}
              style={[styles.searchInput, { color: colors.text, fontSize: scaleFont(15) }]}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && Platform.OS !== 'ios' && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* View Mode Toggle (Grid/List) */}
          <TouchableOpacity
            onPress={() => {
              triggerHapticFeedback('light');
              toggleViewMode();
            }}
            style={[styles.toolBtn, { backgroundColor: colors.surfaceHighlight, borderColor: colors.cardBorder }]}
            accessibilityRole="button"
            accessibilityLabel={`Switch to ${viewMode === 'visual-grid' ? 'list' : 'grid'} view`}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={viewMode === 'visual-grid' ? 'list-outline' : 'grid-outline'}
              size={scaleFont(20)}
              color={colors.text}
            />
          </TouchableOpacity>

          {/* Add New Item Button */}
          <TouchableOpacity
            onPress={handleOpenAdd}
            style={[styles.toolBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
            accessibilityRole="button"
            accessibilityLabel="Add new vegetable item to catalog"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="add" size={scaleFont(22)} color={colors.primaryText} />
          </TouchableOpacity>
        </View>

        {/* Horizontal Category Segmented Filter Strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {['All Vegetables', ...CATEGORIES].map((cat, idx) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => {
                  triggerHapticFeedback('light');
                  setSelectedCategory(cat);
                }}
                style={[
                  styles.categoryPill,
                  isSelected
                    ? { backgroundColor: colors.primary, borderColor: colors.primary }
                    : { backgroundColor: colors.card, borderColor: colors.borderSubtle }
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${cat}`}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    {
                      color: isSelected ? colors.primaryText : colors.text,
                      fontSize: scaleFont(13),
                      fontWeight: isSelected ? '800' : '600'
                    }
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Items View */}
      {filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: scaleFont(44), marginBottom: 12 }}>🔍</Text>
          <Text style={[styles.emptyTitle, { color: colors.text, fontSize: scaleFont(19) }]}>
            No Vegetables Found
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary, fontSize: scaleFont(14) }]}>
            {searchQuery
              ? `No items match "${searchQuery}". Check your spelling or add a new item.`
              : 'No items in this category.'}
          </Text>

          <TouchableOpacity
            onPress={handleOpenAdd}
            style={[styles.addNewItemBtn, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="add-circle-outline" size={scaleFont(18)} color={colors.primaryText} style={{ marginRight: 6 }} />
            <Text style={[styles.addNewItemBtnText, { color: colors.primaryText, fontSize: scaleFont(14) }]}>
              + Add New Item
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          key={viewMode} // Re-mount when changing between 1 col (list) and 2 cols (grid)
          data={filteredItems}
          keyExtractor={item => item.id}
          numColumns={viewMode === 'visual-grid' ? 2 : 1}
          renderItem={viewMode === 'visual-grid' ? renderGridCard : renderListItem}
          contentContainerStyle={[
            styles.listContainer,
            viewMode === 'visual-grid' ? styles.gridListContainer : styles.rowListContainer
          ]}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <View style={styles.catalogFooter}>
              <Text style={[styles.catalogFooterCount, { color: colors.textSecondary, fontSize: scaleFont(12) }]}>
                Showing {filteredItems.length} of {catalogItems.length} vegetables
              </Text>
              <TouchableOpacity
                onPress={handleResetDefaults}
                style={[styles.resetDefaultsBtn, { borderColor: colors.borderSubtle }]}
              >
                <Ionicons name="refresh-outline" size={scaleFont(14)} color={colors.textSecondary} style={{ marginRight: 4 }} />
                <Text style={[styles.resetDefaultsText, { color: colors.textSecondary, fontSize: scaleFont(12) }]}>
                  Reset to Standard Palengke Catalog
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* ==================================================================== */}
      {/* NATIVE iOS FORM SHEET: Add / Edit Item */}
      {/* ==================================================================== */}
      <Modal
        visible={isModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.sheetOverlay}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
          <Pressable style={styles.sheetBackdrop} onPress={() => setIsModalOpen(false)} />
          <View style={[styles.sheetCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
            {/* Grabber */}
            <View style={styles.sheetGrabberContainer}>
              <View style={[styles.sheetGrabber, { backgroundColor: colors.borderSubtle }]} />
            </View>

            {/* iOS Nav Header */}
            <View style={[styles.sheetNavBar, { borderBottomColor: colors.borderSubtle }]}>
              <TouchableOpacity
                onPress={() => setIsModalOpen(false)}
                style={styles.sheetNavBtn}
                accessibilityRole="button"
                accessibilityLabel="Cancel editing item"
              >
                <Text style={[styles.sheetNavBtnText, { color: colors.textSecondary, fontSize: scaleFont(16) }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text style={[styles.sheetNavTitle, { color: colors.text, fontSize: scaleFont(17) }]}>
                {editingItem ? 'Edit Item' : 'New Item'}
              </Text>
              <TouchableOpacity
                onPress={handleSaveItem}
                style={styles.sheetNavBtn}
                accessibilityRole="button"
                accessibilityLabel="Save item to catalog"
              >
                <Text style={[styles.sheetNavBtnBold, { color: colors.primary, fontSize: scaleFont(16) }]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.sheetContentContainer}
            >
              {/* Photo / Visual Chamber */}
              <View style={styles.photoChamberRow}>
                <View style={[styles.formPhotoPreview, { backgroundColor: colors.cardInner, borderColor: colors.borderSubtle }]}>
                  {formImageUri ? (
                    <Image source={{ uri: formImageUri }} style={styles.previewImage} resizeMode="cover" />
                  ) : (
                    <Text style={{ fontSize: scaleFont(42) }}>{formIcon}</Text>
                  )}
                </View>

                <View style={styles.photoActionsCol}>
                  <TouchableOpacity
                    onPress={handlePickImage}
                    style={[styles.photoActionBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                  >
                    <Ionicons name="images-outline" size={scaleFont(16)} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text style={[styles.photoActionText, { color: colors.primary, fontSize: scaleFont(13) }]}>
                      Photo Library
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleTakePhoto}
                    style={[styles.photoActionBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                  >
                    <Ionicons name="camera-outline" size={scaleFont(16)} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text style={[styles.photoActionText, { color: colors.primary, fontSize: scaleFont(13) }]}>
                      Take Photo
                    </Text>
                  </TouchableOpacity>

                  {formImageUri && (
                    <TouchableOpacity
                      onPress={() => setFormImageUri(undefined)}
                      style={[styles.removePhotoBtn]}
                    >
                      <Text style={[styles.removePhotoText, { color: colors.danger, fontSize: scaleFont(12) }]}>
                        Use Emoji Icon Instead
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Form Fields: Inset Grouped */}
              <Text style={[styles.sheetSectionTitle, { color: colors.textSecondary, fontSize: scaleFont(12), marginTop: 14 }]}>
                ITEM DETAILS
              </Text>
              <View style={[styles.insetGroupedCard, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
                {/* Item Name */}
                <View style={[styles.formRow, { borderBottomColor: colors.borderSubtle }]}>
                  <Text style={[styles.formRowLabel, { color: colors.text, fontSize: scaleFont(15) }]}>
                    Name
                  </Text>
                  <TextInput
                    value={formName}
                    onChangeText={setFormName}
                    placeholder="e.g. Talong (Eggplant)"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.formRowInput, { color: colors.text, fontSize: scaleFont(15) }]}
                  />
                </View>

                {/* Wholesale Price */}
                <View style={[styles.formRow, { borderBottomColor: colors.borderSubtle }]}>
                  <Text style={[styles.formRowLabel, { color: colors.text, fontSize: scaleFont(15) }]}>
                    Price (₱)
                  </Text>
                  <TextInput
                    value={formPrice}
                    onChangeText={setFormPrice}
                    placeholder="e.g. 60.00"
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
                    value={formUnit}
                    onChangeText={setFormUnit}
                    placeholder="kg, bundle, tali, sack"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.formRowInput, { color: colors.text, fontSize: scaleFont(15) }]}
                  />
                </View>
              </View>

              {/* Category Selection */}
              <Text style={[styles.sheetSectionTitle, { color: colors.textSecondary, fontSize: scaleFont(12), marginTop: 14 }]}>
                CATEGORY
              </Text>
              <View style={styles.categoryWrapRow}>
                {CATEGORIES.map((cat, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      triggerHapticFeedback('light');
                      setFormCategory(cat);
                    }}
                    style={[
                      styles.categoryOptionChip,
                      formCategory === cat
                        ? { backgroundColor: colors.primaryLight, borderColor: colors.primary }
                        : { backgroundColor: colors.card, borderColor: colors.borderSubtle }
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        {
                          color: formCategory === cat ? colors.primary : colors.text,
                          fontSize: scaleFont(12),
                          fontWeight: formCategory === cat ? '800' : '600'
                        }
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Emoji Icon Grid */}
              <Text style={[styles.sheetSectionTitle, { color: colors.textSecondary, fontSize: scaleFont(12), marginTop: 14 }]}>
                EMOJI ICON
              </Text>
              <View style={[styles.insetGroupedCard, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
                <View style={styles.iconGrid}>
                  {PRESET_ICONS.slice(0, 16).map((icon, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => {
                        triggerHapticFeedback('light');
                        setFormIcon(icon);
                      }}
                      style={[
                        styles.iconTile,
                        formIcon === icon && [styles.iconTileSelected, { borderColor: colors.primary, backgroundColor: colors.primaryLight }]
                      ]}
                    >
                      <Text style={{ fontSize: scaleFont(22) }}>{icon}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Delete Button (If editing existing item) */}
              {editingItem && (
                <TouchableOpacity
                  onPress={() => handleDeleteItem(editingItem)}
                  style={[styles.deleteItemBtn, { backgroundColor: colors.dangerSurface, borderColor: colors.danger }]}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${editingItem.name} from catalog`}
                >
                  <Ionicons name="trash-outline" size={scaleFont(16)} color={colors.danger} style={{ marginRight: 6 }} />
                  <Text style={[styles.deleteItemBtnText, { color: colors.danger, fontSize: scaleFont(14) }]}>
                    Delete "{editingItem.name}" from Catalog
                  </Text>
                </TouchableOpacity>
              )}
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
  searchFilterContainer: {
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8
  },
  iosSearchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 44
  },
  searchIcon: {
    marginRight: 6
  },
  searchInput: {
    flex: 1,
    padding: 0
  },
  toolBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
    gap: 6,
    paddingVertical: 2
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1
  },
  categoryPillText: {
    letterSpacing: -0.2
  },
  listContainer: {
    paddingBottom: 32
  },
  gridListContainer: {
    paddingHorizontal: 12,
    paddingTop: 12
  },
  rowListContainer: {
    paddingHorizontal: 16,
    paddingTop: 12
  },
  /* Double-Bezel Concentric Card Architecture */
  gridTile: {
    flex: 1,
    margin: 4,
    borderRadius: 18,
    borderWidth: 1,
    padding: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2
  },
  gridImageWrapper: {
    width: '100%',
    aspectRatio: 1.15,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden'
  },
  gridImage: {
    width: '100%',
    height: '100%'
  },
  gridEmoji: {
    textAlign: 'center'
  },
  editIconBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  gridCartBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6
  },
  gridCartBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900'
  },
  gridCardContent: {
    paddingTop: 8,
    paddingHorizontal: 2
  },
  gridCategoryEyebrow: {
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2
  },
  gridItemName: {
    fontWeight: '800',
    minHeight: 38,
    letterSpacing: -0.2
  },
  gridPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
    gap: 2
  },
  gridPriceText: {
    fontWeight: '900'
  },
  gridUnitText: {
    fontWeight: '500'
  },
  gridActionArea: {
    marginTop: 8
  },
  gridAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    minHeight: 38
  },
  gridAddBtnText: {
    fontWeight: '800'
  },
  gridStepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    borderWidth: 1.2,
    minHeight: 38,
    paddingHorizontal: 6
  },
  gridStepperBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center'
  },
  gridStepperQty: {
    fontWeight: '900'
  },
  /* Inset Grouped List Row */
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    gap: 12
  },
  listVisualBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  listImage: {
    width: '100%',
    height: '100%',
    borderRadius: 11
  },
  listBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4
  },
  listBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900'
  },
  listInfoCol: {
    flex: 1
  },
  listCategoryEyebrow: {
    fontWeight: '800',
    letterSpacing: 0.5
  },
  listItemName: {
    fontWeight: '800',
    marginTop: 1
  },
  listPriceText: {
    fontWeight: '600',
    marginTop: 2
  },
  listActionArea: {
    minWidth: 90
  },
  listAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    minHeight: 38
  },
  listAddBtnText: {
    fontWeight: '800'
  },
  listStepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    borderWidth: 1.2,
    minHeight: 38,
    paddingHorizontal: 4
  },
  listStepperBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center'
  },
  listStepperQty: {
    fontWeight: '900'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32
  },
  emptyTitle: {
    fontWeight: '800',
    marginBottom: 6
  },
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16
  },
  addNewItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    minHeight: 46
  },
  addNewItemBtnText: {
    fontWeight: '800'
  },
  catalogFooter: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 10
  },
  catalogFooterCount: {
    fontWeight: '600'
  },
  resetDefaultsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1
  },
  resetDefaultsText: {
    fontWeight: '600'
  },
  /* Form Sheet Styling */
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
  photoChamberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 8
  },
  formPhotoPreview: {
    width: 80,
    height: 80,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  previewImage: {
    width: '100%',
    height: '100%'
  },
  photoActionsCol: {
    flex: 1,
    gap: 6
  },
  photoActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 38
  },
  photoActionText: {
    fontWeight: '700'
  },
  removePhotoBtn: {
    paddingVertical: 4
  },
  removePhotoText: {
    fontWeight: '600'
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
  categoryWrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  categoryOptionChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1
  },
  categoryOptionText: {
    letterSpacing: -0.2
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
  deleteItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 20,
    minHeight: 46
  },
  deleteItemBtnText: {
    fontWeight: '700'
  }
});
