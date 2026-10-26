/**
 * Matchly - Complete Profile Search, Filtering & Interactions
 * Group 13 - Frontend Engineering
 * Fully optimized for any device browser with authoritative 60 verified profiles.
 */

(function () {
  'use strict';

  function initSearchPage() {
    const searchLayout = document.querySelector('.search-layout');
    if (!searchLayout) return;

    // 1. Get current user session
    const getCurrentUser = () => {
      if (window.Matchly && window.Matchly.Auth && typeof window.Matchly.Auth.getUser === 'function') {
        return window.Matchly.Auth.getUser();
      }
      try {
        const stored = localStorage.getItem('matchly_current_user');
        return stored ? JSON.parse(stored) : null;
      } catch { return null; }
    };

    const currentUser = getCurrentUser();
    if (!currentUser) {
      try {
        sessionStorage.setItem('matchly_redirect_after_auth', 'search.html');
      } catch (e) {}
      window.location.replace('login.html');
      return;
    }

    const genderSelect = document.getElementById('filter-gender-select');
    const minAgeInput = document.getElementById('filter-min-age');
    const maxAgeInput = document.getElementById('filter-max-age');
    const religionSelect = document.getElementById('filter-religion-select');
    const locationInput = document.getElementById('filter-location-input');
    const applyBtn = document.getElementById('btn-apply-filters');
    const resetBtnSidebar = document.getElementById('btn-reset-filters-sidebar');
    const sortSelect = document.querySelector('.sort-select');
    const headerTitle = document.querySelector('.results__header h2');
    const profilesGrid = document.querySelector('.profiles-grid');

    if (!profilesGrid) return;

    // Enhance Sort options if not already enriched
    if (sortSelect && sortSelect.options.length <= 2) {
      sortSelect.innerHTML = `
        <option value="newest">Featured & Relevant</option>
        <option value="compat_desc">Highest Compatibility</option>
        <option value="age_asc">Age: Low to High</option>
        <option value="age_desc">Age: High to Low</option>
        <option value="name_asc">Name: A to Z</option>
      `;
    }

    // Authoritative profile list from window.Matchly.profiles
    const sourceProfiles = (window.Matchly && Array.isArray(window.Matchly.profiles) && window.Matchly.profiles.length > 0)
      ? window.Matchly.profiles
      : null;

    // Function to render an optimized, high-fidelity facecard
    function createFacecardElement(p) {
      const card = document.createElement('div');
      card.className = 'profile-card facecard';
      card.dataset.id = p.id;
      card.dataset.gender = (p.gender || 'female').toLowerCase();
      card.dataset.religion = (p.religion || 'hindu').toLowerCase();
      card.dataset.city = p.location || 'India';
      card.dataset.age = p.age || 25;
      card.style.cursor = 'pointer';

      const profileUrl = (window.Matchly && window.Matchly.getProfileUrl)
        ? window.Matchly.getProfileUrl(p.id)
        : `profile.html#id=${p.id}`;

      function goToProfile(e) {
        if (window.Matchly && window.Matchly.navigateToProfile) {
          window.Matchly.navigateToProfile(p.id, e);
        } else {
          if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
          try {
            sessionStorage.setItem('matchly_last_viewed_profile', String(p.id));
            localStorage.setItem('matchly_last_viewed_profile', String(p.id));
          } catch (err) {}
          window.location.href = profileUrl;
        }
      }

      // Clicking anywhere on the card opens the candidate's profile!
      card.addEventListener('click', (e) => {
        if (e.target.closest('button, a, input, select')) return;
        goToProfile(e);
      });

      // Check stored interaction states
      let isInterestSent = false;
      let isShortlisted = false;
      try {
        const interests = JSON.parse(localStorage.getItem('matchly_interests') || '{}');
        const favorites = JSON.parse(localStorage.getItem('matchly_favorites') || '{}');
        isInterestSent = !!interests[p.id];
        isShortlisted = !!favorites[p.id];
      } catch (e) {}

      const religionCap = (p.religion || 'Hindu').charAt(0).toUpperCase() + (p.religion || 'Hindu').slice(1);
      const communityText = p.community ? `${religionCap} • ${p.community}` : religionCap;
      const tags = (p.tags && Array.isArray(p.tags)) ? p.tags.slice(0, 3) : ['Verified', 'Match'];

      card.innerHTML = `
        <div class="profile-card__img" style="background-image: url('${p.image}')" title="Click to view ${p.name}'s profile" role="button" tabindex="0">
          <div class="facecard__badge-compat">🔥 ${p.compatibility || '95%'} Match</div>
          ${p.isOnline ? '<div class="facecard__badge-online"><span class="online-pulse"></span><span>Online</span></div>' : ''}
          <div class="facecard__badge-community">${communityText}</div>
        </div>
        <div class="profile-card__body">
          <div class="profile-card__header">
            <h3 class="profile-name">
              <a href="${profileUrl}" class="profile-name-link" title="View profile of ${p.name}">${p.name}</a>
              <span class="verified-badge-mini" title="100% ID Verified">✓</span>
            </h3>
            <span class="profile-age">${p.age} yrs</span>
          </div>
          <div class="profile-profession">💼 ${p.profession}</div>
          <p class="profile-detail">📍 ${p.location} ${p.company ? '• ' + p.company : ''}</p>
          <p class="profile-bio-snippet">${p.bio || 'Passionate professional seeking a genuine, respectful life partner.'}</p>
          <div class="profile-tags-row">
            ${tags.map(t => `<span class="profile-tag-chip">#${t}</span>`).join('')}
          </div>
          <div class="profile-card-actions">
            <a href="${profileUrl}" class="btn-view-profile" title="View complete profile of ${p.name}">
              View Profile &rarr;
            </a>
            <button class="btn-interest ${isInterestSent ? 'active' : ''}" data-id="${p.id}" title="${isInterestSent ? 'Interest Sent' : 'Send Interest'}">
              ${isInterestSent ? '✓ Sent' : '💌 Connect'}
            </button>
            <button class="btn-shortlist ${isShortlisted ? 'active' : ''}" data-id="${p.id}" title="${isShortlisted ? 'Saved in Shortlist' : 'Add to Shortlist'}">
              ${isShortlisted ? '❤️' : '🤍'}
            </button>
          </div>
        </div>
      `;

      // Make image clickable to view profile
      const imgEl = card.querySelector('.profile-card__img');
      if (imgEl) {
        imgEl.addEventListener('click', goToProfile);
        imgEl.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            goToProfile(e);
          }
        });
      }

      // Explicit link and button click events to guarantee navigation
      const nameLink = card.querySelector('.profile-name-link');
      if (nameLink) {
        nameLink.addEventListener('click', goToProfile);
      }

      const viewBtn = card.querySelector('.btn-view-profile');
      if (viewBtn) {
        viewBtn.addEventListener('click', goToProfile);
      }

      // Connect button click handler
      const interestBtn = card.querySelector('.btn-interest');
      if (interestBtn) {
        interestBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const currentUser = getCurrentUser();
          if (!currentUser) {
            if (window.Matchly && window.Matchly.showToast) {
              window.Matchly.showToast('Please log in to connect with verified members.', 'warning');
            }
            setTimeout(() => { window.location.href = 'login.html#redirect=search.html'; }, 800);
            return;
          }

          let cur = {};
          try { cur = JSON.parse(localStorage.getItem('matchly_interests') || '{}'); } catch (err) {}
          const next = !cur[p.id];
          cur[p.id] = next;
          try { localStorage.setItem('matchly_interests', JSON.stringify(cur)); } catch (err) {}

          if (next) {
            interestBtn.classList.add('active');
            interestBtn.innerHTML = '✓ Sent';
            if (window.Matchly && window.Matchly.showToast) {
              window.Matchly.showToast(`Interest request sent to ${p.name}! 💕`, 'success');
            }
          } else {
            interestBtn.classList.remove('active');
            interestBtn.innerHTML = '💌 Connect';
            if (window.Matchly && window.Matchly.showToast) {
              window.Matchly.showToast(`Interest request to ${p.name} withdrawn.`, 'info');
            }
          }
        });
      }

      // Shortlist button click handler
      const shortlistBtn = card.querySelector('.btn-shortlist');
      if (shortlistBtn) {
        shortlistBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const currentUser = getCurrentUser();
          if (!currentUser) {
            if (window.Matchly && window.Matchly.showToast) {
              window.Matchly.showToast('Please log in to shortlist members.', 'warning');
            }
            setTimeout(() => { window.location.href = 'login.html#redirect=search.html'; }, 800);
            return;
          }

          let fav = {};
          try { fav = JSON.parse(localStorage.getItem('matchly_favorites') || '{}'); } catch (err) {}
          const next = !fav[p.id];
          fav[p.id] = next;
          try { localStorage.setItem('matchly_favorites', JSON.stringify(fav)); } catch (err) {}

          if (next) {
            shortlistBtn.classList.add('active');
            shortlistBtn.innerHTML = '❤️';
            if (window.Matchly && window.Matchly.showToast) {
              window.Matchly.showToast(`Added ${p.name} to your shortlist! ⭐`, 'success');
            }
          } else {
            shortlistBtn.classList.remove('active');
            shortlistBtn.innerHTML = '🤍';
            if (window.Matchly && window.Matchly.showToast) {
              window.Matchly.showToast(`Removed ${p.name} from your shortlist.`, 'info');
            }
          }
        });
      }

      return card;
    }

    // Read URL Search Parameters passed from homepage
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('gender') && genderSelect) {
      genderSelect.value = urlParams.get('gender');
    }
    if (urlParams.get('minAge') && minAgeInput) {
      minAgeInput.value = urlParams.get('minAge');
    }
    if (urlParams.get('maxAge') && maxAgeInput) {
      maxAgeInput.value = urlParams.get('maxAge');
    }
    if (urlParams.get('religion') && religionSelect) {
      religionSelect.value = urlParams.get('religion');
    }
    if (urlParams.get('location') && locationInput) {
      locationInput.value = urlParams.get('location');
    }

    // Complete Filter & Sort Execution
    function applyFiltering() {
      const selectedGender = genderSelect ? genderSelect.value.trim().toLowerCase() : '';
      const minAge = minAgeInput ? parseInt(minAgeInput.value, 10) || 18 : 18;
      const maxAge = maxAgeInput ? parseInt(maxAgeInput.value, 10) || 99 : 99;
      const selectedReligion = religionSelect ? religionSelect.value.trim().toLowerCase() : '';
      const locationTerm = locationInput ? locationInput.value.trim().toLowerCase() : '';
      const sortValue = sortSelect ? sortSelect.value : 'newest';

      let dataset = [];

      if (sourceProfiles) {
        dataset = [...sourceProfiles];
      } else {
        // Fallback: parse existing DOM elements
        const domCards = Array.from(profilesGrid.querySelectorAll('.profile-card'));
        dataset = domCards.map((c, i) => ({
          id: c.dataset.id || (i + 1),
          name: (c.querySelector('.profile-name') || {}).textContent || `Member ${i + 1}`,
          gender: c.dataset.gender || 'female',
          religion: c.dataset.religion || 'hindu',
          community: 'Member',
          location: c.dataset.city || 'India',
          age: parseInt(c.dataset.age, 10) || 25,
          profession: 'Professional',
          image: (c.querySelector('.profile-card__img') || {}).style.backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/i, '$1') || '',
          compatibility: '95%',
          compatNumber: 95
        }));
      }

      // Filter dataset
      let visible = dataset.filter(p => {
        if (selectedGender && selectedGender !== 'all' && p.gender.toLowerCase() !== selectedGender) {
          return false;
        }
        if (p.age < minAge || p.age > maxAge) {
          return false;
        }
        if (selectedReligion && selectedReligion !== 'all' && selectedReligion !== 'any' && p.religion.toLowerCase() !== selectedReligion) {
          return false;
        }
        if (locationTerm && !p.location.toLowerCase().includes(locationTerm)) {
          return false;
        }
        return true;
      });

      // Sort dataset
      if (sortValue === 'age_asc') {
        visible.sort((a, b) => a.age - b.age);
      } else if (sortValue === 'age_desc') {
        visible.sort((a, b) => b.age - a.age);
      } else if (sortValue === 'compat_desc') {
        visible.sort((a, b) => (b.compatNumber || 90) - (a.compatNumber || 90));
      } else if (sortValue === 'name_asc') {
        visible.sort((a, b) => a.name.localeCompare(b.name));
      } else {
        // newest / default order
        visible.sort((a, b) => a.id - b.id);
      }

      // Render to DOM
      profilesGrid.innerHTML = '';
      if (visible.length === 0) {
        profilesGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 4.5rem 2rem; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
            <div style="font-size: 3.5rem; margin-bottom: 1rem;">🔍</div>
            <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--text-main); font-family: var(--font-heading);">No Profiles Matched Your Criteria</h3>
            <p style="color: var(--text-muted); margin-bottom: 1.5rem; max-width: 420px; margin-left: auto; margin-right: auto;">Try widening your age filter, choosing 'Any Religion', or clearing your location search.</p>
            <button id="reset-filters-empty-btn" class="btn btn--primary" style="padding: 0.75rem 1.8rem; border-radius: 12px; font-weight: 700;">Reset All Filters</button>
          </div>
        `;
        const resetBtn = document.getElementById('reset-filters-empty-btn');
        if (resetBtn) resetBtn.addEventListener('click', resetAllFilters);
      } else {
        visible.forEach(p => {
          profilesGrid.appendChild(createFacecardElement(p));
        });
      }

      // Update count header
      if (headerTitle) {
        headerTitle.textContent = `Found ${visible.length} verified matches for you`;
      }
    }

    function resetAllFilters() {
      if (genderSelect) genderSelect.value = '';
      if (minAgeInput) minAgeInput.value = '18';
      if (maxAgeInput) maxAgeInput.value = '50';
      if (religionSelect) religionSelect.value = '';
      if (locationInput) locationInput.value = '';
      if (sortSelect) sortSelect.selectedIndex = 0;
      applyFiltering();
      if (window.Matchly && window.Matchly.showToast) {
        window.Matchly.showToast('All search filters have been reset.', 'info');
      }
    }

    if (applyBtn) {
      applyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        applyFiltering();
        if (window.Matchly && window.Matchly.showToast) {
          window.Matchly.showToast('Filters applied successfully!', 'info');
        }
      });
    }

    if (resetBtnSidebar) {
      resetBtnSidebar.addEventListener('click', (e) => {
        e.preventDefault();
        resetAllFilters();
      });
    }

    [genderSelect, religionSelect, sortSelect].forEach(el => {
      if (el) el.addEventListener('change', applyFiltering);
    });

    [minAgeInput, maxAgeInput, locationInput].forEach(el => {
      if (el) el.addEventListener('input', applyFiltering);
    });

    // Execute initial render
    applyFiltering();
  }

  // Execute immediately if DOM is ready, or on DOMContentLoaded if still loading
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearchPage);
  } else {
    initSearchPage();
  }

  window.Matchly = window.Matchly || {};
  window.Matchly.initSearchPage = initSearchPage;
})();

