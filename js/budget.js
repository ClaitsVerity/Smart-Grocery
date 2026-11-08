// Smart Grocery - Budget Safety Tracker Engine (F-05)
(function(window) {
  'use strict';

  const BudgetTracker = {
    /**
     * Get current budget configuration
     */
    getConfig() {
      if (!window.SmartGroceryData) {
        return { monthlyLimit: 600000, safetyBufferPercent: 10, monthName: 'Oktober 2026' };
      }
      return window.SmartGroceryData.getBudget();
    },

    /**
     * Update budget settings
     */
    updateConfig(newLimit, safetyBufferPercent = 10, monthName = 'Oktober 2026') {
      const budgetObj = {
        monthlyLimit: Math.max(10000, Number(newLimit) || 0),
        safetyBufferPercent: Math.max(0, Math.min(50, Number(safetyBufferPercent) || 0)),
        monthName: monthName || 'Oktober 2026'
      };
      if (window.SmartGroceryData) {
        window.SmartGroceryData.saveBudget(budgetObj);
      }
      return budgetObj;
    },

    /**
     * Calculate comprehensive budget status against current cart items
     * @param {Array} cartItems
     * @returns {Object} status summary
     */
    evaluate(cartItems = []) {
      const config = this.getConfig();
      const limit = config.monthlyLimit;
      const bufferPercent = config.safetyBufferPercent || 10;
      const bufferAmount = Math.round((limit * bufferPercent) / 100);
      const safeThreshold = limit - bufferAmount;

      let totalGross = 0;
      let totalDiscount = 0;
      let totalNet = 0;
      let checkedInCartTotal = 0;
      let pendingTotal = 0;
      let inCartCount = 0;

      cartItems.forEach(item => {
        const qty = Number(item.quantity) || 1;
        const unitPrice = Number(item.unitPrice) || 0;
        const gross = qty * unitPrice;

        // Calculate discount with engine if available
        let discCalc = { finalPrice: gross, totalDiscount: 0 };
        if (window.SmartGroceryDiscount) {
          discCalc = window.SmartGroceryDiscount.calculate(
            gross,
            item.discountType || 'none',
            item.discountD1 || 0,
            item.discountD2 || 0,
            item.discountDirect || 0
          );
        }

        totalGross += gross;
        totalDiscount += discCalc.totalDiscount;
        totalNet += discCalc.finalPrice;

        if (item.inCart) {
          checkedInCartTotal += discCalc.finalPrice;
          inCartCount++;
        } else {
          pendingTotal += discCalc.finalPrice;
        }
      });

      const remaining = limit - totalNet;
      const percentUsed = limit > 0 ? (totalNet / limit) * 100 : 0;
      const percentClamped = Math.min(100, Math.max(0, percentUsed));

      // Visual & alert state: SAFE (Green), WARNING (Yellow/Orange), DANGER/OVER (Red)
      let status = 'SAFE';
      let statusText = 'Aman';
      let statusTheme = 'safe'; // 'safe' | 'warning' | 'danger'
      let message = 'Pengeluaran aman terkontrol di bawah batas anggaran.';
      let alertIcon = 'shield-check';

      if (totalNet > limit) {
        status = 'OVER';
        statusText = 'Over Budget!';
        statusTheme = 'danger';
        message = 'Total belanja melebihi batas saldo dompet! Kurangi kuantitas atau batalkan barang sekunder.';
        alertIcon = 'alert-octagon';
      } else if (percentUsed >= 90 || totalNet >= safeThreshold) {
        status = 'WARNING';
        statusText = 'Peringatan Waspada';
        statusTheme = 'warning';
        message = `⚠️ Peringatan Waspada: Total belanja telah mencapai ${percentUsed.toFixed(0)}% dari batas saldo dompet! Hati-hati sebelum ke kasir.`;
        alertIcon = 'alert-triangle';
      }

      return {
        limit: limit,
        bufferPercent: bufferPercent,
        bufferAmount: bufferAmount,
        safeThreshold: safeThreshold,
        totalGross: totalGross,
        totalDiscount: totalDiscount,
        totalNet: totalNet,
        remaining: remaining,
        percentUsed: Number(percentUsed.toFixed(1)),
        percentClamped: Number(percentClamped.toFixed(1)),
        checkedInCartTotal: checkedInCartTotal,
        pendingTotal: pendingTotal,
        inCartCount: inCartCount,
        totalItemsCount: cartItems.length,
        status: status,
        statusText: statusText,
        statusTheme: statusTheme,
        message: message,
        alertIcon: alertIcon,
        isOverBudget: totalNet > limit,
        isNearLimit: totalNet >= safeThreshold && totalNet <= limit
      };
    }
  };

  window.SmartGroceryBudget = BudgetTracker;
})(window);
