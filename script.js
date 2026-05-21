/* ═══════════════════════════════════════════════════════════
   PLAYBOOK INTERACTIONS
   Author: Al Aowshad Himel — 2026 Edition
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ───────── Reading progress bar ───────── */
  const progressBar = document.querySelector('.progress-bar');

  function updateProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = progress + '%';
  }

  /* ───────── Back to top button ───────── */
  const backToTop = document.querySelector('.back-to-top');

  function toggleBackToTop() {
    if (!backToTop) return;
    if (window.scrollY > 600) backToTop.classList.add('visible');
    else backToTop.classList.remove('visible');
  }

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ───────── Scroll listener (throttled with rAF) ───────── */
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateProgress();
        toggleBackToTop();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  updateProgress();

  /* ───────── Sticky nav active state via IntersectionObserver ───────── */
  const navChips = document.querySelectorAll('.nav-chip');
  const chapters = document.querySelectorAll('.chapter');

  if ('IntersectionObserver' in window && chapters.length) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navChips.forEach((chip) => {
            chip.classList.toggle('active', chip.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { rootMargin: '-25% 0px -60% 0px' });

    chapters.forEach((ch) => navObserver.observe(ch));
  }

  /* ───────── Reveal-on-scroll animation ───────── */
  const reveals = document.querySelectorAll('.reveal, .reveal-stagger');

  if ('IntersectionObserver' in window && reveals.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    reveals.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback — show everything
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ───────── Interactive checklists ───────── */
  const checklists = document.querySelectorAll('.checklist');

  checklists.forEach((list) => {
    const items = list.querySelectorAll('.check-item');
    const total = items.length;
    const meta = list.querySelector('.checklist-meta .count');

    function updateCount() {
      const checked = list.querySelectorAll('.check-item.is-checked').length;
      if (meta) meta.textContent = checked + ' / ' + total;
      // Celebrate when all done
      if (checked === total && total > 0 && !list.dataset.celebrated) {
        list.dataset.celebrated = '1';
        celebrate(list);
      }
      if (checked < total && list.dataset.celebrated) {
        list.dataset.celebrated = '';
      }
    }

    items.forEach((item) => {
      const box = item.querySelector('.check-box');
      const toggle = () => {
        item.classList.toggle('is-checked');
        if (box) box.classList.toggle('checked');
        updateCount();
      };
      item.addEventListener('click', (e) => {
        // Avoid double-toggle if clicking exactly on the box
        if (e.target.classList.contains('check-box')) return;
        toggle();
      });
      if (box) {
        box.setAttribute('tabindex', '0');
        box.setAttribute('role', 'checkbox');
        box.setAttribute('aria-checked', 'false');
        box.addEventListener('click', (e) => {
          e.stopPropagation();
          toggle();
          box.setAttribute('aria-checked', box.classList.contains('checked') ? 'true' : 'false');
        });
        box.addEventListener('keydown', (e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            toggle();
            box.setAttribute('aria-checked', box.classList.contains('checked') ? 'true' : 'false');
          }
        });
      }
    });

    updateCount();
  });

  /* ───────── Celebration: confetti burst ───────── */
  function celebrate(target) {
    const rect = target.getBoundingClientRect();
    const burstX = rect.left + rect.width / 2;
    const burstY = rect.top + 40;
    const colors = ['#b84000', '#1a5c3e', '#183562', '#a07800', '#1a1916'];

    for (let i = 0; i < 24; i++) {
      const c = document.createElement('span');
      c.className = 'confetti-particle';
      const size = Math.random() * 6 + 4;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const angle = (Math.PI * 2 * i) / 24 + Math.random() * 0.4;
      const distance = 80 + Math.random() * 80;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance - 40;
      const rotation = Math.random() * 720 - 360;

      Object.assign(c.style, {
        position: 'fixed',
        left: burstX + 'px',
        top: burstY + 'px',
        width: size + 'px',
        height: size + 'px',
        background: color,
        zIndex: 999,
        pointerEvents: 'none',
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        transition: 'transform 1.1s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.1s ease-out',
        transform: 'translate(-50%, -50%) scale(0)',
      });

      document.body.appendChild(c);

      requestAnimationFrame(() => {
        c.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${rotation}deg) scale(1)`;
        c.style.opacity = '0';
      });

      setTimeout(() => c.remove(), 1200);
    }
  }

  /* ───────── Copy prompt to clipboard ───────── */
  document.querySelectorAll('.prompt-copy').forEach((btn) => {
    btn.addEventListener('click', () => {
      const box = btn.closest('.prompt-box');
      if (!box) return;
      const textEl = box.querySelector('.prompt-text');
      if (!textEl) return;
      const text = textEl.textContent.trim();

      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          btn.textContent = 'Copied ✓';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
          }, 1800);
        }).catch(() => fallbackCopy(text, btn));
      } else {
        fallbackCopy(text, btn);
      }
    });
  });

  function fallbackCopy(text, btn) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      btn.textContent = 'Copied ✓';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = 'Copy';
        btn.classList.remove('copied');
      }, 1800);
    } catch (e) {
      btn.textContent = 'Failed';
    }
    document.body.removeChild(ta);
  }

  /* ───────── Smooth in-page anchor scroll with offset ───────── */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 40;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ───────── Easter egg: tap monogram 3x for a wink ───────── */
  const monogram = document.querySelector('.author-monogram');
  if (monogram) {
    let taps = 0;
    let timer = null;
    monogram.style.cursor = 'pointer';
    monogram.addEventListener('click', () => {
      taps++;
      clearTimeout(timer);
      timer = setTimeout(() => { taps = 0; }, 800);
      if (taps >= 3) {
        taps = 0;
        const original = monogram.textContent;
        monogram.textContent = '👋';
        monogram.style.background = '#b84000';
        setTimeout(() => {
          monogram.textContent = original;
          monogram.style.background = '';
        }, 1400);
      }
    });
  }

  /* ───────── Keyboard shortcut: press 'T' for top, 'M' for menu ───────── */
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 't' || e.key === 'T') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (e.key === 'm' || e.key === 'M') {
      const nav = document.querySelector('.sticky-nav');
      if (nav) nav.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

})();
