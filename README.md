# 🛒 GroceryTab PH

> **Palengke Stall Procurement & Restock Tab for iOS**  
> Accessible, visual-first grocery procurement tool designed for local market vendors and elderly stall owners in the Philippines. Priced strictly in Philippine Pesos (₱).

---

## 🌟 Overview

**GroceryTab PH** is a lightweight, 100% offline mobile application tailored for local wet market (*palengke*) stall vendors and small neighborhood grocers (*sari-sari* stores) restocking inventory from wholesale *bagsakan* centers (such as Divisoria, Balintawak, Pasig Mega Market, or local farm suppliers).

Instead of confusing customer checkout slips or fragile paper notebooks, GroceryTab PH provides a dedicated **Wholesale Procurement Tally Sheet** with automatic price memory, visual picture tiles, large touch targets, and instant change (*sukli*) calculations.

---

## 🎯 Key Features

### 1. 📋 Procurement Tally Sheet (Active Restock Tab)
- **Thermal Paper Layout**: Formatted like a grocery receipt with clear column headers: Item & Picture, Wholesale Price (₱), Steppers (`-` / `+`), and Subtotal.
- **Wholesale Price Memory**: Any price adjustment made while at the *bagsakan* center is automatically remembered in your inventory catalog for the next restock trip.
- **No Customer Retail Discounts**: Streamlined strictly for business-to-business inventory procurement.
- **Cash & Change (*Sukli*) Calculator**: Enter cash handed to the wholesaler (with quick-tap Philippine banknote chips: ₱500, ₱1,000, ₱2,000, ₱5,000) and immediately see change due.
- **Wholesale Supplier Source**: Track which bagsakan or farm supplied the goods.

### 2. 📦 Visual Inventory Catalog (Pictures & Icons First)
- **Picture / Icon Cards**: Elderly stall owners can identify goods at a glance using large visual tiles (`🍚` Rice, `🥚` Eggs, `🧄` Garlic, `🧅` Onion, `🍅` Tomatoes, `🍗` Chicken, `🥩` Pork, `🐟` Fish, `🛢️` Cooking Oil, etc.).
- **Camera & Gallery Photo Support**: Take photos of actual market goods with your camera or select from the photo library using `expo-image-picker`.
- **View Toggle**: Switch effortlessly between a high-visibility **Visual Picture Grid** and a **Compact List**.
- **Instant Search & Category Filters**: Filter by Rice & Grains, Vegetables & Spices, Meat & Seafood, Eggs & Dairy, Pantry & Canned, Beverages & Coffee, and Cleaning Supplies.

### 3. 🕒 Procurement Logs & History
- **Offline Persistence**: Completely offline storage powered by `@react-native-async-storage/async-storage`—zero cloud logins or external dependencies.
- **Expandable Itemized Records**: View full breakdowns with item icons, quantities, unit prices, cash paid, and change received.
- **Viber / SMS Order Export**: One-tap copy to clipboard formatted as a wholesale purchase list ready to send to suppliers.
- **Reload to Sheet**: Load past restock sheets back into the active tally for repeat market runs.

### 4. 👁️ Senior-Friendly Accessibility & UX
- **Large Touch Targets**: Minimum **48×48 dp** touch targets across all steppers, action chips, and buttons (tabs are 64–72 dp).
- **Zero Hidden Gesture-Only Actions**: Every edit, deletion, or removal action has an explicit, labeled, high-contrast button.
- **Persistent Accessibility Controller (`Aa / 👁️`)**:
  - **Font Sizing**: Normal (100%), Large (118%), and Extra Large (135%).
  - **Themes**:
    - *High-Contrast Light* (Default: crisp white paper with deep black ink).
    - *Warm Cream* (Soft cream background that reduces glare and eye strain in bright daylight).
    - *High-Contrast Dark* (Pure AMOLED black with bright readable text).
  - **Tactile Haptic Feedback**: Physical vibration confirms every button tap and quantity stepper press.

---

## 📱 Tech Stack

- **Framework**: React Native 0.88 with Expo SDK 58 (Tabs & Modal Architecture)
- **Language**: TypeScript
- **Storage**: `@react-native-async-storage/async-storage`
- **Device Capabilities**:
  - `expo-image-picker` (Camera & Photo Gallery)
  - `expo-haptics` (Tactile feedback)
  - `expo-clipboard` (Wholesale tally export)
  - `expo-status-bar`
  - `@expo/vector-icons`

---

## 📂 Project Structure

```text
GroceryTab-PH/
├── App.tsx                               # Root entry, Theme/App Provider & Accessible 3-Tab Navigator
├── app.json                              # Expo application configuration (ph.grocerytab.app)
├── package.json                          # Dependencies & scripts
├── tsconfig.json                         # TypeScript configuration
└── src/
    ├── components/
    │   ├── AccessibilityModal.tsx        # Persistent modal (Font scales: Normal/Large/XL, 3 Contrast themes)
    │   ├── ReceiptItemRow.tsx            # Thermal receipt row with 48x48dp steppers & direct numeric entry
    │   └── ThermalReceiptPaper.tsx       # Thermal styling with perforated paper cuts & headers
    ├── context/
    │   ├── AppContext.tsx                # Cross-screen state sync (Cart <-> Dictionary <-> History)
    │   └── ThemeContext.tsx              # Accessibility scaling & High-Contrast palette engine
    ├── screens/
    │   ├── ReceiptScreen.tsx             # Active Procurement Tally Sheet & Cash/Change Calculator
    │   ├── DictionaryScreen.tsx          # Visual Inventory Catalog (Pictures & Icons Grid)
    │   └── HistoryScreen.tsx             # Procurement Logs, itemized breakdown, & Viber/SMS export
    ├── services/
    │   ├── StorageService.ts             # AsyncStorage service with price memory & active tally persistence
    │   └── seedData.ts                   # Pre-seeded Philippine palengke wholesale staples & 32 preset icons
    ├── types/
    │   └── index.ts                      # Strict TypeScript data models
    └── utils/
        └── currency.ts                   # Philippine Peso (₱) and local date/time formatters
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Expo Go](https://expo.dev/go) app installed on your iPhone (iOS) or Android device

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/XxeylakxX/GroceryTab-PH.git
   cd GroceryTab-PH
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the Expo development server:**
   ```bash
   npx expo start
   ```

4. **Preview on Device:**
   - Scan the QR code displayed in the terminal with your iPhone's **Camera** app (or inside **Expo Go**).
   - Press `s` in the terminal to toggle between Expo Go and development builds.

---

## 🇵🇭 Built for Philippine Local Markets

All prices, units, and categories are tailored for Philippine palengke operations:
- Common wholesale units: `kg`, `tray (30 pcs)`, `sack (50kg)`, `box`, `case`, `gallon`, `pouch`.
- Currency formatted strictly in Philippine Pesos (`₱1,250.00`).

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
