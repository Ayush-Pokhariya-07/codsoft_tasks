/**
 * ===================================================
 * LUMEN BLOG — script.js
 * Complete Interactive Logic
 * ===================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Blog loaded');

  // Initialize all components
  initDarkMode();
  initLiveSearch();
  initLoadMore();
  initPostInteractions();
});

/**
 * ---------------------------------------------------
 * 1. Dark Mode Persistence
 * ---------------------------------------------------
 * Toggles 'dark-theme' class on <body>, updates data-theme,
 * and persists user preference in localStorage.
 */
function initDarkMode() {
  const themeToggleBtns = document.querySelectorAll('#themeToggleBtn, .theme-toggle-btn');
  const body = document.body;
  const html = document.documentElement;

  // Retrieve saved theme preference (default to 'dark')
  const savedTheme = localStorage.getItem('lumen-theme') || 'dark';

  if (savedTheme === 'dark') {
    body.classList.add('dark-theme');
    html.setAttribute('data-theme', 'dark');
  } else {
    body.classList.remove('dark-theme');
    html.setAttribute('data-theme', 'light');
  }

  // Add click listener to all theme toggle buttons
  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const isDark = body.classList.toggle('dark-theme');
      const currentTheme = isDark ? 'dark' : 'light';

      html.setAttribute('data-theme', currentTheme);
      localStorage.setItem('lumen-theme', currentTheme);
    });
  });
}

/**
 * ---------------------------------------------------
 * 2. Live Search Filtering
 * ---------------------------------------------------
 * Captures user input and filters blog cards in the grid
 * by title and excerpt (case-insensitive) using display: none.
 */
function initLiveSearch() {
  const searchInputs = document.querySelectorAll('.search-input');
  const blogGrid = document.getElementById('blogGrid');

  if (!blogGrid) return; // Exit if not on page with blog grid (e.g. post.html)

  // Empty search state feedback element
  let noResultsEl = document.getElementById('noSearchResults');
  if (!noResultsEl) {
    noResultsEl = document.createElement('div');
    noResultsEl.id = 'noSearchResults';
    noResultsEl.style.cssText = `
      display: none;
      grid-column: 1 / -1;
      text-align: center;
      padding: 3.5rem 1rem;
      background: var(--bg-surface);
      border: 1px dashed var(--border-strong);
      border-radius: var(--radius-lg);
      margin-bottom: 2rem;
    `;
    noResultsEl.innerHTML = `
      <h3 style="font-family: var(--font-serif); font-size: 1.35rem; margin-bottom: 0.5rem; color: var(--text-primary);">No matching articles found</h3>
      <p style="color: var(--text-secondary); font-size: 0.9rem;">Try searching for a different keyword or topic.</p>
    `;
    blogGrid.parentNode.insertBefore(noResultsEl, blogGrid.nextSibling);
  }

  searchInputs.forEach(searchInput => {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const cards = blogGrid.querySelectorAll('.post-card');
      let visibleCount = 0;

      cards.forEach(card => {
        const titleEl = card.querySelector('.card-title');
        const excerptEl = card.querySelector('.card-excerpt');

        const titleText = titleEl ? titleEl.textContent.toLowerCase() : '';
        const excerptText = excerptEl ? excerptEl.textContent.toLowerCase() : '';

        // Check if query matches title or excerpt
        if (titleText.includes(query) || excerptText.includes(query)) {
          card.style.display = ''; // Restore default display
          visibleCount++;
        } else {
          card.style.display = 'none'; // Hide non-matching card
        }
      });

      // Show/hide no results notice
      if (visibleCount === 0 && cards.length > 0 && query !== '') {
        noResultsEl.style.display = 'block';
      } else {
        noResultsEl.style.display = 'none';
      }
    });
  });
}

/**
 * ---------------------------------------------------
 * 3. Load More Pagination
 * ---------------------------------------------------
 * Simulates a network request using setTimeout (800ms),
 * shows 'Loading...' state on button, and dynamically appends
 * 2 new placeholder blog cards to the grid.
 */
