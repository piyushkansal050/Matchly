/**
 * Matchly - Dynamic Profile View Controller
 * Group 13 - Frontend Engineering
 * Supports both Candidate View (any of 60 profiles) and My Profile View (logged in user)
 */

(function () {
  'use strict';

  // Resilient fallback candidate dataset if central profiles database is delayed
  const FALLBACK_PROFILES = [
    {
      id: 1,
      name: "Priya Sharma",
      gender: "female",
      age: 26,
      religion: "hindu",
      community: "Brahmin",
      location: "Delhi, India",
      profession: "Senior Software Engineer",
      company: "Google India",
      education: "B.Tech in Computer Science, IIT Delhi",
      height: "5' 5\"",
      motherTongue: "Hindi",
      horoscope: "Virgo (Kanya)",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
      compatibility: "98%",
      compatNumber: 98,
      isOnline: true,
      verified: true,
      bio: "Passionate about tech, weekend hiking, and discovering boutique coffee spots. Looking for genuine connection with mutual respect and ambition.",
      tags: ["Tech & AI", "Hiking", "Specialty Coffee", "Classical Music"],
      partnerPreference: "Looking for an ambitious, kind-hearted professional who values personal growth and family warmth."
    },
    {
      id: 2,
      name: "Rahul Verma",
      gender: "male",
      age: 29,
      religion: "hindu",
      community: "Kshatriya",
      location: "Mumbai, India",
      profession: "Creative Marketing Director",
      company: "Global Brands Media",
      education: "MBA in Marketing, IIM Ahmedabad",
      height: "5' 11\"",
      motherTongue: "Hindi / Marathi",
      horoscope: "Leo (Simha)",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
      compatibility: "95%",
      compatNumber: 95,
      isOnline: true,
      verified: true,
      bio: "Creative mind with a love for indie music, cinema, and photography. Believer in mutual empowerment and celebrating small everyday joys.",
      tags: ["Marketing", "Music", "Photography", "Fitness"],
      partnerPreference: "Seeking an independent woman with a joyful, adventurous spirit and thoughtful outlook on life."
    },
    {
      id: 3,
      name: "Anjali Gupta",
      gender: "female",
      age: 25,
      religion: "hindu",
      community: "Vaishya",
      location: "Bangalore, India",
      profession: "Physician & Clinical Researcher",
      company: "Manipal Hospital",
      education: "MBBS, MD Pediatrics, AIIMS",
      height: "5' 4\"",
      motherTongue: "Kannada / Hindi",
      horoscope: "Taurus (Vrishabha)",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
      compatibility: "96%",
      compatNumber: 96,
      isOnline: false,
      verified: true,
      bio: "Dedicated healthcare professional who finds peace in classical piano, baking French pastries, and quiet sunset walks by the lake.",
      tags: ["Healthcare", "Reading", "Baking", "Yoga"],
      partnerPreference: "Looking for an understanding partner who values empathy, shared laughter, and meaningful conversations."
    },
    {
      id: 4,
      name: "Vikram Rao",
      gender: "male",
      age: 33,
      religion: "hindu",
      community: "Reddy",
      location: "Hyderabad, India",
      profession: "VP of Private Equity",
      company: "Apex Capital Partners",
      education: "B.Tech (BITS Pilani), MS Finance (Columbia)",
      height: "6' 0\"",
      motherTongue: "Telugu",
      horoscope: "Scorpio (Vrischika)",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
      compatibility: "93%",
      compatNumber: 93,
      isOnline: true,
      verified: true,
      bio: "Finance professional with an entrepreneurial mindset. Enjoy badminton, road trips, and learning about historic civilizations.",
      tags: ["Finance", "Sports", "Roadtrips", "Podcasts"],
      partnerPreference: "Seeking a well-educated, positive, and communicative partner to build an inspiring life together."
    },
    {
      id: 5,
      name: "Sneha Patel",
      gender: "female",
      age: 24,
      religion: "hindu",
      community: "Patel",
      location: "Ahmedabad, India",
      profession: "Lead UI/UX Product Designer",
      company: "DesignCraft Studio",
      education: "B.Des, National Institute of Design (NID)",
      height: "5' 6\"",
      motherTongue: "Gujarati",
      horoscope: "Libra (Tula)",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      compatibility: "97%",
      compatNumber: 97,
      isOnline: true,
      verified: true,
      bio: "Passionate designer who appreciates minimalism, architecture, and road trips. Seeking a kind, curious, and ambitious partner.",
      tags: ["Design", "Art", "Travel", "Coffee"],
      partnerPreference: "Someone with emotional maturity, creativity, and a great sense of humour."
    },
    {
      id: 6,
      name: "Rohit Kumar",
      gender: "male",
      age: 30,
      religion: "hindu",
      community: "Kayastha",
      location: "Delhi, India",
      profession: "Tech Startup Founder",
      company: "PulseAI Health",
      education: "Dual Degree B.Tech + M.Tech, IIT Bombay",
      height: "5' 10\"",
      motherTongue: "Hindi",
      horoscope: "Aries (Mesha)",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
      compatibility: "94%",
      compatNumber: 94,
      isOnline: false,
      verified: true,
      bio: "Startup founder driven by curiosity and innovation. Enjoys lawn tennis, angel investing, and deep conversations over tea.",
      tags: ["Startups", "Tennis", "Tech", "Foodie"],
      partnerPreference: "A warm, progressive partner who loves intellectual curiosity and building a high-trust relationship."
    },
    {
      id: 7,
      name: "Simran Kaur",
      gender: "female",
      age: 27,
      religion: "sikh",
      community: "Jat Sikh",
      location: "Chandigarh, India",
      profession: "Heritage Architect",
      company: "Heritage Architecture Studio",
      education: "M.Arch, CEPT University",
      height: "5' 7\"",
      motherTongue: "Punjabi",
      horoscope: "Gemini (Mithuna)",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
      compatibility: "95%",
      compatNumber: 95,
      isOnline: true,
      verified: true,
      bio: "Balancing heritage preservation and sustainable design. Values family warmth, acoustic sufi music, and poetry.",
      tags: ["Architecture", "Heritage", "Poetry", "Foodie"],
      partnerPreference: "Looking for an honest, ambitious partner who respects traditional warmth and modern perspectives."
    },
    {
      id: 8,
      name: "David D'Souza",
      gender: "male",
      age: 31,
      religion: "christian",
      community: "Catholic",
      location: "Mumbai, India",
      profession: "Cloud Solutions Architect",
      company: "Amazon Web Services (AWS)",
      education: "B.E. Information Technology, St. Xavier's",
      height: "5' 11\"",
      motherTongue: "English / Konkani",
      horoscope: "Pisces (Meena)",
      image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80",
      compatibility: "92%",
      compatNumber: 92,
      isOnline: true,
      verified: true,
      bio: "Tech enthusiast who loves guitar, beach sunsets, and coastal culinary adventures. Looking for a genuine soul.",
      tags: ["Music", "Guitar", "Travel", "Tech"],
      partnerPreference: "Seeking a sincere, joyful partner with a compassionate heart and love for life's adventures."
    },
    {
      id: 9,
      name: "Zara Khan",
      gender: "female",
      age: 26,
      religion: "muslim",
      community: "Sunni",
      location: "Mumbai, India",
      profession: "Journalist & Essayist",
      company: "National Chronicle",
      education: "Master's in Journalism, Columbia University",
      height: "5' 5\"",
      motherTongue: "Urdu / English",
      horoscope: "Cancer (Karka)",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
      compatibility: "96%",
      compatNumber: 96,
      isOnline: true,
      verified: true,
      bio: "Storyteller with a love for literature, independent film festivals, and quiet weekend getaways to the hills.",
      tags: ["Writing", "Films", "Literature", "Travel"],
      partnerPreference: "Looking for an educated, progressive, and respectful partner with integrity and depth of character."
    },
    {
      id: 10,
      name: "Arjun Das",
      gender: "male",
      age: 32,
      religion: "hindu",
      community: "Bengali Kayastha",
      location: "Pune, India",
      profession: "Management Consulting Principal",
      company: "McKinsey & Company",
      education: "B.Tech (IIT Kharagpur), MBA (INSEAD)",
      height: "6' 1\"",
      motherTongue: "Bengali",
      horoscope: "Capricorn (Makara)",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
      compatibility: "94%",
      compatNumber: 94,
      isOnline: false,
      verified: true,
      bio: "Strategy consultant advising global firms. Marathon runner, culinary explorer, and history aficionado.",
      tags: ["Strategy", "Running", "History", "Coffee"],
      partnerPreference: "Looking for a smart, compassionate partner to share laughs, deep conversations, and lifelong dreams."
    },
    {
      id: 17,
      name: "Zara Sheikh",
      gender: "female",
      age: 25,
      religion: "muslim",
      community: "Sunni",
      location: "Hyderabad, India",
      profession: "Pediatric Dentist & Child Specialist",
      company: "Rainbow Children's Medicare",
      education: "BDS, MDS Pediatric Dentistry, Manipal",
      height: "5' 4\"",
      motherTongue: "Urdu / English",
      horoscope: "Leo",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
      compatibility: "98%",
      compatNumber: 98,
      isOnline: true,
      verified: true,
      bio: "Caring doctor passionate about child oral health. Enjoys miniature painting, nature photography, and family gatherings.",
      tags: ["Healthcare", "Art", "Painting", "Family"],
      partnerPreference: "Seeking a kind, educated Muslim professional with strong moral values, empathy, and ambitious vision."
    },
    {
      id: 32,
      name: "Harpreet Kaur",
      gender: "female",
      age: 26,
      religion: "sikh",
      community: "Jat Sikh",
      location: "Amritsar, India",
      profession: "Organic Agrotech Entrepreneur",
      company: "PureRoots Organic Farming",
      education: "B.Sc Agriculture (PAU), MBA Agribusiness (IIMA)",
      height: "5' 7\"",
      motherTongue: "Punjabi",
      horoscope: "Taurus",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
      compatibility: "97%",
      compatNumber: 97,
      isOnline: true,
      verified: true,
      bio: "Promoting farm-to-table clean nutrition. Devoted to community service, equestrian sports, and soulful gurbani kirtan.",
      tags: ["Agrotech", "Horses", "Community", "Nature"],
      partnerPreference: "Looking for an enterprising, humble Sikh partner with integrity, family warmth, and high aspirations."
    },
    {
      id: 47,
      name: "Maria D'Souza",
      gender: "female",
      age: 27,
      religion: "christian",
      community: "Roman Catholic",
      location: "Goa, India",
      profession: "Hospitality & Resort Director",
      company: "Taj Holiday Village Resort & Spa",
      education: "BHM (IHM Goa), Master in International Hospitality (Cornell)",
      height: "5' 6\"",
      motherTongue: "English / Konkani",
      horoscope: "Libra",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
      compatibility: "97%",
      compatNumber: 97,
      isOnline: true,
      verified: true,
      bio: "Leading luxury beach resorts with sustainable hospitality. Passionate about scuba diving, acoustic guitar, and ocean protection.",
      tags: ["Hospitality", "Diving", "Acoustic", "Eco-Travel"],
      partnerPreference: "Looking for a progressive, caring Christian professional with an adventurous spirit and devotion to family."
    }
  ];

  function initProfilePage() {
    let paramId = null;
    let paramName = null;
    let viewParam = null;

    // 1. Hash parameter extraction with HIGHEST PRECEDENCE
    // (Handles #id=2, #2, #name=Rahul%20Verma, #view=me, #/id=2, etc. seamlessly under file:/// and http(s)://)
    if (window.location.hash) {
      const rawHash = window.location.hash.replace(/^#[!\/?]*/, '').trim();
      if (/^\d+$/.test(rawHash)) {
        paramId = rawHash;
      } else {
        const mId = rawHash.match(/(?:^|[&?#])id=([^&?#]+)/i);
        const mName = rawHash.match(/(?:^|[&?#])name=([^&?#]+)/i);
        const mView = rawHash.match(/(?:^|[&?#])view=([^&?#]+)/i);

        if (mId) paramId = decodeURIComponent(mId[1]);
        if (mName) paramName = decodeURIComponent(mName[1]);
        if (mView) viewParam = decodeURIComponent(mView[1]);

        if (!paramId && !paramName && !viewParam) {
          try {
            const hashSearch = rawHash.includes('?') ? rawHash.split('?')[1] : rawHash;
            const sp = new URLSearchParams(hashSearch);
            if (sp.get('id')) paramId = sp.get('id');
            if (sp.get('name')) paramName = sp.get('name');
            if (sp.get('view')) viewParam = sp.get('view');
          } catch (e) {}
        }
      }
    }

    // 2. Query string fallback (only when no parameters were supplied in the hash)
    if (!paramId && !paramName && !viewParam && window.location.search) {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('id')) paramId = urlParams.get('id');
        if (urlParams.get('name')) paramName = urlParams.get('name');
        if (urlParams.get('view')) viewParam = urlParams.get('view');
      } catch (e) {}
    }

    // 3. Stored profile fallback (when opening profile.html directly without parameters)
    if (!paramId && !paramName && !viewParam) {
      try {
        const stored = sessionStorage.getItem('matchly_last_viewed_profile') ||
                       localStorage.getItem('matchly_last_viewed_profile');
        if (stored) {
          paramId = stored;
        }
      } catch (e) {}
    }

    const currentUser = (window.Matchly && window.Matchly.Auth && typeof window.Matchly.Auth.getUser === 'function')
      ? window.Matchly.Auth.getUser()
      : (function () {
          try {
            const stored = localStorage.getItem('matchly_current_user');
            return stored ? JSON.parse(stored) : null;
          } catch (e) {
            return null;
          }
        })();

    // Guard: Profiles must ONLY open when user is logged in or signed up
    if (!currentUser) {
      const targetUrl = window.location.pathname.split('/').pop() + window.location.search + window.location.hash;
      try {
        sessionStorage.setItem('matchly_redirect_after_auth', targetUrl || 'profile.html');
      } catch (e) {}
      window.location.replace('login.html');
      return;
    }

    // 1. Resolve Profile to Render
    let candidateProfile = null;
    let isMyProfile = false;

    if (viewParam === 'me' || viewParam === 'myprofile') {
      isMyProfile = true;
    } else if (paramId) {
      const cleanId = String(paramId).trim();
      const numId = parseInt(cleanId, 10);

      // Check central getProfileById
      if (window.Matchly && typeof window.Matchly.getProfileById === 'function') {
        candidateProfile = window.Matchly.getProfileById(cleanId);
      }

      // Check window.Matchly.profiles array
      if (!candidateProfile && window.Matchly && Array.isArray(window.Matchly.profiles)) {
        candidateProfile = window.Matchly.profiles.find(p => p.id === numId || String(p.id).toLowerCase() === cleanId.toLowerCase());
      }

      // Check embedded fallback profiles
      if (!candidateProfile && Array.isArray(FALLBACK_PROFILES)) {
        candidateProfile = FALLBACK_PROFILES.find(p => p.id === numId || String(p.id).toLowerCase() === cleanId.toLowerCase());
      }

      if (candidateProfile) {
        try { sessionStorage.setItem('matchly_last_viewed_profile', String(candidateProfile.id)); } catch (e) {}
      } else if (currentUser && currentUser.id && String(currentUser.id).toLowerCase() === cleanId.toLowerCase()) {
        isMyProfile = true;
      }
    } else if (paramName) {
      const cleanName = decodeURIComponent(String(paramName)).trim().toLowerCase();

      if (window.Matchly && typeof window.Matchly.getProfileByName === 'function') {
        candidateProfile = window.Matchly.getProfileByName(cleanName);
      }

      if (!candidateProfile && window.Matchly && Array.isArray(window.Matchly.profiles)) {
        candidateProfile = window.Matchly.profiles.find(p => p.name.toLowerCase() === cleanName || p.name.toLowerCase().includes(cleanName));
      }

      if (!candidateProfile && Array.isArray(FALLBACK_PROFILES)) {
        candidateProfile = FALLBACK_PROFILES.find(p => p.name.toLowerCase() === cleanName || p.name.toLowerCase().includes(cleanName));
      }

      if (candidateProfile) {
        try { sessionStorage.setItem('matchly_last_viewed_profile', String(candidateProfile.id)); } catch (e) {}
      } else if (currentUser && currentUser.name && String(currentUser.name).toLowerCase() === cleanName) {
        isMyProfile = true;
      }
    } else {
      if (currentUser) {
        isMyProfile = true;
      } else {
        // Default to profile 1
        candidateProfile = (window.Matchly && typeof window.Matchly.getProfileById === 'function')
          ? window.Matchly.getProfileById(1)
          : ((window.Matchly && Array.isArray(window.Matchly.profiles) && window.Matchly.profiles[0]) || FALLBACK_PROFILES[0]);
      }
    }

    if (isMyProfile && currentUser) {
      renderMyProfile(currentUser);
    } else if (candidateProfile) {
      renderCandidateProfile(candidateProfile);
    } else {
      // Guaranteed fallback
      const fallback = (window.Matchly && Array.isArray(window.Matchly.profiles) && window.Matchly.profiles[0]) || FALLBACK_PROFILES[0];
      renderCandidateProfile(fallback);
    }

    // --- RENDER CANDIDATE PROFILE ---
    function renderCandidateProfile(profile) {
      const firstName = profile.name.split(' ')[0] || profile.name;
      document.title = `Matchly - ${profile.name}`;

      // Read stored interactions once at top of renderCandidateProfile so both sidebar & details can access them
      let interests = {};
      let favorites = {};
      try {
        interests = JSON.parse(localStorage.getItem('matchly_interests') || '{}');
        favorites = JSON.parse(localStorage.getItem('matchly_favorites') || '{}');
      } catch (e) {}

      const isInterestSent = !!interests[profile.id];
      const isShortlisted = !!favorites[profile.id];

      // Back navigation
      const backNav = document.getElementById('btn-back-nav');
      if (backNav) {
        if (document.referrer && (document.referrer.includes('homepage.html') || document.referrer.includes('homepage-react.html'))) {
          backNav.href = 'homepage.html';
          backNav.innerHTML = '← Back to Home';
        } else {
          backNav.href = 'search.html';
          backNav.innerHTML = '← Back to Find Matches';
        }
      }

      // Profile Cover Photo with Vibrant Gradient
      const coverEl = document.getElementById('profile-cover');
      if (coverEl) {
        coverEl.style.backgroundImage = `linear-gradient(135deg, rgba(233, 30, 99, 0.72) 0%, rgba(156, 39, 176, 0.72) 100%), url('${profile.image}')`;
        coverEl.style.backgroundSize = 'cover';
        coverEl.style.backgroundPosition = 'center 20%';
      }

      // Sidebar Info
      const indContainer = document.getElementById('sidebar-indicator-container');
      if (indContainer) {
        indContainer.innerHTML = profile.isOnline
          ? '<div style="color: #4caf50; font-size: 0.82rem; font-weight: 700; margin-bottom: 8px;">● Active Now</div>'
          : '<div style="color: var(--text-muted); font-size: 0.82rem; margin-bottom: 8px;">● Offline</div>';
      }

      const avatarEl = document.getElementById('profile-avatar');
      if (avatarEl) {
        avatarEl.style.backgroundImage = `url('${profile.image}')`;
      }

      const nameTextEl = document.getElementById('name-text');
      if (nameTextEl) {
        nameTextEl.textContent = profile.name;
      }

      const idEl = document.getElementById('profile-id');
      if (idEl) {
        const numId = parseInt(profile.id, 10) || 1;
        idEl.textContent = `Matchly ID: M${100000 + numId * 142}`;
      }

      const subBadge = document.getElementById('sidebar-sub-badge');
      if (subBadge) {
        subBadge.innerHTML = `<span class="compat-badge">${profile.compatibility || '96%'} Compatibility Match</span>`;
      }

      // Sidebar Actions
      const actionsContainer = document.getElementById('profile-actions');
      if (actionsContainer) {
        actionsContainer.innerHTML = `
          <button id="btn-interest-action" class="btn btn--primary w-100" style="${isInterestSent ? 'background-color: #4caf50;' : ''}">
            ${isInterestSent ? '✓ Interest Sent!' : 'Send Interest'}
          </button>
          <button id="btn-shortlist-action" class="btn btn--outline w-100" style="${isShortlisted ? 'background-color: #ffc107; color: #333;' : ''}">
            ${isShortlisted ? '★ Shortlisted' : 'Shortlist'}
          </button>
          <a id="btn-direct-msg" href="messages.html#chat=${encodeURIComponent(profile.name)}" class="btn btn--outline w-100" style="text-decoration: none;">
            💬 Message ${firstName}
          </a>
        `;

        const btnInterest = document.getElementById('btn-interest-action');
        const btnShortlist = document.getElementById('btn-shortlist-action');

        if (btnInterest) {
          btnInterest.onclick = () => {
            let cur = {};
            try { cur = JSON.parse(localStorage.getItem('matchly_interests') || '{}'); } catch {}
            const nextState = !cur[profile.id];
            cur[profile.id] = nextState;
            localStorage.setItem('matchly_interests', JSON.stringify(cur));

            if (nextState) {
              btnInterest.innerText = '✓ Interest Sent!';
              btnInterest.style.backgroundColor = '#4caf50';
              if (window.Matchly) window.Matchly.showToast(`Interest request sent to ${profile.name}! 💕`, 'success');
            } else {
              btnInterest.innerText = 'Send Interest';
              btnInterest.style.backgroundColor = 'var(--primary-color)';
              if (window.Matchly) window.Matchly.showToast(`Interest request to ${profile.name} cancelled.`, 'info');
            }
          };
        }

        if (btnShortlist) {
          btnShortlist.onclick = () => {
            let fav = {};
            try { fav = JSON.parse(localStorage.getItem('matchly_favorites') || '{}'); } catch {}
            const nextState = !fav[profile.id];
            fav[profile.id] = nextState;
            localStorage.setItem('matchly_favorites', JSON.stringify(fav));

            if (nextState) {
              btnShortlist.innerText = '★ Shortlisted';
              btnShortlist.style.backgroundColor = '#ffc107';
              btnShortlist.style.color = '#333';
              if (window.Matchly) window.Matchly.showToast(`Added ${profile.name} to your shortlist! ⭐`, 'success');
            } else {
              btnShortlist.innerText = 'Shortlist';
              btnShortlist.style.backgroundColor = 'transparent';
              btnShortlist.style.color = 'var(--primary-color)';
              if (window.Matchly) window.Matchly.showToast(`Removed ${profile.name} from your shortlist.`, 'info');
            }
          };
        }
      }

      // Details Main Sections
      const detailsContainer = document.getElementById('profile-details');
      if (detailsContainer) {
        const religionCapitalized = (profile.religion || 'Hindu').charAt(0).toUpperCase() + (profile.religion || 'Hindu').slice(1);
        const tagsHtml = (profile.tags && Array.isArray(profile.tags))
          ? `<div class="profile-tags">${profile.tags.map(t => `<span class="profile-tag">#${t}</span>`).join('')}</div>`
          : '';

        detailsContainer.innerHTML = `
          <section class="detail-section">
            <div class="detail-section__header">
              <h2>About ${firstName}</h2>
              <span class="verified-badge">100% ID Verified</span>
            </div>
            <p style="color: var(--text-main); line-height: 1.7; font-size: 1rem;">
              ${profile.bio || 'Passionate professional with high values, family warmth, and a zest for life.'}
            </p>
            ${tagsHtml}
          </section>

          <section class="detail-section">
            <div class="detail-section__header">
              <h2>Basic Details</h2>
              <span style="font-size: 0.85rem; color: var(--text-muted);">Horoscope: ${profile.horoscope || 'Auspicious'}</span>
            </div>
            <ul class="detail-list">
              <li><span class="detail-label">Age</span> <span class="detail-value">${profile.age} Years</span></li>
              <li><span class="detail-label">Height</span> <span class="detail-value">${profile.height || '5\' 6"'}</span></li>
              <li><span class="detail-label">Religion & Community</span> <span class="detail-value">${religionCapitalized} (${profile.community || 'Open'})</span></li>
              <li><span class="detail-label">Mother Tongue</span> <span class="detail-value">${profile.motherTongue || 'Hindi / English'}</span></li>
              <li><span class="detail-label">Marital Status</span> <span class="detail-value">Never Married</span></li>
              <li><span class="detail-label">Current Location</span> <span class="detail-value">${profile.location || 'India'}</span></li>
            </ul>
          </section>

          <section class="detail-section">
            <div class="detail-section__header">
              <h2>Education & Career</h2>
              <span style="font-size: 0.85rem; color: #4caf50; font-weight: 600;">✓ Employment Verified</span>
            </div>
            <ul class="detail-list">
              <li><span class="detail-label">Highest Education</span> <span class="detail-value">${profile.education || 'Graduate Degree'}</span></li>
              <li><span class="detail-label">Institution</span> <span class="detail-value">${(profile.education && profile.education.includes(',')) ? profile.education.split(',')[1].trim() : (profile.company ? profile.company + ' Alumni' : 'Premier University')}</span></li>
              <li><span class="detail-label">Occupation</span> <span class="detail-value">${profile.profession || 'Professional'}</span></li>
              <li><span class="detail-label">Company / Workplace</span> <span class="detail-value">${profile.company || 'Leading Enterprise'}</span></li>
              <li><span class="detail-label">Annual Income</span> <span class="detail-value">Private (Available upon mutual connection)</span></li>
              <li><span class="detail-label">Work Location</span> <span class="detail-value">${profile.location || 'India'}</span></li>
            </ul>
          </section>

          <section class="detail-section">
            <div class="detail-section__header">
              <h2>Partner Expectations</h2>
              <span style="font-size: 0.85rem; color: var(--primary-color); font-weight: 600;">Mutual Compatibility</span>
            </div>
            <p style="color: var(--text-main); line-height: 1.7; font-size: 0.98rem;">
              ${profile.partnerPreference || 'Looking for an understanding, educated, and kind-hearted life partner with family values and mutual respect.'}
            </p>
          </section>

          <section class="detail-section" style="background: linear-gradient(135deg, rgba(233, 30, 99, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%); border: 1px dashed var(--primary-color); text-align: center; padding: 2rem 1.5rem;">
            <h3 style="font-size: 1.35rem; margin-bottom: 0.4rem; color: var(--text-main); font-family: var(--font-heading);">
              Interested in connecting with ${firstName}?
            </h3>
            <p style="color: var(--text-muted); font-size: 0.92rem; margin-bottom: 1.4rem; max-width: 480px; margin-left: auto; margin-right: auto;">
              Express your interest directly. Send an interest note or start a private conversation.
            </p>
            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
              <button id="btn-bottom-interest" class="btn btn--primary" style="padding: 0.75rem 1.8rem; border-radius: 12px; font-weight: 700; ${isInterestSent ? 'background-color: #4caf50;' : ''}">
                ${isInterestSent ? '✓ Interest Sent' : '💌 Connect & Send Interest'}
              </button>
              <a href="messages.html#chat=${encodeURIComponent(profile.name)}" class="btn btn--outline" style="padding: 0.75rem 1.6rem; border-radius: 12px; font-weight: 600; text-decoration: none;">
                💬 Message ${firstName}
              </a>
              <a href="search.html" class="btn btn--outline" style="padding: 0.75rem 1.4rem; border-radius: 12px; text-decoration: none;">
                🔍 Browse More Matches
              </a>
            </div>
          </section>
        `;

        const bottomInterestBtn = document.getElementById('btn-bottom-interest');
        if (bottomInterestBtn) {
          bottomInterestBtn.onclick = () => {
            const sidebarInterestBtn = document.getElementById('btn-interest-action');
            if (sidebarInterestBtn) {
              sidebarInterestBtn.click();
              bottomInterestBtn.innerText = sidebarInterestBtn.innerText;
              bottomInterestBtn.style.backgroundColor = sidebarInterestBtn.style.backgroundColor;
            }
          };
        }
      }
    }

    // --- RENDER LOGGED IN USER'S OWN PROFILE ---
    function renderMyProfile(user) {
      document.title = `Matchly - My Profile (${user.name})`;

      // Back navigation
      const backNav = document.getElementById('btn-back-nav');
      if (backNav) {
        backNav.href = 'homepage.html';
        backNav.innerHTML = '← Back to Home';
      }

      // Sidebar Info
      const indContainer = document.getElementById('sidebar-indicator-container');
      if (indContainer) {
        indContainer.innerHTML = '<div class="my-profile-indicator">⭐ My Account Profile</div>';
      }

      const avatarEl = document.getElementById('profile-avatar');
      if (avatarEl) {
        const av = user.avatar || (user.gender === 'male' ? 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80' : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80');
        avatarEl.style.backgroundImage = `url('${av}')`;
      }

      const nameTextEl = document.getElementById('name-text');
      if (nameTextEl) {
        nameTextEl.textContent = user.name;
      }

      const idEl = document.getElementById('profile-id');
      if (idEl) {
        idEl.textContent = `Matchly ID: ${user.id || 'M104523'}`;
      }

      const subBadge = document.getElementById('sidebar-sub-badge');
      if (subBadge) {
        subBadge.innerHTML = `<span class="compat-badge" style="background: linear-gradient(135deg, #e91e63 0%, #9c27b0 100%);">⭐ ${user.subscription || 'Basic'} Tier Member</span>`;
      }

      // Activity counts
      let interestCount = 0;
      let favoriteCount = 0;
      try {
        const intObj = JSON.parse(localStorage.getItem('matchly_interests') || '{}');
        const favObj = JSON.parse(localStorage.getItem('matchly_favorites') || '{}');
        interestCount = Object.values(intObj).filter(Boolean).length;
        favoriteCount = Object.values(favObj).filter(Boolean).length;
      } catch {}

      // Sidebar Actions
      const actionsContainer = document.getElementById('profile-actions');
      if (actionsContainer) {
        actionsContainer.innerHTML = `
          <button id="btn-edit-bio-sidebar" class="btn btn--primary w-100">
            ✏️ Edit Profile Bio
          </button>
          <a href="subscription.html" class="btn btn--outline w-100" style="text-decoration: none;">
            ⭐ Manage Subscription (${user.subscription || 'Basic'})
          </a>
          <button id="btn-open-password-modal" class="btn btn--outline w-100">
            🔑 Change Password
          </button>
          <a href="search.html" class="btn btn--outline w-100" style="text-decoration: none;">
            🔍 Browse Matches
          </a>
          <button id="btn-profile-logout" class="btn btn--outline w-100" style="color: #c62828; border-color: rgba(198, 40, 40, 0.3);">
            Log Out
          </button>
        `;

        const btnBio = document.getElementById('btn-edit-bio-sidebar');
        const btnPass = document.getElementById('btn-open-password-modal');
        const btnLogout = document.getElementById('btn-profile-logout');

        if (btnBio) {
          btnBio.onclick = toggleBioEditor;
        }

        if (btnPass) {
          btnPass.onclick = () => {
            const modal = document.getElementById('password-modal');
            if (modal) modal.style.display = 'flex';
          };
        }

        if (btnLogout) {
          btnLogout.onclick = () => {
            if (window.Matchly && window.Matchly.Auth) {
              window.Matchly.Auth.logout();
            }
          };
        }
      }

      // Details Main Content
      const detailsContainer = document.getElementById('profile-details');
      if (detailsContainer) {
        const userBio = user.bio || 'Passionate about building a genuine life partnership grounded in mutual respect, shared laughter, and personal growth.';

        detailsContainer.innerHTML = `
          <!-- Activity Stats -->
          <div class="user-stats-grid">
            <div class="user-stat-card">
              <div class="user-stat-number">${interestCount}</div>
              <div class="user-stat-label">Interests Sent</div>
            </div>
            <div class="user-stat-card">
              <div class="user-stat-number">${favoriteCount}</div>
              <div class="user-stat-label">Shortlisted Matches</div>
            </div>
            <div class="user-stat-card">
              <div class="user-stat-number">100%</div>
              <div class="user-stat-label">Verified Trust Score</div>
            </div>
          </div>

          <!-- About Me & Bio Editor -->
          <section class="detail-section">
            <div class="detail-section__header">
              <h2>About You</h2>
              <button id="btn-edit-bio-inline" class="btn btn--outline" style="padding: 0.35rem 0.8rem; font-size: 0.82rem;">✏️ Edit Bio</button>
            </div>
            <div id="bio-display-text" style="color: var(--text-main); line-height: 1.7; font-size: 1rem;">
              ${userBio}
            </div>

            <!-- Inline Bio Editor Form -->
            <div id="bio-editor-box" class="bio-editor-container">
              <textarea id="bio-editor-input" class="bio-editor-textarea">${userBio}</textarea>
              <div style="display: flex; gap: 8px;">
                <button id="btn-save-bio" class="btn btn--primary" style="padding: 0.5rem 1.2rem; font-size: 0.88rem;">Save Bio</button>
                <button id="btn-cancel-bio" class="btn btn--outline" style="padding: 0.5rem 1rem; font-size: 0.88rem;">Cancel</button>
              </div>
            </div>
          </section>

          <!-- Account & Membership Information -->
          <section class="detail-section">
            <div class="detail-section__header">
              <h2>Account & Verification Details</h2>
              <span class="verified-badge">✓ Active & ID Verified</span>
            </div>
            <ul class="detail-list">
              <li><span class="detail-label">Full Name</span> <span class="detail-value">${user.name}</span></li>
              <li><span class="detail-label">Email Address</span> <span class="detail-value">${user.email}</span></li>
              <li><span class="detail-label">Matchly ID</span> <span class="detail-value">${user.id || 'M104523'}</span></li>
              <li><span class="detail-label">Registered Gender</span> <span class="detail-value">${(user.gender || 'Not Specified').toUpperCase()}</span></li>
              <li><span class="detail-label">Subscription Tier</span> <span class="detail-value">${user.subscription || 'Basic'} Plan (<a href="subscription.html" style="color: var(--primary-color); text-decoration: underline;">Upgrade</a>)</span></li>
              <li><span class="detail-label">Member Since</span> <span class="detail-value">${user.memberSince || '2026'}</span></li>
            </ul>
          </section>

          <!-- Quick Navigation & Account Security -->
          <section class="detail-section">
            <div class="detail-section__header">
              <h2>Account Safety & Shortcuts</h2>
              <span style="font-size: 0.85rem; color: #4caf50; font-weight: 600;">🔒 256-Bit SSL Protected</span>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
              <a href="search.html" class="btn btn--primary">
                🔍 Find Matches
              </a>
              <a href="messages.html" class="btn btn--outline">
                💬 Open Messages
              </a>
              <a href="subscription.html" class="btn btn--outline">
                ⭐ Premium Membership Plans
              </a>
              <button id="btn-change-pass-sec" class="btn btn--outline">
                🔑 Change Password
              </button>
            </div>
          </section>
        `;

        // Wire bio editor buttons
        const btnEditInline = document.getElementById('btn-edit-bio-inline');
        const btnSaveBio = document.getElementById('btn-save-bio');
        const btnCancelBio = document.getElementById('btn-cancel-bio');
        const btnChangePassSec = document.getElementById('btn-change-pass-sec');

        if (btnEditInline) btnEditInline.onclick = toggleBioEditor;
        if (btnCancelBio) btnCancelBio.onclick = toggleBioEditor;

        if (btnSaveBio) {
          btnSaveBio.onclick = () => {
            const input = document.getElementById('bio-editor-input');
            const newBio = input ? input.value.trim() : '';
            if (!newBio) {
              if (window.Matchly) window.Matchly.showToast('Please enter your bio.', 'warning');
              return;
            }

            user.bio = newBio;
            try {
              localStorage.setItem('matchly_current_user', JSON.stringify(user));
              // Also update in registered users
              if (window.Matchly && window.Matchly.Auth) {
                const regUsers = window.Matchly.Auth.getRegisteredUsers();
                const idx = regUsers.findIndex(u => u.email === user.email || u.id === user.id);
                if (idx !== -1) {
                  regUsers[idx].bio = newBio;
                  window.Matchly.Auth.saveRegisteredUsers(regUsers);
                }
              }
            } catch {}

            const displayEl = document.getElementById('bio-display-text');
            if (displayEl) displayEl.textContent = newBio;
            toggleBioEditor();

            if (window.Matchly) {
              window.Matchly.showToast('Profile bio updated successfully! 💕', 'success');
            }
          };
        }

        if (btnChangePassSec) {
          btnChangePassSec.onclick = () => {
            const modal = document.getElementById('password-modal');
            if (modal) modal.style.display = 'flex';
          };
        }
      }
    }

    function toggleBioEditor() {
      const editorBox = document.getElementById('bio-editor-box');
      const displayText = document.getElementById('bio-display-text');
      if (editorBox && displayText) {
        const isEditing = editorBox.style.display === 'flex';
        editorBox.style.display = isEditing ? 'none' : 'flex';
        displayText.style.display = isEditing ? 'block' : 'none';
        if (!isEditing) {
          const input = document.getElementById('bio-editor-input');
          if (input) input.focus();
        }
      }
    }

    // Modal close listener
    const modal = document.getElementById('password-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
      };
    }
    if (btnCloseModal && modal) {
      btnCloseModal.onclick = () => {
        modal.style.display = 'none';
      };
    }

    // Change Password Form in Modal
    const passForm = document.getElementById('profile-change-password-form');
    if (passForm) {
      passForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newPassInput = document.getElementById('modal-new-password');
        const confPassInput = document.getElementById('modal-confirm-password');

        const newPass = newPassInput ? newPassInput.value.trim() : '';
        const confPass = confPassInput ? confPassInput.value.trim() : '';

        if (!newPass || !confPass) {
          if (window.Matchly) window.Matchly.showToast('Please fill in both password fields.', 'warning');
          return;
        }

        if (newPass !== confPass) {
          if (window.Matchly) window.Matchly.showToast('Passwords do not match.', 'error');
          return;
        }

        const user = (window.Matchly && window.Matchly.Auth) ? window.Matchly.Auth.getUser() : null;
        if (!user || !user.email) {
          if (window.Matchly) window.Matchly.showToast('Please log in first.', 'warning');
          return;
        }

        const res = window.Matchly.Auth.resetPassword(user.email, newPass);
        if (!res.success) {
          if (window.Matchly) window.Matchly.showToast(res.message, 'error', 4500);
          return;
        }

        if (modal) modal.style.display = 'none';
        passForm.reset();
        if (window.Matchly) {
          window.Matchly.showToast('Password updated successfully! 💕', 'success');
        }
      });
    }
  }

  // Execute immediately if DOM is already ready, or on DOMContentLoaded if still loading
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfilePage);
  } else {
    initProfilePage();
  }

  // Support instant re-rendering when hash changes (e.g. user clicks another candidate profile)
  window.addEventListener('hashchange', initProfilePage);

  // Expose on global Matchly namespace
  window.Matchly = window.Matchly || {};
  window.Matchly.initProfilePage = initProfilePage;
})();

