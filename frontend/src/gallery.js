import { fetchPaintings, fetchArtists, fetchPublicExhibitions, getJpegUrl } from './api.js';
import { router } from './router.js';
import { isAdminMode, isAdminParamPresent, setAdminToken, adminLink, buildGalleryUrl } from './admin.js';
import { adminLogin } from './api.js';
import {
  initAdminPanel,
  removeAdminPanel,
  isPaintingInExhibition,
  addPaintingToExhibition,
  setOnExhibitionChange
} from './admin-panel.js';
import { renderNavigation, attachLangToggle } from './nav.js';
import { initLightbox, attachPaintingClickListeners } from './lightbox.js';
import { setPageMeta } from './utils.js';
import { t, tExhibition } from './i18n.js';

// Track current gallery state for re-render
let currentFilters = {};

export async function renderGallery(params) {
  // If ?admin=true is present but no valid token, show login form
  if (isAdminParamPresent() && !isAdminMode()) {
    renderAdminLogin(params);
    return;
  }

  const adminMode = isAdminMode();

  setPageMeta(
    adminMode ? 'Storage - Vermillion Pavilion' : 'Gallery - Vermillion Pavilion',
    adminMode
      ? 'Admin view of all paintings in the Vermillion Pavilion collection.'
      : 'Browse exhibitions of Chinese paintings by Chang Chien-ying and Fei Cheng-wu from the Vermillion Pavilion studio.'
  );

  const app = document.querySelector('#app');

  // Show loading state with navigation
  app.innerHTML = `
    ${renderNavigation()}
    <div class="container">
      <div class="loading">Loading...</div>
    </div>
  `;

  try {
    // Initialize lightbox
    initLightbox();

    if (adminMode) {
      // Admin mode: show all paintings as "storage"
      await renderStorageView(app, params);
      // Initialize admin panel
      setOnExhibitionChange(() => updatePaintingCards());
      await initAdminPanel();

      // Restore scroll position if returning from painting detail
      const savedScroll = sessionStorage.getItem('galleryScrollPosition');
      if (savedScroll) {
        setTimeout(() => {
          window.scrollTo(0, parseInt(savedScroll));
          sessionStorage.removeItem('galleryScrollPosition');
        }, 100);
      }

      // Save scroll position when clicking on paintings
      document.querySelectorAll('.painting-card a').forEach(link => {
        link.addEventListener('click', () => {
          sessionStorage.setItem('galleryScrollPosition', window.scrollY);
        });
      });
    } else {
      // Public mode: show exhibitions index
      await renderExhibitionsIndex(app);
    }

    // Attach lightbox click listeners to painting images
    attachPaintingClickListeners();
  } catch (error) {
    console.error('Error loading gallery:', error);
    app.innerHTML = `
      <div class="container">
        <header>
          <h1>Mist and Clarity</h1>
        </header>
        <div class="error">
          <p>Error loading paintings. Please make sure the backend server is running.</p>
          <p class="error-detail">${error.message}</p>
        </div>
      </div>
    `;
  }
}

// Show login form when ?admin=true but no token
function renderAdminLogin(params) {
  const app = document.querySelector('#app');
  app.innerHTML = `
    ${renderNavigation()}
    <div class="container">
      <div class="admin-login-box">
        <h2>Admin Login</h2>
        <div class="admin-login-form">
          <label for="admin-password">Password</label>
          <input type="password" id="admin-password" placeholder="Enter admin password" autocomplete="current-password" />
          <button id="btn-admin-login" class="btn-small btn-save">Login</button>
          <p id="login-error" class="login-error" hidden>Incorrect password. Please try again.</p>
        </div>
      </div>
    </div>
  `;

  attachLangToggle();

  const input = document.getElementById('admin-password');
  const btn = document.getElementById('btn-admin-login');
  const errorMsg = document.getElementById('login-error');

  async function attemptLogin() {
    const password = input.value;
    if (!password) return;

    btn.disabled = true;
    btn.textContent = 'Logging in…';
    errorMsg.hidden = true;

    try {
      const { token } = await adminLogin(password);
      setAdminToken(token);
      renderGallery(params);
    } catch {
      errorMsg.hidden = false;
      btn.disabled = false;
      btn.textContent = 'Login';
      input.focus();
    }
  }

  btn.addEventListener('click', attemptLogin);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') attemptLogin(); });
  input.focus();
}

