// =========================================================
//  ExpenseIQ — script.js
//  Complete application logic: state, CRUD, rendering,
//  localStorage persistence, filtering, and UI helpers.
// =========================================================

'use strict';

console.log('Expense Tracker loaded');

/* ---------------------------------------------------------
   CONSTANTS & CONFIGURATION
   --------------------------------------------------------- */

const LS_KEY = 'expenseiq_transactions';

/** Human-readable label map for each category value */
const CATEGORY_LABELS = {
  salary:          'Salary',
  freelance:       'Freelance',
  investment:      'Investment',
  gift:            'Gift / Bonus',
  'other-income':  'Other Income',
  food:            'Food & Dining',
  transport:       'Transport',
  housing:         'Housing / Rent',
  utilities:       'Utilities',
  health:          'Health & Fitness',
  entertainment:   'Entertainment',
  shopping:        'Shopping',
  education:       'Education',
  travel:          'Travel',
  'other-expense': 'Other Expense',
};

/** Emoji icon for each category */
const CATEGORY_ICONS = {
  salary:          '💰',
  freelance:       '💼',
  investment:      '📈',
  gift:            '🎁',
  'other-income':  '💵',
  food:            '🍽️',
  transport:       '🚗',
  housing:         '🏠',
  utilities:       '💡',
  health:          '🏋️',
  entertainment:   '🎬',
  shopping:        '🛍️',
  education:       '📚',
  travel:          '✈️',
  'other-expense': '💸',
};

/* ---------------------------------------------------------
   DOM REFERENCES
   --------------------------------------------------------- */

const dom = {
  // Summary cards
  totalIncome:     document.getElementById('totalIncome'),
  totalExpenses:   document.getElementById('totalExpenses'),
  currentBalance:  document.getElementById('currentBalance'),

  // Header
  headerDate:      document.getElementById('headerDate'),
  greetingTitle:   document.querySelector('.greeting-title'),

  // Form
  form:            document.getElementById('transactionForm'),
  typeIncome:      document.getElementById('typeIncome'),
  typeExpense:     document.getElementById('typeExpense'),
  inputAmount:     document.getElementById('inputAmount'),
  inputDescription:document.getElementById('inputDescription'),
  inputDate:       document.getElementById('inputDate'),
  inputCategory:   document.getElementById('inputCategory'),
  btnAdd:          document.getElementById('btnAddTransaction'),

  // Errors
  errorAmount:     document.getElementById('errorAmount'),
  errorDescription:document.getElementById('errorDescription'),
  errorDate:       document.getElementById('errorDate'),
  errorCategory:   document.getElementById('errorCategory'),

  // History
  transactionList: document.getElementById('transactionList'),
  emptyState:      document.getElementById('emptyState'),
  filterCategory:  document.getElementById('filterCategory'),
};

/* ---------------------------------------------------------
   APPLICATION STATE
   --------------------------------------------------------- */

/** @type {Transaction[]} Master list of all transaction objects */
let transactions = [];

/**
 * @typedef {Object} Transaction
 * @property {string} id          - Unique identifier (timestamp-based)
 * @property {'income'|'expense'} type
 * @property {number} amount      - Positive number in INR
 * @property {string} description - User-supplied text
 * @property {string} date        - ISO date string (YYYY-MM-DD)
 * @property {string} category    - One of the CATEGORY_LABELS keys
 */

/** ID of the transaction currently being edited, or null */
let editingId = null;

/* ---------------------------------------------------------
   LOCAL STORAGE — PERSISTENCE
   --------------------------------------------------------- */

/**
 * Serialise the transactions array and persist it to localStorage.
 */
function saveToStorage() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(transactions));
  } catch (err) {
    console.warn('ExpenseIQ: Could not save to localStorage.', err);
  }
}

/**
 * Load transactions from localStorage on page initialisation.
 * Falls back to an empty array if nothing is stored or the data is corrupt.
 * @returns {Transaction[]}
 */
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('ExpenseIQ: Could not parse localStorage data.', err);
    return [];
  }
}

/* ---------------------------------------------------------
   UTILITY HELPERS
   --------------------------------------------------------- */

