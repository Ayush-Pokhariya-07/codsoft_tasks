// ═══════════════════════════════════════════
//  script.js — Portfolio Interactive Features
// ═══════════════════════════════════════════

console.log('Loaded');

/* ─────────────────────────────────────────────
   1. PROJECT DATA & DYNAMIC INJECTION
   ──────────────────────────────────────────── */

const projects = [
  {
    id: 'proj-lipi',
    title: 'Lipi – Global Language Learning App',
    description:
      'A gamified language-learning platform supporting 20+ languages. Features spaced-repetition flashcards, live pronunciation feedback, progress streaks, and a community leaderboard.',
    stack: ['React', 'Node.js', 'MongoDB'],
    icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">
             <path d="M5 8l6 6M4 14s-1-1 1-3 3.5-.5 5 1M12 8l6 6M11 14s-1-1 1-3 3.5-.5 5 1"/>
             <circle cx="12" cy="12" r="10"/>
           </svg>`,
    githubUrl: 'https://github.com/',
    demoUrl:   '#',
  },
  {
    id: 'proj-b2b',
    title: 'B2B Marketplace Platform',
    description:
      'A full-stack B2B commerce hub where verified businesses can list products, request bulk quotes, and manage procurement workflows. Includes role-based auth and invoice generation.',
    stack: ['React', 'Express', 'PostgreSQL'],
    icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">
             <path d="M3 3h18v4H3zM3 10h18v4H3zM3 17h18v4H3z"/>
           </svg>`,
    githubUrl: 'https://github.com/',
    demoUrl:   '#',
  },
  {
    id: 'proj-cpp-tracker',
    title: 'C++ Algorithms Tracker',
    description:
      'A personal DSA progress tracker with 150+ C++ solutions organised by topic. Features difficulty tagging, time-complexity notes, and a visual heatmap of solved problems.',
    stack: ['C++', 'DSA', 'JavaScript'],
    icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">
             <polyline points="16 18 22 12 16 6"/>
             <polyline points="8 6 2 12 8 18"/>
           </svg>`,
    githubUrl: 'https://github.com/',
    demoUrl:   '#',
  },
];

/**
 * Builds a project card's HTML string from a project data object.
 * @param {Object} project
 * @returns {string} HTML string for one <article> card
 */
function buildProjectCard(project) {
  const techTags = project.stack
    .map(t => `<span class="project-tech-tag">${t}</span>`)
    .join('');

  const githubIconPath =
    'M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577' +
    ' 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335' +
    '-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236' +
    ' 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466' +
    '-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176' +
    ' 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405' +
    ' 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91' +
    ' 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015' +
    ' 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z';

  return `
    <article class="project-card reveal" id="${project.id}" aria-labelledby="${project.id}-title">
      <div class="project-image">
        <div class="project-image-placeholder">${project.icon}</div>
        <div class="project-image-overlay" aria-hidden="true"></div>
        <div class="project-tags-overlay">${techTags}</div>
      </div>
      <div class="project-body">
        <h3 class="project-title" id="${project.id}-title">${project.title}</h3>
        <p class="project-description">${project.description}</p>
        <div class="project-footer">
          <a
            href="${project.githubUrl}"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-code"
            id="${project.id}-code"
            aria-label="View ${project.title} source code on GitHub"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="${githubIconPath}"/>
            </svg>
            View Code
          </a>
          <a href="${project.demoUrl}" class="btn-demo" id="${project.id}-demo"
             target="_blank" rel="noopener noreferrer">
            Live Demo ↗
          </a>
        </div>
      </div>
    </article>`;
}

/**
 * Clears the projects grid and injects dynamically built cards.
 */
function renderProjects() {
  const grid = document.querySelector('.projects-grid');
  if (!grid) return;

  grid.innerHTML = projects.map(buildProjectCard).join('');

  // Re-observe newly injected cards for scroll-reveal
  grid.querySelectorAll('.project-card.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.1}s`;
    revealObserver.observe(el);
  });
}

/* ─────────────────────────────────────────────
   2. SCROLL-REVEAL OBSERVER (defined early so
      renderProjects() can reference it)
   ──────────────────────────────────────────── */

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

// Selectors that should animate in on scroll
const revealSelectors = [
  '.about-grid',
  '.skills-category',
  '.skills-bar-section',
  '.resume-card',
  '.contact-info-card',
  '.contact-form',
  '.stat-card',
];

