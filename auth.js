/**
 * Matchly - Authentication & Session Management
 * Group 13 - Frontend Engineering
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'matchly_current_user';
  const REGISTERED_USERS_KEY = 'matchly_registered_users';

  // High-quality avatars automatically assigned based on gender
  const MALE_AVATAR = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80';
  const FEMALE_AVATAR = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80';

  /**
   * Password Complexity Validator
   * Requirements:
   * 1. At least 8 characters long
   * 2. At least one lowercase letter (a-z)
   * 3. At least one uppercase letter (A-Z)
   * 4. At least one special character (!@#$%^&*...)
   */
  function validatePassword(password) {
    const pass = typeof password === 'string' ? password : '';
    const minLength = pass.length >= 8;
    const hasLower = /[a-z]/.test(pass);
    const hasUpper = /[A-Z]/.test(pass);
    // Non-alphanumeric and non-whitespace character
    const hasSpecial = /[^A-Za-z0-9\s]/.test(pass);

    const isValid = minLength && hasLower && hasUpper && hasSpecial;

    const missingRules = [];
    if (!minLength) missingRules.push('at least 8 characters long');
    if (!hasLower) missingRules.push('at least 1 lowercase letter (a-z)');
    if (!hasUpper) missingRules.push('at least 1 uppercase letter (A-Z)');
    if (!hasSpecial) missingRules.push('at least 1 special character (e.g. !@#$%^&*)');

    let score = 0;
    if (minLength) score++;
    if (hasLower) score++;
    if (hasUpper) score++;
    if (hasSpecial) score++;

    let strengthLabel = 'Very Weak';
    let strengthColor = '#ef4444';
    let badgeClass = 'badge-weak';
    if (score === 1) {
      strengthLabel = 'Weak';
      strengthColor = '#f87171';
      badgeClass = 'badge-weak';
    } else if (score === 2) {
      strengthLabel = 'Fair';
      strengthColor = '#fb923c';
      badgeClass = 'badge-fair';
    } else if (score === 3) {
      strengthLabel = 'Good';
      strengthColor = '#facc15';
      badgeClass = 'badge-good';
    } else if (score === 4) {
      strengthLabel = 'Strong & Secure';
      strengthColor = '#10b981';
      badgeClass = 'badge-strong';
    }

    let errorMessage = '';
    if (!isValid) {
      errorMessage = `Password must have ${missingRules.join(', ')}.`;
    }

    return {
      isValid,
      score,
      strengthLabel,
      strengthColor,
      badgeClass,
      minLength,
      hasLower,
      hasUpper,
      hasSpecial,
      missingRules,
      errorMessage
    };
  }

  // Default verified demo users so login works immediately
  const DEFAULT_REGISTERED_USERS = [
    {
      id: 'M104523',
      name: 'Rakshit Verma',
      email: 'rakshit@example.com',
      gender: 'male',
      password: 'Password@2026',
      avatar: MALE_AVATAR,
      memberSince: '2026',
      status: 'verified',
      subscription: 'Basic'
    },
    {
      id: 'M104524',
      name: 'Priya Sharma',
      email: 'priya@example.com',
      gender: 'female',
      password: 'Password@2026',
      avatar: FEMALE_AVATAR,
      memberSince: '2026',
      status: 'verified',
      subscription: 'Basic'
    }
  ];

  // Get registered users from localStorage
  function getRegisteredUsers() {
    try {
      const stored = localStorage.getItem(REGISTERED_USERS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(DEFAULT_REGISTERED_USERS));
      return DEFAULT_REGISTERED_USERS;
    } catch (e) {
      console.error('Error reading registered users:', e);
      return DEFAULT_REGISTERED_USERS;
    }
  }

  // Save registered users to localStorage
  function saveRegisteredUsers(users) {
    try {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Error saving registered users:', e);
    }
  }

  // Get current logged-in user session
  function getCurrentUser() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error('Error reading auth state:', e);
      return null;
    }
  }

  // Set logged-in user
  function setCurrentUser(user) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      syncNavbarAuthState();
    } catch (e) {
      console.error('Error saving auth state:', e);
    }
  }

  // Get post-authentication redirect destination
  function getPostAuthRedirect() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect') || sessionStorage.getItem('matchly_redirect_after_auth');
      const plan = urlParams.get('plan') || sessionStorage.getItem('matchly_pending_upgrade_plan');
      sessionStorage.removeItem('matchly_redirect_after_auth');
      if (redirect) {
        if (plan && !redirect.includes('plan=')) {
          const sep = redirect.includes('?') ? '&' : '?';
          return `${redirect}${sep}plan=${encodeURIComponent(plan)}`;
        }
        return redirect;
      }
      if (urlParams.get('reset') === 'success') {
        return 'search.html';
      }
    } catch (e) {}
    return 'search.html';
  }

  // Preserve query parameters when switching between login and register
  function preserveAuthParams() {
    try {
      const search = window.location.search;
      if (!search) return;
      const links = document.querySelectorAll('.auth-footer a, .auth-brand a, .auth-tabs a');
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && (href.includes('login.html') || href.includes('register.html')) && !href.includes('?')) {
          link.setAttribute('href', `${href}${search}`);
        }
      });
    } catch (e) {}
  }

  // Log out user
  function logoutUser() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('matchly_subscription_plan');
    syncNavbarAuthState();
    if (window.Matchly && window.Matchly.showToast) {
      window.Matchly.showToast('You have been logged out successfully.', 'info');
    }
    // If on protected page, redirect to home
    if (window.location.pathname.includes('messages.html') || window.location.pathname.includes('search.html')) {
      setTimeout(() => {
        window.location.href = 'homepage.html';
      }, 800);
    } else {
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  }

  // Show inline error message in form
  function showInlineError(form, message) {
    removeInlineError(form);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'matchly-inline-error';
    errorDiv.style.cssText = `
      background: #ffebee;
      color: #c62828;
      border: 1px solid #ef9a9a;
      padding: 10px 14px;
      border-radius: 8px;
      margin-bottom: 1.2rem;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 10px;
      animation: fadeIn 0.3s ease;
    `;
    errorDiv.innerHTML = `
      <span style="font-size: 1.1rem;">⚠️</span>
      <span style="flex: 1;">${message}</span>
    `;

    const firstChild = form.querySelector('.form-group') || form.firstChild;
    form.insertBefore(errorDiv, firstChild);
  }

  // Remove inline error message in form
  function removeInlineError(form) {
    const existing = form.querySelector('.matchly-inline-error');
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }
  }

  // Sync body and navbar classes with auth state
  function syncNavbarAuthState() {
    const user = getCurrentUser();
    const body = document.body;

    if (user) {
      body.classList.remove('logged-out');
      body.classList.add('logged-in');

      // Update logged-in actions in navbar
      const loggedInContainers = document.querySelectorAll('.nav-actions-logged-in');
      loggedInContainers.forEach(container => {
        const avatarUrl = user.avatar || (user.gender === 'male' ? MALE_AVATAR : FEMALE_AVATAR);
        container.innerHTML = `
          <a href="profile.html#view=me" class="navbar__user-pill" title="View My Profile" style="text-decoration: none; cursor: pointer;">
            <img src="${avatarUrl}" alt="${user.name || 'Member'}" class="user-avatar-mini" />
            <div class="user-info-text">
              <span class="user-name-span">${user.name || 'Member'}</span>
              <span class="user-status-span">✓ View Profile</span>
            </div>
          </a>
          <button class="btn btn--outline btn-matchly-logout" style="padding: 0.35rem 0.8rem; font-size: 0.82rem; border-radius: 8px;">Log Out</button>
        `;
      });
    } else {
      body.classList.remove('logged-in');
      body.classList.add('logged-out');
    }

    // Find Matches nav item: ALWAYS visible so any user can click it
    // If not logged in, clicking it opens the Login / Sign Up page (guarded globally)
    const matchesNavItems = document.querySelectorAll('.nav-item-matches');
    matchesNavItems.forEach(el => {
      el.style.display = '';
    });

    // Messages nav item: strictly visible only when user has signed up or logged in
    const messagesNavItems = document.querySelectorAll('.nav-item-messages');
    messagesNavItems.forEach(el => {
      el.style.display = user ? '' : 'none';
    });

    // Attach click events to logout buttons
    const logoutButtons = document.querySelectorAll('.btn-matchly-logout, .nav-actions-logged-in a[href="homepage.html"]');
    logoutButtons.forEach(btn => {
      btn.onclick = function (e) {
        e.preventDefault();
        logoutUser();
      };
    });
  }

  // Handle Login Page Form
  function initLoginForm() {
    const loginForm = document.getElementById('login-form') || document.querySelector('.auth-form');
    // Ensure this is the login form (has email and password, but no fullname or gender inputs)
    if (!loginForm) return;
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const fullnameInput = document.getElementById('fullname');
    const genderInput = document.getElementById('gender');
    if (!emailInput || !passwordInput || fullnameInput || genderInput) return;

    // Check for password reset completion query parameters
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('reset') === 'success') {
        const resetEmail = urlParams.get('email');
        if (emailInput && resetEmail) {
          emailInput.value = decodeURIComponent(resetEmail).trim();
        }
        if (passwordInput) {
          passwordInput.focus();
        }
        if (window.Matchly && window.Matchly.showToast) {
          window.Matchly.showToast('Password reset successful! Please log in with your new password. 💕', 'success', 5000);
        }
      }
    } catch (e) {}

    // Quick Demo Autofill helper
    const demoBtn = document.getElementById('btn-fill-demo');
    if (demoBtn && emailInput && passwordInput) {
      demoBtn.addEventListener('click', function () {
        emailInput.value = 'rakshit@example.com';
        passwordInput.value = 'Password@2026';
        if (window.Matchly && window.Matchly.showToast) {
          window.Matchly.showToast('Demo credentials autofilled! Click Log In to continue. 💕', 'info', 2500);
        }
      });
    }

    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      removeInlineError(loginForm);

      const emailVal = emailInput.value.trim().toLowerCase();
      const passwordVal = passwordInput.value.trim();

      if (!emailVal || !passwordVal) {
        showInlineError(loginForm, 'Please fill in both email and password.');
        if (window.Matchly) window.Matchly.showToast('Please fill in all fields', 'warning');
        return;
      }

      const submitBtn = loginForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Checking credentials...';
      }

      setTimeout(() => {
        const registeredUsers = getRegisteredUsers();

        // Check if user exists in registered database by email or ID
        const matchedUser = registeredUsers.find(u => 
          (u.email && u.email.toLowerCase().trim() === emailVal) ||
          (u.id && String(u.id).toLowerCase().trim() === emailVal)
        );

        // If user is NOT found, reject login with clear message
        if (!matchedUser) {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = 'Log In';
          }
          showInlineError(loginForm, 'User not found. Please sign up first.');
          if (window.Matchly) {
            window.Matchly.showToast('User not found. Please sign up first.', 'error', 4500);
          }
          return;
        }

        // User exists, now check password
        const userPass = (matchedUser.password || '').trim();
        if (userPass && userPass !== passwordVal) {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = 'Log In';
          }
          showInlineError(loginForm, 'Incorrect password. Please try again.');
          if (window.Matchly) {
            window.Matchly.showToast('Incorrect password. Please check your password and try again.', 'error', 4000);
          }
          return;
        }

        // Login successful
        if (submitBtn) submitBtn.innerText = 'Logging in...';
        setCurrentUser(matchedUser);

        // Sync user subscription
        if (matchedUser.subscription) {
          localStorage.setItem('matchly_subscription_plan', matchedUser.subscription);
        } else {
          localStorage.setItem('matchly_subscription_plan', 'Basic');
        }

        if (window.Matchly) {
          window.Matchly.showToast(`Welcome back, ${matchedUser.name}! 💕`, 'success');
        }

        const targetUrl = getPostAuthRedirect();
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 500);
      }, 400);
    });
  }

  // Handle Registration Page Form
  function initRegisterForm() {
    const registerForm = document.getElementById('register-form') || document.querySelector('.auth-form');
    if (!registerForm) return;
    const fullnameInput = document.getElementById('fullname');
    // Guard: Only run if this is the registration form
    if (!fullnameInput) return;

    const genderInput = document.getElementById('gender');
    const passwordInput = document.getElementById('password');
    const emailInput = document.getElementById('email');

    // 1. Live avatar preview when gender changes
    if (genderInput) {
      genderInput.addEventListener('change', function () {
        const selectedGender = this.value.toLowerCase();
        let previewContainer = document.getElementById('gender-avatar-preview');

        if (!previewContainer) {
          previewContainer = document.createElement('div');
          previewContainer.id = 'gender-avatar-preview';
          previewContainer.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
            margin-top: 8px;
            padding: 8px 12px;
            background: var(--bg-surface);
            border-radius: 8px;
            border: 1px dashed var(--border-color);
            transition: all 0.25s ease;
          `;
          genderInput.parentNode.appendChild(previewContainer);
        }

        if (selectedGender === 'male') {
          previewContainer.style.display = 'flex';
          previewContainer.innerHTML = `
            <img src="${MALE_AVATAR}" alt="Male Profile" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-color);">
            <div>
              <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-dark);">Male Profile Photo Assigned</div>
              <div style="font-size: 0.75rem; color: var(--text-light);">Automatically set for your account</div>
            </div>
          `;
        } else if (selectedGender === 'female') {
          previewContainer.style.display = 'flex';
          previewContainer.innerHTML = `
            <img src="${FEMALE_AVATAR}" alt="Female Profile" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-color);">
            <div>
              <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-dark);">Female Profile Photo Assigned</div>
              <div style="font-size: 0.75rem; color: var(--text-light);">Automatically set for your account</div>
            </div>
          `;
        } else {
          previewContainer.style.display = 'none';
        }
      });
    }

    // 2. Password Visibility Toggle
    const togglePassBtn = document.getElementById('btn-toggle-password');
    const eyeIcon = document.getElementById('eye-icon');
    if (togglePassBtn && passwordInput) {
      togglePassBtn.addEventListener('click', function () {
        const isPassword = passwordInput.getAttribute('type') === 'password';
        passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
        if (eyeIcon) {
          eyeIcon.textContent = isPassword ? '🙈' : '👁️';
        }
        togglePassBtn.setAttribute('title', isPassword ? 'Hide password' : 'Show password');
      });
    }

    // 3. Real-time Password Requirements Checklist & Strength Meter
    if (passwordInput) {
      const ruleLengthEl = document.getElementById('rule-length');
      const ruleLowerEl = document.getElementById('rule-lowercase');
      const ruleUpperEl = document.getElementById('rule-uppercase');
      const ruleSpecialEl = document.getElementById('rule-special');
      const meterFill = document.getElementById('password-meter-fill');
      const meterText = document.getElementById('password-meter-text');
      const meterScore = document.getElementById('password-meter-score');
      const badgeEl = document.getElementById('password-strength-badge');

      function updateItem(el, passed) {
        if (!el) return;
        const iconSpan = el.querySelector('.rule-icon');
        if (passed) {
          el.classList.add('valid');
          el.classList.remove('invalid');
          if (iconSpan) iconSpan.textContent = '✓';
        } else {
          el.classList.remove('valid');
          el.classList.remove('invalid');
          if (iconSpan) iconSpan.textContent = '○';
        }
      }

      function updateCriteriaUI() {
        const val = passwordInput.value;
        const res = validatePassword(val);

        updateItem(ruleLengthEl, res.minLength);
        updateItem(ruleLowerEl, res.hasLower);
        updateItem(ruleUpperEl, res.hasUpper);
        updateItem(ruleSpecialEl, res.hasSpecial);

        if (!val) {
          if (meterFill) {
            meterFill.style.width = '0%';
            meterFill.style.backgroundColor = '#ef4444';
          }
          if (meterText) {
            meterText.textContent = 'Strength: Needs requirements';
            meterText.style.color = '';
          }
          if (meterScore) meterScore.textContent = '0 / 4 met';
          if (badgeEl) {
            badgeEl.className = 'password-badge';
            badgeEl.textContent = 'Required';
          }
          passwordInput.style.borderColor = '';
          passwordInput.style.boxShadow = '';
          return;
        }

        const percentage = (res.score / 4) * 100;
        if (meterFill) {
          meterFill.style.width = `${percentage}%`;
          meterFill.style.backgroundColor = res.strengthColor;
        }
        if (meterText) {
          meterText.textContent = `Strength: ${res.strengthLabel}`;
          meterText.style.color = res.strengthColor;
        }
        if (meterScore) {
          meterScore.textContent = `${res.score} / 4 met`;
        }
        if (badgeEl) {
          badgeEl.className = `password-badge ${res.badgeClass}`;
          badgeEl.textContent = res.isValid ? 'Strong ✓' : res.strengthLabel;
        }

        if (res.isValid) {
          passwordInput.style.borderColor = '#10b981';
          passwordInput.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.18)';
        } else {
          passwordInput.style.borderColor = res.score >= 2 ? '#fb923c' : '#ef4444';
          passwordInput.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.15)';
        }
      }

      passwordInput.addEventListener('input', updateCriteriaUI);
      passwordInput.addEventListener('focus', updateCriteriaUI);
    }

    // 4. Form Submit Validation
    registerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      removeInlineError(registerForm);

      const fullname = fullnameInput ? fullnameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
      const gender = genderInput ? genderInput.value.toLowerCase() : '';
      const password = passwordInput ? passwordInput.value.trim() : '';

      if (!fullname || !email || !gender || !password) {
        showInlineError(registerForm, 'Please complete all required fields.');
        if (window.Matchly) window.Matchly.showToast('Please fill in all fields including gender.', 'warning');
        return;
      }

      // Check Password Conditions: 8 chars, 1 lowercase, 1 uppercase, 1 special char
      const passValidation = validatePassword(password);
      if (!passValidation.isValid) {
        // Highlight failed items
        const ruleLengthEl = document.getElementById('rule-length');
        const ruleLowerEl = document.getElementById('rule-lowercase');
        const ruleUpperEl = document.getElementById('rule-uppercase');
        const ruleSpecialEl = document.getElementById('rule-special');

        if (!passValidation.minLength && ruleLengthEl) ruleLengthEl.classList.add('invalid');
        if (!passValidation.hasLower && ruleLowerEl) ruleLowerEl.classList.add('invalid');
        if (!passValidation.hasUpper && ruleUpperEl) ruleUpperEl.classList.add('invalid');
        if (!passValidation.hasSpecial && ruleSpecialEl) ruleSpecialEl.classList.add('invalid');

        showInlineError(registerForm, `Strong password required: ${passValidation.errorMessage}`);
        if (window.Matchly) {
          window.Matchly.showToast(`Password condition not met: ${passValidation.errorMessage}`, 'error', 5500);
        }
        if (passwordInput) {
          passwordInput.style.borderColor = '#ef4444';
          passwordInput.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.25)';
          passwordInput.focus();
        }
        return; // Password will not work unless all conditions are met!
      }

      // Check if user is already registered
      const registeredUsers = getRegisteredUsers();
      const existingUser = registeredUsers.find(u => u.email && u.email.toLowerCase() === email);

      if (existingUser) {
        showInlineError(registerForm, 'An account with this email already exists. Please log in.');
        if (window.Matchly) {
          window.Matchly.showToast('Account already exists! Please log in instead.', 'warning', 4500);
        }
        return;
      }

      const submitBtn = registerForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Creating Profile...';
      }

      setTimeout(() => {
        // Automatically assign male or female profile photo
        const assignedAvatar = (gender === 'male') ? MALE_AVATAR : FEMALE_AVATAR;

        const newUser = {
          id: 'M' + Math.floor(100000 + Math.random() * 900000),
          name: fullname,
          email: email,
          gender: gender,
          password: password,
          avatar: assignedAvatar,
          memberSince: '2026',
          status: 'verified',
          subscription: 'Basic'
        };

        // Save into registered users database
        registeredUsers.push(newUser);
        saveRegisteredUsers(registeredUsers);

        // Set as active session
        setCurrentUser(newUser);
        localStorage.setItem('matchly_subscription_plan', 'Basic');

        if (window.Matchly) {
          window.Matchly.showToast(`Account created! Welcome to Matchly, ${fullname}! 🎉`, 'success', 4000);
        }

        const targetUrl = getPostAuthRedirect();
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 800);
      }, 600);
    });
  }

  // Temporary storage key for OTPs
  const RESET_CODES_KEY = 'matchly_reset_codes';

  // Generate 6-digit OTP code for a user
  function generateResetCode(emailOrId) {
    if (!emailOrId) return { success: false, message: 'Please enter your email or Matchly ID.' };
    const query = emailOrId.trim().toLowerCase();
    const users = getRegisteredUsers();
    const user = users.find(u => 
      (u.email && u.email.toLowerCase() === query) ||
      (u.id && u.id.toLowerCase() === query)
    );

    if (!user) {
      return { success: false, message: 'No registered account found with this email or Matchly ID.' };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      const tokens = JSON.parse(sessionStorage.getItem(RESET_CODES_KEY) || '{}');
      tokens[user.email.toLowerCase()] = {
        code: code,
        userId: user.id,
        timestamp: Date.now()
      };
      sessionStorage.setItem(RESET_CODES_KEY, JSON.stringify(tokens));
    } catch (e) {}

    return {
      success: true,
      code: code,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    };
  }

  // Verify code
  function verifyResetCode(emailOrId, inputCode) {
    if (!emailOrId || !inputCode) return { success: false, message: 'Please provide both email and code.' };
    const query = emailOrId.trim().toLowerCase();
    const cleanCode = inputCode.trim();

    try {
      const tokens = JSON.parse(sessionStorage.getItem(RESET_CODES_KEY) || '{}');
      let entry = tokens[query];
      if (!entry) {
        for (const k in tokens) {
          if (tokens[k].userId && tokens[k].userId.toLowerCase() === query) {
            entry = tokens[k];
            break;
          }
        }
      }

      if (entry && entry.code === cleanCode) {
        return { success: true };
      }
    } catch (e) {}

    return { success: false, message: 'Invalid verification code. Please check and try again.' };
  }

  // Reset password
  function resetPassword(emailOrId, newPassword) {
    if (!emailOrId || !newPassword) {
      return { success: false, message: 'Missing email or new password.' };
    }

    const query = emailOrId.trim().toLowerCase();
    const users = getRegisteredUsers();
    const userIndex = users.findIndex(u =>
      (u.email && u.email.toLowerCase() === query) ||
      (u.id && u.id.toLowerCase() === query)
    );

    if (userIndex === -1) {
      return { success: false, message: 'No registered account found with this email or ID.' };
    }

    const passCheck = validatePassword(newPassword);
    if (!passCheck.isValid) {
      return { success: false, message: passCheck.errorMessage };
    }

    users[userIndex].password = newPassword.trim();
    saveRegisteredUsers(users);

    // If current session is this user, update active session
    const current = getCurrentUser();
    if (current && (
      (current.email && current.email.toLowerCase() === query) ||
      (current.id && current.id.toLowerCase() === query)
    )) {
      current.password = newPassword.trim();
      setCurrentUser(current);
    }

    // Clean up reset code token
    try {
      const tokens = JSON.parse(sessionStorage.getItem(RESET_CODES_KEY) || '{}');
      delete tokens[users[userIndex].email.toLowerCase()];
      sessionStorage.setItem(RESET_CODES_KEY, JSON.stringify(tokens));
    } catch (e) {}

    return {
      success: true,
      message: 'Password updated successfully.',
      user: users[userIndex]
    };
  }

  // Expose auth API globally
  window.Matchly = window.Matchly || {};
  window.Matchly.Auth = {
    getUser: getCurrentUser,
    setUser: setCurrentUser,
    logout: logoutUser,
    sync: syncNavbarAuthState,
    getRegisteredUsers: getRegisteredUsers,
    saveRegisteredUsers: saveRegisteredUsers,
    validatePassword: validatePassword,
    generateResetCode: generateResetCode,
    verifyResetCode: verifyResetCode,
    resetPassword: resetPassword,
    avatars: {
      male: MALE_AVATAR,
      female: FEMALE_AVATAR
    }
  };

  // Check and display the banner when user was redirected because authentication is required
  function checkAuthRequiredBanner() {
    const banner = document.getElementById('auth-required-banner');
    if (!banner) return;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect') || sessionStorage.getItem('matchly_redirect_after_auth');
      if (redirect) {
        banner.style.display = 'flex';
        const titleEl = document.getElementById('auth-banner-title');
        const descEl = document.getElementById('auth-banner-desc');
        if (redirect.toLowerCase().includes('profile')) {
          if (titleEl) titleEl.textContent = '🔒 Profile Access Protected';
          if (descEl) descEl.textContent = 'Profiles are only accessible after you log in or sign up. Log in or create an account below to view this member profile.';
        } else if (redirect.toLowerCase().includes('search')) {
          if (titleEl) titleEl.textContent = '💖 Find Matches Protected';
          if (descEl) descEl.textContent = 'Find Matches is only available to registered members. Log in or sign up below to browse all verified matches.';
        }
      }
    } catch (e) {}
  }

  function initAuth() {
    syncNavbarAuthState();
    preserveAuthParams();
    checkAuthRequiredBanner();
    initLoginForm();
    initRegisterForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
  } else {
    initAuth();
  }
})();
