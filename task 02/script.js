/**
 * TaskFlow — script.js
 * Complete To-Do List Application Logic
 */

'use strict';

/* ─────────────────────────────────────────
   CONSTANTS & DOM REFERENCES
───────────────────────────────────────────── */
const LS_TASKS_KEY = 'taskflow_tasks';
const LS_THEME_KEY = 'taskflow_theme';

// Form & input
const taskForm      = document.getElementById('task-form');
const taskInput     = document.getElementById('task-input');
const categorySelect = document.getElementById('category-select');
const prioritySelect = document.getElementById('priority-select');
const dueDateInput  = document.getElementById('due-date');
const charCount     = document.getElementById('char-count');

// Controls
const searchInput   = document.getElementById('search-input');
const searchClear   = document.getElementById('search-clear');
const filterSelect  = document.getElementById('filter-select');
const sortSelect    = document.getElementById('sort-select');
const clearDoneBtn  = document.getElementById('clear-completed-btn');

// Task list & empty state
const taskList      = document.getElementById('task-list');
const emptyState    = document.getElementById('empty-state');
const visibleCount  = document.getElementById('visible-task-count');

// Stats
const completedCountEl = document.getElementById('completed-count');
const pendingCountEl   = document.getElementById('pending-count');
const progressFill     = document.getElementById('progress-fill');
const progressWrapper  = progressFill.parentElement;

// Theme
const themeSwitch   = document.getElementById('theme-switch');
const htmlEl        = document.documentElement;

// Toast
const toastContainer = document.getElementById('toast-container');

// Footer
const footerYear = document.getElementById('footer-year');

/* ─────────────────────────────────────────
   APPLICATION STATE
───────────────────────────────────────────── */
let tasks = [];           // Master array of task objects
let editingTaskId = null; // Tracks which task is being edited (null = new task)

/* ─────────────────────────────────────────
   TASK DATA MODEL
   {
     id:        string  — unique identifier (Date.now())
     text:      string  — task description
     category:  string  — 'work' | 'personal' | 'health' | etc.
     priority:  string  — 'low' | 'medium' | 'high' | 'urgent'
     dueDate:   string  — ISO date string 'YYYY-MM-DD' or ''
     completed: boolean — completion status
     createdAt: number  — timestamp for sorting
   }
───────────────────────────────────────────── */

/* ─────────────────────────────────────────
   LOCAL STORAGE — PERSISTENCE
───────────────────────────────────────────── */

/**
 * Serialises the tasks array to localStorage.
 */
function saveTasks() {
  localStorage.setItem(LS_TASKS_KEY, JSON.stringify(tasks));
}

/**
 * Loads and parses the tasks array from localStorage.
 * Returns an empty array if nothing is stored.
 */
