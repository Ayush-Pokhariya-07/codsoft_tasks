// ═══════════════════════════════════════════
//  script.js — Portfolio Interactive Features
// ═══════════════════════════════════════════

console.log('Loaded');

// ─── Navbar: scroll-shadow & active link ───
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('main section[id]');

window.addEventListener('scroll', () => {
  // Scrolled class for shadow
  navbar.classList.toggle('scrolled', window.scrollY > 20);

  // Active nav link highlighting
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 90;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
});

// ─── Hamburger Menu ─────────────────────────
const hamburgerBtn = document.getElementById('hamburgerBtn');
const navLinksContainer = document.getElementById('navLinks');

hamburgerBtn.addEventListener('click', () => {
  const isOpen = navLinksContainer.classList.toggle('open');
  hamburgerBtn.classList.toggle('open', isOpen);
  hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
});

// Close mobile menu when a link is clicked
navLinksContainer.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinksContainer.classList.remove('open');
    hamburgerBtn.classList.remove('open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
  });
});

// ─── Typewriter Effect ──────────────────────
const typewriterEl = document.getElementById('typewriter');
const words = ['Software Engineer', 'Front-End Developer', 'Problem Solver', 'MERN Stack Dev'];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeWriter() {
  const currentWord = words[wordIndex];

  if (isDeleting) {
    typewriterEl.textContent = currentWord.substring(0, charIndex - 1);
    charIndex--;
  } else {
    typewriterEl.textContent = currentWord.substring(0, charIndex + 1);
    charIndex++;
  }

  let delay = isDeleting ? 60 : 100;

  if (!isDeleting && charIndex === currentWord.length) {
    delay = 1800;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    wordIndex = (wordIndex + 1) % words.length;
    delay = 400;
  }

  setTimeout(typeWriter, delay);
}

typeWriter();

// ─── Scroll-Reveal Observer ─────────────────
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

// Add reveal class to elements we want to animate on scroll
const revealTargets = [
  '.about-grid',
  '.skills-category',
  '.skills-bar-section',
  '.project-card',
  '.resume-card',
  '.contact-info-card',
  '.contact-form',
  '.stat-card',
];

revealTargets.forEach(selector => {
  document.querySelectorAll(selector).forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${i * 0.08}s`;
    revealObserver.observe(el);
  });
});

// ─── Skill Bars Animation ───────────────────
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

// ─── Contact Form ───────────────────────────
const contactForm = document.getElementById('contactForm');
const formStatusMsg = document.getElementById('formStatusMsg');
const submitBtn = document.getElementById('contactSubmitBtn');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const message = document.getElementById('contactMessage').value.trim();

    if (!name || !email || !message) {
      formStatusMsg.textContent = '⚠️ Please fill in all fields.';
      formStatusMsg.style.color = '#f87171';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      formStatusMsg.textContent = '⚠️ Please enter a valid email address.';
      formStatusMsg.style.color = '#f87171';
      return;
    }

    // Simulate send
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    formStatusMsg.textContent = '';

    setTimeout(() => {
      formStatusMsg.textContent = '✅ Message sent! I\'ll get back to you soon.';
      formStatusMsg.style.color = '#34d399';
      contactForm.reset();
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
        Send Message`;
    }, 1200);
  });
}