revealSelectors.forEach(selector => {
  document.querySelectorAll(selector).forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${i * 0.08}s`;
    revealObserver.observe(el);
  });
});

// Inject projects now (cards also get observed inside renderProjects)
renderProjects();

/* ─────────────────────────────────────────────
   3. NAVBAR — scroll shadow & active link
   ──────────────────────────────────────────── */

const navbar    = document.getElementById('navbar');
const navLinks  = document.querySelectorAll('.nav-link');
const sections  = document.querySelectorAll('main section[id]');

window.addEventListener('scroll', () => {
  // Add shadow when user scrolls past 20 px
  navbar.classList.toggle('scrolled', window.scrollY > 20);

  // Highlight the nav link whose section is currently in view
  let currentId = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 100) {
      currentId = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
  });
}, { passive: true });

/* ─────────────────────────────────────────────
   4. MOBILE NAVIGATION — hamburger toggle
   ──────────────────────────────────────────── */

const hamburgerBtn       = document.getElementById('hamburgerBtn');
const navLinksContainer  = document.getElementById('navLinks');

/**
 * Toggles the mobile menu open/closed.
 * Uses the 'active' class (CSS aliased to 'open') on both elements.
 */
function toggleMobileMenu(forceClose = false) {
  const isNowOpen = forceClose
    ? false
    : !navLinksContainer.classList.contains('active');

  navLinksContainer.classList.toggle('active', isNowOpen);
  hamburgerBtn.classList.toggle('active', isNowOpen);
  hamburgerBtn.setAttribute('aria-expanded', String(isNowOpen));
}

hamburgerBtn.addEventListener('click', () => toggleMobileMenu());

// Close menu when any nav link is clicked
navLinksContainer.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => toggleMobileMenu(true));
});

// Close menu when clicking outside of the nav area
document.addEventListener('click', (e) => {
  if (
    navLinksContainer.classList.contains('active') &&
    !navLinksContainer.contains(e.target) &&
    !hamburgerBtn.contains(e.target)
  ) {
    toggleMobileMenu(true);
  }
});

/* ─────────────────────────────────────────────
   5. SMOOTH SCROLLING for nav links
   ──────────────────────────────────────────── */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;           // skip bare "#" links

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ─────────────────────────────────────────────
   6. TYPEWRITER EFFECT (hero subtitle)
   ──────────────────────────────────────────── */

const typewriterEl = document.getElementById('typewriter');

if (typewriterEl) {
  const words       = ['Software Engineer', 'Front-End Developer', 'Problem Solver', 'MERN Stack Dev'];
  let wordIndex     = 0;
  let charIndex     = 0;
  let isDeleting    = false;

  (function typeWriter() {
    const currentWord = words[wordIndex];

    typewriterEl.textContent = isDeleting
      ? currentWord.substring(0, charIndex - 1)
      : currentWord.substring(0, charIndex + 1);

    isDeleting ? charIndex-- : charIndex++;

    let delay = isDeleting ? 60 : 100;

    if (!isDeleting && charIndex === currentWord.length) {
      delay      = 1800;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex  = (wordIndex + 1) % words.length;
      delay      = 400;
    }

    setTimeout(typeWriter, delay);
  })();
}

/* ─────────────────────────────────────────────
   7. SKILL BARS — animate widths on scroll
   ──────────────────────────────────────────── */

const skillBarObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.skill-bar-fill').forEach(bar => {
          bar.classList.add('animated');
        });
        skillBarObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 }
);

const skillsBarSection = document.querySelector('.skills-bar-section');
if (skillsBarSection) skillBarObserver.observe(skillsBarSection);

/* ─────────────────────────────────────────────
   8. CONTACT FORM VALIDATION
   ──────────────────────────────────────────── */

const contactForm    = document.getElementById('contactForm');
const formStatusMsg  = document.getElementById('formStatusMsg');
const submitBtn      = document.getElementById('contactSubmitBtn');

/** Shows an inline status message with a given colour, then clears it. */
function showFormStatus(message, color, autoClearMs = 0) {
  formStatusMsg.textContent = message;
  formStatusMsg.style.color = color;
  if (autoClearMs) {
    setTimeout(() => { formStatusMsg.textContent = ''; }, autoClearMs);
  }
}

/** Very simple email regex — matches the vast majority of valid addresses. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();   // ← always prevent default first

    const nameField    = document.getElementById('contactName');
    const emailField   = document.getElementById('contactEmail');
    const messageField = document.getElementById('contactMessage');

    const name    = nameField.value.trim();
    const email   = emailField.value.trim();
    const message = messageField.value.trim();

    // ── Validation ─────────────────────────────
    if (!name) {
      showFormStatus('⚠️  Please enter your name.', '#f87171');
      nameField.focus();
      return;
    }

    if (!email) {
      showFormStatus('⚠️  Please enter your email address.', '#f87171');
      emailField.focus();
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      showFormStatus('⚠️  Please enter a valid email address (e.g. you@domain.com).', '#f87171');
      emailField.focus();
      return;
    }

    if (!message) {
      showFormStatus('⚠️  Please write a message before sending.', '#f87171');
      messageField.focus();
      return;
    }

    // ── Simulate send ───────────────────────────
    submitBtn.disabled     = true;
    submitBtn.textContent  = 'Sending…';
    formStatusMsg.textContent = '';

    setTimeout(() => {
      // Reset form fields
      contactForm.reset();

      // Restore button HTML (icon + label)
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" aria-hidden="true">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
        Send Message`;

      // Success message — auto-clears after 5 s
      showFormStatus('✅  Message sent successfully! I\'ll get back to you soon.', '#34d399', 5000);
    }, 1200);
  });
}