/**
 * Generate a simple unique ID based on the current timestamp + random salt.
 * @returns {string}
 */
function generateId() {
  return `txn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Format a number as Indian-locale currency string with the ₹ symbol.
 * @param {number} value
 * @returns {string}  e.g. "₹1,24,500.00"
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style:                 'currency',
    currency:              'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format an ISO date string (YYYY-MM-DD) into a human-readable form.
 * @param {string} isoDate
 * @returns {string}  e.g. "25 Aug 2026"
 */
function formatDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  // Using UTC to avoid timezone-shift issues
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString('en-IN', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Determine a transaction type from its category key.
 * Income categories are explicitly listed; everything else is treated as expense.
 * @param {string} category
 * @returns {'income'|'expense'}
 */
function typeFromCategory(category) {
  const incomeCategories = ['salary', 'freelance', 'investment', 'gift', 'other-income'];
  return incomeCategories.includes(category) ? 'income' : 'expense';
}

/**
 * Return a friendly greeting based on the current hour.
 * @returns {string}
 */
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/* ---------------------------------------------------------
   FINANCIAL CALCULATIONS
   --------------------------------------------------------- */

/**
 * Walk the full transactions array, compute totals, and
 * update the three Summary Card DOM elements.
 */
function updateSummaryCards() {
  const income   = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance  = income - expenses;

  // Animate the counters with a brief fade-pulse
  animateCardUpdate(dom.totalIncome,    formatCurrency(income));
  animateCardUpdate(dom.totalExpenses,  formatCurrency(expenses));
  animateCardUpdate(dom.currentBalance, formatCurrency(balance));

  // Visually flag a negative balance on the card
  const balanceCard = document.getElementById('cardBalance');
  if (balance < 0) {
    balanceCard.classList.add('card--balance-negative');
    dom.currentBalance.style.color = 'var(--expense-500)';
  } else {
    balanceCard.classList.remove('card--balance-negative');
    dom.currentBalance.style.color = 'var(--balance-500)';
  }
}

/**
 * Apply a short CSS animation to a summary amount element when its value changes.
 * @param {HTMLElement} el
 * @param {string} newText
 */
function animateCardUpdate(el, newText) {
  if (el.textContent === newText) return;   // no-op if unchanged
  el.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
  el.style.opacity    = '0';
  el.style.transform  = 'translateY(6px)';
  setTimeout(() => {
    el.textContent      = newText;
    el.style.opacity    = '1';
    el.style.transform  = 'translateY(0)';
  }, 150);
}

/* ---------------------------------------------------------
   FORM — VALIDATION
   --------------------------------------------------------- */

/**
 * Clear all inline error messages from the form.
 */
function clearFormErrors() {
  dom.errorAmount.textContent      = '';
  dom.errorDescription.textContent = '';
  dom.errorDate.textContent        = '';
  dom.errorCategory.textContent    = '';
}

/**
 * Validate the add/edit form. Writes error messages to the DOM
 * and returns true if the form is valid.
 * @returns {boolean}
 */
function validateForm() {
  clearFormErrors();
  let valid = true;

  const amount = parseFloat(dom.inputAmount.value);
  if (!dom.inputAmount.value.trim() || isNaN(amount) || amount <= 0) {
    dom.errorAmount.textContent = 'Please enter a valid amount greater than ₹0.';
    dom.inputAmount.focus();
    valid = false;
  }

  if (!dom.inputDescription.value.trim()) {
    dom.errorDescription.textContent = 'Description cannot be empty.';
    if (valid) dom.inputDescription.focus();
    valid = false;
  }

  if (!dom.inputDate.value) {
    dom.errorDate.textContent = 'Please select a date.';
    if (valid) dom.inputDate.focus();
    valid = false;
  }

  if (!dom.inputCategory.value) {
    dom.errorCategory.textContent = 'Please select a category.';
    if (valid) dom.inputCategory.focus();
    valid = false;
  }

  return valid;
}

/* ---------------------------------------------------------
   FORM — RESET & POPULATE (for edit mode)
   --------------------------------------------------------- */

/**
 * Reset the form to its default "Add" state.
 */
function resetForm() {
  dom.form.reset();
  clearFormErrors();
  editingId = null;

  // Restore button to "Add" state
  dom.btnAdd.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
    Add Transaction`;
  dom.btnAdd.style.background = '';  // restore default gradient

  // Reset date to today
  dom.inputDate.value = new Date().toISOString().split('T')[0];

  // Ensure Income radio is checked
  dom.typeIncome.checked = true;
}

