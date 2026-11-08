// Smart Grocery & Budget Safety Tracker - Main App Controller
(function(window, document) {
  'use strict';

  // App State
  let activeTab = 'screenBelanja';
  let deferredPrompt = null;
  let activeReceiptId = null;

  // DOM Elements cache
  const elements = {};

  function initApp() {
    cacheElements();
    initClock();
    initServiceWorker();
    initNavigation();
    initPWAInstall();
    initFilterChips();
    initItemModal();
    initBudgetControls();
    initCheckoutModal();
    initReceiptModal();
    initPriceDbModal();
    initQuickBudgetModal();
    initDataBackupTools();
    initFirebaseSyncUI();

    // Initialize Cart
    if (window.SmartGroceryCart) {
      window.SmartGroceryCart.init();
    }

    // Render Initial State
    renderAll();
    initLucideIcons();
  }

  function cacheElements() {
    elements.statusClock = document.getElementById('statusClock');
    elements.screens = document.querySelectorAll('.screen');
    elements.navBtns = document.querySelectorAll('.nav-tab-btn');
    elements.appToast = document.getElementById('appToast');
    elements.toastMessage = document.getElementById('toastMessage');

    // Belanja Tab
    elements.budgetHeroCard = document.getElementById('budgetHeroCard');
    elements.budgetMonthLabel = document.getElementById('budgetMonthLabel');
    elements.budgetStatusBadge = document.getElementById('budgetStatusBadge');
    elements.budgetStatusText = document.getElementById('budgetStatusText');
    elements.heroSpentAmount = document.getElementById('heroSpentAmount');
    elements.heroLimitAmount = document.getElementById('heroLimitAmount');
    elements.heroMeterFill = document.getElementById('heroMeterFill');
    elements.heroRemainingAmount = document.getElementById('heroRemainingAmount');
    elements.heroSavingsAmount = document.getElementById('heroSavingsAmount');
    elements.heroAlertBanner = document.getElementById('heroAlertBanner');
    elements.heroAlertText = document.getElementById('heroAlertText');

    elements.searchCartInput = document.getElementById('searchCartInput');
    elements.filterChipsRow = document.getElementById('filterChipsRow');
    elements.countAllBadge = document.getElementById('countAllBadge');
    elements.countPendingBadge = document.getElementById('countPendingBadge');
    elements.countInCartBadge = document.getElementById('countInCartBadge');
    elements.cartItemsList = document.getElementById('cartItemsList');
    elements.emptyCartState = document.getElementById('emptyCartState');

    // Sticky Thumb Bar
    elements.thumbCartCount = document.getElementById('thumbCartCount');
    elements.thumbCartTotal = document.getElementById('thumbCartTotal');
    elements.btnBottomAdd = document.getElementById('btnBottomAdd');
    elements.btnBottomCheckout = document.getElementById('btnBottomCheckout');
    elements.btnQuickAdd = document.getElementById('btnQuickAdd');
    elements.btnQuickConfig = document.getElementById('btnQuickConfig');
    elements.btnOpenBudgetModal = document.getElementById('btnOpenBudgetModal');

    // PWA Banner
    elements.pwaInstallBanner = document.getElementById('pwaInstallBanner');
    elements.btnInstallPwa = document.getElementById('btnInstallPwa');

    // Item Modal
    elements.modalBackdrop = document.getElementById('modalBackdrop');
    elements.itemModal = document.getElementById('itemModal');
    elements.itemModalTitle = document.getElementById('itemModalTitle');
    elements.btnCloseItemModal = document.getElementById('btnCloseItemModal');
    elements.editItemId = document.getElementById('editItemId');
    elements.inputItemName = document.getElementById('inputItemName');
    elements.quickStapleChips = document.getElementById('quickStapleChips');
    elements.categoryPillGrid = document.getElementById('categoryPillGrid');
    elements.selectedCategory = document.getElementById('selectedCategory');
    elements.unitPillGrid = document.getElementById('unitPillGrid');
    elements.selectedUnit = document.getElementById('selectedUnit');
    elements.inputItemQty = document.getElementById('inputItemQty');
    elements.btnModalQtyMinus = document.getElementById('btnModalQtyMinus');
    elements.btnModalQtyPlus = document.getElementById('btnModalQtyPlus');
    elements.inputItemUnitPrice = document.getElementById('inputItemUnitPrice');
    elements.modalComparatorCard = document.getElementById('modalComparatorCard');
    elements.modalComparatorBadge = document.getElementById('modalComparatorBadge');
    elements.modalComparatorDesc = document.getElementById('modalComparatorDesc');
    elements.modalLiveTotal = document.getElementById('modalLiveTotal');
    elements.inputItemInCart = document.getElementById('inputItemInCart');
    elements.inputItemNotes = document.getElementById('inputItemNotes');
    elements.btnSubmitItemModal = document.getElementById('btnSubmitItemModal');
    elements.btnSubmitModalText = document.getElementById('btnSubmitModalText');

    // Discount inside Item Modal
    elements.discTabBtns = document.querySelectorAll('.disc-tab-btn');
    elements.sectionDiscSingle = document.getElementById('sectionDiscSingle');
    elements.sectionDiscTiered = document.getElementById('sectionDiscTiered');
    elements.sectionDiscDirect = document.getElementById('sectionDiscDirect');
    elements.inputDiscD1 = document.getElementById('inputDiscD1');
    elements.inputTieredD1 = document.getElementById('inputTieredD1');
    elements.inputTieredD2 = document.getElementById('inputTieredD2');
    elements.inputDiscDirect = document.getElementById('inputDiscDirect');
    elements.discountExplanationCard = document.getElementById('discountExplanationCard');
    elements.discSummaryTitle = document.getElementById('discSummaryTitle');
    elements.discSavingsAmount = document.getElementById('discSavingsAmount');
    elements.discStepsBreakdown = document.getElementById('discStepsBreakdown');

    // Checkout Modal
    elements.checkoutModal = document.getElementById('checkoutModal');
    elements.btnCloseCheckoutModal = document.getElementById('btnCloseCheckoutModal');
    elements.coTotalPayment = document.getElementById('coTotalPayment');
    elements.coTotalSaved = document.getElementById('coTotalSaved');
    elements.coItemCount = document.getElementById('coItemCount');
    elements.coBudgetLimit = document.getElementById('coBudgetLimit');
    elements.coBudgetStatusBadge = document.getElementById('coBudgetStatusBadge');
    elements.coSupermarketInput = document.getElementById('coSupermarketInput');
    elements.btnConfirmCheckout = document.getElementById('btnConfirmCheckout');

    // History Tab & Modals
    elements.historyListContainer = document.getElementById('historyListContainer');
    elements.emptyHistoryState = document.getElementById('emptyHistoryState');
    elements.btnOpenPriceDbModal = document.getElementById('btnOpenPriceDbModal');
    elements.receiptDetailModal = document.getElementById('receiptDetailModal');
    elements.btnCloseReceiptModal = document.getElementById('btnCloseReceiptModal');
    elements.receiptModalBody = document.getElementById('receiptModalBody');
    elements.btnRepeatFromReceipt = document.getElementById('btnRepeatFromReceipt');
    elements.priceDbModal = document.getElementById('priceDbModal');
    elements.btnClosePriceDbModal = document.getElementById('btnClosePriceDbModal');
    elements.searchPriceDbInput = document.getElementById('searchPriceDbInput');
    elements.priceDbItemsList = document.getElementById('priceDbItemsList');
    elements.btnExportData = document.getElementById('btnExportData');
    elements.btnResetDemoData = document.getElementById('btnResetDemoData');

    // Firebase Elements
    elements.firebaseStatusBadge = document.getElementById('firebaseStatusBadge');
    elements.firebaseStatusText = document.getElementById('firebaseStatusText');
    elements.firebaseTabStatusBadge = document.getElementById('firebaseTabStatusBadge');
    elements.firebaseTabStatusText = document.getElementById('firebaseTabStatusText');
    elements.firebaseLastSyncInfo = document.getElementById('firebaseLastSyncInfo');
    elements.btnSyncFirestore = document.getElementById('btnSyncFirestore');
    elements.btnUploadToCloud = document.getElementById('btnUploadToCloud');

    // Anggaran Tab
    elements.radialGaugeBar = document.getElementById('radialGaugeBar');
    elements.radialGaugePercent = document.getElementById('radialGaugePercent');
    elements.radialGaugeStatusText = document.getElementById('radialGaugeStatusText');
    elements.gaugeDetailedMessage = document.getElementById('gaugeDetailedMessage');
    elements.safetyBufferSlider = document.getElementById('safetyBufferSlider');
    elements.bufferPercentLabel = document.getElementById('bufferPercentLabel');
    elements.bufferAmountText = document.getElementById('bufferAmountText');
    elements.inputTabBudgetLimit = document.getElementById('inputTabBudgetLimit');
    elements.btnSaveTabBudget = document.getElementById('btnSaveTabBudget');

    // Quick Budget Modal
    elements.quickBudgetModal = document.getElementById('quickBudgetModal');
    elements.btnCloseQuickBudgetModal = document.getElementById('btnCloseQuickBudgetModal');
    elements.inputQuickBudgetLimit = document.getElementById('inputQuickBudgetLimit');
    elements.inputQuickBudgetMonth = document.getElementById('inputQuickBudgetMonth');
    elements.inputQuickBudgetBuffer = document.getElementById('inputQuickBudgetBuffer');
    elements.btnSaveQuickBudget = document.getElementById('btnSaveQuickBudget');
  }

  function initClock() {
    function update() {
      const now = new Date();
      if (elements.statusClock) {
        elements.statusClock.textContent = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      }
    }
    update();
    setInterval(update, 30000);
  }

  function initServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch((err) => {
          console.warn('SW registration note:', err);
        });
      });
    }
  }

  function initLucideIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  function vibrate(pattern = [30]) {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch (e) {
      // Ignore vibration errors if unsupported
    }
  }

  function showToast(message, type = 'success') {
    if (!elements.appToast) return;
    elements.toastMessage.textContent = message;
    elements.appToast.className = `toast-notification active ${type}`;
    setTimeout(() => {
      elements.appToast.className = 'toast-notification';
    }, 2400);
  }

  // Navigation Tabs
  function initNavigation() {
    elements.navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetScreenId = btn.getAttribute('data-tab');
        switchTab(targetScreenId);
        vibrate([20]);
      });
    });
  }

  function switchTab(screenId) {
    activeTab = screenId;
    elements.screens.forEach(screen => {
      screen.classList.toggle('active', screen.id === screenId);
    });

    elements.navBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === screenId);
    });

    // Toggle sticky bottom bar visibility (only on Belanja tab)
    const stickyBar = document.getElementById('stickyActionBar');
    if (stickyBar) {
      stickyBar.style.display = screenId === 'screenBelanja' ? 'flex' : 'none';
    }

    renderAll();
    initLucideIcons();
  }

  // PWA Install Handling
  function initPWAInstall() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (elements.pwaInstallBanner) {
        elements.pwaInstallBanner.style.display = 'flex';
        initLucideIcons();
      }
    });

    if (elements.btnInstallPwa) {
      elements.btnInstallPwa.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          showToast('Smart Grocery berhasil dipasang!', 'success');
          elements.pwaInstallBanner.style.display = 'none';
        }
        deferredPrompt = null;
      });
    }

    window.addEventListener('appinstalled', () => {
      showToast('Aplikasi PWA Siap Digunakan', 'success');
      if (elements.pwaInstallBanner) elements.pwaInstallBanner.style.display = 'none';
    });
  }

  // Belanja Filter Chips
  function initFilterChips() {
    if (elements.searchCartInput) {
      elements.searchCartInput.addEventListener('input', (e) => {
        window.SmartGroceryCart.searchQuery = e.target.value;
        renderCartList();
      });
    }

    const filterBtns = elements.filterChipsRow ? elements.filterChipsRow.querySelectorAll('.filter-chip') : [];
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const status = btn.getAttribute('data-filter-status');
        window.SmartGroceryCart.filterStatus = status;
        renderCartList();
        vibrate([15]);
      });
    });
  }

  // Main Render Orchestrator
  function renderAll() {
    renderBudgetCard();
    renderCartList();
    renderHistoryTab();
    renderAnggaranTab();
    initLucideIcons();
  }

  // ==========================================================================
  // RENDER: F-05 Budget Hero Card
  // ==========================================================================
  function renderBudgetCard() {
    if (!window.SmartGroceryBudget || !window.SmartGroceryCart) return;

    const cartItems = window.SmartGroceryCart.getItems();
    const status = window.SmartGroceryBudget.evaluate(cartItems);
    const config = window.SmartGroceryBudget.getConfig();

    // Month label
    if (elements.budgetMonthLabel) elements.budgetMonthLabel.textContent = config.monthName || 'Bulan Ini';

    // Amounts
    if (elements.heroSpentAmount) elements.heroSpentAmount.textContent = formatRp(status.totalNet);
    if (elements.heroLimitAmount) elements.heroLimitAmount.textContent = formatRp(status.limit);
    if (elements.heroRemainingAmount) {
      elements.heroRemainingAmount.textContent = status.remaining >= 0 ? formatRp(status.remaining) : `-${formatRp(Math.abs(status.remaining))}`;
    }
    if (elements.heroSavingsAmount) elements.heroSavingsAmount.textContent = formatRp(status.totalDiscount);

    // Meter Fill & Theme
    if (elements.heroMeterFill) {
      elements.heroMeterFill.style.width = `${status.percentClamped}%`;
    }

    if (elements.budgetHeroCard) {
      elements.budgetHeroCard.className = `budget-hero-card theme-${status.statusTheme}`;
    }

    // Status Badge
    if (elements.budgetStatusBadge && elements.budgetStatusText) {
      elements.budgetStatusBadge.className = `budget-chip-status ${status.statusTheme}`;
      elements.budgetStatusText.textContent = status.statusText;
    }

    // Alert Banner
    if (elements.heroAlertBanner && elements.heroAlertText) {
      if (status.statusTheme === 'warning' || status.statusTheme === 'danger') {
        elements.heroAlertBanner.style.display = 'flex';
        elements.heroAlertBanner.className = `budget-alert-banner ${status.statusTheme}`;
        elements.heroAlertText.textContent = status.message;
      } else {
        elements.heroAlertBanner.style.display = 'none';
      }
    }

    // Sticky Thumb Action Bar Counters
    if (elements.thumbCartCount) {
      elements.thumbCartCount.textContent = `${status.totalItemsCount} Barang (${status.inCartCount} di troli)`;
    }
    if (elements.thumbCartTotal) {
      elements.thumbCartTotal.textContent = formatRp(status.totalNet);
    }
  }

  // ==========================================================================
  // RENDER: Cart Item Cards (F-01, F-02, F-03, F-04)
  // ==========================================================================
  function renderCartList() {
    if (!elements.cartItemsList || !window.SmartGroceryCart) return;

    const allItems = window.SmartGroceryCart.getItems();
    const filteredItems = window.SmartGroceryCart.getFilteredItems();

    // Update filter counts
    const countInCart = allItems.filter(i => i.inCart).length;
    const countPending = allItems.length - countInCart;
    if (elements.countAllBadge) elements.countAllBadge.textContent = allItems.length;
    if (elements.countInCartBadge) elements.countInCartBadge.textContent = countInCart;
    if (elements.countPendingBadge) elements.countPendingBadge.textContent = countPending;

    if (filteredItems.length === 0) {
      elements.cartItemsList.innerHTML = '';
      if (elements.emptyCartState) elements.emptyCartState.style.display = 'flex';
      return;
    }

    if (elements.emptyCartState) elements.emptyCartState.style.display = 'none';

    let html = '';
    filteredItems.forEach(item => {
      // F-04: Compare against price history database
      const comp = window.SmartGroceryComparator
        ? window.SmartGroceryComparator.compare(item.name, item.unitPrice)
        : { status: 'new', symbol: '+', badgeClass: 'price-new', label: 'Item Baru', subLabel: '' };

      const isChecked = item.inCart ? 'is-checked' : '';
      const checkedIcon = item.inCart ? '<i data-lucide="check" style="width:16px;height:16px;"></i>' : '';

      // Discount tag
      let discountHtml = '';
      if (item.discountType && item.discountType !== 'none') {
        discountHtml = `
          <span class="discount-tag-badge">
            <i data-lucide="percent" style="width:10px;height:10px;"></i>
            <span>${item.discountBadge || item.discountDescription}</span>
          </span>
        `;
      }

      // Comparison indicator badge (F-04 requirement: ↑ merah, ↓ hijau, = abu-abu)
      const compHtml = `
        <div class="item-comparator-row">
          <span class="price-indicator-badge ${comp.badgeClass}" title="${comp.advice || ''}">
            <span>${comp.symbol}</span>
            <span>${comp.label}</span>
          </span>
          ${comp.subLabel ? `<span class="history-reference-text">(${comp.subLabel})</span>` : ''}
          ${discountHtml}
        </div>
      `;

      html += `
        <article class="cart-item-card ${isChecked}" data-item-id="${item.id}">
          <div class="cart-item-header">
            <div class="item-main-info">
              <!-- Checkbox / In-trolley toggle button -->
              <button class="btn-toggle-trolley" data-action="toggle" data-id="${item.id}" title="Tandai sudah masuk troli" aria-label="Tandai dalam troli">
                ${checkedIcon}
              </button>
              <div class="item-details">
                <span class="item-category-tag">${escapeHtml(item.category)}</span>
                <h3 class="item-name">${escapeHtml(item.name)}</h3>
                ${item.notes ? `<p class="item-notes">${escapeHtml(item.notes)}</p>` : ''}
              </div>
            </div>
            <div class="item-header-actions">
              <button class="btn-item-action" data-action="edit" data-id="${item.id}" title="Edit barang" aria-label="Edit">
                <i data-lucide="edit-3" style="width:15px;height:15px;"></i>
              </button>
              <button class="btn-item-action delete" data-action="delete" data-id="${item.id}" title="Hapus barang" aria-label="Hapus">
                <i data-lucide="trash-2" style="width:15px;height:15px;"></i>
              </button>
            </div>
          </div>

          <!-- Price Comparator Indicator (F-04) -->
          ${compHtml}

          <!-- Quantity Stepper & Final Total (F-01, F-02) -->
          <div class="cart-item-footer">
            <div class="stepper-control">
              <button class="btn-step" data-action="step-minus" data-id="${item.id}" aria-label="Kurang kuantitas">-</button>
              <span class="stepper-value">${item.quantity} ${item.unit}</span>
              <button class="btn-step" data-action="step-plus" data-id="${item.id}" aria-label="Tambah kuantitas">+</button>
            </div>

            <div class="item-pricing-summary">
              <span class="unit-price-line">
                @ ${formatRp(item.unitPrice)}/${item.unit}
              </span>
              <span class="item-total-final">${formatRp(item.finalPrice)}</span>
              ${item.discountAmount > 0 ? `<span class="item-saved-text">Hemat ${formatRp(item.discountAmount)}</span>` : ''}
            </div>
          </div>
        </article>
      `;
    });

    elements.cartItemsList.innerHTML = html;
    initLucideIcons();

    // Attach card event listeners
    attachCartItemEvents();
  }

  function attachCartItemEvents() {
    const cards = elements.cartItemsList.querySelectorAll('.cart-item-card');
    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;

        const action = btn.getAttribute('data-action');
        const id = btn.getAttribute('data-id');

        if (action === 'toggle') {
          window.SmartGroceryCart.toggleInCart(id);
          vibrate([35]);
          renderAll();
        } else if (action === 'step-plus') {
          window.SmartGroceryCart.stepQuantity(id, 1);
          vibrate([20]);
          renderAll();
        } else if (action === 'step-minus') {
          window.SmartGroceryCart.stepQuantity(id, -1);
          vibrate([20]);
          renderAll();
        } else if (action === 'edit') {
          openEditItemModal(id);
        } else if (action === 'delete') {
          if (confirm('Hapus barang ini dari troli?')) {
            window.SmartGroceryCart.removeItem(id);
            vibrate([40]);
            renderAll();
            showToast('Barang dihapus', 'warning');
          }
        }
      });
    });
  }

  // ==========================================================================
  // RENDER: F-06 Riwayat Tab
  // ==========================================================================
  function renderHistoryTab() {
    if (!elements.historyListContainer || !window.SmartGroceryHistory) return;

    const transactions = window.SmartGroceryHistory.getAllTransactions();
    if (transactions.length === 0) {
      elements.historyListContainer.innerHTML = '';
      if (elements.emptyHistoryState) elements.emptyHistoryState.style.display = 'flex';
      return;
    }

    if (elements.emptyHistoryState) elements.emptyHistoryState.style.display = 'none';

    let html = '';
    transactions.forEach(trx => {
      const budgetStatusBadge = trx.isOverBudget
        ? '<span class="budget-chip-status danger" style="padding:2px 8px;font-size:10px;">Over Budget</span>'
        : '<span class="budget-chip-status safe" style="padding:2px 8px;font-size:10px;">Aman</span>';

      html += `
        <div class="history-card" data-trx-id="${trx.id}">
          <div class="history-card-top">
            <div class="history-meta">
              <span class="history-date">${escapeHtml(trx.formattedDate || trx.month)}</span>
              <h3 class="history-supermarket">${escapeHtml(trx.supermarket)}</h3>
            </div>
            ${budgetStatusBadge}
          </div>

          <div class="history-stats-grid">
            <div class="history-stat-box">
              <span class="history-stat-label">Total Belanja</span>
              <span class="history-stat-val highlight">${formatRp(trx.totalSpent)}</span>
            </div>
            <div class="history-stat-box">
              <span class="history-stat-label">Diskon Hemat</span>
              <span class="history-stat-val saved">${formatRp(trx.totalSaved || 0)}</span>
            </div>
            <div class="history-stat-box">
              <span class="history-stat-label">Jumlah Item</span>
              <span class="history-stat-val">${trx.itemCount || (trx.items ? trx.items.length : 0)} Item</span>
            </div>
          </div>

          <div class="history-card-actions">
            <button class="btn-history-repeat" data-action="view-receipt" data-id="${trx.id}">
              <i data-lucide="receipt" style="width:14px;height:14px;"></i> Lihat Struk
            </button>
            <button class="btn-history-repeat" data-action="repeat-trx" data-id="${trx.id}" style="background:rgba(255,255,255,0.06);border-color:var(--border-subtle);color:var(--text-primary);">
              <i data-lucide="rotate-cw" style="width:14px;height:14px;"></i> Ulangi ke Troli
            </button>
          </div>
        </div>
      `;
    });

    elements.historyListContainer.innerHTML = html;
    initLucideIcons();

    // Attach history card actions
    elements.historyListContainer.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        const id = btn.getAttribute('data-id');
        if (action === 'view-receipt') {
          openReceiptModal(id);
        } else if (action === 'repeat-trx') {
          if (confirm('Muat seluruh barang dari struk belanja ini ke troli aktif Anda?')) {
            window.SmartGroceryHistory.repeatTransactionIntoCart(id);
            showToast('Barang berhasil dimuat ke troli!', 'success');
            switchTab('screenBelanja');
          }
        }
      });
    });
  }

  // ==========================================================================
  // RENDER: F-05 Anggaran Tab (Radial Gauge & Buffer)
  // ==========================================================================
  function renderAnggaranTab() {
    if (!window.SmartGroceryBudget || !window.SmartGroceryCart) return;

    const cartItems = window.SmartGroceryCart.getItems();
    const status = window.SmartGroceryBudget.evaluate(cartItems);
    const config = window.SmartGroceryBudget.getConfig();

    // Radial Progress Calculation
    // Circumference of r=70 is 2 * PI * 70 ≈ 440
    const circumference = 440;
    const clampedPercent = Math.min(100, Math.max(0, status.percentUsed));
    const offset = circumference - (clampedPercent / 100) * circumference;

    if (elements.radialGaugeBar) {
      elements.radialGaugeBar.style.strokeDashoffset = offset;
      if (status.statusTheme === 'danger') {
        elements.radialGaugeBar.style.stroke = 'var(--budget-danger)';
      } else if (status.statusTheme === 'warning') {
        elements.radialGaugeBar.style.stroke = 'var(--budget-warning)';
      } else {
        elements.radialGaugeBar.style.stroke = 'var(--budget-safe)';
      }
    }

    if (elements.radialGaugePercent) elements.radialGaugePercent.textContent = `${status.percentUsed}%`;
    if (elements.radialGaugeStatusText) elements.radialGaugeStatusText.textContent = status.statusText;
    if (elements.gaugeDetailedMessage) elements.gaugeDetailedMessage.textContent = status.message;

    // Buffer Controls
    if (elements.safetyBufferSlider) elements.safetyBufferSlider.value = config.safetyBufferPercent || 10;
    if (elements.bufferPercentLabel) elements.bufferPercentLabel.textContent = `${config.safetyBufferPercent || 10}%`;
    if (elements.bufferAmountText) elements.bufferAmountText.textContent = formatRp(status.bufferAmount);
    if (elements.inputTabBudgetLimit) elements.inputTabBudgetLimit.value = config.monthlyLimit;
  }

  // ==========================================================================
  // ITEM MODAL CONTROLLER (F-01, F-02, F-03, F-04)
  // ==========================================================================
  let currentDiscountType = 'none';

  function initItemModal() {
    // Open modal triggers
    if (elements.btnQuickAdd) elements.btnQuickAdd.addEventListener('click', () => openAddItemModal());
    if (elements.btnBottomAdd) elements.btnBottomAdd.addEventListener('click', () => openAddItemModal());
    if (elements.btnCloseItemModal) elements.btnCloseItemModal.addEventListener('click', closeAllModals);
    if (elements.modalBackdrop) elements.modalBackdrop.addEventListener('click', closeAllModals);

    // Quantity buttons
    if (elements.btnModalQtyMinus) {
      elements.btnModalQtyMinus.addEventListener('click', () => {
        let val = Number(elements.inputItemQty.value) || 1;
        if (val > 1) {
          elements.inputItemQty.value = val - 1;
          recalculateModalLive();
        }
      });
    }
    if (elements.btnModalQtyPlus) {
      elements.btnModalQtyPlus.addEventListener('click', () => {
        let val = Number(elements.inputItemQty.value) || 1;
        elements.inputItemQty.value = val + 1;
        recalculateModalLive();
      });
    }

    // Input changes trigger realtime computation & comparator
    if (elements.inputItemName) {
      elements.inputItemName.addEventListener('input', () => {
        updateModalComparator();
      });
    }
    if (elements.inputItemQty) {
      elements.inputItemQty.addEventListener('input', recalculateModalLive);
    }
    if (elements.inputItemUnitPrice) {
      elements.inputItemUnitPrice.addEventListener('input', () => {
        recalculateModalLive();
        updateModalComparator();
      });
    }

    // Discount Tabs
    elements.discTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.discTabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDiscountType = btn.getAttribute('data-disc-type');
        toggleDiscountSections(currentDiscountType);
        recalculateModalLive();
        vibrate([15]);
      });
    });

    // Discount Inputs
    [elements.inputDiscD1, elements.inputTieredD1, elements.inputTieredD2, elements.inputDiscDirect].forEach(input => {
      if (input) input.addEventListener('input', recalculateModalLive);
    });

    // Preset discount buttons
    document.querySelectorAll('.quick-d1-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        elements.inputDiscD1.value = btn.getAttribute('data-pct');
        recalculateModalLive();
      });
    });
    document.querySelectorAll('.quick-tier-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        elements.inputTieredD1.value = btn.getAttribute('data-d1');
        elements.inputTieredD2.value = btn.getAttribute('data-d2');
        recalculateModalLive();
      });
    });

    // Submit Item Modal
    if (elements.btnSubmitItemModal) {
      elements.btnSubmitItemModal.addEventListener('click', handleSaveItemModal);
    }

    // Render category & unit pill options
    renderCategoryPills();
    renderUnitPills();
    renderQuickStapleChips();
  }

  function toggleDiscountSections(type) {
    elements.sectionDiscSingle.style.display = type === 'single' ? 'flex' : 'none';
    elements.sectionDiscTiered.style.display = type === 'tiered' ? 'flex' : 'none';
    elements.sectionDiscDirect.style.display = type === 'direct' ? 'flex' : 'none';
  }

  function renderCategoryPills() {
    if (!elements.categoryPillGrid || !window.SmartGroceryData) return;
    const cats = window.SmartGroceryData.getCategories();
    let html = '';
    cats.forEach((cat, idx) => {
      const active = idx === 0 ? 'active' : '';
      html += `<button type="button" class="pill-btn ${active}" data-cat="${escapeHtml(cat.name)}">${escapeHtml(cat.name)}</button>`;
    });
    elements.categoryPillGrid.innerHTML = html;

    elements.categoryPillGrid.querySelectorAll('.pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        elements.categoryPillGrid.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        elements.selectedCategory.value = btn.getAttribute('data-cat');
        vibrate([15]);
      });
    });
  }

  function renderUnitPills() {
    if (!elements.unitPillGrid || !window.SmartGroceryData) return;
    const units = window.SmartGroceryData.getUnits();
    let html = '';
    units.forEach((u, idx) => {
      const active = u === 'pcs' ? 'active' : '';
      html += `<button type="button" class="pill-btn ${active}" data-unit="${u}">${u}</button>`;
    });
    elements.unitPillGrid.innerHTML = html;

    elements.unitPillGrid.querySelectorAll('.pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        elements.unitPillGrid.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        elements.selectedUnit.value = btn.getAttribute('data-unit');
        vibrate([15]);
      });
    });
  }

  function renderQuickStapleChips() {
    if (!elements.quickStapleChips || !window.SmartGroceryComparator) return;
    const suggestions = window.SmartGroceryComparator.getSuggestions('');
    let html = '';
    suggestions.forEach(item => {
      html += `<button type="button" class="quick-chip" data-name="${escapeHtml(item.name)}" data-price="${item.lastPrice}" data-unit="${item.unit}" data-cat="${item.category}">+ ${escapeHtml(item.name)}</button>`;
    });
    elements.quickStapleChips.innerHTML = html;

    elements.quickStapleChips.querySelectorAll('.quick-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        elements.inputItemName.value = chip.getAttribute('data-name');
        elements.inputItemUnitPrice.value = chip.getAttribute('data-price');
        
        // Select category
        const cat = chip.getAttribute('data-cat');
        if (cat) {
          elements.selectedCategory.value = cat;
          elements.categoryPillGrid.querySelectorAll('.pill-btn').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-cat') === cat);
          });
        }

        // Select unit
        const u = chip.getAttribute('data-unit');
        if (u) {
          elements.selectedUnit.value = u;
          elements.unitPillGrid.querySelectorAll('.pill-btn').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-unit') === u);
          });
        }

        recalculateModalLive();
        updateModalComparator();
        vibrate([25]);
      });
    });
  }

  function openAddItemModal() {
    elements.editItemId.value = '';
    elements.itemModalTitle.textContent = 'Tambah Barang Belanja';
    elements.btnSubmitModalText.textContent = 'Simpan ke Keranjang';
    elements.inputItemName.value = '';
    elements.inputItemQty.value = '1';
    elements.inputItemUnitPrice.value = '';
    elements.inputItemNotes.value = '';
    elements.inputItemInCart.checked = true;

    // Reset discount
    currentDiscountType = 'none';
    elements.discTabBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-disc-type') === 'none'));
    toggleDiscountSections('none');
    elements.inputDiscD1.value = '';
    elements.inputTieredD1.value = '50';
    elements.inputTieredD2.value = '20';
    elements.inputDiscDirect.value = '';

    recalculateModalLive();
    updateModalComparator();

    openBottomSheet(elements.itemModal);
    setTimeout(() => {
      elements.inputItemName.focus();
    }, 200);
  }

  function openEditItemModal(id) {
    const item = window.SmartGroceryCart.getItems().find(i => i.id === id);
    if (!item) return;

    elements.editItemId.value = item.id;
    elements.itemModalTitle.textContent = 'Edit Barang Belanja';
    elements.btnSubmitModalText.textContent = 'Perbarui Barang';
    elements.inputItemName.value = item.name;
    elements.inputItemQty.value = item.quantity;
    elements.inputItemUnitPrice.value = item.unitPrice;
    elements.inputItemNotes.value = item.notes || '';
    elements.inputItemInCart.checked = Boolean(item.inCart);

    // Category
    elements.selectedCategory.value = item.category;
    elements.categoryPillGrid.querySelectorAll('.pill-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-cat') === item.category);
    });

    // Unit
    elements.selectedUnit.value = item.unit;
    elements.unitPillGrid.querySelectorAll('.pill-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-unit') === item.unit);
    });

    // Discount
    currentDiscountType = item.discountType || 'none';
    elements.discTabBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-disc-type') === currentDiscountType));
    toggleDiscountSections(currentDiscountType);
    elements.inputDiscD1.value = item.discountD1 || '';
    elements.inputTieredD1.value = item.discountD1 || '50';
    elements.inputTieredD2.value = item.discountD2 || '20';
    elements.inputDiscDirect.value = item.discountDirect || '';

    recalculateModalLive();
    updateModalComparator();

    openBottomSheet(elements.itemModal);
  }

  // Realtime Live Recalculation inside Item Modal (F-02, F-03)
  function recalculateModalLive() {
    const qty = Math.max(0, Number(elements.inputItemQty.value) || 0);
    const unitPrice = Math.max(0, Number(elements.inputItemUnitPrice.value) || 0);
    const gross = qty * unitPrice;

    let d1 = 0, d2 = 0, direct = 0;
    if (currentDiscountType === 'single') {
      d1 = Number(elements.inputDiscD1.value) || 0;
    } else if (currentDiscountType === 'tiered') {
      d1 = Number(elements.inputTieredD1.value) || 0;
      d2 = Number(elements.inputTieredD2.value) || 0;
    } else if (currentDiscountType === 'direct') {
      direct = Number(elements.inputDiscDirect.value) || 0;
    }

    const disc = window.SmartGroceryDiscount.calculate(gross, currentDiscountType, d1, d2, direct);

    // Live total
    if (elements.modalLiveTotal) elements.modalLiveTotal.textContent = formatRp(disc.finalPrice);

    // Live discount explanation
    if (elements.discSummaryTitle) elements.discSummaryTitle.textContent = disc.description;
    if (elements.discSavingsAmount) elements.discSavingsAmount.textContent = `Hemat ${formatRp(disc.totalDiscount)}`;

    if (elements.discStepsBreakdown) {
      if (disc.steps && disc.steps.length > 0) {
        let stepsHtml = '';
        disc.steps.forEach(s => {
          stepsHtml += `
            <div class="discount-step-row">
              <span>${escapeHtml(s.label)}</span>
              <span>- ${formatRp(s.deduction)}</span>
            </div>
          `;
        });
        elements.discStepsBreakdown.innerHTML = stepsHtml;
      } else {
        elements.discStepsBreakdown.innerHTML = '';
      }
    }
  }

  // Realtime Price Comparator inside Item Modal (F-04 Checklist)
  function updateModalComparator() {
    const name = elements.inputItemName.value;
    const price = Number(elements.inputItemUnitPrice.value) || 0;

    const comp = window.SmartGroceryComparator.compare(name, price);

    if (elements.modalComparatorBadge && elements.modalComparatorDesc) {
      elements.modalComparatorBadge.className = `price-indicator-badge ${comp.badgeClass}`;
      elements.modalComparatorBadge.innerHTML = `<span>${comp.symbol}</span> <span>${comp.label}</span>`;
      elements.modalComparatorDesc.textContent = comp.advice;
    }
  }

  // Handle Save from Item Modal
  function handleSaveItemModal() {
    const name = (elements.inputItemName.value || '').trim();
    const unitPrice = Number(elements.inputItemUnitPrice.value) || 0;
    const qty = Number(elements.inputItemQty.value) || 1;

    if (!name) {
      alert('Mohon isi nama barang.');
      elements.inputItemName.focus();
      return;
    }
    if (unitPrice <= 0) {
      alert('Harga satuan harus lebih dari Rp 0.');
      elements.inputItemUnitPrice.focus();
      return;
    }

    let d1 = 0, d2 = 0, direct = 0;
    if (currentDiscountType === 'single') {
      d1 = Number(elements.inputDiscD1.value) || 0;
    } else if (currentDiscountType === 'tiered') {
      d1 = Number(elements.inputTieredD1.value) || 0;
      d2 = Number(elements.inputTieredD2.value) || 0;
    } else if (currentDiscountType === 'direct') {
      direct = Number(elements.inputDiscDirect.value) || 0;
    }

    const payload = {
      name: name,
      category: elements.selectedCategory.value || 'Makanan Pokok',
      unit: elements.selectedUnit.value || 'pcs',
      quantity: qty,
      unitPrice: unitPrice,
      discountType: currentDiscountType,
      discountD1: d1,
      discountD2: d2,
      discountDirect: direct,
      inCart: elements.inputItemInCart.checked,
      notes: elements.inputItemNotes.value
    };

    const editId = elements.editItemId.value;
    if (editId) {
      window.SmartGroceryCart.updateItem(editId, payload);
      showToast('Barang berhasil diperbarui', 'success');
    } else {
      window.SmartGroceryCart.addItem(payload);
      showToast('Barang dimasukkan ke troli', 'success');
    }

    // Check budget alert vibration
    const status = window.SmartGroceryBudget.evaluate(window.SmartGroceryCart.getItems());
    if (status.isOverBudget) {
      vibrate([100, 50, 200, 50, 300]); // Danger pattern
    } else if (status.statusTheme === 'warning') {
      vibrate([80, 40, 80]); // Warning pattern
    } else {
      vibrate([40]);
    }

    closeAllModals();
    renderAll();
  }

  // ==========================================================================
  // CHECKOUT MODAL CONTROLLER (F-06)
  // ==========================================================================
  function initCheckoutModal() {
    if (elements.btnBottomCheckout) {
      elements.btnBottomCheckout.addEventListener('click', openCheckoutModal);
    }
    if (elements.btnCloseCheckoutModal) {
      elements.btnCloseCheckoutModal.addEventListener('click', closeAllModals);
    }
    if (elements.btnConfirmCheckout) {
      elements.btnConfirmCheckout.addEventListener('click', handleConfirmCheckout);
    }
  }

  function openCheckoutModal() {
    const cartItems = window.SmartGroceryCart.getItems();
    if (!cartItems || cartItems.length === 0) {
      alert('Keranjang belanja masih kosong! Tambahkan barang terlebih dahulu.');
      return;
    }

    const status = window.SmartGroceryBudget.evaluate(cartItems);

    if (elements.coTotalPayment) elements.coTotalPayment.textContent = formatRp(status.totalNet);
    if (elements.coTotalSaved) elements.coTotalSaved.textContent = formatRp(status.totalDiscount);
    if (elements.coItemCount) elements.coItemCount.textContent = `${status.totalItemsCount} Barang`;
    if (elements.coBudgetLimit) elements.coBudgetLimit.textContent = formatRp(status.limit);

    if (elements.coBudgetStatusBadge) {
      elements.coBudgetStatusBadge.className = `budget-chip-status ${status.statusTheme}`;
      elements.coBudgetStatusBadge.textContent = status.statusText;
    }

    openBottomSheet(elements.checkoutModal);
    vibrate([30]);
  }

  function handleConfirmCheckout() {
    try {
      const supermarket = (elements.coSupermarketInput.value || '').trim() || 'Superindo Rantau';
      const receipt = window.SmartGroceryHistory.checkoutCurrentCart({ supermarket: supermarket });

      vibrate([50, 50, 100]);
      closeAllModals();
      renderAll();
      showToast('Belanja selesai! Database harga diperbarui.', 'success');

      // Switch to history tab to view newly created receipt
      switchTab('screenRiwayat');
      setTimeout(() => {
        openReceiptModal(receipt.id);
      }, 300);
    } catch (err) {
      alert(err.message || 'Gagal menyelesaikan belanja');
    }
  }

  // ==========================================================================
  // RECEIPT DETAIL MODAL CONTROLLER
  // ==========================================================================
  function initReceiptModal() {
    if (elements.btnCloseReceiptModal) {
      elements.btnCloseReceiptModal.addEventListener('click', closeAllModals);
    }
    if (elements.btnRepeatFromReceipt) {
      elements.btnRepeatFromReceipt.addEventListener('click', () => {
        if (!activeReceiptId) return;
        window.SmartGroceryHistory.repeatTransactionIntoCart(activeReceiptId);
        closeAllModals();
        showToast('Semua barang dimasukkan ke troli aktif!', 'success');
        switchTab('screenBelanja');
      });
    }
  }

  function openReceiptModal(id) {
    const trx = window.SmartGroceryHistory.getTransaction(id);
    if (!trx) return;

    activeReceiptId = id;
    let itemsHtml = '';
    (trx.items || []).forEach((item, idx) => {
      itemsHtml += `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:12px;">
          <div>
            <div style="font-weight:700;color:var(--text-white);">${idx + 1}. ${escapeHtml(item.name)}</div>
            <div style="color:var(--text-muted);font-size:11px;">${item.quantity} ${item.unit} @ ${formatRp(item.unitPrice)}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:700;font-family:var(--font-numeric);color:var(--emerald-400);">${formatRp(item.finalPrice)}</div>
            ${item.discountAmount > 0 ? `<div style="font-size:10px;color:#fbbf24;">Diskon -${formatRp(item.discountAmount)}</div>` : ''}
          </div>
        </div>
      `;
    });

    elements.receiptModalBody.innerHTML = `
      <div style="background:rgba(0,0,0,0.3);padding:14px;border-radius:var(--radius-lg);margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <span style="color:var(--text-muted);font-size:11px;">Lokasi Belanja:</span>
          <strong style="color:var(--text-white);font-size:12px;">${escapeHtml(trx.supermarket)}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <span style="color:var(--text-muted);font-size:11px;">Waktu Transaksi:</span>
          <span style="color:var(--text-secondary);font-size:12px;">${escapeHtml(trx.formattedDate)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span style="color:var(--text-muted);font-size:11px;">Status Anggaran:</span>
          <span class="budget-chip-status ${trx.isOverBudget ? 'danger' : 'safe'}" style="padding:2px 8px;font-size:10px;">${trx.isOverBudget ? 'Over Budget' : 'Aman'}</span>
        </div>
      </div>

      <h4 style="font-size:13px;font-weight:700;color:var(--text-white);margin-bottom:6px;">Rincian Barang (${(trx.items || []).length} Item):</h4>
      <div style="background:rgba(0,0,0,0.2);padding:10px;border-radius:var(--radius-md);max-height:220px;overflow-y:auto;">
        ${itemsHtml}
      </div>

      <div style="margin-top:14px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);padding:12px;border-radius:var(--radius-md);display:flex;justify-content:space-between;align-items:center;">
        <div>
          <span style="font-size:11px;color:var(--text-muted);">Total Pembayaran:</span>
          <div style="font-family:var(--font-numeric);font-size:20px;font-weight:800;color:var(--emerald-400);">${formatRp(trx.totalSpent)}</div>
        </div>
        <div style="text-align:right;">
          <span style="font-size:11px;color:var(--text-muted);">Hemat Promo:</span>
          <div style="font-family:var(--font-numeric);font-size:14px;font-weight:700;color:#fbbf24;">${formatRp(trx.totalSaved || 0)}</div>
        </div>
      </div>
    `;

    openBottomSheet(elements.receiptDetailModal);
    initLucideIcons();
  }

  // ==========================================================================
  // PRICE DB MODAL (F-06 / F-04 DB INSPECTOR)
  // ==========================================================================
  function initPriceDbModal() {
    if (elements.btnOpenPriceDbModal) {
      elements.btnOpenPriceDbModal.addEventListener('click', openPriceDbModal);
    }
    if (elements.btnClosePriceDbModal) {
      elements.btnClosePriceDbModal.addEventListener('click', closeAllModals);
    }
    if (elements.searchPriceDbInput) {
      elements.searchPriceDbInput.addEventListener('input', (e) => {
        renderPriceDbItems(e.target.value);
      });
    }
  }

  function openPriceDbModal() {
    renderPriceDbItems('');
    openBottomSheet(elements.priceDbModal);
  }

  function renderPriceDbItems(query = '') {
    if (!elements.priceDbItemsList || !window.SmartGroceryData) return;
    const history = window.SmartGroceryData.getPriceHistory() || [];
    const cleanQuery = query.toLowerCase().trim();

    const filtered = cleanQuery
      ? history.filter(item => item.name.toLowerCase().includes(cleanQuery) || item.category.toLowerCase().includes(cleanQuery))
      : history;

    if (filtered.length === 0) {
      elements.priceDbItemsList.innerHTML = '<p style="text-align:center;padding:20px;font-size:12px;color:var(--text-muted);">Tidak ada data patokan harga ditemukan.</p>';
      return;
    }

    let html = '';
    filtered.forEach(item => {
      html += `
        <div style="background:var(--bg-input);padding:10px 12px;border-radius:var(--radius-md);border:1px solid var(--border-subtle);display:flex;justify-content:space-between;align-items:center;">
          <div>
            <span style="font-size:10px;color:var(--emerald-400);font-weight:700;text-transform:uppercase;">${escapeHtml(item.category)}</span>
            <h4 style="font-size:13px;font-weight:700;color:var(--text-white);">${escapeHtml(item.name)}</h4>
            <span style="font-size:11px;color:var(--text-muted);">${item.lastMonth || 'Bulan lalu'} ${item.notes ? `• ${escapeHtml(item.notes)}` : ''}</span>
          </div>
          <div style="text-align:right;">
            <span style="font-size:10px;color:var(--text-muted);">Harga Patokan</span>
            <div style="font-family:var(--font-numeric);font-weight:800;color:var(--text-white);font-size:14px;">${formatRp(item.lastPrice)}/${item.unit || 'pcs'}</div>
          </div>
        </div>
      `;
    });

    elements.priceDbItemsList.innerHTML = html;
  }

  // ==========================================================================
  // BUDGET SETTINGS (Tab Anggaran & Quick Modal)
  // ==========================================================================
  function initBudgetControls() {
    if (elements.safetyBufferSlider) {
      elements.safetyBufferSlider.addEventListener('input', (e) => {
        const val = Number(e.target.value) || 10;
        const config = window.SmartGroceryBudget.getConfig();
        window.SmartGroceryBudget.updateConfig(config.monthlyLimit, val, config.monthName);
        renderAll();
      });
    }

    if (elements.btnSaveTabBudget) {
      elements.btnSaveTabBudget.addEventListener('click', () => {
        const newLimit = Number(elements.inputTabBudgetLimit.value) || 600000;
        const config = window.SmartGroceryBudget.getConfig();
        window.SmartGroceryBudget.updateConfig(newLimit, config.safetyBufferPercent, config.monthName);
        showToast('Limit anggaran diperbarui!', 'success');
        vibrate([30]);
        renderAll();
      });
    }
  }

  function initQuickBudgetModal() {
    if (elements.btnQuickConfig) {
      elements.btnQuickConfig.addEventListener('click', openQuickBudgetModal);
    }
    if (elements.btnOpenBudgetModal) {
      elements.btnOpenBudgetModal.addEventListener('click', openQuickBudgetModal);
    }
    if (elements.btnCloseQuickBudgetModal) {
      elements.btnCloseQuickBudgetModal.addEventListener('click', closeAllModals);
    }
    if (elements.btnSaveQuickBudget) {
      elements.btnSaveQuickBudget.addEventListener('click', () => {
        const limit = Number(elements.inputQuickBudgetLimit.value) || 600000;
        const month = elements.inputQuickBudgetMonth.value.trim() || 'Oktober 2026';
        const buffer = Number(elements.inputQuickBudgetBuffer.value) || 10;

        window.SmartGroceryBudget.updateConfig(limit, buffer, month);
        showToast('Pengaturan anggaran disimpan', 'success');
        vibrate([30]);
        closeAllModals();
        renderAll();
      });
    }
  }

  function openQuickBudgetModal() {
    const config = window.SmartGroceryBudget.getConfig();
    elements.inputQuickBudgetLimit.value = config.monthlyLimit;
    elements.inputQuickBudgetMonth.value = config.monthName || 'Oktober 2026';
    elements.inputQuickBudgetBuffer.value = config.safetyBufferPercent || 10;
    openBottomSheet(elements.quickBudgetModal);
  }

  // ==========================================================================
  // BACKUP & RESET TOOLS
  // ==========================================================================
  function initDataBackupTools() {
    if (elements.btnExportData) {
      elements.btnExportData.addEventListener('click', () => {
        window.SmartGroceryHistory.exportJSON();
        showToast('File backup JSON diunduh', 'success');
      });
    }

    if (elements.btnResetDemoData) {
      elements.btnResetDemoData.addEventListener('click', () => {
        if (confirm('Atur ulang semua data ke data contoh anak kos (Beras, Minyak promo, Sabun diskon bertingkat, dll.)?')) {
          window.SmartGroceryData.resetAllToDefault();
          window.SmartGroceryCart.init();
          showToast('Data demo berhasil dimuat ulang!', 'success');
          vibrate([50]);
          renderAll();
        }
      });
    }
  }

  // ==========================================================================
  // FIREBASE CLOUD FIRESTORE INTEGRATION
  // ==========================================================================
  function initFirebaseSyncUI() {
    window.addEventListener('smartgrocery:firebase-status', (e) => {
      const detail = e.detail || {};
      updateFirebaseStatusUI(detail);
    });

    window.addEventListener('smartgrocery:data-changed', (e) => {
      if (window.SmartGroceryCart) {
        window.SmartGroceryCart.init();
      }
      renderAll();
    });

    if (elements.btnSyncFirestore) {
      elements.btnSyncFirestore.addEventListener('click', async () => {
        if (!window.SmartGroceryFirebase) {
          showToast('Firebase SDK belum siap', 'warning');
          return;
        }
        showToast('Menyinkronkan dari Cloud Firestore...', 'info');
        const ok = await window.SmartGroceryFirebase.pullAllCloudData();
        if (ok) {
          showToast('Data Firestore berhasil disinkronkan!', 'success');
          renderAll();
        } else {
          showToast('Gagal sinkron Firestore', 'warning');
        }
      });
    }

    if (elements.btnUploadToCloud) {
      elements.btnUploadToCloud.addEventListener('click', async () => {
        if (!window.SmartGroceryFirebase) {
          showToast('Firebase SDK belum siap', 'warning');
          return;
        }
        showToast('Mengunggah data lokal ke Firestore...', 'info');
        const ok = await window.SmartGroceryFirebase.pushAllLocalData();
        if (ok) {
          showToast('Data berhasil diunggah ke Cloud Firestore!', 'success');
        } else {
          showToast('Gagal mengunggah data', 'warning');
        }
      });
    }
  }

  function updateFirebaseStatusUI(detail) {
    const status = detail.status || 'offline';
    const badge = elements.firebaseStatusBadge;
    const tabBadge = elements.firebaseTabStatusBadge;
    const syncInfo = elements.firebaseLastSyncInfo;

    if (badge) {
      badge.className = 'status-badge-cloud ' + (status === 'connected' || status === 'synced' ? 'synced' : status === 'connecting' ? 'connecting' : 'offline');
      if (status === 'connected' || status === 'synced') {
        badge.innerHTML = '<i data-lucide="cloud" style="width:10px;height:10px;"></i> <span id="firebaseStatusText">Cloud</span>';
      } else if (status === 'connecting') {
        badge.innerHTML = '<i data-lucide="refresh-cw" style="width:10px;height:10px;"></i> <span id="firebaseStatusText">Konek</span>';
      } else {
        badge.innerHTML = '<i data-lucide="cloud-off" style="width:10px;height:10px;"></i> <span id="firebaseStatusText">Lokal</span>';
      }
    }

    if (tabBadge) {
      if (status === 'connected' || status === 'synced') {
        tabBadge.className = 'budget-chip-status safe';
        tabBadge.innerHTML = '<i data-lucide="check" style="width:10px;height:10px;"></i> Terkoneksi';
      } else if (status === 'connecting') {
        tabBadge.className = 'budget-chip-status warning';
        tabBadge.innerHTML = '<i data-lucide="refresh-cw" style="width:10px;height:10px;"></i> Menyinkronkan';
      } else {
        tabBadge.className = 'budget-chip-status danger';
        tabBadge.innerHTML = '<i data-lucide="alert-circle" style="width:10px;height:10px;"></i> Offline / Lokal';
      }
    }

    if (syncInfo) {
      if (detail.lastSynced) {
        const timeStr = new Date(detail.lastSynced).toLocaleTimeString('id-ID');
        syncInfo.textContent = `Terakhir disinkronkan: ${timeStr} • ${detail.message || 'Data up-to-date'}`;
      } else if (detail.message) {
        syncInfo.textContent = detail.message;
      }
    }

    initLucideIcons();
  }

  // Bottom Sheet Modal Helpers
  function openBottomSheet(modal) {
    if (!modal) return;
    if (elements.modalBackdrop) elements.modalBackdrop.classList.add('active');
    modal.classList.add('active');
  }

  function closeAllModals() {
    if (elements.modalBackdrop) elements.modalBackdrop.classList.remove('active');
    document.querySelectorAll('.bottom-sheet-modal').forEach(m => m.classList.remove('active'));
  }

  // Currency & Escape Helpers
  function formatRp(amount) {
    const num = Math.round(Number(amount) || 0);
    return 'Rp ' + num.toLocaleString('id-ID');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Boot on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})(window, document);
