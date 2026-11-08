// Smart Grocery - Firebase SDK Initialization & Cloud Firestore Database Integration
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB-68S-6GE_S-V7U7FIamcHfrPGcUcsAsQ",
  authDomain: "smart-brocery.firebaseapp.com",
  projectId: "smart-brocery",
  storageBucket: "smart-brocery.firebasestorage.app",
  messagingSenderId: "385571597092",
  appId: "1:385571597092:web:59b30132db278c3de2e1b1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper to sanitize objects for Firestore (remove undefined / functions)
function sanitize(obj) {
  return JSON.parse(JSON.stringify(obj));
}

const COLLECTIONS = {
  CART: 'cart_items',
  SETTINGS: 'settings',
  PRICE_HISTORY: 'price_history',
  TRANSACTIONS: 'transactions'
};

const DOCS = {
  BUDGET: 'budget'
};

// Global Firebase Manager for Smart Grocery
const FirebaseManager = {
  app,
  db,
  isReady: false,
  isSyncing: false,
  lastSynced: null,
  activeListeners: [],
  syncDisabledTemporarily: false,

  notifyStatus(status, details = {}) {
    const eventDetail = {
      status, // 'connecting' | 'connected' | 'synced' | 'offline' | 'error'
      lastSynced: this.lastSynced,
      projectId: firebaseConfig.projectId,
      ...details
    };
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('smartgrocery:firebase-status', { detail: eventDetail }));
    }
  },

  notifyDataChanged(type, data) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('smartgrocery:data-changed', { detail: { type, data } }));
    }
  },

  /**
   * Initialize Firestore connection and listeners
   */
  async init() {
    this.notifyStatus('connecting', { message: 'Menghubungkan ke Cloud Firestore...' });

    try {
      // 1. Initial sync: check if database has data or needs seeding
      await this.initialSync();

      // 2. Set up realtime listeners for live sync across devices
      this.setupRealtimeListeners();

      this.isReady = true;
      this.lastSynced = new Date();
      this.notifyStatus('connected', { message: 'Terkoneksi ke Firebase Cloud Firestore' });
      console.log('🔥 [Firebase] Cloud Firestore connected successfully for project:', firebaseConfig.projectId);
    } catch (err) {
      console.warn('⚠️ [Firebase] Offline or connection error. Falling back to LocalStorage:', err);
      this.notifyStatus('error', { message: 'Mode Offline (Menggunakan Penyimpanan Lokal)', error: err });
    }
  },

  /**
   * Initial sync between Firestore and local storage
   */
  async initialSync() {
    try {
      const cartSnapshot = await getDocs(collection(db, COLLECTIONS.CART));
      const budgetDocSnap = await getDoc(doc(db, COLLECTIONS.SETTINGS, DOCS.BUDGET));
      const priceSnap = await getDocs(collection(db, COLLECTIONS.PRICE_HISTORY));
      const trxSnap = await getDocs(collection(db, COLLECTIONS.TRANSACTIONS));

      // 1. Budget
      if (budgetDocSnap.exists() && window.SmartGroceryData) {
        window.SmartGroceryData.set('sg_budget_config', budgetDocSnap.data());
      } else if (window.SmartGroceryData) {
        const localBudget = window.SmartGroceryData.getBudget();
        if (localBudget) await this.saveBudget(localBudget);
      }

      // 2. Cart
      if (!cartSnapshot.empty && window.SmartGroceryData) {
        const cloudCart = [];
        cartSnapshot.forEach(d => cloudCart.push(d.data()));
        window.SmartGroceryData.set('sg_active_cart', cloudCart);
        if (window.SmartGroceryCart) {
          window.SmartGroceryCart.items = cloudCart;
          window.SmartGroceryCart.recalculateAll();
        }
      } else if (window.SmartGroceryData) {
        const localCart = window.SmartGroceryData.getCart() || [];
        if (localCart.length > 0) {
          await this.syncAllCart(localCart);
        }
      }

      // 3. Price History
      if (!priceSnap.empty && window.SmartGroceryData) {
        const cloudPrices = [];
        priceSnap.forEach(d => cloudPrices.push(d.data()));
        window.SmartGroceryData.set('sg_price_history_db', cloudPrices);
      } else if (window.SmartGroceryData) {
        const localPrices = window.SmartGroceryData.getPriceHistory() || [];
        if (localPrices.length > 0) {
          await this.syncAllPriceHistory(localPrices);
        }
      }

      // 4. Transactions
      if (!trxSnap.empty && window.SmartGroceryData) {
        const cloudTrx = [];
        trxSnap.forEach(d => cloudTrx.push(d.data()));
        cloudTrx.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        window.SmartGroceryData.set('sg_transactions_log', cloudTrx);
      } else if (window.SmartGroceryData) {
        const localTrx = window.SmartGroceryData.getTransactions() || [];
        for (const trx of localTrx) {
          await this.saveTransaction(trx);
        }
      }

      this.notifyDataChanged('all', null);
    } catch (err) {
      console.error('Error during initial Firestore sync:', err);
      throw err;
    }
  },

  /**
   * Set up realtime snapshot listeners
   */
  setupRealtimeListeners() {
    // 1. Cart Items Listener
    const unsubCart = onSnapshot(collection(db, COLLECTIONS.CART), (snapshot) => {
      if (this.syncDisabledTemporarily) return;

      const cloudItems = [];
      snapshot.forEach(docSnap => {
        cloudItems.push(docSnap.data());
      });

      // Update local storage & in-memory cart
      if (window.SmartGroceryData && window.SmartGroceryCart) {
        // Only update if there are items or if explicitly empty
        const currentCart = window.SmartGroceryData.getCart();
        const cloudJson = JSON.stringify(cloudItems);
        const localJson = JSON.stringify(currentCart);

        if (cloudJson !== localJson && cloudItems.length > 0) {
          window.SmartGroceryData.set('sg_active_cart', cloudItems);
          window.SmartGroceryCart.items = cloudItems;
          window.SmartGroceryCart.recalculateAll();
          this.lastSynced = new Date();
          this.notifyStatus('synced', { message: 'Keranjang tersinkron dari Cloud' });
          this.notifyDataChanged('cart', cloudItems);
        }
      }
    }, (err) => {
      console.warn('[Firebase] Cart listener error:', err);
    });
    this.activeListeners.push(unsubCart);

    // 2. Budget Config Listener
    const unsubBudget = onSnapshot(doc(db, COLLECTIONS.SETTINGS, DOCS.BUDGET), (docSnap) => {
      if (this.syncDisabledTemporarily) return;

      if (docSnap.exists() && window.SmartGroceryData) {
        const cloudBudget = docSnap.data();
        const currentBudget = window.SmartGroceryData.getBudget();

        if (JSON.stringify(cloudBudget) !== JSON.stringify(currentBudget)) {
          window.SmartGroceryData.set('sg_budget_config', cloudBudget);
          this.lastSynced = new Date();
          this.notifyStatus('synced', { message: 'Anggaran tersinkron dari Cloud' });
          this.notifyDataChanged('budget', cloudBudget);
        }
      }
    }, (err) => {
      console.warn('[Firebase] Budget listener error:', err);
    });
    this.activeListeners.push(unsubBudget);

    // 3. Transactions Listener
    const unsubTrx = onSnapshot(collection(db, COLLECTIONS.TRANSACTIONS), (snapshot) => {
      if (this.syncDisabledTemporarily) return;

      const cloudTrx = [];
      snapshot.forEach(docSnap => {
        cloudTrx.push(docSnap.data());
      });

      if (cloudTrx.length > 0 && window.SmartGroceryData) {
        // Sort descending by date
        cloudTrx.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        const currentTrx = window.SmartGroceryData.getTransactions();
        if (JSON.stringify(cloudTrx) !== JSON.stringify(currentTrx)) {
          window.SmartGroceryData.set('sg_transactions_log', cloudTrx);
          this.notifyDataChanged('transactions', cloudTrx);
        }
      }
    }, (err) => {
      console.warn('[Firebase] Transactions listener error:', err);
    });
    this.activeListeners.push(unsubTrx);

    // 4. Price History Listener
    const unsubPrice = onSnapshot(collection(db, COLLECTIONS.PRICE_HISTORY), (snapshot) => {
      if (this.syncDisabledTemporarily) return;

      const cloudPrices = [];
      snapshot.forEach(docSnap => {
        cloudPrices.push(docSnap.data());
      });

      if (cloudPrices.length > 0 && window.SmartGroceryData) {
        const currentPrices = window.SmartGroceryData.getPriceHistory();
        if (JSON.stringify(cloudPrices) !== JSON.stringify(currentPrices)) {
          window.SmartGroceryData.set('sg_price_history_db', cloudPrices);
          this.notifyDataChanged('price_history', cloudPrices);
        }
      }
    }, (err) => {
      console.warn('[Firebase] Price history listener error:', err);
    });
    this.activeListeners.push(unsubPrice);
  },

  /**
   * Save or update a single cart item to Firestore
   */
  async saveCartItem(item) {
    if (!item || !item.id) return;
    try {
      this.syncDisabledTemporarily = true;
      const cleanData = sanitize(item);
      cleanData.updatedAt = new Date().toISOString();
      await setDoc(doc(db, COLLECTIONS.CART, item.id), cleanData);
      this.lastSynced = new Date();
      this.notifyStatus('synced', { message: `Barang "${item.name}" disimpan ke Cloud` });
    } catch (err) {
      console.error('[Firebase] Error saving cart item:', err);
    } finally {
      setTimeout(() => { this.syncDisabledTemporarily = false; }, 300);
    }
  },

  /**
   * Delete a cart item from Firestore
   */
  async deleteCartItem(itemId) {
    if (!itemId) return;
    try {
      this.syncDisabledTemporarily = true;
      await deleteDoc(doc(db, COLLECTIONS.CART, itemId));
      this.lastSynced = new Date();
      this.notifyStatus('synced', { message: 'Barang dihapus dari Cloud' });
    } catch (err) {
      console.error('[Firebase] Error deleting cart item:', err);
    } finally {
      setTimeout(() => { this.syncDisabledTemporarily = false; }, 300);
    }
  },

  /**
   * Sync complete cart list to Firestore
   */
  async syncAllCart(cartItems = []) {
    try {
      this.syncDisabledTemporarily = true;
      const batch = writeBatch(db);

      // Get existing cloud items to delete any that were removed
      const snapshot = await getDocs(collection(db, COLLECTIONS.CART));
      const activeIds = new Set(cartItems.map(i => i.id));

      snapshot.forEach(docSnap => {
        if (!activeIds.has(docSnap.id)) {
          batch.delete(docSnap.ref);
        }
      });

      // Upsert current items
      cartItems.forEach(item => {
        const cleanData = sanitize(item);
        cleanData.updatedAt = new Date().toISOString();
        const docRef = doc(db, COLLECTIONS.CART, item.id);
        batch.set(docRef, cleanData);
      });

      await batch.commit();
      this.lastSynced = new Date();
      this.notifyStatus('synced', { message: 'Keranjang lengkap tersinkronisasi ke Cloud' });
    } catch (err) {
      console.error('[Firebase] Error syncing all cart items:', err);
    } finally {
      setTimeout(() => { this.syncDisabledTemporarily = false; }, 300);
    }
  },

  /**
   * Save budget configuration to Firestore
   */
  async saveBudget(budgetConfig) {
    if (!budgetConfig) return;
    try {
      this.syncDisabledTemporarily = true;
      const cleanData = sanitize(budgetConfig);
      cleanData.updatedAt = new Date().toISOString();
      await setDoc(doc(db, COLLECTIONS.SETTINGS, DOCS.BUDGET), cleanData);
      this.lastSynced = new Date();
      this.notifyStatus('synced', { message: 'Pengaturan anggaran disimpan ke Cloud' });
    } catch (err) {
      console.error('[Firebase] Error saving budget config:', err);
    } finally {
      setTimeout(() => { this.syncDisabledTemporarily = false; }, 300);
    }
  },

  /**
   * Save completed transaction receipt to Firestore
   */
  async saveTransaction(transaction) {
    if (!transaction || !transaction.id) return;
    try {
      const cleanData = sanitize(transaction);
      cleanData.createdAt = cleanData.createdAt || new Date().toISOString();
      await setDoc(doc(db, COLLECTIONS.TRANSACTIONS, transaction.id), cleanData);
      this.lastSynced = new Date();
      this.notifyStatus('synced', { message: 'Struk belanja tersimpan di Cloud Firestore' });
    } catch (err) {
      console.error('[Firebase] Error saving transaction:', err);
    }
  },

  /**
   * Save / update a price history record in Firestore
   */
  async savePriceHistoryItem(phItem) {
    if (!phItem || !phItem.id) return;
    try {
      const cleanData = sanitize(phItem);
      cleanData.updatedAt = new Date().toISOString();
      await setDoc(doc(db, COLLECTIONS.PRICE_HISTORY, phItem.id), cleanData);
    } catch (err) {
      console.error('[Firebase] Error saving price history item:', err);
    }
  },

  /**
   * Sync complete price history database to Firestore
   */
  async syncAllPriceHistory(priceHistoryList = []) {
    try {
      const batch = writeBatch(db);
      priceHistoryList.forEach(ph => {
        const cleanData = sanitize(ph);
        cleanData.updatedAt = new Date().toISOString();
        const docRef = doc(db, COLLECTIONS.PRICE_HISTORY, ph.id);
        batch.set(docRef, cleanData);
      });
      await batch.commit();
      this.lastSynced = new Date();
    } catch (err) {
      console.error('[Firebase] Error syncing price history:', err);
    }
  },

  /**
   * Push all local data from localStorage into Cloud Firestore
   */
  async pushAllLocalData() {
    if (!window.SmartGroceryData) return;
    this.isSyncing = true;
    this.notifyStatus('connecting', { message: 'Mengunggah seluruh data lokal ke Cloud Firestore...' });

    try {
      const cart = window.SmartGroceryData.getCart() || [];
      const budget = window.SmartGroceryData.getBudget();
      const prices = window.SmartGroceryData.getPriceHistory() || [];
      const transactions = window.SmartGroceryData.getTransactions() || [];

      // 1. Budget
      if (budget) await this.saveBudget(budget);

      // 2. Cart
      if (cart.length > 0) await this.syncAllCart(cart);

      // 3. Price History
      if (prices.length > 0) await this.syncAllPriceHistory(prices);

      // 4. Transactions
      for (const trx of transactions) {
        await this.saveTransaction(trx);
      }

      this.lastSynced = new Date();
      this.notifyStatus('synced', { message: 'Semua data lokal berhasil diunggah ke Cloud Firestore!' });
      return true;
    } catch (err) {
      console.error('Error pushing local data to Firestore:', err);
      this.notifyStatus('error', { message: 'Gagal mengunggah data ke Firestore', error: err });
      return false;
    } finally {
      this.isSyncing = false;
    }
  },

  /**
   * Pull all data from Cloud Firestore into local storage and memory
   */
  async pullAllCloudData() {
    if (!window.SmartGroceryData) return;
    this.isSyncing = true;
    this.notifyStatus('connecting', { message: 'Mengambil data terbaru dari Cloud Firestore...' });

    try {
      // 1. Budget
      const budgetSnap = await getDoc(doc(db, COLLECTIONS.SETTINGS, DOCS.BUDGET));
      if (budgetSnap.exists()) {
        window.SmartGroceryData.set('sg_budget_config', budgetSnap.data());
      }

      // 2. Cart
      const cartSnap = await getDocs(collection(db, COLLECTIONS.CART));
      if (!cartSnap.empty) {
        const cloudCart = [];
        cartSnap.forEach(d => cloudCart.push(d.data()));
        window.SmartGroceryData.set('sg_active_cart', cloudCart);
        if (window.SmartGroceryCart) {
          window.SmartGroceryCart.items = cloudCart;
          window.SmartGroceryCart.recalculateAll();
        }
      }

      // 3. Price History
      const priceSnap = await getDocs(collection(db, COLLECTIONS.PRICE_HISTORY));
      if (!priceSnap.empty) {
        const cloudPrices = [];
        priceSnap.forEach(d => cloudPrices.push(d.data()));
        window.SmartGroceryData.set('sg_price_history_db', cloudPrices);
      }

      // 4. Transactions
      const trxSnap = await getDocs(collection(db, COLLECTIONS.TRANSACTIONS));
      if (!trxSnap.empty) {
        const cloudTrx = [];
        trxSnap.forEach(d => cloudTrx.push(d.data()));
        cloudTrx.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        window.SmartGroceryData.set('sg_transactions_log', cloudTrx);
      }

      this.lastSynced = new Date();
      this.notifyStatus('synced', { message: 'Data berhasil disinkronkan dari Cloud Firestore' });
      this.notifyDataChanged('all', null);
      return true;
    } catch (err) {
      console.error('Error pulling data from Firestore:', err);
      this.notifyStatus('error', { message: 'Gagal mengambil data dari Firestore', error: err });
      return false;
    } finally {
      this.isSyncing = false;
    }
  }
};

// Expose globally
window.SmartGroceryFirebase = FirebaseManager;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => FirebaseManager.init());
} else {
  FirebaseManager.init();
}