function initLoadMore() {
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  const blogGrid = document.getElementById('blogGrid');

  if (!loadMoreBtn || !blogGrid) return;

  // Pool of new placeholder articles to append dynamically
  const placeholderArticles = [
    {
      category: 'Fitness & Sleep',
      categoryClass: 'fitness',
      image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80',
      date: 'August 04, 2026',
      readTime: '5 min read',
      title: 'The Science of Deep Sleep and Circadian Optimization',
      excerpt: 'Exploring non-optical light therapy, cold thermogenesis protocols, and magnesium glycinate timing to maximize stage-4 regenerative rest.',
      author: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
    },
    {
      category: 'Technology & VR',
      categoryClass: 'tech',
      image: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?auto=format&fit=crop&w=800&q=80',
      date: 'July 30, 2026',
      readTime: '6 min read',
      title: 'Exploring Spatial Computing Interfaces in WebXR',
      excerpt: 'How spatial interaction standards and hand-tracking micro-gestures are transforming standard two-dimensional web navigation models.',
      author: 'Sophia Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80'
    },
    {
      category: 'Cinema & Stunts',
      categoryClass: 'cinema',
      image: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=800&q=80',
      date: 'July 26, 2026',
      readTime: '7 min read',
      title: 'The Evolution of Practical Wirework in Neo-Noir Action',
      excerpt: 'Tracing the heritage of Hong Kong wire-fu to modern Hollywood blockbusters, examining how physics and camera positioning sell real impact.',
      author: 'Marcus Vance',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'
    },
    {
      category: 'Philosophy & Design',
      categoryClass: 'ai',
      image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
      date: 'July 21, 2026',
      readTime: '4 min read',
      title: 'Typography as Architecture: Designing Calm Digital Spaces',
      excerpt: 'Why vertical rhythm, baseline grids, and generous white space create cognitive sanctuary in an era of saturated push notifications.',
      author: 'Dr. Aris Thorne',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80'
    }
  ];

  let currentBatchIndex = 0;
  const batchSize = 2;

  loadMoreBtn.addEventListener('click', () => {
    // Save original button content
    const originalContent = loadMoreBtn.innerHTML;

    // Change text to 'Loading...' and disable button
    loadMoreBtn.innerHTML = `
      <span>Loading...</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;">
        <line x1="12" y1="2" x2="12" y2="6"></line>
        <line x1="12" y1="18" x2="12" y2="22"></line>
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
        <line x1="2" y1="12" x2="6" y2="12"></line>
        <line x1="18" y1="12" x2="22" y2="12"></line>
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
      </svg>
    `;
    loadMoreBtn.disabled = true;
    loadMoreBtn.style.opacity = '0.7';
    loadMoreBtn.style.cursor = 'wait';

    // Wait 800ms to simulate network latency
    setTimeout(() => {
      const itemsToAppend = placeholderArticles.slice(currentBatchIndex, currentBatchIndex + batchSize);

      itemsToAppend.forEach(article => {
        const card = createBlogCardElement(article);
        blogGrid.appendChild(card);
      });

      currentBatchIndex += batchSize;

      // Reset button state
      loadMoreBtn.innerHTML = originalContent;
      loadMoreBtn.disabled = false;
      loadMoreBtn.style.opacity = '1';
      loadMoreBtn.style.cursor = 'pointer';

      // If no more articles left in the pool
      if (currentBatchIndex >= placeholderArticles.length) {
        loadMoreBtn.innerHTML = '<span>All Articles Loaded</span>';
        loadMoreBtn.disabled = true;
        loadMoreBtn.style.opacity = '0.5';
        loadMoreBtn.style.cursor = 'default';
      }
    }, 800);
  });
}

/**
 * Helper function to create DOM element for a blog post card
 */
function createBlogCardElement(article) {
  const card = document.createElement('article');
  card.className = 'post-card';
  card.style.animation = 'fadeInUp 0.4s ease forwards';

  card.innerHTML = `
    <div class="card-media">
      <span class="card-category-wrap">
        <span class="category-tag ${article.categoryClass}">${article.category}</span>
      </span>
      <img src="${article.image}" alt="${article.title}">
    </div>
    <div class="card-body">
      <div class="card-meta">
        <time>${article.date}</time>
        <span>•</span>
        <span>${article.readTime}</span>
      </div>
      <h3 class="card-title">
        <a href="post.html">${article.title}</a>
      </h3>
      <p class="card-excerpt">
        ${article.excerpt}
      </p>
      <div class="card-footer">
        <div class="author-chip">
          <img src="${article.avatar}" alt="${article.author}" class="author-avatar">
          <span class="author-name">${article.author}</span>
        </div>
        <a href="post.html" class="read-more-link">
          <span>Read More</span>
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
      </div>
    </div>
  `;

  return card;
}

/**
 * ---------------------------------------------------
 * 4. Post Page Detail Interactions
 * ---------------------------------------------------
 * Copy Link feedback, interactive comments form.
 */
function initPostInteractions() {
  // Copy link button
  const copyLinkBtn = document.getElementById('copyLinkBtn');
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
        const span = copyLinkBtn.querySelector('span');
        if (span) {
          const original = span.textContent;
          span.textContent = 'Link Copied!';
          copyLinkBtn.style.borderColor = 'var(--accent-primary)';
          copyLinkBtn.style.color = 'var(--accent-primary)';

          setTimeout(() => {
            span.textContent = original;
            copyLinkBtn.style.borderColor = '';
            copyLinkBtn.style.color = '';
          }, 2000);
        }
      }).catch(() => {
        alert('URL copied: ' + window.location.href);
      });
    });
  }

  // Interactive comment form submission on post.html
  const commentForm = document.querySelector('.comment-form-box form');
  const commentList = document.querySelector('.comment-list');
  const commentBadge = document.querySelector('.comment-badge');

  if (commentForm && commentList) {
    commentForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('commentAuthor');
      const messageInput = document.getElementById('commentMessage');

      const authorName = nameInput ? nameInput.value.trim() : 'Anonymous Reader';
      const commentText = messageInput ? messageInput.value.trim() : '';

      if (!commentText) return;

      const newComment = document.createElement('div');
      newComment.className = 'comment-item';
      newComment.style.animation = 'fadeInUp 0.4s ease forwards';
      newComment.innerHTML = `
        <div class="comment-header">
          <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80" alt="${authorName}" class="commenter-avatar">
          <div>
            <div class="commenter-name">${authorName}</div>
            <div class="comment-time">Just now</div>
          </div>
        </div>
        <p class="comment-text">${commentText}</p>
        <button class="comment-reply-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 14 4 9 9 4"></polyline>
            <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
          </svg>
          <span>Reply</span>
        </button>
      `;

      commentList.prepend(newComment);

      // Update count badge
      if (commentBadge) {
        const total = commentList.querySelectorAll('.comment-item').length;
        commentBadge.textContent = `${total} Comments`;
      }

      // Reset form
      commentForm.reset();
    });
  }
}
