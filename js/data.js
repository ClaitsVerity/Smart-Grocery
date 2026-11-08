// Smart Grocery - Initial Seed Data & LocalStorage Handlers
(function(window) {
  'use strict';

  const STORAGE_KEYS = {
    BUDGET: 'sg_budget_config',
    CART: 'sg_active_cart',
    PRICE_HISTORY: 'sg_price_history_db',
    TRANSACTIONS: 'sg_transactions_log',
    SESSION: 'sg_shopping_session'
  };

  const DEFAULT_CATEGORIES = [
    { id: 'bahan_pokok', name: 'Bahan Pokok', icon: 'utensils', color: '#10b981' },
    { id: 'makanan_pokok', name: 'Makanan Pokok', icon: 'utensils', color: '#10b981' },
    { id: 'minyak_bumbu', name: 'Minyak & Bumbu', icon: 'flame', color: '#f59e0b' },
    { id: 'kebersihan', name: 'Kebersihan & Cuci', icon: 'sparkles', color: '#3b82f6' },
    { id: 'perawatan', name: 'Perawatan Diri', icon: 'heart', color: '#ec4899' },
    { id: 'minuman', name: 'Minuman & Susu', icon: 'coffee', color: '#8b5cf6' },
    { id: 'camilan', name: 'Camilan & Snack', icon: 'cookie', color: '#f97316' },
    { id: 'lainnya', name: 'Lain-lain', icon: 'package', color: '#64748b' }
  ];

  const DEFAULT_UNITS = ['pcs', 'pack', 'kg', 'liter', 'karung/5kg', 'botol', 'dus', 'ikat'];

  const SEED_SESSION = {
    store: 'Lotte Mart Grocery - Puri Indah',
    date: '2026-10-26'
  };

  // Seed baseline price history from "Bulan Lalu" (September 2026) for price comparator
  const SEED_PRICE_HISTORY = [
    {
      id: 'ph_dt2_1',
      name: 'Beras Rojolele',
      category: 'Bahan Pokok',
      unit: 'karung/5kg',
      lastPrice: 68000, // Sekarang Rp 74.000 -> Naik +Rp 6.000 (↑)
      lastMonth: 'September 2026',
      supermarket: 'Lotte Mart Grocery - Puri Indah',
      notes: 'Lotte Mart Grocery - Puri Indah'
    },
    {
      id: 'ph_dt2_2',
      name: 'Beras 5kg',
      category: 'Bahan Pokok',
      unit: 'karung/5kg',
      lastPrice: 68000, // Sekarang Rp 74.000 -> Naik +Rp 6.000 (↑)
      lastMonth: 'September 2026',
      supermarket: 'Lotte Mart Grocery - Puri Indah',
      notes: 'Lotte Mart Grocery - Puri Indah'
    },
    {
      id: 'ph_dt2_3',
      name: 'Telur 1kg',
      category: 'Bahan Pokok',
      unit: 'kg',
      lastPrice: 32000, // Sekarang Rp 28.000 -> Turun -Rp 4.000 (↓)
      lastMonth: 'September 2026',
      supermarket: 'Lotte Mart Grocery - Puri Indah',
      notes: 'Lotte Mart Grocery - Puri Indah'
    },
    {
      id: 'ph_dt2_4',
      name: 'Garam 500g',
      category: 'Minyak & Bumbu',
      unit: 'pack',
      lastPrice: 5000, // Sekarang Rp 5.000 -> Stabil (=)
      lastMonth: 'September 2026',
      supermarket: 'Lotte Mart Grocery - Puri Indah',
      notes: 'Lotte Mart Grocery - Puri Indah'
    },
    {
      id: 'ph_dt2_5',
      name: 'Minyak Goreng 2L',
      category: 'Minyak & Bumbu',
      unit: 'pack',
      lastPrice: 43000, // SRS F-02
      lastMonth: 'September 2026',
      supermarket: 'Lotte Mart Grocery - Puri Indah',
      notes: 'Lotte Mart Grocery - Puri Indah'
    },
    {
      id: 'ph_dt2_6',
      name: 'Wajan',
      category: 'Lain-lain',
      unit: 'pcs',
      lastPrice: 100000, // SRS F-03 Wajan promo 50% + 20%
      lastMonth: 'September 2026',
      supermarket: 'Lotte Mart Grocery - Puri Indah',
      notes: 'Lotte Mart Grocery - Puri Indah'
    },
    {
      id: 'ph_dt2_7',
      name: 'Sabun Cuci',
      category: 'Kebersihan & Cuci',
      unit: 'pack',
      lastPrice: 20000, // SRS F-03 Sabun cuci diskon 25%
      lastMonth: 'September 2026',
      supermarket: 'Lotte Mart Grocery - Puri Indah',
      notes: 'Lotte Mart Grocery - Puri Indah'
    },
    {
      id: 'ph_dt2_8',
      name: 'Sabun Mandi',
      category: 'Perawatan Diri',
      unit: 'pack',
      lastPrice: 15000, // SRS F-06B Sabun mandi Rp 15.000 qty 2
      lastMonth: 'September 2026',
      supermarket: 'Lotte Mart Grocery - Puri Indah',
      notes: 'Lotte Mart Grocery - Puri Indah'
    },
    {
      id: 'ph_1',
      name: 'Beras Ramos Super 5kg',
      category: 'Makanan Pokok',
      unit: 'pack',
      lastPrice: 69500,
      lastMonth: 'September 2026',
      notes: 'Beli di Superindo'
    },
    {
      id: 'ph_2',
      name: 'Minyak Goreng Sania 2L',
      category: 'Minyak & Bumbu',
      unit: 'pack',
      lastPrice: 38000,
      lastMonth: 'September 2026',
      notes: 'Harga normal'
    },
    {
      id: 'ph_3',
      name: 'Telur Ayam Negeri 1kg',
      category: 'Makanan Pokok',
      unit: 'kg',
      lastPrice: 28500,
      lastMonth: 'September 2026',
      notes: 'Isi ~16 butir'
    },
    {
      id: 'ph_4',
      name: 'Indomie Goreng Spesial',
      category: 'Makanan Pokok',
      unit: 'pcs',
      lastPrice: 3100,
      lastMonth: 'September 2026',
      notes: 'Stok kosan'
    },
    {
      id: 'ph_5',
      name: 'Sunlight Jeruk Nipis 750ml',
      category: 'Kebersihan & Cuci',
      unit: 'pack',
      lastPrice: 15000,
      lastMonth: 'September 2026',
      notes: 'Refill pouch'
    },
    {
      id: 'ph_6',
      name: 'Sabun Mandi Lifebuoy Refill 400ml',
      category: 'Perawatan Diri',
      unit: 'pack',
      lastPrice: 22500,
      lastMonth: 'September 2026',
      notes: 'Total 10'
    },
    {
      id: 'ph_7',
      name: 'Deterjen Rinso Anti Noda 770g',
      category: 'Kebersihan & Cuci',
      unit: 'pack',
      lastPrice: 23000,
      lastMonth: 'September 2026',
      notes: 'Bubuk'
    },
    {
      id: 'ph_8',
      name: 'Pasta Gigi Pepsodent 190g',
      category: 'Perawatan Diri',
      unit: 'pcs',
      lastPrice: 14000,
      lastMonth: 'September 2026',
      notes: 'Jumbo'
    },
    {
      id: 'ph_9',
      name: 'Susu UHT Ultra Milk Full Cream 1L',
      category: 'Minuman & Susu',
      unit: 'liter',
      lastPrice: 19000,
      lastMonth: 'September 2026',
      notes: 'Tetra pak'
    },
    {
      id: 'ph_10',
      name: 'Bawang Merah Brebes 500g',
      category: 'Minyak & Bumbu',
      unit: 'pack',
      lastPrice: 17500,
      lastMonth: 'September 2026',
      notes: 'Pasar/Supermarket'
    },
    {
      id: 'ph_11',
      name: 'Nugget Ayam Fiesta 500g',
      category: 'Makanan Pokok',
      unit: 'pack',
      lastPrice: 45000,
      lastMonth: 'September 2026',
      notes: 'Frozen'
    },
    {
      id: 'ph_12',
      name: 'Shampoo Pantene 160ml',
      category: 'Perawatan Diri',
      unit: 'botol',
      lastPrice: 26000,
      lastMonth: 'September 2026',
      notes: 'Hair fall control'
    }
  ];

  // Seed initial trolley cart with DT2 test scenario items
  const SEED_CART = [
    {
      id: 'item_1',
      name: 'Beras Rojolele',
      category: 'Bahan Pokok',
      unit: 'karung/5kg',
      quantity: 1,
      unitPrice: 74000, // Naik vs 68.000 (+Rp 6.000 ↑) di Lotte Mart Puri Indah
      discountType: 'none',
      discountD1: 0,
      discountD2: 0,
      discountDirect: 0,
      inCart: true,
      notes: 'Bahan Pokok di Lotte Mart'
    },
    {
      id: 'item_2',
      name: 'Minyak Goreng 2L',
      category: 'Minyak & Bumbu',
      unit: 'pack',
      quantity: 1,
      unitPrice: 43000, // SRS F-02: Qty 1 = Rp 43.000, ubah ke Qty 3 = Rp 129.000
      discountType: 'none',
      discountD1: 0,
      discountD2: 0,
      discountDirect: 0,
      inCart: true,
      notes: 'Promo Lotte Mart Puri Indah'
    },
    {
      id: 'item_3',
      name: 'Telur 1kg',
      category: 'Bahan Pokok',
      unit: 'kg',
      quantity: 1,
      unitPrice: 28000, // Turun vs 32.000 (-Rp 4.000 ↓) di Lotte Mart Puri Indah
      discountType: 'none',
      discountD1: 0,
      discountD2: 0,
      discountDirect: 0,
      inCart: true,
      notes: 'Harga turun dibanding bulan lalu'
    },
    {
      id: 'item_4',
      name: 'Garam 500g',
      category: 'Minyak & Bumbu',
      unit: 'pack',
      quantity: 1,
      unitPrice: 5000, // Stabil vs 5.000 (=)
      discountType: 'none',
      discountD1: 0,
      discountD2: 0,
      discountDirect: 0,
      inCart: false, // Belum masuk troli, masih di rak!
      notes: 'Harga stabil di Lotte Mart'
    }
  ];

  const SEED_BUDGET = {
    monthlyLimit: 350000, // Rp 350.000 limit dompet belanja anak rantau (DT2 Review Kasus Rian)
    safetyBufferPercent: 10, // 10% buffer = Rp 35.000 cadangan aman
    monthName: 'Oktober 2026',
    alertThresholdPercent: 90 // Skenario Uji 5: warning pada >= 90%
  };

  const SEED_TRANSACTIONS = [
    {
      id: 'trx_sep_2026',
      date: '2026-09-24T10:30:00.000Z',
      month: 'September 2026',
      supermarket: 'Lotte Mart Grocery - Puri Indah',
      budgetLimit: 550000,
      totalSpent: 485000,
      totalSaved: 42000,
      itemCount: 8,
      items: [
        { name: 'Beras Ramos Super 5kg', qty: 1, unit: 'pack', finalTotal: 69500 },
        { name: 'Minyak Goreng Sania 2L', qty: 1, unit: 'pack', finalTotal: 38000 },
        { name: 'Telur Ayam Negeri 1kg', qty: 1, unit: 'kg', finalTotal: 28500 },
        { name: 'Sunlight Jeruk Nipis 750ml', qty: 2, unit: 'pack', finalTotal: 30000 },
        { name: 'Sabun Mandi Lifebuoy Refill 400ml', qty: 2, unit: 'pack', finalTotal: 45000 },
        { name: 'Deterjen Rinso Anti Noda 770g', qty: 1, unit: 'pack', finalTotal: 23000 },
        { name: 'Pasta Gigi Pepsodent 190g', qty: 1, unit: 'pcs', finalTotal: 14000 },
        { name: 'Nugget Ayam Fiesta 500g', qty: 1, unit: 'pack', finalTotal: 45000 }
      ]
    }
  ];

  // Storage helper
  const DataStore = {
    get(key, defaultValue) {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const item = window.localStorage.getItem(key);
          return item ? JSON.parse(item) : defaultValue;
        }
        return defaultValue;
      } catch (e) {
        console.warn('Storage read fallback for key:', key);
        return defaultValue;
      }
    },
    set(key, value) {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, JSON.stringify(value));
        }
      } catch (e) {
        console.error('Storage write error for key:', key, e);
      }
    },

    // Session (Store & Date - F-01 & F-06A)
    getSession() {
      return this.get(STORAGE_KEYS.SESSION, SEED_SESSION);
    },
    saveSession(sessionObj) {
      this.set(STORAGE_KEYS.SESSION, sessionObj);
      if (typeof window !== 'undefined' && window.SmartGroceryFirebase && window.SmartGroceryFirebase.isReady) {
        window.SmartGroceryFirebase.saveSession(sessionObj);
      }
    },
    // Budget
    getBudget() {
      return this.get(STORAGE_KEYS.BUDGET, SEED_BUDGET);
    },
    saveBudget(budgetObj) {
      this.set(STORAGE_KEYS.BUDGET, budgetObj);
      if (typeof window !== 'undefined' && window.SmartGroceryFirebase && window.SmartGroceryFirebase.isReady) {
        window.SmartGroceryFirebase.saveBudget(budgetObj);
      }
    },
    // Cart
    getCart() {
      return this.get(STORAGE_KEYS.CART, SEED_CART);
    },
    saveCart(cartArray) {
      this.set(STORAGE_KEYS.CART, cartArray);
      if (typeof window !== 'undefined' && window.SmartGroceryFirebase && window.SmartGroceryFirebase.isReady) {
        window.SmartGroceryFirebase.syncAllCart(cartArray);
      }
    },
    // Price history DB (F-04, F-06)
    getPriceHistory() {
      return this.get(STORAGE_KEYS.PRICE_HISTORY, SEED_PRICE_HISTORY);
    },
    savePriceHistory(historyArray) {
      this.set(STORAGE_KEYS.PRICE_HISTORY, historyArray);
      if (typeof window !== 'undefined' && window.SmartGroceryFirebase && window.SmartGroceryFirebase.isReady) {
        window.SmartGroceryFirebase.syncAllPriceHistory(historyArray);
      }
    },
    // Past Transactions Logs
    getTransactions() {
      return this.get(STORAGE_KEYS.TRANSACTIONS, SEED_TRANSACTIONS);
    },
    saveTransactions(trxArray) {
      this.set(STORAGE_KEYS.TRANSACTIONS, trxArray);
      if (typeof window !== 'undefined' && window.SmartGroceryFirebase && window.SmartGroceryFirebase.isReady && trxArray.length > 0) {
        window.SmartGroceryFirebase.saveTransaction(trxArray[0]);
      }
    },
    // Reset all to seed
    resetAllToDefault() {
      this.set(STORAGE_KEYS.SESSION, SEED_SESSION);
      this.set(STORAGE_KEYS.BUDGET, SEED_BUDGET);
      this.set(STORAGE_KEYS.CART, SEED_CART);
      this.set(STORAGE_KEYS.PRICE_HISTORY, SEED_PRICE_HISTORY);
      this.set(STORAGE_KEYS.TRANSACTIONS, SEED_TRANSACTIONS);
      if (typeof window !== 'undefined' && window.SmartGroceryFirebase && window.SmartGroceryFirebase.isReady) {
        window.SmartGroceryFirebase.pushAllLocalData();
      }
    },
    getCategories() {
      return DEFAULT_CATEGORIES;
    },
    getUnits() {
      return DEFAULT_UNITS;
    }
  };

  // Expose globally
  window.SmartGroceryData = DataStore;
})(window);