/**
 * Populate the form with an existing transaction's data for editing.
 * @param {Transaction} txn
 */
function populateFormForEdit(txn) {
  editingId = txn.id;

  // Select the correct type radio
  if (txn.type === 'income') {
    dom.typeIncome.checked  = true;
    dom.typeExpense.checked = false;
  } else {
    dom.typeIncome.checked  = false;
    dom.typeExpense.checked = true;
  }

  dom.inputAmount.value      = txn.amount;
  dom.inputDescription.value = txn.description;
  dom.inputDate.value        = txn.date;
  dom.inputCategory.value    = txn.category;

  // Change button to "Update" state
  dom.btnAdd.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
    Update Transaction`;
  dom.btnAdd.style.background =
    'linear-gradient(135deg, hsl(32,88%,52%) 0%, hsl(14,80%,58%) 100%)';

  // Scroll form into view
  dom.form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  dom.inputAmount.focus();
}

/* ---------------------------------------------------------
   CORE CRUD — ADD
   --------------------------------------------------------- */

/**
 * Read form values, build a new transaction object, push it to the
 * state array, persist, and refresh the UI.
 */
function addTransaction() {
  const selectedType = dom.typeIncome.checked ? 'income' : 'expense';

  /** @type {Transaction} */
  const newTxn = {
    id:          generateId(),
    type:        selectedType,
    amount:      parseFloat(parseFloat(dom.inputAmount.value).toFixed(2)),
    description: dom.inputDescription.value.trim(),
    date:        dom.inputDate.value,
    category:    dom.inputCategory.value,
  };

  transactions.unshift(newTxn);   // prepend so newest appears first
  saveToStorage();
  refreshAll();
  resetForm();
  showToast(`✅ "${newTxn.description}" added!`);
}

/* ---------------------------------------------------------
   CORE CRUD — EDIT
   --------------------------------------------------------- */

/**
 * Find the transaction being edited, apply form changes in-place,
 * persist, and refresh the UI.
 */
function updateTransaction() {
  const idx = transactions.findIndex(t => t.id === editingId);
  if (idx === -1) {
    console.warn('ExpenseIQ: editingId not found in state, aborting update.');
    resetForm();
    return;
  }

  const selectedType = dom.typeIncome.checked ? 'income' : 'expense';

  transactions[idx] = {
    ...transactions[idx],
    type:        selectedType,
    amount:      parseFloat(parseFloat(dom.inputAmount.value).toFixed(2)),
    description: dom.inputDescription.value.trim(),
    date:        dom.inputDate.value,
    category:    dom.inputCategory.value,
  };

  saveToStorage();
  refreshAll();
  resetForm();
  showToast(`✏️ Transaction updated successfully!`);
}

/* ---------------------------------------------------------
   CORE CRUD — DELETE
   --------------------------------------------------------- */

/**
 * Remove a transaction from state by its ID, then update storage and UI.
 * @param {string} id
 */
function deleteTransaction(id) {
  const txn = transactions.find(t => t.id === id);
  if (!txn) return;

  if (!confirm(`Delete "${txn.description}"?\nThis action cannot be undone.`)) return;

  transactions = transactions.filter(t => t.id !== id);
  saveToStorage();
  refreshAll();
  showToast(`🗑️ "${txn.description}" deleted.`);
}

/* ---------------------------------------------------------
   DYNAMIC RENDERING
   --------------------------------------------------------- */

/**
 * Build the HTML string for a single transaction list item.
 * @param {Transaction} txn
 * @returns {string}
 */
function buildTransactionHTML(txn) {
  const isIncome    = txn.type === 'income';
  const typeClass   = isIncome ? 'txn-item--income'  : 'txn-item--expense';
  const iconBgClass = isIncome ? 'income-cat-icon'   : 'expense-cat-icon';
  const amtClass    = isIncome ? 'income-amount'     : 'expense-amount';
  const prefix      = isIncome ? '+'                 : '\u2212'; // minus sign

  const icon        = CATEGORY_ICONS[txn.category]  || (isIncome ? '💰' : '💸');
  const label       = CATEGORY_LABELS[txn.category] || txn.category;
  const badgeClass  = `badge--${txn.category}`;
  const formattedAmt = formatCurrency(txn.amount);
  const formattedDate = formatDate(txn.date);

  // Sanitise description to prevent XSS when injecting via innerHTML
  const safeDesc = txn.description
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const safeLabel = label
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return `
    <li class="txn-item ${typeClass}"
        data-id="${txn.id}"
        data-category="${txn.category}"
        role="listitem">
      <div class="txn-left">
        <div class="txn-cat-icon ${iconBgClass}" aria-hidden="true">${icon}</div>
        <div class="txn-info">
          <span class="txn-desc" title="${safeDesc}">${safeDesc}</span>
          <div class="txn-meta">
            <time class="txn-date" datetime="${txn.date}">${formattedDate}</time>
            <span class="txn-badge ${badgeClass}">${safeLabel}</span>
          </div>
        </div>
      </div>
      <div class="txn-right">
        <span class="txn-amount ${amtClass}">${prefix}${formattedAmt}</span>
        <div class="txn-actions">
          <button class="action-btn edit-btn"
                  data-action="edit"
                  data-id="${txn.id}"
                  aria-label="Edit ${safeDesc} transaction"
                  title="Edit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                 aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="action-btn delete-btn"
                  data-action="delete"
                  data-id="${txn.id}"
                  aria-label="Delete ${safeDesc} transaction"
                  title="Delete">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                 aria-hidden="true">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      </div>
    </li>`;
}

/**
 * Clear the transaction list and re-render all items matching the
 * currently selected filter. Show the empty state if none match.
 */
function renderTransactionList() {
  const filterValue = dom.filterCategory.value;     // 'all' or a category key

  const filtered = filterValue === 'all'
    ? transactions
    : transactions.filter(t => t.category === filterValue);

  // Sort by date descending (most recent first)
  const sorted = [...filtered].sort((a, b) => {
    if (b.date !== a.date) return b.date.localeCompare(a.date);
    // Secondary: by creation order (id contains timestamp)
    return b.id.localeCompare(a.id);
  });

  dom.transactionList.innerHTML = sorted.map(buildTransactionHTML).join('');

  // Toggle empty state
  const isEmpty = sorted.length === 0;
  dom.emptyState.hidden    = !isEmpty;
  dom.emptyState.setAttribute('aria-hidden', String(!isEmpty));
}

/**
 * Master refresh: re-render the list and recalculate summary cards.
 * Called after every state mutation.
 */
function refreshAll() {
  renderTransactionList();
  updateSummaryCards();
}

/* ---------------------------------------------------------
   EVENT DELEGATION — Transaction List Actions
   --------------------------------------------------------- */

/**
 * Single delegated click listener on the transaction list.
 * Handles both Edit and Delete actions via data-action attributes.
 * @param {MouseEvent} e
 */
function handleListClick(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  const action = btn.dataset.action;
  const id     = btn.dataset.id;

  if (action === 'delete') {
    deleteTransaction(id);
  } else if (action === 'edit') {
    const txn = transactions.find(t => t.id === id);
    if (txn) populateFormForEdit(txn);
  }
}

/* ---------------------------------------------------------
   EVENT LISTENER — Form Submission
   --------------------------------------------------------- */

/**
 * Handle form submit for both "Add" and "Update" modes.
 * @param {SubmitEvent} e
 */
function handleFormSubmit(e) {
  e.preventDefault();
  if (!validateForm()) return;

  if (editingId) {
    updateTransaction();
  } else {
    addTransaction();
  }
}

/* ---------------------------------------------------------
   EVENT LISTENER — Category Filter
   --------------------------------------------------------- */

/**
 * Re-render the list whenever the filter dropdown changes.
 */
function handleFilterChange() {
  renderTransactionList();
}

/* ---------------------------------------------------------
   TOAST NOTIFICATION
   --------------------------------------------------------- */

let toastTimer = null;

/**
 * Display a brief non-blocking toast message at the bottom of the screen.
 * Auto-dismisses after 3 seconds.
 * @param {string} message
 */
function showToast(message) {
  let toast = document.getElementById('expenseiq-toast');

  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'expenseiq-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    Object.assign(toast.style, {
      position:        'fixed',
      bottom:          '1.5rem',
      left:            '50%',
      transform:       'translateX(-50%) translateY(80px)',
      background:      'hsl(222, 20%, 18%)',
      color:           'hsl(220, 20%, 96%)',
      padding:         '0.75rem 1.5rem',
      borderRadius:    '9999px',
      fontSize:        '0.9rem',
      fontFamily:      'Inter, sans-serif',
      fontWeight:      '600',
      boxShadow:       '0 8px 32px hsla(222, 40%, 4%, 0.7)',
      border:          '1px solid hsla(220, 20%, 40%, 0.3)',
      zIndex:          '9999',
      transition:      'transform 0.35s cubic-bezier(0.22,1,0.36,1), opacity 0.35s ease',
      opacity:         '0',
      whiteSpace:      'nowrap',
      pointerEvents:   'none',
    });
    document.body.appendChild(toast);
  }

  toast.textContent = message;

  // Clear any existing timer
  if (toastTimer) clearTimeout(toastTimer);

  // Slide in
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(-50%) translateY(0)';
    toast.style.opacity   = '1';
  });

  // Slide out after 3 s
  toastTimer = setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(80px)';
    toast.style.opacity   = '0';
  }, 3000);
}

/* ---------------------------------------------------------
   HEADER — DATE & GREETING
   --------------------------------------------------------- */

/**
 * Populate the header date and update the greeting text based
 * on the current time of day.
 */
function initHeaderAndGreeting() {
  // Header date
  const now = new Date();
  dom.headerDate.textContent = now.toLocaleDateString('en-IN', {
    weekday: 'short',
    day:     'numeric',
    month:   'long',
    year:    'numeric',
  });

  // Dynamic greeting
  if (dom.greetingTitle) {
    dom.greetingTitle.textContent = `${getGreeting()}, Ayush 👋`;
  }

  // Greeting sub — current month/year
  const greetingSub = document.querySelector('.greeting-sub');
  if (greetingSub) {
    const monthYear = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    greetingSub.textContent = `Here's your financial snapshot for ${monthYear}`;
  }
}

