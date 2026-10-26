/**
 * Matchly - Subscription Management & In-Modal Authentication
 * Group 13 - Frontend Engineering
 */

(function () {
  'use strict';

  // Plan Details Configuration
  const PLAN_DETAILS = {
    Basic: {
      name: 'Basic',
      price: 'Free',
      period: '',
      badge: 'Starter',
      features: [
        'Create a profile',
        'Browse members',
        'Send up to 5 messages per day',
        'Basic search filters'
      ]
    },
    Premium: {
      name: 'Premium',
      price: '$9.99',
      period: '/mo',
      badge: 'Most Popular',
      features: [
        'Everything in Basic',
        'Unlimited messaging',
        'See who liked your profile',
        'Advanced search filters',
        'Ad-free experience'
      ]
    },
    VIP: {
      name: 'VIP',
      price: '$19.99',
      period: '/mo',
      badge: 'VIP Elite',
      features: [
        'Everything in Premium',
        'Priority profile placement',
        'Read receipts for messages',
        'Dedicated matchmaker support'
      ]
    }
  };

  const MALE_AVATAR = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80';
  const FEMALE_AVATAR = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80';

  function getCurrentUser() {
    try {
      if (window.Matchly && window.Matchly.Auth && typeof window.Matchly.Auth.getUser === 'function') {
        const u = window.Matchly.Auth.getUser();
        if (u) return u;
      }
      const raw = localStorage.getItem('matchly_current_user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function getCurrentTier(user) {
    if (!user) return null;
    return user.subscription || localStorage.getItem('matchly_subscription_plan') || 'Basic';
  }

  function getRegisteredUsers() {
    try {
      if (window.Matchly && window.Matchly.Auth && typeof window.Matchly.Auth.getRegisteredUsers === 'function') {
        return window.Matchly.Auth.getRegisteredUsers();
      }
      const stored = localStorage.getItem('matchly_registered_users');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  function saveRegisteredUsers(users) {
    try {
      if (window.Matchly && window.Matchly.Auth && typeof window.Matchly.Auth.saveRegisteredUsers === 'function') {
        window.Matchly.Auth.saveRegisteredUsers(users);
        return;
      }
      localStorage.setItem('matchly_registered_users', JSON.stringify(users));
    } catch (e) {}
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

  function validatePasswordLocal(password) {
    if (window.Matchly && window.Matchly.Auth && typeof window.Matchly.Auth.validatePassword === 'function') {
      return window.Matchly.Auth.validatePassword(password);
    }
    const minLength = typeof password === 'string' && password.length >= 8;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const isValid = minLength && hasLower && hasUpper && hasSpecial;
    const missingRules = [];
    if (!minLength) missingRules.push('at least 8 characters');
    if (!hasUpper) missingRules.push('one uppercase letter (A-Z)');
    if (!hasLower) missingRules.push('one lowercase letter (a-z)');
    if (!hasSpecial) missingRules.push('one special character (!@#$%^&*)');
    return {
      isValid,
      minLength,
      hasLower,
      hasUpper,
      hasSpecial,
      errorMessage: isValid ? '' : `Password must have ${missingRules.join(', ')}.`
    };
  }

  document.addEventListener('DOMContentLoaded', () => {
    const pricingCards = document.querySelectorAll('.pricing-card');
    if (!pricingCards || pricingCards.length === 0) return;

    function refreshPageUI() {
      const activeUser = getCurrentUser();
      const activeTier = getCurrentTier(activeUser);
      renderAuthStatusBar(activeUser, activeTier);
      setupPricingCards(activeUser, activeTier);
      if (window.Matchly && window.Matchly.Auth && typeof window.Matchly.Auth.sync === 'function') {
        window.Matchly.Auth.sync();
      }
    }

    refreshPageUI();
    handleAutoResumeUpgrade();

    function renderAuthStatusBar(currentUser, activeTier) {
      let statusContainer = document.getElementById('subscription-auth-status');
      if (!statusContainer) {
        statusContainer = document.createElement('div');
        statusContainer.id = 'subscription-auth-status';
        statusContainer.className = 'subscription-auth-status-container';
        const pricingGrid = document.querySelector('.pricing-grid');
        if (pricingGrid && pricingGrid.parentNode) {
          pricingGrid.parentNode.insertBefore(statusContainer, pricingGrid);
        }
      }

      if (currentUser) {
        const avatarUrl = currentUser.avatar || MALE_AVATAR;
        statusContainer.innerHTML = `
          <div class="sub-auth-status-bar sub-auth-status-bar--logged-in">
            <div class="sub-user-profile">
              <div class="sub-user-avatar" style="background-image: url('${avatarUrl}');"></div>
              <div>
                <div class="sub-user-name">Signed in as <strong>${escapeHtml(currentUser.name || 'Member')}</strong></div>
                <div class="sub-user-info">${escapeHtml(currentUser.email || 'Verified Account')} • Member since ${escapeHtml(currentUser.memberSince || '2026')}</div>
              </div>
            </div>
            <div class="sub-tier-badge">
              <span>✨</span> Active Plan: <strong>${escapeHtml(activeTier || 'Basic')}</strong>
            </div>
          </div>
        `;
      } else {
        statusContainer.innerHTML = `
          <div class="sub-auth-status-bar sub-auth-status-bar--guest">
            <div class="sub-guest-content">
              <div class="sub-guest-icon">🔒</div>
              <div class="sub-guest-text">
                <strong>Login Required to Upgrade:</strong> You can view all our membership plans below, but upgrading to <strong>Premium</strong> or <strong>VIP</strong> requires logging in.
              </div>
            </div>
            <div class="sub-guest-actions">
              <button id="bar-login-btn" class="btn btn--outline" style="padding: 0.5rem 1.1rem; font-size: 0.88rem; border-radius: 10px;">Log In</button>
              <button id="bar-signup-btn" class="btn btn--primary" style="padding: 0.5rem 1.1rem; font-size: 0.88rem; border-radius: 10px;">Sign Up</button>
            </div>
          </div>
        `;

        const barLoginBtn = statusContainer.querySelector('#bar-login-btn');
        const barSignupBtn = statusContainer.querySelector('#bar-signup-btn');
        if (barLoginBtn) {
          barLoginBtn.addEventListener('click', () => showSubscriptionAuthModal('Premium', 'login'));
        }
        if (barSignupBtn) {
          barSignupBtn.addEventListener('click', () => showSubscriptionAuthModal('Premium', 'signup'));
        }
      }
    }

    function setupPricingCards(currentUser, activeTier) {
      pricingCards.forEach(card => {
        const titleEl = card.querySelector('h3');
        const planName = (card.getAttribute('data-plan') || (titleEl ? titleEl.textContent : '')).trim();
        const button = card.querySelector('button');

        if (!button) return;

        button.setAttribute('data-plan', planName);

        // Replace button to cleanly reset event listeners
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        if (currentUser) {
          // USER IS LOGGED IN
          if (planName === activeTier) {
            newButton.innerText = 'Active Plan ✓';
            newButton.disabled = true;
            newButton.style.opacity = '0.75';
            newButton.style.cursor = 'default';
          } else if (planName === 'Basic' && (activeTier === 'Premium' || activeTier === 'VIP')) {
            newButton.innerText = 'Included Free';
            newButton.disabled = true;
            newButton.style.opacity = '0.5';
            newButton.style.cursor = 'default';
          } else if (planName === 'Premium' && activeTier === 'VIP') {
            newButton.innerText = 'Included in VIP';
            newButton.disabled = true;
            newButton.style.opacity = '0.5';
            newButton.style.cursor = 'default';
          } else {
            // Upgrade is available for logged-in user
            newButton.innerText = planName === 'VIP' ? 'Upgrade to VIP' : 'Upgrade to Premium';
            newButton.disabled = false;
            newButton.style.opacity = '1';
            newButton.style.cursor = 'pointer';

            newButton.addEventListener('click', (e) => {
              e.preventDefault();
              showCheckoutModal(planName);
            });
          }
        } else {
          // USER IS NOT LOGGED IN - REQUIRE IN-MODAL AUTHENTICATION
          if (planName === 'Basic') {
            newButton.innerText = 'Get Started Free';
            newButton.disabled = false;
            newButton.style.opacity = '1';
            newButton.style.cursor = 'pointer';

            newButton.addEventListener('click', (e) => {
              e.preventDefault();
              showSubscriptionAuthModal('Basic', 'signup');
            });
          } else {
            // Paid plans: Premium or VIP
            newButton.innerText = (planName === 'VIP' ? 'Get VIP' : 'Upgrade to Premium') + ' 🔒';
            newButton.disabled = false;
            newButton.style.opacity = '1';
            newButton.style.cursor = 'pointer';

            newButton.addEventListener('click', (e) => {
              e.preventDefault();
              // Open modal with login/signup authentication directly inside!
              showSubscriptionAuthModal(planName, 'login');
            });
          }
        }
      });
    }

    /**
     * MAIN IN-MODAL AUTHENTICATION & UPGRADE SYSTEM
     * Authenticates login and signup right inside the subscription modal.
     */
    function showSubscriptionAuthModal(planName, initialTab = 'login') {
      const activeUser = getCurrentUser();
      if (activeUser) {
        showCheckoutModal(planName);
        return;
      }

      // Remove existing modal if any
      const existing = document.querySelector('.matchly-modal-overlay');
      if (existing) existing.remove();

      const details = PLAN_DETAILS[planName] || { name: planName, price: '$9.99', period: '/mo' };

      const overlay = document.createElement('div');
      overlay.className = 'matchly-modal-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');

      const card = document.createElement('div');
      card.className = 'matchly-modal-card';
      overlay.appendChild(card);
      document.body.appendChild(overlay);

      function closeModal() {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        document.removeEventListener('keydown', handleEsc);
      }

      function handleEsc(e) {
        if (e.key === 'Escape') closeModal();
      }

      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
      });
      document.addEventListener('keydown', handleEsc);

      renderAuthStep(initialTab);

      function renderAuthStep(activeTab) {
        card.innerHTML = `
          <button class="matchly-modal-close" aria-label="Close modal">&times;</button>
          
          <div class="matchly-modal-badge">
            <span>🔒</span>
          </div>

          <h3>Authenticate to Upgrade</h3>
          <p class="matchly-modal-desc" style="margin-bottom: 0.8rem;">
            Please log in or create an account to upgrade to <strong>${escapeHtml(planName)} Plan</strong> (${details.price}${details.period}).
          </p>

          <!-- Plan preview pill -->
          <div style="display: inline-flex; align-items: center; gap: 8px; background: var(--bg-soft); border: 1px solid var(--border-color); padding: 5px 14px; border-radius: 20px; font-size: 0.85rem; margin-bottom: 0.8rem;">
            <span>💎</span> Selected: <strong style="color: var(--primary-color);">${escapeHtml(planName)} Membership</strong> (${details.price}${details.period})
          </div>

          <!-- Segmented Tab Switcher -->
          <div class="auth-modal-tabs">
            <button type="button" class="auth-modal-tab ${activeTab === 'login' ? 'active' : ''}" data-tab="login">
              🔑 Log In
            </button>
            <button type="button" class="auth-modal-tab ${activeTab === 'signup' ? 'active' : ''}" data-tab="signup">
              ✨ Create Account
            </button>
          </div>

          <!-- Error Alert Container -->
          <div id="modal-auth-error-box" class="auth-modal-error" style="display: none; margin-bottom: 12px;"></div>

          <!-- TAB 1: LOGIN FORM -->
          <form id="modal-login-form" class="auth-modal-form" style="display: ${activeTab === 'login' ? 'flex' : 'none'};">
            <div class="form-group">
              <label for="modal-login-email">Email Address or Member ID</label>
              <input type="text" id="modal-login-email" placeholder="e.g. rakshit@example.com" required autocomplete="username" />
            </div>

            <div class="form-group">
              <label for="modal-login-password">Password</label>
              <input type="password" id="modal-login-password" placeholder="Enter your password" required autocomplete="current-password" />
            </div>

            <!-- Demo Hint -->
            <div class="auth-modal-hint" style="background: var(--bg-soft); padding: 8px 12px; border-radius: 8px; border: 1px dashed var(--border-color);">
              💡 <strong>Demo Login:</strong> <code>rakshit@example.com</code> / <code>Password@2026</code>
            </div>

            <button type="submit" id="btn-modal-submit-login" class="btn btn--primary w-100" style="padding: 0.85rem; font-size: 1rem; border-radius: 12px; margin-top: 6px;">
              Log In & Upgrade to ${escapeHtml(planName)} →
            </button>

            <div class="auth-switch-link">
              New to Matchly? <a id="link-switch-to-signup">Create a free account here</a>
            </div>
          </form>

          <!-- TAB 2: SIGN UP FORM -->
          <form id="modal-signup-form" class="auth-modal-form" style="display: ${activeTab === 'signup' ? 'flex' : 'none'};">
            <div class="form-group">
              <label for="modal-signup-name">Full Name</label>
              <input type="text" id="modal-signup-name" placeholder="e.g. Priya Sharma" required />
            </div>

            <div class="form-group">
              <label for="modal-signup-email">Email Address</label>
              <input type="email" id="modal-signup-email" placeholder="name@example.com" required />
            </div>

            <div class="form-group">
              <label for="modal-signup-gender">Gender</label>
              <select id="modal-signup-gender" required>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div class="form-group">
              <label for="modal-signup-password">Password</label>
              <input type="password" id="modal-signup-password" placeholder="Min. 8 chars, 1 uppercase, 1 special" required />
            </div>

            <!-- Password Requirements Checklist -->
            <div id="modal-password-criteria" class="auth-modal-criteria" style="display: none;"></div>

            <button type="submit" id="btn-modal-submit-signup" class="btn btn--primary w-100" style="padding: 0.85rem; font-size: 1rem; border-radius: 12px; margin-top: 6px;">
              Create Account & Upgrade to ${escapeHtml(planName)} →
            </button>

            <div class="auth-switch-link">
              Already have an account? <a id="link-switch-to-login">Log in here</a>
            </div>
          </form>

          <button id="modal-guest-close-btn" class="matchly-modal-secondary-link" style="margin-top: 14px;">
            Continue Browsing as Guest
          </button>
        `;

        // Wire Close Buttons
        card.querySelector('.matchly-modal-close').addEventListener('click', closeModal);
        card.querySelector('#modal-guest-close-btn').addEventListener('click', closeModal);

        // Tab Switching
        const tabBtns = card.querySelectorAll('.auth-modal-tab');
        const loginForm = card.querySelector('#modal-login-form');
        const signupForm = card.querySelector('#modal-signup-form');
        const errorBox = card.querySelector('#modal-auth-error-box');

        function showTab(tabKey) {
          errorBox.style.display = 'none';
          tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabKey);
          });
          if (tabKey === 'login') {
            loginForm.style.display = 'flex';
            signupForm.style.display = 'none';
            const emailInput = loginForm.querySelector('#modal-login-email');
            if (emailInput) emailInput.focus();
          } else {
            loginForm.style.display = 'none';
            signupForm.style.display = 'flex';
            const nameInput = signupForm.querySelector('#modal-signup-name');
            if (nameInput) nameInput.focus();
          }
        }

        tabBtns.forEach(btn => {
          btn.addEventListener('click', () => {
            showTab(btn.getAttribute('data-tab'));
          });
        });

        card.querySelector('#link-switch-to-signup').addEventListener('click', (e) => {
          e.preventDefault();
          showTab('signup');
        });

        card.querySelector('#link-switch-to-login').addEventListener('click', (e) => {
          e.preventDefault();
          showTab('login');
        });

        function showFormError(msg) {
          errorBox.style.display = 'flex';
          errorBox.innerHTML = `<span>⚠️</span><span style="flex: 1;">${msg}</span>`;
        }

        function clearFormError() {
          errorBox.style.display = 'none';
          errorBox.innerHTML = '';
        }

        // Live Password Checklist for Modal Signup
        const signupPassInput = card.querySelector('#modal-signup-password');
        const criteriaBox = card.querySelector('#modal-password-criteria');
        if (signupPassInput && criteriaBox) {
          signupPassInput.addEventListener('input', () => {
            const val = signupPassInput.value;
            if (!val) {
              criteriaBox.style.display = 'none';
              return;
            }
            criteriaBox.style.display = 'flex';
            const res = validatePasswordLocal(val);

            function ruleItem(label, passed) {
              const color = passed ? '#2e7d32' : '#c62828';
              const icon = passed ? '✓' : '○';
              return `
                <div style="color: ${color}; font-weight: ${passed ? '600' : 'normal'}; display: flex; align-items: center; gap: 6px;">
                  <span style="font-weight: bold; width: 12px;">${icon}</span>
                  <span>${label}</span>
                </div>
              `;
            }

            criteriaBox.innerHTML = `
              <div style="font-weight: 600; color: #555; margin-bottom: 2px;">Password requirements:</div>
              ${ruleItem('At least 8 characters', res.minLength)}
              ${ruleItem('One uppercase letter (A-Z)', res.hasUpper)}
              ${ruleItem('One lowercase letter (a-z)', res.hasLower)}
              ${ruleItem('One special character (!@#$%^&*)', res.hasSpecial)}
            `;
          });
        }

        // SUBMIT LOGIN IN MODAL
        loginForm.addEventListener('submit', (e) => {
          e.preventDefault();
          clearFormError();

          const emailVal = loginForm.querySelector('#modal-login-email').value.trim().toLowerCase();
          const passVal = loginForm.querySelector('#modal-login-password').value.trim();

          if (!emailVal || !passVal) {
            showFormError('Please enter both email/ID and password.');
            return;
          }

          const submitBtn = loginForm.querySelector('#btn-modal-submit-login');
          submitBtn.disabled = true;
          submitBtn.innerText = 'Verifying credentials...';

          setTimeout(() => {
            const users = getRegisteredUsers();
            const matchedUser = users.find(u =>
              (u.email && u.email.toLowerCase() === emailVal) ||
              (u.id && u.id.toLowerCase() === emailVal)
            );

            if (!matchedUser) {
              submitBtn.disabled = false;
              submitBtn.innerText = `Log In & Upgrade to ${planName} →`;
              showFormError('User not found. Please check your credentials or switch to Sign Up.');
              return;
            }

            if (matchedUser.password !== passVal) {
              submitBtn.disabled = false;
              submitBtn.innerText = `Log In & Upgrade to ${planName} →`;
              showFormError('Incorrect password. Please try again.');
              return;
            }

            // SUCCESSFUL AUTHENTICATION!
            submitBtn.innerText = 'Authenticated! Proceeding...';

            // Set logged in session
            localStorage.setItem('matchly_current_user', JSON.stringify(matchedUser));
            if (matchedUser.subscription) {
              localStorage.setItem('matchly_subscription_plan', matchedUser.subscription);
            }
            if (window.Matchly && window.Matchly.Auth && typeof window.Matchly.Auth.setUser === 'function') {
              window.Matchly.Auth.setUser(matchedUser);
            }

            refreshPageUI();

            if (window.Matchly && window.Matchly.showToast) {
              window.Matchly.showToast(`Welcome back, ${matchedUser.name}! 💕 Ready to complete your upgrade.`, 'success', 3500);
            }

            // Seamlessly transition right to Checkout Confirmation step
            renderCheckoutStep(matchedUser);
          }, 400);
        });

        // SUBMIT SIGN UP IN MODAL
        signupForm.addEventListener('submit', (e) => {
          e.preventDefault();
          clearFormError();

          const nameVal = signupForm.querySelector('#modal-signup-name').value.trim();
          const emailVal = signupForm.querySelector('#modal-signup-email').value.trim().toLowerCase();
          const genderVal = signupForm.querySelector('#modal-signup-gender').value.toLowerCase();
          const passVal = signupForm.querySelector('#modal-signup-password').value.trim();

          if (!nameVal || !emailVal || !genderVal || !passVal) {
            showFormError('Please fill in all required fields.');
            return;
          }

          const passValidation = validatePasswordLocal(passVal);
          if (!passValidation.isValid) {
            showFormError(passValidation.errorMessage || 'Password does not meet required criteria.');
            return;
          }

          const users = getRegisteredUsers();
          const existingUser = users.find(u => u.email && u.email.toLowerCase() === emailVal);
          if (existingUser) {
            showFormError('An account with this email already exists. Please switch to Log In.');
            return;
          }

          const submitBtn = signupForm.querySelector('#btn-modal-submit-signup');
          submitBtn.disabled = true;
          submitBtn.innerText = 'Creating account...';

          setTimeout(() => {
            const assignedAvatar = (genderVal === 'male') ? MALE_AVATAR : FEMALE_AVATAR;
            const newUser = {
              id: 'M' + Math.floor(100000 + Math.random() * 900000),
              name: nameVal,
              email: emailVal,
              gender: genderVal,
              password: passVal,
              avatar: assignedAvatar,
              memberSince: '2026',
              status: 'verified',
              subscription: 'Basic'
            };

            users.push(newUser);
            saveRegisteredUsers(users);

            // Set active session
            localStorage.setItem('matchly_current_user', JSON.stringify(newUser));
            localStorage.setItem('matchly_subscription_plan', 'Basic');
            if (window.Matchly && window.Matchly.Auth && typeof window.Matchly.Auth.setUser === 'function') {
              window.Matchly.Auth.setUser(newUser);
            }

            refreshPageUI();

            if (window.Matchly && window.Matchly.showToast) {
              window.Matchly.showToast(`Account created! Welcome, ${nameVal}! 🎉 Ready to activate upgrade.`, 'success', 3500);
            }

            // Seamlessly transition right to Checkout Confirmation step
            renderCheckoutStep(newUser);
          }, 500);
        });
      }

      // STEP 2: CHECKOUT CONFIRMATION (Rendered directly inside the modal once authenticated)
      function renderCheckoutStep(user) {
        if (planName === 'Basic') {
          closeModal();
          return;
        }

        const avatarUrl = user.avatar || MALE_AVATAR;

        card.innerHTML = `
          <button class="matchly-modal-close" aria-label="Close modal">&times;</button>
          
          <div class="matchly-modal-badge" style="background: linear-gradient(135deg, rgba(233, 30, 99, 0.2) 0%, rgba(255, 193, 7, 0.2) 100%);">
            <span>💎</span>
          </div>

          <h3>Confirm Upgrade to ${escapeHtml(planName)}</h3>
          <p class="matchly-modal-desc" style="margin-bottom: 1.2rem;">
            You are authenticated! Confirm below to activate your premium matchmaking membership.
          </p>

          <div class="matchly-plan-summary-box">
            <div class="matchly-plan-summary-row">
              <span style="color: var(--text-muted);">Account:</span>
              <div style="display: flex; align-items: center; gap: 8px;">
                <img src="${avatarUrl}" alt="Avatar" style="width: 22px; height: 22px; border-radius: 50%; object-fit: cover;" />
                <strong>${escapeHtml(user.name || 'Member')}</strong>
              </div>
            </div>
            <div class="matchly-plan-summary-row">
              <span style="color: var(--text-muted);">Email:</span>
              <span>${escapeHtml(user.email || 'Verified Account')}</span>
            </div>
            <div class="matchly-plan-summary-row">
              <span style="color: var(--text-muted);">Selected Tier:</span>
              <strong style="color: var(--primary-color);">${escapeHtml(planName)} Membership</strong>
            </div>
            <div class="matchly-plan-summary-row">
              <span style="color: var(--text-muted);">Pricing:</span>
              <strong>${details.price}<span>${details.period}</span></strong>
            </div>
            <div class="matchly-plan-summary-row">
              <span style="color: var(--text-muted);">Activation:</span>
              <span style="color: #4caf50; font-weight: 700;">✓ Instant Activation</span>
            </div>
          </div>

          <div class="matchly-modal-actions" style="flex-direction: row; gap: 10px;">
            <button id="modal-checkout-cancel-btn" class="btn btn--outline" style="flex: 1;">Cancel</button>
            <button id="modal-checkout-confirm-btn" class="btn btn--primary" style="flex: 1.6;">Confirm & Activate</button>
          </div>
        `;

        card.querySelector('.matchly-modal-close').addEventListener('click', closeModal);
        card.querySelector('#modal-checkout-cancel-btn').addEventListener('click', closeModal);

        const confirmBtn = card.querySelector('#modal-checkout-confirm-btn');
        confirmBtn.addEventListener('click', () => {
          confirmBtn.disabled = true;
          confirmBtn.innerText = 'Activating...';

          setTimeout(() => {
            // 1. Save subscription globally
            localStorage.setItem('matchly_subscription_plan', planName);

            // 2. Attach to active user
            user.subscription = planName;
            localStorage.setItem('matchly_current_user', JSON.stringify(user));

            // 3. Update registered users database
            try {
              const users = getRegisteredUsers();
              const idx = users.findIndex(u =>
                (u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase()) ||
                (u.id && user.id && u.id === user.id)
              );
              if (idx !== -1) {
                users[idx].subscription = planName;
                saveRegisteredUsers(users);
              }
            } catch (err) {
              console.error('Error updating registered user tier:', err);
            }

            closeModal();

            if (window.Matchly && window.Matchly.showToast) {
              window.Matchly.showToast(`Congratulations, ${user.name}! You are now upgraded to ${planName} Plan! 🎉`, 'success', 5000);
            }

            refreshPageUI();
          }, 800);
        });
      }
    }

    // Modal when an already authenticated user upgrades
    function showCheckoutModal(planName) {
      const activeUser = getCurrentUser();
      if (!activeUser) {
        showSubscriptionAuthModal(planName, 'login');
        return;
      }

      const existing = document.querySelector('.matchly-modal-overlay');
      if (existing) existing.remove();

      const details = PLAN_DETAILS[planName] || { name: planName, price: '$9.99', period: '/mo' };

      const overlay = document.createElement('div');
      overlay.className = 'matchly-modal-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');

      const avatarUrl = activeUser.avatar || MALE_AVATAR;

      overlay.innerHTML = `
        <div class="matchly-modal-card">
          <button class="matchly-modal-close" aria-label="Close modal">&times;</button>
          
          <div class="matchly-modal-badge" style="background: linear-gradient(135deg, rgba(233, 30, 99, 0.2) 0%, rgba(255, 193, 7, 0.2) 100%);">
            <span>💎</span>
          </div>

          <h3>Confirm Upgrade to ${escapeHtml(planName)}</h3>
          <p class="matchly-modal-desc">
            Activate premium features, unlimited conversations, and priority matching for your account.
          </p>

          <div class="matchly-plan-summary-box">
            <div class="matchly-plan-summary-row">
              <span style="color: var(--text-muted);">Account:</span>
              <div style="display: flex; align-items: center; gap: 8px;">
                <img src="${avatarUrl}" alt="Avatar" style="width: 22px; height: 22px; border-radius: 50%; object-fit: cover;" />
                <strong>${escapeHtml(activeUser.name || 'Member')}</strong>
              </div>
            </div>
            <div class="matchly-plan-summary-row">
              <span style="color: var(--text-muted);">Email:</span>
              <span>${escapeHtml(activeUser.email || 'Verified Account')}</span>
            </div>
            <div class="matchly-plan-summary-row">
              <span style="color: var(--text-muted);">Selected Tier:</span>
              <strong style="color: var(--primary-color);">${escapeHtml(planName)} Membership</strong>
            </div>
            <div class="matchly-plan-summary-row">
              <span style="color: var(--text-muted);">Price:</span>
              <strong>${details.price}<span>${details.period}</span></strong>
            </div>
            <div class="matchly-plan-summary-row">
              <span style="color: var(--text-muted);">Instant Activation:</span>
              <span style="color: #4caf50; font-weight: 700;">✓ Guaranteed</span>
            </div>
          </div>

          <div class="matchly-modal-actions" style="flex-direction: row; gap: 10px;">
            <button id="modal-cancel-btn" class="btn btn--outline" style="flex: 1;">Cancel</button>
            <button id="modal-confirm-btn" class="btn btn--primary" style="flex: 1.6;">Confirm & Activate</button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      function closeModal() {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        document.removeEventListener('keydown', handleEsc);
      }

      function handleEsc(e) {
        if (e.key === 'Escape') closeModal();
      }

      overlay.querySelector('.matchly-modal-close').addEventListener('click', closeModal);
      overlay.querySelector('#modal-cancel-btn').addEventListener('click', closeModal);
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
      });
      document.addEventListener('keydown', handleEsc);

      const confirmBtn = overlay.querySelector('#modal-confirm-btn');
      confirmBtn.addEventListener('click', () => {
        confirmBtn.disabled = true;
        confirmBtn.innerText = 'Activating...';

        setTimeout(() => {
          localStorage.setItem('matchly_subscription_plan', planName);
          activeUser.subscription = planName;
          localStorage.setItem('matchly_current_user', JSON.stringify(activeUser));

          try {
            const users = getRegisteredUsers();
            const idx = users.findIndex(u =>
              (u.email && activeUser.email && u.email.toLowerCase() === activeUser.email.toLowerCase()) ||
              (u.id && activeUser.id && u.id === activeUser.id)
            );
            if (idx !== -1) {
              users[idx].subscription = planName;
              saveRegisteredUsers(users);
            }
          } catch (e) {
            console.error('Error updating registered user tier:', e);
          }

          closeModal();

          if (window.Matchly && window.Matchly.showToast) {
            window.Matchly.showToast(`Congratulations, ${activeUser.name || 'Member'}! You are now subscribed to ${planName} Plan! 🎉`, 'success', 5000);
          }

          refreshPageUI();
        }, 800);
      });
    }

    // Auto-resume pending upgrade if redirected with plan parameter
    function handleAutoResumeUpgrade() {
      const activeUser = getCurrentUser();
      const currentTier = getCurrentTier(activeUser);
      const urlParams = new URLSearchParams(window.location.search);
      const pendingPlan = urlParams.get('plan') || sessionStorage.getItem('matchly_pending_upgrade_plan');

      if (pendingPlan && (pendingPlan === 'Premium' || pendingPlan === 'VIP')) {
        try {
          sessionStorage.removeItem('matchly_pending_upgrade_plan');
        } catch (e) {}

        if (urlParams.get('plan')) {
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }

        if (!activeUser) {
          setTimeout(() => {
            showSubscriptionAuthModal(pendingPlan, 'login');
          }, 300);
        } else if (pendingPlan !== currentTier) {
          setTimeout(() => {
            showCheckoutModal(pendingPlan);
          }, 300);
        }
      }
    }
  });
})();