// Render the admin storage view (all 580 paintings)
async function renderStorageView(app, params) {
  // Fetch artists for filter
  const artists = await fetchArtists();

  // Get filter from URL params
  currentFilters = {};
  if (params.get('artist_id')) {
    currentFilters.artist_id = params.get('artist_id');
  }
  if (params.get('theme')) {
    currentFilters.theme = params.get('theme');
  }

  // Fetch all paintings
  const paintings = await fetchPaintings(currentFilters);

  // Get unique themes for filter
  const themes = [...new Set(paintings.map(p => p.theme).filter(Boolean))].sort();

  // Render gallery with admin controls
  app.innerHTML = `
    ${renderNavigation()}
    <div class="container gallery-admin">
      <div class="admin-mode-banner">
        <span class="admin-indicator">Storage View (Admin Mode)</span>
        <span class="admin-hint">Click a painting to add it to the exhibition</span>
      </div>

      <div class="filters">
        <div class="filter-group">
          <label for="storage-search">Search:</label>
          <input type="text" id="storage-search" placeholder="Title, artist, or catalogue no." autocomplete="off">
        </div>

        <div class="filter-group">
          <label for="artist-filter">Artist:</label>
          <select id="artist-filter">
            <option value="">All Artists</option>
            ${artists.map(artist => `
              <option value="${artist.id}" ${currentFilters.artist_id == artist.id ? 'selected' : ''}>
                ${artist.name_preferred}
              </option>
            `).join('')}
          </select>
        </div>

        <div class="filter-group">
          <label for="theme-filter">Theme:</label>
          <select id="theme-filter">
            <option value="">All Themes</option>
            ${themes.map(theme => `
              <option value="${theme}" ${currentFilters.theme === theme ? 'selected' : ''}>
                ${theme}
              </option>
            `).join('')}
          </select>
        </div>

        <button id="clear-filters">Clear Filters</button>
      </div>

      <div class="gallery-info">
        <p>Storage: <span id="storage-count">${paintings.length}</span> paintings</p>
      </div>

      <div class="gallery-grid" id="gallery-grid">
        ${paintings.map(painting => renderPaintingCard(painting, true)).join('')}
      </div>
    </div>
  `;

  attachLangToggle();

  // Client-side search filter
  function applyStorageSearch() {
    const query = document.getElementById('storage-search').value.trim().toLowerCase();
    const cards = document.querySelectorAll('#gallery-grid .painting-card');
    let visible = 0;
    cards.forEach(card => {
      const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
      const artist = (card.querySelector('.artist')?.textContent || '').toLowerCase();
      const catalogNum = (card.dataset.catalog || '');
      const matches = !query || title.includes(query) || artist.includes(query) || catalogNum.includes(query);
      card.style.display = matches ? '' : 'none';
      if (matches) visible++;
    });
    const countEl = document.getElementById('storage-count');
    if (countEl) countEl.textContent = visible;
  }

  document.getElementById('storage-search').addEventListener('input', applyStorageSearch);

  // Add filter event listeners
  document.getElementById('artist-filter').addEventListener('change', (e) => {
    const filters = {};
    if (e.target.value) filters.artist_id = e.target.value;
    if (document.getElementById('theme-filter').value) {
      filters.theme = document.getElementById('theme-filter').value;
    }
    router.navigate(buildGalleryUrl(filters));
  });

  document.getElementById('theme-filter').addEventListener('change', (e) => {
    const filters = {};
    if (document.getElementById('artist-filter').value) {
      filters.artist_id = document.getElementById('artist-filter').value;
    }
    if (e.target.value) filters.theme = e.target.value;
    router.navigate(buildGalleryUrl(filters));
  });

  document.getElementById('clear-filters').addEventListener('click', () => {
    document.getElementById('storage-search').value = '';
    router.navigate(buildGalleryUrl({}));
  });

  // Add click handlers for adding paintings to exhibition
  addPaintingClickHandlers();
}