/* ---------------------------------------------------------
   FORM — DEFAULT DATE
   --------------------------------------------------------- */

/**
 * Pre-fill the date input with today's date so the user doesn't
 * have to pick it manually for same-day entries.
 */
function setDefaultDate() {
  if (!dom.inputDate.value) {
    dom.inputDate.value = new Date().toISOString().split('T')[0];
  }
}

/* ---------------------------------------------------------
   KEYBOARD SHORTCUT — Escape to cancel edit
   --------------------------------------------------------- */

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && editingId) {
    resetForm();
    showToast('✖ Edit cancelled.');
  }
});

/* ---------------------------------------------------------
   INITIALISATION
   --------------------------------------------------------- */

/**
 * Bootstrap the application:
 *  1. Load persisted data from localStorage.
 *  2. Wire up all event listeners.
 *  3. Render the initial UI state.
 */
function init() {
  // 1 – Load state
  transactions = loadFromStorage();

  // 2 – Event listeners
  dom.form.addEventListener('submit', handleFormSubmit);
  dom.transactionList.addEventListener('click', handleListClick);
  dom.filterCategory.addEventListener('change', handleFilterChange);

  // Clear field-level error on input/change
  dom.inputAmount.addEventListener('input',  () => { dom.errorAmount.textContent = ''; });
  dom.inputDescription.addEventListener('input', () => { dom.errorDescription.textContent = ''; });
  dom.inputDate.addEventListener('change',   () => { dom.errorDate.textContent = ''; });
  dom.inputCategory.addEventListener('change',() => { dom.errorCategory.textContent = ''; });

  // 3 – Initial UI
  initHeaderAndGreeting();
  setDefaultDate();
  refreshAll();
}

// Run once the DOM is fully parsed
document.addEventListener('DOMContentLoaded', init);
