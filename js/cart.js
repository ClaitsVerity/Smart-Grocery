// Smart Grocery - Cart Management Engine (F-01, F-02)
(function(window) {
  'use strict';

  const CartManager = {
    items: [],
    filterStatus: 'all', // 'all' | 'in_cart' | 'pending'
    filterCategory: 'all',
    searchQuery: '',

    init() {
      if (window.SmartGroceryData) {
        this.items = window.SmartGroceryData.getCart() || [];
      }
      this.recalculateAll();
    },

    getItems() {
      return this.items;
    },

    save() {
      if (window.SmartGroceryData) {
        window.SmartGroceryData.saveCart(this.items);
      }
    },

    /**
     * Add new grocery item (F-01)
     */
    addItem(itemData) {
      const newItem = {
        id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        name: (itemData.name || '').trim(),
        category: itemData.category || 'Makanan Pokok',
        unit: itemData.unit || 'pcs',
        quantity: Math.max(0.1, Number(itemData.quantity) || 1),
        unitPrice: Math.max(0, Number(itemData.unitPrice) || 0),
        discountType: itemData.discountType || 'none',
        discountD1: Number(itemData.discountD1) || 0,
        discountD2: Number(itemData.discountD2) || 0,
        discountDirect: Number(itemData.discountDirect) || 0,
        inCart: Boolean(itemData.inCart),
        notes: (itemData.notes || '').trim()
      };

      this.computeItemFinancials(newItem);
      this.items.unshift(newItem);
      this.save();
      return newItem;
    },

    /**
     * Update existing item
     */
    updateItem(id, updateData) {
      const index = this.items.findIndex(item => item.id === id);
      if (index === -1) return null;

      const item = this.items[index];
      if (updateData.name !== undefined) item.name = updateData.name.trim();
      if (updateData.category !== undefined) item.category = updateData.category;
      if (updateData.unit !== undefined) item.unit = updateData.unit;
      if (updateData.quantity !== undefined) item.quantity = Math.max(0.1, Number(updateData.quantity) || 1);
      if (updateData.unitPrice !== undefined) item.unitPrice = Math.max(0, Number(updateData.unitPrice) || 0);
      if (updateData.discountType !== undefined) item.discountType = updateData.discountType;
      if (updateData.discountD1 !== undefined) item.discountD1 = Number(updateData.discountD1) || 0;
      if (updateData.discountD2 !== undefined) item.discountD2 = Number(updateData.discountD2) || 0;
      if (updateData.discountDirect !== undefined) item.discountDirect = Number(updateData.discountDirect) || 0;
      if (updateData.inCart !== undefined) item.inCart = Boolean(updateData.inCart);
      if (updateData.notes !== undefined) item.notes = updateData.notes.trim();

      this.computeItemFinancials(item);
      this.save();
      return item;
    },

    /**
     * Quick quantity increment/decrement (+ / -) directly from cart card (Thumb-friendly mobile ergonomics)
     */
    stepQuantity(id, delta) {
      const item = this.items.find(i => i.id === id);
      if (!item) return;

      let newQty = Number(item.quantity) + delta;
      if (newQty <= 0) {
        // If reduced to 0, ask or remove
        this.removeItem(id);
        return;
      }
      // If decimal (e.g. 0.5 kg), round cleanly
      item.quantity = Math.round(newQty * 100) / 100;
      this.computeItemFinancials(item);
      this.save();
    },

    /**
     * Toggle inCart status (checked into shopping cart)
     */
    toggleInCart(id) {
      const item = this.items.find(i => i.id === id);
      if (item) {
        item.inCart = !item.inCart;
        this.save();
      }
      return item;
    },

    /**
     * Remove item
     */
    removeItem(id) {
      this.items = this.items.filter(item => item.id !== id);
      this.save();
    },

    /**
     * Clear all items in cart
     */
    clearCart() {
      this.items = [];
      this.save();
    },

    /**
     * Realtime computation of item totals & tiered discounts (F-02, F-03)
     */
    computeItemFinancials(item) {
      const gross = (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0);
      item.grossPrice = gross;

      if (window.SmartGroceryDiscount) {
        const disc = window.SmartGroceryDiscount.calculate(
          gross,
          item.discountType,
          item.discountD1,
          item.discountD2,
          item.discountDirect
        );
        item.finalPrice = disc.finalPrice;
        item.discountAmount = disc.totalDiscount;
        item.discountDescription = disc.description;
        item.discountBadge = disc.badgeText;
        item.effectivePercent = disc.effectivePercent;
      } else {
        item.finalPrice = gross;
        item.discountAmount = 0;
        item.discountDescription = 'Tanpa Diskon';
        item.discountBadge = null;
        item.effectivePercent = 0;
      }
    },

    /**
     * Recalculate all items in cart
     */
    recalculateAll() {
      this.items.forEach(item => this.computeItemFinancials(item));
    },

    /**
     * Get filtered items list for rendering
     */
    getFilteredItems() {
      return this.items.filter(item => {
        // Status filter
        if (this.filterStatus === 'in_cart' && !item.inCart) return false;
        if (this.filterStatus === 'pending' && item.inCart) return false;

        // Category filter
        if (this.filterCategory !== 'all' && item.category !== this.filterCategory) return false;

        // Search query
        if (this.searchQuery) {
          const q = this.searchQuery.toLowerCase();
          const matchName = item.name.toLowerCase().includes(q);
          const matchCat = item.category.toLowerCase().includes(q);
          if (!matchName && !matchCat) return false;
        }

        return true;
      });
    }
  };

  window.SmartGroceryCart = CartManager;
})(window);
