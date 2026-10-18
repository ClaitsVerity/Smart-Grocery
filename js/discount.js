// Smart Grocery - Tiered & Single Discount Calculator Engine (F-03)
(function(window) {
  'use strict';

  const DiscountEngine = {
    /**
     * Calculate compound / tiered discount sequentially
     * @param {number} basePrice - Total base price (unitPrice * qty)
     * @param {string} discountType - 'none' | 'single' | 'tiered' | 'direct'
     * @param {number} d1 - Primary discount percent (0-100)
     * @param {number} d2 - Secondary discount percent (0-100)
     * @param {number} directAmount - Direct cash deduction in Rupiah
     * @returns {Object} detailed calculation breakdown
     */
    calculate(basePrice, discountType = 'none', d1 = 0, d2 = 0, directAmount = 0) {
      const original = Math.max(0, Number(basePrice) || 0);
      d1 = Math.max(0, Math.min(100, Number(d1) || 0));
      d2 = Math.max(0, Math.min(100, Number(d2) || 0));
      directAmount = Math.max(0, Number(directAmount) || 0);

      if (original === 0 || discountType === 'none') {
        return {
          originalPrice: original,
          finalPrice: original,
          totalDiscount: 0,
          effectivePercent: 0,
          type: 'none',
          steps: [],
          description: 'Tanpa Diskon',
          badgeText: null
        };
      }

      if (discountType === 'single') {
        const discountVal = (original * d1) / 100;
        const finalVal = Math.round(original - discountVal);
        return {
          originalPrice: original,
          finalPrice: Math.max(0, finalVal),
          totalDiscount: Math.round(discountVal),
          effectivePercent: d1,
          type: 'single',
          steps: [
            { step: 1, label: `Diskon ${d1}%`, deduction: Math.round(discountVal), remaining: Math.max(0, finalVal) }
          ],
          description: `Diskon ${d1}%`,
          badgeText: `-${d1}%`
        };
      }

      if (discountType === 'tiered') {
        // Multi-tier sequential calculation (SRS F-03 requirement)
        // Step 1: Apply D1
        const afterStep1 = original * (1 - (d1 / 100));
        const deduction1 = original - afterStep1;

        // Step 2: Apply D2 to the already-reduced price from Step 1
        const afterStep2 = afterStep1 * (1 - (d2 / 100));
        const deduction2 = afterStep1 - afterStep2;

        const totalDeduction = Math.round(deduction1 + deduction2);
        const finalVal = Math.max(0, Math.round(afterStep2));
        const effectivePercent = original > 0 ? ((totalDeduction / original) * 100) : 0;

        return {
          originalPrice: original,
          finalPrice: finalVal,
          totalDiscount: totalDeduction,
          effectivePercent: Number(effectivePercent.toFixed(1)),
          type: 'tiered',
          steps: [
            {
              step: 1,
              label: `Tahap 1: Diskon ${d1}% dari Rp ${original.toLocaleString('id-ID')}`,
              deduction: Math.round(deduction1),
              remaining: Math.round(afterStep1)
            },
            {
              step: 2,
              label: `Tahap 2: Diskon ${d2}% dari sisa Rp ${Math.round(afterStep1).toLocaleString('id-ID')}`,
              deduction: Math.round(deduction2),
              remaining: finalVal
            }
          ],
          description: `Diskon Bertingkat ${d1}% + ${d2}% (Efektif ${effectivePercent.toFixed(1)}%)`,
          badgeText: `${d1}%+${d2}%`
        };
      }

      if (discountType === 'direct') {
        const discountVal = Math.min(original, directAmount);
        const finalVal = Math.max(0, original - discountVal);
        const effectivePercent = original > 0 ? (discountVal / original) * 100 : 0;
        return {
          originalPrice: original,
          finalPrice: finalVal,
          totalDiscount: discountVal,
          effectivePercent: Number(effectivePercent.toFixed(1)),
          type: 'direct',
          steps: [
            { step: 1, label: `Potongan Langsung Tunai`, deduction: discountVal, remaining: finalVal }
          ],
          description: `Potongan Langsung Rp ${discountVal.toLocaleString('id-ID')}`,
          badgeText: `-Rp ${discountVal.toLocaleString('id-ID')}`
        };
      }

      return {
        originalPrice: original,
        finalPrice: original,
        totalDiscount: 0,
        effectivePercent: 0,
        type: 'none',
        steps: [],
        description: 'Tanpa Diskon',
        badgeText: null
      };
    },

    /**
     * Format currency to Indonesian Rupiah
     */
    formatRupiah(amount) {
      const num = Math.round(Number(amount) || 0);
      return 'Rp ' + num.toLocaleString('id-ID');
    }
  };

  window.SmartGroceryDiscount = DiscountEngine;
})(window);