// Render the public exhibitions index (current shows + past exhibitions archive)
async function renderExhibitionsIndex(app) {
  const { current, past } = await fetchPublicExhibitions();

  if (current.length === 0 && past.length === 0) {
    // Nothing public yet
    app.innerHTML = `
      ${renderNavigation()}
      <div class="container">
        <div class="exhibition-empty">
          <h2>${t('gallery.comingSoon')}</h2>
          <p>${t('gallery.comingSoonText')}</p>
        </div>
      </div>
    `;
    attachLangToggle();
    return;
  }

  // Render exhibitions index
  app.innerHTML = `
    ${renderNavigation()}
    <div class="container">
      ${current.length > 0 ? `
        <div class="exhibitions-index-header">
          <h1>${t('gallery.heading')}</h1>
          <p class="exhibitions-subtitle">${t('gallery.subtitle')}</p>
        </div>

        <div class="exhibitions-grid">
          ${current.map(exhibition => renderExhibitionCard(exhibition)).join('')}
        </div>
      ` : `
        <div class="exhibition-empty">
          <h2>${t('gallery.comingSoon')}</h2>
          <p>${t('gallery.comingSoonText')}</p>
        </div>
      `}

      ${past.length > 0 ? `
        <div class="past-exhibitions-section">
          <div class="exhibitions-index-header">
            <h1>${t('gallery.pastHeading')}</h1>
            <p class="exhibitions-subtitle">${t('gallery.pastSubtitle')}</p>
          </div>

          <div class="exhibitions-grid">
            ${past.map(exhibition => renderExhibitionCard(exhibition)).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  attachLangToggle();
}

// Render an exhibition card for the index
function renderExhibitionCard(exhibition) {
  const firstPainting = exhibition.first_painting;
  const count = exhibition.painting_count || 0;
  const displayName = tExhibition(exhibition, 'name');
  const displaySubtitle = tExhibition(exhibition, 'subtitle');

  return `
    <div class="exhibition-card">
      <a href="/exhibition/${exhibition.id}" data-link>
        ${firstPainting ? `
          <div class="exhibition-card-image">
            <img
              src="${getJpegUrl(firstPainting.catalog_number)}"
              alt="${displayName}"
              loading="lazy"
            />
          </div>
        ` : ''}
        <div class="exhibition-card-content">
          <h2 class="exhibition-card-title">${displayName}</h2>
          ${displaySubtitle ? `<p class="exhibition-card-subtitle">${displaySubtitle}</p>` : ''}
          <p class="exhibition-card-count">${count} ${count !== 1 ? t('gallery.paintingsPlural') : t('gallery.paintings')}</p>
          <span class="exhibition-card-link">${t('gallery.viewExhibition')}</span>
        </div>
      </a>
    </div>
  `;
}

// Render a single painting card
function renderPaintingCard(painting, isAdminView) {
  const inExhibition = isAdminView && isPaintingInExhibition(painting.id);

  return `
    <div class="painting-card ${inExhibition ? 'in-exhibition' : ''}" data-id="${painting.id}" data-catalog="${painting.catalog_number || ''}">
      ${isAdminView ? `
        <button class="btn-add-to-exhibition ${inExhibition ? 'in-exhibition' : ''}"
                data-painting='${JSON.stringify(painting).replace(/'/g, "&#39;")}'
                title="${inExhibition ? 'Already in exhibition' : 'Add to exhibition'}">
          ${inExhibition ? '&#10003;' : '+'}
        </button>
        <div class="painting-image">
          <img
            src="${getJpegUrl(painting.catalog_number)}"
            alt="${painting.descriptive_title || painting.artists_title || 'Untitled'}"
            loading="lazy"
          />
        </div>
        <a href="${adminLink('/painting/' + painting.id)}" data-link>
          <div class="painting-info">
            <h3>${painting.descriptive_title || painting.artists_title || 'Untitled'}</h3>
            <p class="artist">${painting.artist_name || 'Unknown Artist'}</p>
            ${painting.theme ? `<p class="theme">${painting.theme}</p>` : ''}
            ${painting.dimensions_h && painting.dimensions_w ?
              `<p class="dimensions">${painting.dimensions_h} × ${painting.dimensions_w} cm</p>`
              : ''}
            <div class="painting-card-action">
              <span class="view-details-link">View Details →</span>
            </div>
          </div>
        </a>
      ` : `
      <a href="/painting/${painting.id}" data-link>
        <div class="painting-image">
          <img
            src="${getJpegUrl(painting.catalog_number)}"
            alt="${painting.descriptive_title || painting.artists_title || 'Untitled'}"
            loading="lazy"
          />
        </div>
        <div class="painting-info">
          <h3>${painting.descriptive_title || painting.artists_title || 'Untitled'}</h3>
          <p class="artist">${painting.artist_name || 'Unknown Artist'}</p>
          ${painting.theme ? `<p class="theme">${painting.theme}</p>` : ''}
          ${painting.dimensions_h && painting.dimensions_w ?
            `<p class="dimensions">${painting.dimensions_h} × ${painting.dimensions_w} cm</p>`
            : ''}
          <div class="painting-card-action">
            <span class="view-details-link">View Details →</span>
          </div>
        </div>
      </a>`}
    </div>
  `;
}

// Add click handlers for the "add to exhibition" buttons
function addPaintingClickHandlers() {
  document.querySelectorAll('.btn-add-to-exhibition').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (btn.classList.contains('in-exhibition')) {
        return; // Already in exhibition
      }

      const paintingData = JSON.parse(btn.dataset.painting);
      const success = await addPaintingToExhibition(paintingData.id, paintingData);

      if (success) {
        // Update the button state
        btn.classList.add('in-exhibition');
        btn.innerHTML = '&#10003;';
        btn.title = 'Already in exhibition';
        btn.closest('.painting-card').classList.add('in-exhibition');
      }
    });
  });
}

// Update painting cards to reflect exhibition state (called when exhibition changes)
function updatePaintingCards() {
  document.querySelectorAll('.painting-card').forEach(card => {
    const paintingId = parseInt(card.dataset.id);
    const inExhibition = isPaintingInExhibition(paintingId);
    const btn = card.querySelector('.btn-add-to-exhibition');

    if (inExhibition) {
      card.classList.add('in-exhibition');
      if (btn) {
        btn.classList.add('in-exhibition');
        btn.innerHTML = '&#10003;';
        btn.title = 'Already in exhibition';
      }
    } else {
      card.classList.remove('in-exhibition');
      if (btn) {
        btn.classList.remove('in-exhibition');
        btn.innerHTML = '+';
        btn.title = 'Add to exhibition';
      }
    }
  });
}
