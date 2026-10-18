// Smart Grocery - Realtime Price Comparator Engine (F-04)
(function(window) {
  'use strict';

  const PriceComparator = {
    /**
     * Clean and normalize string for comparison
     */
    normalize(str) {
      return (str || '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    },

    /**
     * Find best matching item from historical price database
     * @param {string} productName
     * @returns {Object|null}
     */
    findMatch(productName) {
      if (!productName || !window.SmartGroceryData) return null;
      const history = window.SmartGroceryData.getPriceHistory() || [];
      const cleanTarget = this.normalize(productName);
      if (!cleanTarget) return null;

      // 1. Exact normalized match
      let match = history.find(item => this.normalize(item.name) === cleanTarget);
      if (match) return match;

      // 2. Substring or token match
      const targetTokens = cleanTarget.split(' ').filter(t => t.length > 2);
      if (targetTokens.length > 0) {
        match = history.find(item => {
          const itemClean = this.normalize(item.name);
          return targetTokens.every(tok => itemClean.includes(tok));
        });
        if (match) return match;

        // 3. Partial fallback if at least 2 tokens match
        match = history.find(item => {
          const itemClean = this.normalize(item.name);
          const matchedCount = targetTokens.filter(tok => itemClean.includes(tok)).length;
          return matchedCount >= Math.min(2, targetTokens.length);
        });
        if (match) return match;
      }

      return null;
    },

    /**
     * Compare current input price against previous month (F-04 Checklist)
     * @param {string} productName
     * @param {number} currentUnitPrice
     * @returns {Object} comparison result
     */
    compare(productName, currentUnitPrice) {
      const current = Math.round(Number(currentUnitPrice) || 0);
      const matchedHistory = this.findMatch(productName);

      if (!matchedHistory || current <= 0) {
        return {
          status: 'new',
          symbol: '+',
          badgeClass: 'price-new',
          color: '#3b82f6',
          label: 'Item Baru',
          subLabel: 'Belum ada data bulan lalu',
          diff: 0,
          diffPercent: 0,
          lastPrice: null,
          lastMonth: null,
          isNew: true,
          advice: 'Harga ini akan tersimpan otomatis sebagai patokan bulan depan.'
        };
      }

      const lastPrice = Math.round(matchedHistory.lastPrice);
      const diff = current - lastPrice;
      const diffPercent = lastPrice > 0 ? ((diff / lastPrice) * 100) : 0;
      const formattedLastPrice = 'Rp ' + lastPrice.toLocaleString('id-ID');
      const formattedDiff = 'Rp ' + Math.abs(diff).toLocaleString('id-ID');
      const absPercent = Math.abs(diffPercent).toFixed(1);

      if (diff > 0) {
        // Harga Naik (↑ Panah Merah)
        return {
          status: 'up',
          symbol: '↑',
          badgeClass: 'price-up',
          color: '#ef4444',
          label: `Naik ${formattedDiff} (+${absPercent}%)`,
          subLabel: `Bulan lalu: ${formattedLastPrice}`,
          diff: diff,
          diffPercent: Number(diffPercent.toFixed(1)),
          lastPrice: lastPrice,
          lastMonth: matchedHistory.lastMonth || 'Bulan lalu',
          isNew: false,
          advice: `Harga naik dibanding ${matchedHistory.lastMonth || 'bulan lalu'}. Pertimbangkan alternatif atau kurangi kuantitas.`
        };
      } else if (diff < 0) {
        // Harga Turun (↓ Panah Hijau)
        return {
          status: 'down',
          symbol: '↓',
          badgeClass: 'price-down',
          color: '#10b981',
          label: `Turun ${formattedDiff} (-${absPercent}%)`,
          subLabel: `Bulan lalu: ${formattedLastPrice}`,
          diff: diff,
          diffPercent: Number(diffPercent.toFixed(1)),
          lastPrice: lastPrice,
          lastMonth: matchedHistory.lastMonth || 'Bulan lalu',
          isNew: false,
          advice: `Lebih hemat dibanding ${matchedHistory.lastMonth || 'bulan lalu'}! Pilihan hemat untuk anak rantau.`
        };
      } else {
        // Harga Tetap (= Tanda Sama Dengan)
        return {
          status: 'equal',
          symbol: '=',
          badgeClass: 'price-equal',
          color: '#64748b',
          label: 'Stabil (=)',
          subLabel: `Sama dengan bulan lalu (${formattedLastPrice})`,
          diff: 0,
          diffPercent: 0,
          lastPrice: lastPrice,
          lastMonth: matchedHistory.lastMonth || 'Bulan lalu',
          isNew: false,
          advice: `Harga stabil persis sama dengan ${matchedHistory.lastMonth || 'bulan lalu'}.`
        };
      }
    },

    /**
     * Get autocomplete / suggestions list from history
     * @param {string} query
     * @returns {Array} suggestions
     */
    getSuggestions(query = '') {
      if (!window.SmartGroceryData) return [];
      const history = window.SmartGroceryData.getPriceHistory() || [];
      const clean = this.normalize(query);
      if (!clean) {
        // Return top staples for quick chips
        return history.slice(0, 6);
      }
      return history.filter(item => this.normalize(item.name).includes(clean)).slice(0, 5);
    }
  };

  window.SmartGroceryComparator = PriceComparator;
})(window);
