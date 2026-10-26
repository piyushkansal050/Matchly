/**
 * Matchly - Core Universal JavaScript Utilities
 * Group 13 - Frontend Engineering
 */

(function () {
  'use strict';

  // 1. Toast Notification System
  function initToastContainer() {
    if (document.getElementById('matchly-toast-container')) return;

    const container = document.createElement('div');
    container.id = 'matchly-toast-container';
    container.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
      max-width: 380px;
      width: calc(100% - 48px);
    `;
    document.body.appendChild(container);
  }

  function showToast(message, type = 'info', duration = 3500) {
    initToastContainer();
    const container = document.getElementById('matchly-toast-container');

    const toast = document.createElement('div');
    toast.className = `matchly-toast matchly-toast--${type}`;

    let icon = 'ℹ️';
    let borderColor = '#e91e63';
    let bgColor = '#ffffff';

    if (type === 'success') {
      icon = '💖';
      borderColor = '#e91e63';
    } else if (type === 'warning') {
      icon = '⚠️';
      borderColor = '#ffc107';
    } else if (type === 'error') {
      icon = '❌';
      borderColor = '#f44336';
    }

    toast.style.cssText = `
      background: ${bgColor};
      color: #333333;
      padding: 12px 18px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.06);
      border-left: 5px solid ${borderColor};
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 0.95rem;
      font-family: 'Inter', sans-serif;
      pointer-events: auto;
      transform: translateY(20px);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    toast.innerHTML = `
      <span style="font-size: 1.25rem;">${icon}</span>
      <div style="flex: 1; line-height: 1.4;">${message}</div>
      <button style="background: transparent; border: none; font-size: 1.1rem; color: #999; cursor: pointer; padding: 0 4px;" aria-label="Close">&times;</button>
    `;

    const closeBtn = toast.querySelector('button');
    closeBtn.addEventListener('click', () => removeToast(toast));

    container.appendChild(toast);

    // Trigger enter animation
    requestAnimationFrame(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    });

    const timer = setTimeout(() => {
      removeToast(toast);
    }, duration);

    function removeToast(el) {
      clearTimeout(timer);
      el.style.transform = 'translateY(20px)';
      el.style.opacity = '0';
      setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 300);
    }
  }

  // 2. Universal Theme Management
  function getSavedTheme() {
    try {
      return localStorage.getItem('matchly_theme') || 'light';
    } catch (e) {
      return 'light';
    }
  }

  function updateThemeButtonLabels(theme) {
    const toggleBtns = document.querySelectorAll('#theme-toggle-btn, .theme-toggle-inline');
    toggleBtns.forEach(btn => {
      btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    });
  }

  function applyTheme(theme, notify = false) {
    const isDark = theme === 'dark';
    if (document.body) {
      if (isDark) {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    }
    document.documentElement.setAttribute('data-theme', theme);

    try {
      localStorage.setItem('matchly_theme', theme);
    } catch (e) {}

    updateThemeButtonLabels(theme);

    if (notify && window.Matchly && window.Matchly.showToast) {
      window.Matchly.showToast(
        `Switched to ${isDark ? 'Romantic Night' : 'Radiant Sunset'} theme ✨`,
        'info',
        2000
      );
    }
  }

  function toggleTheme() {
    const current = getSavedTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next, true);
  }

  // Pre-apply theme as early as possible
  try {
    const initialTheme = getSavedTheme();
    document.documentElement.setAttribute('data-theme', initialTheme);
    if (document.body && initialTheme === 'dark') {
      document.body.classList.add('dark-theme');
    }
  } catch (e) {}

  // 3. Standardize Navbar and Brand Logo (Topbar removed as requested)
  function standardizeNavbarAndBrand() {
    const currentTheme = getSavedTheme();

    // 3a. Remove any top announcement bar if present in DOM
    document.querySelectorAll('.react-topbar').forEach(el => el.remove());

    // 3b. Ensure theme toggle exists inside navbar actions
    const navbarActions = document.querySelectorAll('.navbar__actions');
    navbarActions.forEach(actions => {
      if (!actions.querySelector('#theme-toggle-btn, .theme-toggle-inline')) {
        const themeBtn = document.createElement('button');
        themeBtn.id = 'theme-toggle-btn';
        themeBtn.className = 'theme-toggle-inline';
        themeBtn.setAttribute('title', 'Toggle Theme');
        themeBtn.setAttribute('aria-label', 'Toggle Theme');
        themeBtn.innerHTML = currentTheme === 'dark' ? '☀️' : '🌙';
        actions.prepend(themeBtn);
      }
    });

    // 3c. Standardize Navbar Brand Logo (Strict 0 Gap)
    const brandLinks = document.querySelectorAll('.navbar__brand, .footer .navbar__brand');
    brandLinks.forEach(brand => {
      brand.innerHTML = '<span class="navbar__brand-icon">💖</span><span class="navbar__brand-text">Match<span>ly</span></span>';
      brand.style.gap = '0';
    });

    // 3d. Standardize 'Matches' nav item to 'Find Matches'
    const matchesLink = document.querySelector('.nav-item-matches .navbar__link');
    if (matchesLink && matchesLink.textContent.trim() === 'Matches') {
      matchesLink.textContent = 'Find Matches';
    }

    // 3e. Add notification dot to Messages link if missing
    const messagesLink = document.querySelector('.nav-item-messages .navbar__link');
    if (messagesLink && !messagesLink.querySelector('.nav-msg-dot')) {
      const dot = document.createElement('span');
      dot.className = 'nav-msg-dot';
      messagesLink.style.position = 'relative';
      messagesLink.appendChild(dot);
    }

    // 3f. Standardize Auth page brands if present
    const authBrandLink = document.querySelector('.auth-brand a');
    if (authBrandLink) {
      authBrandLink.innerHTML = '<span class="navbar__brand-icon">💖</span><span class="navbar__brand-text">Match<span>ly</span></span>';
      authBrandLink.style.display = 'inline-flex';
      authBrandLink.style.alignItems = 'center';
      authBrandLink.style.gap = '0';
      authBrandLink.style.textDecoration = 'none';
      authBrandLink.style.color = 'var(--text-main)';
    }

    // Bind theme button click handlers
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('#theme-toggle-btn, .theme-toggle-inline');
      if (btn) {
        e.preventDefault();
        toggleTheme();
      }
    });

    updateThemeButtonLabels(currentTheme);
  }

  // 4. Active Link Highlighter
  function highlightActiveNav() {
    const currentPath = window.location.pathname.split('/').pop() || 'homepage.html';
    const navLinks = document.querySelectorAll('.navbar__menu .navbar__link');

    navLinks.forEach(link => {
      const linkPath = link.getAttribute('href');
      if (linkPath === currentPath) {
        link.classList.add('navbar__link--active');
      }
    });
  }

  // 5. Mobile Menu Auto-close on link click or outside tap
  function initMobileMenuEnhancements() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const menu = document.querySelector('.navbar__menu');
    const toggleBtn = document.querySelector('.navbar__toggle');

    if (toggleBtn && !toggle) {
      toggleBtn.addEventListener('click', (e) => {
        if (menu) {
          menu.classList.toggle('mobile-menu-active');
        }
      });
    }

    // Close when clicking nav links
    const navLinks = document.querySelectorAll('.navbar__menu a, .navbar__actions a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (toggle && toggle.checked) {
          toggle.checked = false;
        }
        if (menu) {
          menu.classList.remove('mobile-menu-active');
        }
      });
    });

    // Close when tapping outside the navbar on mobile
    document.addEventListener('click', (e) => {
      if (toggle && toggle.checked && !e.target.closest('.navbar, .react-navbar')) {
        toggle.checked = false;
      }
      if (menu && menu.classList.contains('mobile-menu-active') && !e.target.closest('.navbar, .react-navbar')) {
        menu.classList.remove('mobile-menu-active');
      }
    });
  }

  // Expose global helpers
  window.Matchly = window.Matchly || {};
  window.Matchly.showToast = showToast;
  window.Matchly.applyTheme = applyTheme;
  window.Matchly.toggleTheme = toggleTheme;

  // Profile URL & Navigation Helpers
  // Uses hash '#id=X' instead of query '?id=X' to prevent ERR_FILE_NOT_FOUND
  // in Chromium/Windows when viewing via file:/// protocol, while maintaining 100% full compatibility on http(s)://.
  function getProfileUrl(profileId) {
    if (!profileId) return 'profile.html';
    // If numeric or alphanumeric identifier
    if (/^\d+$/.test(String(profileId).trim())) {
      return 'profile.html#id=' + encodeURIComponent(String(profileId).trim());
    }
    return 'profile.html#name=' + encodeURIComponent(String(profileId).trim());
  }

  function navigateToProfile(profileId, e) {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }

    const currentUser = (window.Matchly && window.Matchly.Auth && typeof window.Matchly.Auth.getUser === 'function')
      ? window.Matchly.Auth.getUser()
      : (function () {
          try {
            const stored = localStorage.getItem('matchly_current_user');
            return stored ? JSON.parse(stored) : null;
          } catch (err) { return null; }
        })();

    const targetUrl = getProfileUrl(profileId);

    // Guard: Profiles must ONLY open when user is logged in or signed up
    if (!currentUser) {
      if (window.Matchly && typeof window.Matchly.openAuthModal === 'function') {
        window.Matchly.openAuthModal(targetUrl, 'login', '🔒 Please log in or sign up to view member profiles.');
        return;
      }
      try {
        sessionStorage.setItem('matchly_redirect_after_auth', targetUrl);
        if (profileId) {
          sessionStorage.setItem('matchly_last_viewed_profile', String(profileId));
        }
      } catch (err) {}
      window.location.href = 'login.html';
      return;
    }

    if (profileId) {
      try {
        sessionStorage.setItem('matchly_last_viewed_profile', String(profileId));
        localStorage.setItem('matchly_last_viewed_profile', String(profileId));
      } catch (err) {}
    }

    const targetHash = targetUrl.includes('#') ? targetUrl.substring(targetUrl.indexOf('#')) : '';

    // If already on profile.html, switch hash directly and trigger instant re-render
    const isProfilePage = window.location.pathname.toLowerCase().endsWith('profile.html') ||
                          window.location.href.toLowerCase().includes('profile.html');
    if (isProfilePage) {
      if (window.location.search) {
        try {
          window.history.replaceState(null, '', 'profile.html' + targetHash);
        } catch (err) {}
      }
      if (targetHash) {
        window.location.hash = targetHash;
      }
      if (window.Matchly && typeof window.Matchly.initProfilePage === 'function') {
        window.Matchly.initProfilePage();
      }
    } else {
      window.location.href = targetUrl;
    }
  }

  // Universal Navigation Interceptor:
  // If user clicks on "Find Matches" or any profile link without being logged in/signed up,
  // the login & signup pop-up or page should open!
  function initAuthGuards() {
    document.addEventListener('click', function (e) {
      const link = e.target.closest('a, button');
      if (!link) return;

      // Don't intercept if already on login or register or forgot password
      const currentPath = window.location.pathname.toLowerCase();
      if (currentPath.includes('login.html') || currentPath.includes('register.html') || currentPath.includes('forgot-password.html')) {
        return;
      }

      const href = link.getAttribute('href') || '';
      const text = (link.textContent || '').trim().toLowerCase();

      const currentUser = (window.Matchly && window.Matchly.Auth && typeof window.Matchly.Auth.getUser === 'function')
        ? window.Matchly.Auth.getUser()
        : (function () {
            try {
              const stored = localStorage.getItem('matchly_current_user');
              return stored ? JSON.parse(stored) : null;
            } catch { return null; }
          })();

      // If user is already authenticated, allow normal navigation
      if (currentUser) return;

      // Check if clicking "Find Matches" (navbar, hero button, footer, or any link to search.html)
      const isFindMatches = href === 'search.html' || 
                            href.includes('search.html') || 
                            link.closest('.nav-item-matches') ||
                            text === 'find matches' ||
                            text.includes('find matches') ||
                            text.includes('explore all 50+ matches');

      if (isFindMatches) {
        e.preventDefault();
        e.stopPropagation();
        if (window.Matchly && typeof window.Matchly.openAuthModal === 'function') {
          window.Matchly.openAuthModal('search.html', 'login', '💖 Please log in or sign up to find matches and explore verified members.');
          return;
        }
        try {
          sessionStorage.setItem('matchly_redirect_after_auth', 'search.html');
        } catch (err) {}
        window.location.href = 'login.html';
        return;
      }

      // Check if clicking on a Profile link or button
      const isProfile = href.includes('profile.html') || 
                        link.classList.contains('match-btn-view-profile') ||
                        link.classList.contains('back-nav-link');

      if (isProfile) {
        // If clicking back to find matches, route to login if unauthenticated
        if (text.includes('find matches')) {
          e.preventDefault();
          e.stopPropagation();
          if (window.Matchly && typeof window.Matchly.openAuthModal === 'function') {
            window.Matchly.openAuthModal('search.html', 'login', '💖 Please log in or sign up to find matches.');
            return;
          }
          try { sessionStorage.setItem('matchly_redirect_after_auth', 'search.html'); } catch (err) {}
          window.location.href = 'login.html';
          return;
        }

        e.preventDefault();
        e.stopPropagation();
        const target = href || 'profile.html';
        if (window.Matchly && typeof window.Matchly.openAuthModal === 'function') {
          window.Matchly.openAuthModal(target, 'login', '🔒 Please log in or sign up to view member profiles.');
          return;
        }
        try {
          sessionStorage.setItem('matchly_redirect_after_auth', target);
        } catch (err) {}
        window.location.href = 'login.html';
        return;
      }
    }, true);
  }

  window.Matchly.getProfileUrl = getProfileUrl;
  window.Matchly.navigateToProfile = navigateToProfile;

  function initMain() {
    applyTheme(getSavedTheme());
    standardizeNavbarAndBrand();
    highlightActiveNav();
    initMobileMenuEnhancements();
    initAuthGuards();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMain);
  } else {
    initMain();
  }
})();
