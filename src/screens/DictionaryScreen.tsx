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
  ScrollView
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
    cartItems
  } = useApp();

  const { colors, scaleFont, viewMode, toggleViewMode, triggerHapticFeedback } = useAppTheme();

  // Search and Category Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Items');

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formUnit, setFormUnit] = useState('kg');
  const [formCategory, setFormCategory] = useState('Rice & Grains');
  const [formIcon, setFormIcon] = useState('🍚');
  const [formImageUri, setFormImageUri] = useState<string | undefined>(undefined);
  const [formSupplier, setFormSupplier] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Count items in active procurement
  const cartItemCounts = useMemo(() => {
    const map = new Map<string, number>();
    cartItems.forEach(ci => {
      map.set(ci.id, ci.quantity);
      map.set(ci.name.toLowerCase().trim(), ci.quantity);
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
        selectedCategory === 'All Items' || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [catalogItems, searchQuery, selectedCategory]);

  const handleOpenAdd = () => {
    triggerHapticFeedback('light');
    setEditingItem(null);
    setFormName('');
    setFormPrice('');
    setFormUnit('kg');
    setFormCategory('Rice & Grains');
    setFormIcon('🍚');
    setFormImageUri(undefined);
    setFormSupplier('Bagsakan Central');
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
          onPress: () => deleteCatalogItem(item.id)
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

  // Render Visual Grid Tile (Picture / Icon First)
  const renderGridCard = ({ item }: { item: CatalogItem }) => {
    const qtyInCart = cartItemCounts.get(item.id) || cartItemCounts.get(item.name.toLowerCase().trim()) || 0;

    return (
      <View style={[styles.gridTile, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        {/* Large Visual Picture / Icon Container */}
        <TouchableOpacity
          onPress={() => addToCart(item)}
          style={[styles.gridImageWrapper, { backgroundColor: colors.surfaceHighlight }]}
          accessibilityRole="button"
          accessibilityLabel={`Add ${item.name} to procurement tally. Price: ${formatPHP(item.unitPrice)}`}
        >
          {item.imageUri ? (
            <Image source={{ uri: item.imageUri }} style={styles.tilePhoto} resizeMode="cover" />
          ) : (
            <Text style={styles.tileEmoji}>{item.icon || '🛒'}</Text>
          )}

          {/* Active Qty Badge */}
          {qtyInCart > 0 && (
            <View style={[styles.tileBadge, { backgroundColor: colors.accent, borderColor: colors.card }]}>
              <Text style={styles.tileBadgeText}>{qtyInCart}x</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Item Title & Price */}
        <View style={styles.gridInfoBox}>
          <Text
            style={[styles.gridItemName, { color: colors.text, fontSize: scaleFont(15) }]}
            numberOfLines={2}
          >
            {item.name}
          </Text>

          <View style={styles.gridPriceRow}>
            <Text style={[styles.gridPrice, { color: colors.text, fontSize: scaleFont(17) }]}>
              {formatPHP(item.unitPrice)}
            </Text>
            <Text style={[styles.gridUnit, { color: colors.textMuted, fontSize: scaleFont(12) }]}>
              /{item.unit}
            </Text>
          </View>
        </View>

        {/* Action Buttons: Edit and Add to Tally */}
        <View style={styles.gridActionsRow}>
          <TouchableOpacity
            onPress={() => handleOpenEdit(item)}
            style={[styles.gridEditBtn, { borderColor: colors.border, backgroundColor: colors.surfaceHighlight }]}
            accessibilityLabel={`Edit ${item.name}`}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="pencil" size={scaleFont(16)} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => addToCart(item)}
            style={[
              styles.gridAddBtn,
              { backgroundColor: qtyInCart > 0 ? colors.accent : colors.primary }
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Add ${item.name} to procurement tally`}
          >
            <Ionicons name="add" size={scaleFont(18)} color={colors.primaryText} />
            <Text style={[styles.gridAddText, { color: colors.primaryText, fontSize: scaleFont(13) }]}>
              {qtyInCart > 0 ? `Tally (${qtyInCart})` : '+ Add'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render List View Row
  const renderListCard = ({ item }: { item: CatalogItem }) => {
    const qtyInCart = cartItemCounts.get(item.id) || cartItemCounts.get(item.name.toLowerCase().trim()) || 0;

    return (
      <View style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.cardHeader}>
          {/* Visual Icon / Picture */}
          <View style={[styles.listVisualBox, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
            {item.imageUri ? (
              <Image source={{ uri: item.imageUri }} style={styles.listImage} resizeMode="cover" />
            ) : (
              <Text style={{ fontSize: scaleFont(28) }}>{item.icon || '🛒'}</Text>
            )}
          </View>

          <View style={styles.cardInfo}>
            <Text style={[styles.itemCategoryBadge, { color: colors.primary, fontSize: scaleFont(12) }]}>
              {item.category.toUpperCase()}
            </Text>
            <Text style={[styles.itemName, { color: colors.text, fontSize: scaleFont(17) }]}>
              {item.name}
            </Text>
            {item.supplier ? (
              <Text style={[styles.itemNotes, { color: colors.textMuted, fontSize: scaleFont(12) }]}>
                Supplier: {item.supplier}
              </Text>
            ) : null}
          </View>

          {/* Unit Price */}
          <View style={styles.priceColumn}>
            <Text style={[styles.priceTag, { color: colors.text, fontSize: scaleFont(19) }]}>
              {formatPHP(item.unitPrice)}
            </Text>
            <Text style={[styles.unitSub, { color: colors.textSecondary, fontSize: scaleFont(13) }]}>
              per {item.unit}
            </Text>
          </View>
        </View>

        {/* Action Row */}
        <View style={styles.cardFooter}>
          <TouchableOpacity
            onPress={() => handleOpenEdit(item)}
            style={[styles.smallBtn, { borderColor: colors.border, backgroundColor: colors.surfaceHighlight }]}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${item.name}`}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="create-outline" size={scaleFont(18)} color={colors.text} />
            <Text style={[styles.smallBtnText, { color: colors.text, fontSize: scaleFont(13) }]}>
              Edit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleDeleteItem(item)}
            style={[styles.smallBtn, { borderColor: colors.danger, backgroundColor: colors.dangerSurface }]}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${item.name}`}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="trash-outline" size={scaleFont(18)} color={colors.danger} />
            <Text style={[styles.smallBtnText, { color: colors.danger, fontSize: scaleFont(13) }]}>
              Delete
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => addToCart(item)}
            style={[
              styles.addToReceiptBtn,
              {
                backgroundColor: qtyInCart > 0 ? colors.accent : colors.primary
              }
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Add ${item.name} to procurement tally`}
          >
            <Ionicons
              name={qtyInCart > 0 ? 'checkmark-circle' : 'add-circle'}
              size={scaleFont(20)}
              color={colors.primaryText}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.addToReceiptText, { color: colors.primaryText, fontSize: scaleFont(14) }]}>
              {qtyInCart > 0 ? `On Sheet (${qtyInCart}) +` : '+ To Procurement'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Search Bar & Visual View Toggle */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search" size={scaleFont(22)} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search goods (e.g. Rice, Eggs, Pork)..."
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text, fontSize: scaleFont(16) }]}
            accessibilityLabel="Search items"
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearSearchBtn}
              accessibilityLabel="Clear search input"
            >
              <Ionicons name="close-circle" size={scaleFont(22)} color={colors.textMuted} />
            </TouchableOpacity>
          )}

          {/* Toggle between Visual Grid and Compact List */}
          <TouchableOpacity
            onPress={toggleViewMode}
            style={[styles.toggleViewBtn, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}
            accessibilityRole="button"
            accessibilityLabel={`Switch to ${viewMode === 'visual-grid' ? 'List View' : 'Picture Grid View'}`}
          >
            <Ionicons
              name={viewMode === 'visual-grid' ? 'list' : 'grid'}
              size={scaleFont(20)}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Category Filter Chips */}
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryChipsList}
          renderItem={({ item: cat }) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                onPress={() => {
                  triggerHapticFeedback('light');
                  setSelectedCategory(cat);
                }}
                style={[
                  styles.catChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderWidth: 2
                  }
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <Text
                  style={[
                    styles.catChipText,
                    {
                      color: isSelected ? colors.primaryText : colors.text,
                      fontSize: scaleFont(14),
                      fontWeight: isSelected ? '800' : '600'
                    }
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Subheader: Item count & Add Button */}
      <View style={styles.subHeader}>
        <View>
          <Text style={[styles.countText, { color: colors.textSecondary, fontSize: scaleFont(14) }]}>
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} in inventory
          </Text>
        </View>
        <View style={styles.subHeaderActions}>
          <TouchableOpacity
            onPress={handleResetDefaults}
            style={[styles.resetDefaultsBtn, { borderColor: colors.border }]}
            accessibilityLabel="Restore default staples"
          >
            <Ionicons name="refresh" size={scaleFont(16)} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleOpenAdd}
            style={[styles.addNewItemBtn, { backgroundColor: colors.primary }]}
            accessibilityLabel="Add new inventory item"
            accessibilityRole="button"
          >
            <Ionicons name="add" size={scaleFont(20)} color={colors.primaryText} />
            <Text style={[styles.addNewItemText, { color: colors.primaryText, fontSize: scaleFont(15) }]}>
              + Add Item
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Item List or Visual Picture Grid */}
      <FlatList
        key={viewMode} // Re-renders cleanly when toggling columns
        numColumns={viewMode === 'visual-grid' ? 2 : 1}
        data={filteredItems}
        keyExtractor={item => item.id}
        renderItem={viewMode === 'visual-grid' ? renderGridCard : renderListCard}
        columnWrapperStyle={viewMode === 'visual-grid' ? styles.gridRow : undefined}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={scaleFont(48)} color={colors.textMuted} />
            <Text style={[styles.emptyStateTitle, { color: colors.text, fontSize: scaleFont(18) }]}>
              No items found
            </Text>
            <Text style={[styles.emptyStateDesc, { color: colors.textMuted, fontSize: scaleFont(14) }]}>
              No items match "{searchQuery}". Tap below to add it!
            </Text>
            <TouchableOpacity
              onPress={handleOpenAdd}
              style={[styles.emptyAddBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.emptyAddBtnText, { color: colors.primaryText, fontSize: scaleFont(16) }]}>
                + Add "{searchQuery}"
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Floating Active Procurement Pill */}
      {cartItems.length > 0 && (
        <TouchableOpacity
          onPress={onNavigateToReceipt}
          style={[styles.floatingCartPill, { backgroundColor: colors.accent, borderColor: colors.cardBorder }]}
          accessibilityRole="button"
          accessibilityLabel={`View Procurement Tally Sheet. ${cartItems.length} items listed.`}
        >
          <Ionicons name="receipt" size={scaleFont(22)} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={[styles.floatingCartText, { fontSize: scaleFont(16) }]}>
            View Procurement Sheet ({cartItems.length})
          </Text>
          <Ionicons name="chevron-forward" size={scaleFont(20)} color="#FFFFFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      )}

      {/* Add / Edit Item Modal */}
      <Modal
        visible={isModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setIsModalOpen(false)} />
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalTitle, { color: colors.text, fontSize: scaleFont(20) }]}>
                {editingItem ? 'Edit Item & Price' : 'Add New Inventory Item'}
              </Text>
              <Text style={[styles.modalSub, { color: colors.textSecondary, fontSize: scaleFont(14) }]}>
                Set visual pictures/icons and wholesale procurement cost
              </Text>

              {/* Picture / Icon Section */}
              <Text style={[styles.inputLabel, { color: colors.text, fontSize: scaleFont(14) }]}>
                Item Picture or Icon:
              </Text>
              <View style={styles.imageSelectorRow}>
                {/* Preview Box */}
                <View style={[styles.photoPreviewBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  {formImageUri ? (
                    <Image source={{ uri: formImageUri }} style={styles.previewImage} resizeMode="cover" />
                  ) : (
                    <Text style={{ fontSize: 36 }}>{formIcon}</Text>
                  )}
                </View>

                {/* Photo Action Buttons */}
                <View style={styles.photoActions}>
                  <TouchableOpacity
                    onPress={handleTakePhoto}
                    style={[styles.photoBtn, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}
                  >
                    <Ionicons name="camera-outline" size={scaleFont(18)} color={colors.text} />
                    <Text style={[styles.photoBtnText, { color: colors.text, fontSize: scaleFont(12) }]}>
                      Take Photo
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handlePickImage}
                    style={[styles.photoBtn, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}
                  >
                    <Ionicons name="images-outline" size={scaleFont(18)} color={colors.text} />
                    <Text style={[styles.photoBtnText, { color: colors.text, fontSize: scaleFont(12) }]}>
                      Pick Photo
                    </Text>
                  </TouchableOpacity>

                  {formImageUri && (
                    <TouchableOpacity
                      onPress={() => setFormImageUri(undefined)}
                      style={[styles.photoBtn, { borderColor: colors.danger }]}
                    >
                      <Text style={[styles.photoBtnText, { color: colors.danger, fontSize: scaleFont(12) }]}>
                        Use Emoji
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Emoji Icon Grid Picker */}
              <Text style={[styles.inputLabel, { color: colors.text, fontSize: scaleFont(13), marginTop: 8 }]}>
                Or Select from Preset Visual Icons:
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScrollRow}>
                {PRESET_ICONS.map(ic => (
                  <TouchableOpacity
                    key={ic}
                    onPress={() => {
                      setFormIcon(ic);
                      setFormImageUri(undefined);
                      triggerHapticFeedback('light');
                    }}
                    style={[
                      styles.iconPickTile,
                      {
                        backgroundColor: formIcon === ic && !formImageUri ? colors.primary : colors.card,
                        borderColor: formIcon === ic && !formImageUri ? colors.primary : colors.border
                      }
                    ]}
                  >
                    <Text style={{ fontSize: 24 }}>{ic}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Name */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text, fontSize: scaleFont(14) }]}>
                  Item Name:
                </Text>
                <TextInput
                  value={formName}
                  onChangeText={setFormName}
                  placeholder="e.g. Rice (Dinorado) or White Sugar"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.modalInput,
                    { backgroundColor: colors.card, color: colors.text, borderColor: colors.border, fontSize: scaleFont(16) }
                  ]}
                />
              </View>

              {/* Price & Unit Row */}
              <View style={styles.formRow}>
                <View style={[styles.inputGroup, { flex: 1.2 }]}>
                  <Text style={[styles.inputLabel, { color: colors.text, fontSize: scaleFont(14) }]}>
                    Wholesale Price (₱):
                  </Text>
                  <TextInput
                    value={formPrice}
                    onChangeText={setFormPrice}
                    placeholder="e.g. 52.00"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="decimal-pad"
                    style={[
                      styles.modalInput,
                      { backgroundColor: colors.card, color: colors.text, borderColor: colors.border, fontSize: scaleFont(16) }
                    ]}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, { color: colors.text, fontSize: scaleFont(14) }]}>
                    Unit:
                  </Text>
                  <TextInput
                    value={formUnit}
                    onChangeText={setFormUnit}
                    placeholder="kg, sack, tray"
                    placeholderTextColor={colors.textMuted}
                    style={[
                      styles.modalInput,
                      { backgroundColor: colors.card, color: colors.text, borderColor: colors.border, fontSize: scaleFont(16) }
                    ]}
                  />
                </View>
              </View>

              {/* Category Selector */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text, fontSize: scaleFont(14) }]}>
                  Category:
                </Text>
                <FlatList
                  horizontal
                  data={CATEGORIES.filter(c => c !== 'All Items')}
                  keyExtractor={c => c}
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item: cat }) => {
                    const isCatSelected = formCategory === cat;
                    return (
                      <TouchableOpacity
                        onPress={() => setFormCategory(cat)}
                        style={[
                          styles.catChoiceChip,
                          {
                            backgroundColor: isCatSelected ? colors.primary : colors.card,
                            borderColor: isCatSelected ? colors.primary : colors.border
                          }
                        ]}
                      >
                        <Text
                          style={[
                            styles.catChoiceText,
                            {
                              color: isCatSelected ? colors.primaryText : colors.text,
                              fontSize: scaleFont(13),
                              fontWeight: isCatSelected ? '700' : '500'
                            }
                          ]}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>

              {/* Supplier */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text, fontSize: scaleFont(14) }]}>
                  Wholesale Supplier / Bagsakan:
                </Text>
                <TextInput
                  value={formSupplier}
                  onChangeText={setFormSupplier}
                  placeholder="e.g. Divisoria, Balintawak, or Pasig Market"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.modalInput,
                    { backgroundColor: colors.card, color: colors.text, borderColor: colors.border, fontSize: scaleFont(15) }
                  ]}
                />
              </View>

              {/* Modal Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={() => setIsModalOpen(false)}
                  style={[styles.modalActionBtn, styles.modalCancelBtn, { borderColor: colors.border }]}
                >
                  <Text style={[styles.modalCancelText, { color: colors.text, fontSize: scaleFont(16) }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveItem}
                  style={[styles.modalActionBtn, { backgroundColor: colors.primary }]}
                >
                  <Text style={[styles.modalSaveText, { color: colors.primaryText, fontSize: scaleFont(16) }]}>
                    Save Item
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1.5
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 2,
    paddingHorizontal: 12,
    minHeight: 52
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontWeight: '700', paddingVertical: 8 },
  clearSearchBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  toggleViewBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6
  },
  categoryChipsList: { paddingVertical: 10, gap: 8 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center'
  },
  catChipText: {},
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  countText: { fontWeight: '700' },
  subHeaderActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  resetDefaultsBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  addNewItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    minHeight: 46
  },
  addNewItemText: { fontWeight: '800', marginLeft: 4 },
  listContent: { paddingHorizontal: 14, paddingBottom: 90, gap: 12 },
  gridRow: {
    justifyContent: 'space-between',
    gap: 12
  },
  gridTile: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  gridImageWrapper: {
    height: 94,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative'
  },
  tilePhoto: {
    width: '100%',
    height: '100%'
  },
  tileEmoji: {
    fontSize: 44
  },
  tileBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2
  },
  tileBadgeText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12
  },
  gridInfoBox: {
    marginTop: 8,
    minHeight: 52
  },
  gridItemName: {
    fontWeight: '800'
  },
  gridPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4
  },
  gridPrice: {
    fontWeight: '900'
  },
  gridUnit: {
    marginLeft: 3,
    fontWeight: '600'
  },
  gridActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)'
  },
  gridEditBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  gridAddBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    minHeight: 38
  },
  gridAddText: {
    fontWeight: '800',
    marginLeft: 2
  },
  itemCard: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 14,
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
    marginBottom: 10
  },
  listVisualBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    overflow: 'hidden'
  },
  listImage: {
    width: '100%',
    height: '100%'
  },
  cardInfo: { flex: 1, paddingRight: 8 },
  itemCategoryBadge: { fontWeight: '800', letterSpacing: 0.5, marginBottom: 2 },
  itemName: { fontWeight: '800' },
  itemNotes: { marginTop: 2 },
  priceColumn: { alignItems: 'flex-end', minWidth: 90 },
  priceTag: { fontWeight: '900' },
  unitSub: { marginTop: 2, fontWeight: '600' },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)'
  },
  smallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 46,
    gap: 4
  },
  smallBtnText: { fontWeight: '700' },
  addToReceiptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    minHeight: 46
  },
  addToReceiptText: { fontWeight: '800' },
  emptyState: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyStateTitle: { fontWeight: '800', marginTop: 10 },
  emptyStateDesc: { textAlign: 'center', marginTop: 6, marginBottom: 16 },
  emptyAddBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    minHeight: 48,
    justifyContent: 'center'
  },
  emptyAddBtnText: { fontWeight: '800' },
  floatingCartPill: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  floatingCartText: { color: '#FFFFFF', fontWeight: '900' },
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
    maxWidth: 440,
    maxHeight: '90%',
    borderRadius: 20,
    borderWidth: 2,
    padding: 18
  },
  modalTitle: { fontWeight: '800' },
  modalSub: { marginTop: 4, marginBottom: 12 },
  imageSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8
  },
  photoPreviewBox: {
    width: 68,
    height: 68,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  previewImage: {
    width: '100%',
    height: '100%'
  },
  photoActions: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    minHeight: 40,
    gap: 4
  },
  photoBtnText: {
    fontWeight: '700'
  },
  iconScrollRow: {
    flexDirection: 'row',
    marginBottom: 12
  },
  iconPickTile: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6
  },
  inputGroup: { marginBottom: 12 },
  formRow: { flexDirection: 'row', gap: 10 },
  inputLabel: { fontWeight: '700', marginBottom: 6 },
  modalInput: {
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 50,
    fontWeight: '700'
  },
  catChoiceChip: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 6
  },
  catChoiceText: {},
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 14 },
  modalActionBtn: {
    flex: 1,
    minHeight: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalCancelBtn: { borderWidth: 2 },
  modalCancelText: { fontWeight: '700' },
  modalSaveText: { fontWeight: '800' }
});
