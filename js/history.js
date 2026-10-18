// Smart Grocery - History & Price Database Manager (F-06)
(function(window) {
  'use strict';

  const HistoryManager = {
    /**
     * Finalize and complete current shopping session (Checkout)
     * Saves receipt to history AND updates price database for next month
     * @param {Object} options - supermarket name, notes
     */
    checkoutCurrentCart(options = {}) {
      if (!window.SmartGroceryCart || !window.SmartGroceryBudget || !window.SmartGroceryData) {
        throw new Error('Dependencies not loaded');
      }

      const cartItems = window.SmartGroceryCart.getItems();
      if (!cartItems || cartItems.length === 0) {
        throw new Error('Keranjang belanja masih kosong');
      }

      const budgetStatus = window.SmartGroceryBudget.evaluate(cartItems);
      const now = new Date();
      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const currentMonthName = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

      // Build transaction receipt
      const transaction = {
        id: 'trx_' + now.getTime(),
        date: now.toISOString(),
        formattedDate: now.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        month: currentMonthName,
        supermarket: options.supermarket || 'Supermarket Bulanan',
        budgetLimit: budgetStatus.limit,
        totalSpent: budgetStatus.totalNet,
        totalGross: budgetStatus.totalGross,
        totalSaved: budgetStatus.totalDiscount,
        itemCount: cartItems.length,
        isOverBudget: budgetStatus.isOverBudget,
        statusText: budgetStatus.statusText,
        notes: options.notes || '',
        items: cartItems.map(item => ({
          name: item.name,
          category: item.category,
          unit: item.unit,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          grossPrice: item.grossPrice,
          finalPrice: item.finalPrice,
          discountAmount: item.discountAmount,
          discountType: item.discountType,
          discountDescription: item.discountDescription
        }))
      };

      // 1. Save to transactions list
      const existingTrx = window.SmartGroceryData.getTransactions() || [];
      existingTrx.unshift(transaction);
      window.SmartGroceryData.saveTransactions(existingTrx);

      // 2. F-06 Requirement: Update Price History Database with latest prices
      this.updatePriceDatabaseWithPurchasedItems(cartItems, currentMonthName, transaction.supermarket);

      // 3. Clear active cart
      window.SmartGroceryCart.clearCart();

      return transaction;
    },

    /**
     * Updates historical price records so next month's comparisons use these latest prices
     */
    updatePriceDatabaseWithPurchasedItems(items, monthName, supermarket) {
      const priceHistory = window.SmartGroceryData.getPriceHistory() || [];

      items.forEach(item => {
        if (!item.name || !item.unitPrice) return;
        const normalizedItemName = item.name.trim().toLowerCase();

        const existingIndex = priceHistory.findIndex(ph => ph.name.trim().toLowerCase() === normalizedItemName);
        if (existingIndex !== -1) {
          // Update existing item with new reference price
          priceHistory[existingIndex].lastPrice = item.unitPrice;
          priceHistory[existingIndex].lastMonth = monthName;
          priceHistory[existingIndex].category = item.category;
          priceHistory[existingIndex].unit = item.unit;
          if (supermarket) priceHistory[existingIndex].notes = `Beli di ${supermarket}`;
        } else {
          // Insert new record into price DB
          priceHistory.unshift({
            id: 'ph_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            name: item.name.trim(),
            category: item.category,
            unit: item.unit,
            lastPrice: item.unitPrice,
            lastMonth: monthName,
            notes: supermarket ? `Beli di ${supermarket}` : ''
          });
        }
      });

      window.SmartGroceryData.savePriceHistory(priceHistory);
    },

    /**
     * Get all past transactions
     */
    getAllTransactions() {
      if (!window.SmartGroceryData) return [];
      return window.SmartGroceryData.getTransactions() || [];
    },

    /**
     * Get transaction by ID
     */
    getTransaction(id) {
      const all = this.getAllTransactions();
      return all.find(t => t.id === id) || null;
    },

    /**
     * Delete transaction
     */
    deleteTransaction(id) {
      let all = this.getAllTransactions();
      all = all.filter(t => t.id !== id);
      window.SmartGroceryData.saveTransactions(all);
      return all;
    },

    /**
     * Repeat past transaction: copies items from an old receipt into current cart
     */
    repeatTransactionIntoCart(id) {
      const trx = this.getTransaction(id);
      if (!trx || !trx.items) return false;

      trx.items.forEach(oldItem => {
        window.SmartGroceryCart.addItem({
          name: oldItem.name,
          category: oldItem.category,
          unit: oldItem.unit,
          quantity: oldItem.quantity,
          unitPrice: oldItem.unitPrice,
          discountType: oldItem.discountType || 'none',
          inCart: false
        });
      });
      return true;
    },

    /**
     * Export all data as JSON file for download
     */
    exportJSON() {
      const backup = {
        app: 'SmartGroceryBudgetTracker',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        budget: window.SmartGroceryData.getBudget(),
        cart: window.SmartGroceryData.getCart(),
        priceHistory: window.SmartGroceryData.getPriceHistory(),
        transactions: window.SmartGroceryData.getTransactions()
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `smart_grocery_backup_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    },

    /**
     * Import JSON data
     */
    importJSON(jsonString) {
      try {
        const parsed = JSON.parse(jsonString);
        if (parsed.budget) window.SmartGroceryData.saveBudget(parsed.budget);
        if (parsed.cart) window.SmartGroceryData.saveCart(parsed.cart);
        if (parsed.priceHistory) window.SmartGroceryData.savePriceHistory(parsed.priceHistory);
        if (parsed.transactions) window.SmartGroceryData.saveTransactions(parsed.transactions);
        return true;
      } catch (e) {
        console.error('Import failed', e);
        return false;
      }
    }
  };

  window.SmartGroceryHistory = HistoryManager;
})(window);