function loadTasks() {
  try {
    const stored = localStorage.getItem(LS_TASKS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/* ─────────────────────────────────────────
   CORE CRUD OPERATIONS
───────────────────────────────────────────── */

/**
 * Adds a new task to the array and persists it.
 */
function addTask(text, category, priority, dueDate) {
  const task = {
    id:        String(Date.now()),
    text:      text.trim(),
    category,
    priority,
    dueDate,
    completed: false,
    createdAt: Date.now(),
  };
  tasks.unshift(task); // newest first
  saveTasks();
  return task;
}

/**
 * Updates an existing task's editable fields and persists.
 */
function updateTask(id, text, category, priority, dueDate) {
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return;
  tasks[idx] = { ...tasks[idx], text: text.trim(), category, priority, dueDate };
  saveTasks();
}

/**
 * Removes a task by id and persists.
 */
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
}

/**
 * Flips a task's completed status and persists.
 */
function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  saveTasks();
}

/* ─────────────────────────────────────────
   HELPERS — CATEGORY / PRIORITY META
───────────────────────────────────────────── */

const CATEGORY_META = {
  general:  { label: 'General',  icon: 'category',       css: '' },
  work:     { label: 'Work',     icon: 'work',            css: 'badge-work' },
  personal: { label: 'Personal', icon: 'person',          css: 'badge-personal' },
  health:   { label: 'Health',   icon: 'favorite',        css: 'badge-health' },
  finance:  { label: 'Finance',  icon: 'payments',        css: 'badge-finance' },
  learning: { label: 'Learning', icon: 'school',          css: 'badge-learning' },
  shopping: { label: 'Shopping', icon: 'shopping_cart',   css: 'badge-shopping' },
};

const PRIORITY_META = {
  low:    { label: 'Low',    css: 'badge-priority-low',    icon: 'flag' },
  medium: { label: 'Medium', css: 'badge-priority-medium', icon: 'flag' },
  high:   { label: 'High',   css: 'badge-priority-high',   icon: 'flag' },
  urgent: { label: 'Urgent', css: 'badge-priority-urgent', icon: 'emergency_home' },
};

/**
 * Formats a 'YYYY-MM-DD' string into a human-readable label.
 * Returns '' when no date is provided.
 */
function formatDueDate(isoDate) {
  if (!isoDate) return '';
  // Parse in UTC to avoid timezone shifts
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Returns true if the given ISO date string is in the past.
 */
function isOverdue(isoDate, completed) {
  if (!isoDate || completed) return false;
  const [y, m, d] = isoDate.split('-').map(Number);
  const due = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

/* ─────────────────────────────────────────
   RENDERING — BUILD TASK ITEM HTML
───────────────────────────────────────────── */

/**
 * Creates and returns a <li> DOM element for a given task object.
 */
function createTaskElement(task) {
  const cat  = CATEGORY_META[task.category]  || CATEGORY_META.general;
  const pri  = PRIORITY_META[task.priority]  || PRIORITY_META.medium;
  const due  = formatDueDate(task.dueDate);
  const over = isOverdue(task.dueDate, task.completed);

  const li = document.createElement('li');
  li.className   = `task-item${task.completed ? ' completed' : ''}`;
  li.dataset.id       = task.id;
  li.dataset.priority = task.priority;
  li.dataset.category = task.category;
  li.setAttribute('role', 'listitem');

  li.innerHTML = `
    <!-- Checkbox -->
    <label class="task-checkbox-label" for="check-${task.id}" aria-label="Mark task as complete">
      <input
        type="checkbox"
        class="task-checkbox"
        id="check-${task.id}"
        ${task.completed ? 'checked' : ''}
        aria-describedby="task-text-${task.id}"
      />
      <span class="custom-checkbox" aria-hidden="true">
        <span class="material-symbols-rounded check-icon">check</span>
      </span>
    </label>

    <!-- Content -->
    <div class="task-content">
      <p class="task-text" id="task-text-${task.id}">${escapeHtml(task.text)}</p>
      <div class="task-meta">
        <span
          class="badge badge-category ${cat.css}"
          aria-label="Category: ${cat.label}"
        >
          <span class="material-symbols-rounded" aria-hidden="true">${cat.icon}</span>
          ${cat.label}
        </span>
        <span
          class="badge badge-priority ${pri.css}"
          aria-label="Priority: ${pri.label}"
        >
          <span class="material-symbols-rounded" aria-hidden="true">${pri.icon}</span>
          ${pri.label}
        </span>
        ${due ? `
        <span
          class="badge badge-due${over ? ' overdue' : ''}"
          aria-label="Due date: ${due}${over ? ' — Overdue' : ''}"
        >
          <span class="material-symbols-rounded" aria-hidden="true">
            ${over ? 'event_busy' : 'calendar_today'}
          </span>
          ${due}${over ? ' ⚠' : ''}
        </span>` : ''}
      </div>
    </div>

    <!-- Actions -->
    <div class="task-actions" role="group" aria-label="Task actions">
      <button
        class="task-action-btn btn-edit"
        data-id="${task.id}"
        aria-label="Edit task"
        title="Edit task"
      >
        <span class="material-symbols-rounded" aria-hidden="true">edit</span>
      </button>
      <button
        class="task-action-btn btn-delete"
        data-id="${task.id}"
        aria-label="Delete task"
        title="Delete task"
      >
        <span class="material-symbols-rounded" aria-hidden="true">delete</span>
      </button>
    </div>
  `;

  // ── Attach inline event listeners ──────────────────
  // Checkbox toggle
  li.querySelector('.task-checkbox').addEventListener('change', () => {
    toggleTask(task.id);
    refreshAll();
  });

  // Edit button
  li.querySelector('.btn-edit').addEventListener('click', () => {
    startEditing(task.id);
  });

  // Delete button (with micro animation)
  li.querySelector('.btn-delete').addEventListener('click', () => {
    li.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    li.style.opacity    = '0';
    li.style.transform  = 'scale(0.95)';
    setTimeout(() => {
      deleteTask(task.id);
      refreshAll();
      showToast('Task deleted', 'info');
    }, 200);
  });

  return li;
}

/**
 * Escapes HTML special characters to prevent XSS.
 */
function escapeHtml(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(str).replace(/[&<>"']/g, c => map[c]);
}

/* ─────────────────────────────────────────
   RENDERING — FULL LIST RENDER
───────────────────────────────────────────── */

/**
 * Applies search / filter / sort to produce a display list,
 * then re-renders the <ul>.
 */
function renderTaskList() {
  const searchVal = searchInput.value.trim().toLowerCase();
  const filterVal = filterSelect.value;   // 'all' | 'pending' | 'completed'
  const sortVal   = sortSelect.value;     // 'newest' | 'oldest' | 'priority' | 'due-date'

  // 1. Clone array so we don't mutate state
  let display = [...tasks];

  // 2. Filter by status
  if (filterVal === 'completed') {
    display = display.filter(t => t.completed);
  } else if (filterVal === 'pending') {
    display = display.filter(t => !t.completed);
  }

  // 3. Filter by search string
  if (searchVal) {
    display = display.filter(t =>
      t.text.toLowerCase().includes(searchVal) ||
      t.category.toLowerCase().includes(searchVal) ||
      t.priority.toLowerCase().includes(searchVal)
    );
  }

  // 4. Sort
  const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3 };
  switch (sortVal) {
    case 'oldest':
      display.sort((a, b) => a.createdAt - b.createdAt);
      break;
    case 'priority':
      display.sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 4) - (PRIORITY_ORDER[b.priority] ?? 4));
      break;
    case 'due-date':
      display.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
      break;
    case 'newest':
    default:
      display.sort((a, b) => b.createdAt - a.createdAt);
  }

  // 5. Clear the list (remove placeholder + previous renders)
  taskList.innerHTML = '';

  // 6. Show empty state or render items
  if (display.length === 0) {
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;
    display.forEach(task => {
      taskList.appendChild(createTaskElement(task));
    });
  }

  // 7. Update visible count badge
  const n = display.length;
  visibleCount.textContent = `${n} task${n !== 1 ? 's' : ''}`;
}

/* ─────────────────────────────────────────
   LIVE STATISTICS
───────────────────────────────────────────── */

/**
 * Re-calculates completed / pending counts and updates
 * the header chips and the progress bar.
 */
function updateStats() {
  const total     = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending   = total - completed;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Animate number changes
  animateCount(completedCountEl, parseInt(completedCountEl.textContent) || 0, completed);
  animateCount(pendingCountEl,   parseInt(pendingCountEl.textContent)   || 0, pending);

  // Progress bar
  progressFill.style.width = `${pct}%`;
  progressWrapper.setAttribute('aria-valuenow', pct);
}

/**
 * Smoothly counts a number element from `from` to `to`.
 */
function animateCount(el, from, to) {
  if (from === to) { el.textContent = to; return; }
  const duration = 350;
  const steps    = 20;
  const interval = duration / steps;
  const diff     = to - from;
  let step = 0;

  const timer = setInterval(() => {
    step++;
    el.textContent = Math.round(from + (diff * step) / steps);
    if (step >= steps) {
      clearInterval(timer);
      el.textContent = to;
    }
  }, interval);
}

/* ─────────────────────────────────────────
   REFRESH — SINGLE CALL TO UPDATE ALL UI
───────────────────────────────────────────── */

/**
 * Master refresh: renders the list + stats together.
 * Call this after every state mutation.
 */
function refreshAll() {
  renderTaskList();
  updateStats();
}

/* ─────────────────────────────────────────
   FORM — ADD / EDIT TASK
───────────────────────────────────────────── */

/**
 * Reads form values, validates, then adds or saves a task.
 */
function handleFormSubmit(e) {
  e.preventDefault();

  const text     = taskInput.value.trim();
  const category = categorySelect.value;
  const priority = prioritySelect.value;
  const dueDate  = dueDateInput.value;

  // Validation
  if (!text) {
    shakeElement(taskInput);
    taskInput.focus();
    showToast('Please enter a task description.', 'error');
    return;
  }

  if (editingTaskId) {
    // ── UPDATE MODE ──
    updateTask(editingTaskId, text, category, priority, dueDate);
    stopEditing();
    showToast('Task updated!', 'success');
  } else {
    // ── ADD MODE ──
    addTask(text, category, priority, dueDate);
    showToast('Task added!', 'success');
  }

  taskForm.reset();
  taskInput.focus();
  updateCharCount();
  refreshAll();
}

/**
 * Populates the form with an existing task's data ready for editing.
 */
function startEditing(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  editingTaskId = id;

  // Populate form
  taskInput.value        = task.text;
  categorySelect.value   = task.category;
  prioritySelect.value   = task.priority;
  dueDateInput.value     = task.dueDate || '';

  updateCharCount();

  // Update button label
  const addBtn = document.getElementById('add-task-btn');
  addBtn.innerHTML = `
    <span class="material-symbols-rounded btn-icon" aria-hidden="true">save</span>
    Save Changes
  `;
  addBtn.classList.add('btn-editing');

  // Smooth scroll to form
  taskForm.closest('.input-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
  taskInput.focus();
}

/**
 * Cancels edit mode and resets the form button.
 */
function stopEditing() {
  editingTaskId = null;
  const addBtn  = document.getElementById('add-task-btn');
  addBtn.innerHTML = `
    <span class="material-symbols-rounded btn-icon" aria-hidden="true">add_task</span>
    Add Task
  `;
  addBtn.classList.remove('btn-editing');
}

/* ─────────────────────────────────────────
   CHARACTER COUNTER
───────────────────────────────────────────── */

function updateCharCount() {
  const len = taskInput.value.length;
  charCount.textContent = `${len}/200`;
  charCount.style.color = len > 180
    ? 'var(--color-danger)'
    : len > 150
      ? 'var(--color-warning)'
      : 'var(--color-text-faint)';
}

/* ─────────────────────────────────────────
   SEARCH & FILTER
───────────────────────────────────────────── */

function handleSearch() {
  searchClear.hidden = searchInput.value.length === 0;
  renderTaskList();
}

function clearSearch() {
  searchInput.value  = '';
  searchClear.hidden = true;
  searchInput.focus();
  renderTaskList();
}

/* ─────────────────────────────────────────
   DARK MODE
───────────────────────────────────────────── */

/**
 * Applies a theme ('light' | 'dark') to the <html> element
 * and persists the preference to localStorage.
 */
function applyTheme(theme) {
  htmlEl.setAttribute('data-theme', theme);
  themeSwitch.checked = theme === 'dark';
  themeSwitch.setAttribute('aria-checked', String(theme === 'dark'));
  localStorage.setItem(LS_THEME_KEY, theme);
}

/**
 * Toggles between 'light' and 'dark'.
 */
function toggleTheme() {
  const current = htmlEl.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

/**
 * Reads the saved theme (or falls back to system preference).
 */
function loadTheme() {
  const saved = localStorage.getItem(LS_THEME_KEY);
  if (saved) {
    applyTheme(saved);
  } else {
    // Respect OS preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }
}

/* ─────────────────────────────────────────
   TOAST NOTIFICATIONS
───────────────────────────────────────────── */

/**
 * Shows a temporary toast notification.
 * @param {string} message  — Display text
 * @param {'success'|'error'|'info'} type — Visual style
 * @param {number} duration — ms before auto-dismiss
 */
function showToast(message, type = 'info', duration = 2800) {
  const icons = { success: 'check_circle', error: 'error', info: 'info' };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <span class="material-symbols-rounded" aria-hidden="true">${icons[type] ?? 'info'}</span>
    <span>${escapeHtml(message)}</span>
  `;

  toastContainer.appendChild(toast);

  // Auto-remove
  const remove = () => {
    toast.classList.add('toast-out');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  };

  setTimeout(remove, duration);
  toast.addEventListener('click', remove); // Click to dismiss early
}

/* ─────────────────────────────────────────
   UI HELPERS
───────────────────────────────────────────── */

/**
 * Briefly shakes an element to indicate an error.
 */
function shakeElement(el) {
  el.classList.remove('shake');
  void el.offsetWidth; // force reflow
  el.classList.add('shake');
  el.addEventListener('animationend', () => el.classList.remove('shake'), { once: true });
}

/* ─────────────────────────────────────────
   EVENT LISTENERS
───────────────────────────────────────────── */

// Form submit (add / save)
taskForm.addEventListener('submit', handleFormSubmit);

// Form reset (clear button)
taskForm.addEventListener('reset', () => {
  stopEditing();
  updateCharCount();
  // Small delay so reset fires first
  setTimeout(() => { updateCharCount(); }, 0);
});

// Character counter
taskInput.addEventListener('input', updateCharCount);

// Search
searchInput.addEventListener('input', handleSearch);
searchClear.addEventListener('click', clearSearch);

// Filter & sort dropdowns
filterSelect.addEventListener('change', renderTaskList);
sortSelect.addEventListener('change',   renderTaskList);

// Clear completed tasks
clearDoneBtn.addEventListener('click', () => {
  const doneCount = tasks.filter(t => t.completed).length;
  if (doneCount === 0) {
    showToast('No completed tasks to clear.', 'info');
    return;
  }
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  refreshAll();
  showToast(`${doneCount} completed task${doneCount !== 1 ? 's' : ''} removed.`, 'success');
});

// Dark mode toggle
themeSwitch.addEventListener('change', toggleTheme);

// Listen for OS theme changes (if no preference saved)
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (!localStorage.getItem(LS_THEME_KEY)) {
    applyTheme(e.matches ? 'dark' : 'light');
  }
});

/* ─────────────────────────────────────────
   CSS ANIMATION — SHAKE KEYFRAME (injected)
───────────────────────────────────────────── */
// Inject shake keyframe dynamically so it lives with the JS logic
(function injectShakeKeyframe() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%       { transform: translateX(-6px); }
      40%       { transform: translateX(6px); }
      60%       { transform: translateX(-4px); }
      80%       { transform: translateX(4px); }
    }
    .shake { animation: shake 0.35s ease forwards; }

    /* Edit-mode button style */
    .btn-editing {
      background: linear-gradient(135deg, #0ea5e9, #06b6d4) !important;
      box-shadow: 0 3px 12px rgba(6,182,212,0.35) !important;
    }
    .btn-editing:hover {
      background: linear-gradient(135deg, #0284c7, #0891b2) !important;
    }
  `;
  document.head.appendChild(style);
})();

/* ─────────────────────────────────────────
   INITIALISE
───────────────────────────────────────────── */

(function init() {
  // 1. Set footer year
  if (footerYear) footerYear.textContent = new Date().getFullYear();

  // 2. Load & apply saved theme
  loadTheme();

  // 3. Load persisted tasks
  tasks = loadTasks();

  // 4. Remove the static placeholder task from HTML
  //    (it was only there for CSS/layout preview)
  const placeholder = document.getElementById('task-placeholder');
  if (placeholder) placeholder.remove();

  // 5. Initial render
  refreshAll();

  // 6. Initialise char counter
  updateCharCount();

  console.log('To-Do app initialized');
})();
