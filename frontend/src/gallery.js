import { fetchPaintings, fetchArtists, fetchActiveExhibition, getJpegUrl } from './api.js';
import { router } from './router.js';
import { isAdminMode, adminLink, buildGalleryUrl } from './admin.js';
import {
  initAdminPanel,
  removeAdminPanel,
  isPaintingInExhibition,
  addPaintingToExhibition,
  setOnExhibitionChange
} from './admin-panel.js';
import { renderNavigation } from './nav.js';
import { initLightbox, attachPaintingClickListeners } from './lightbox.js';

// Track current gallery state for re-render
let currentFilters = {};

export async function renderGallery(params) {
  const app = document.querySelector('#app');
  const adminMode = isAdminMode();

  // Show loading state
  app.innerHTML = `
    <div class="container">
      <header>
        <h1>Mist and Clarity</h1>
        <p class="subtitle">Paintings by Fei Cheng-wu and Chang Chien-ying</p>
      </header>
      <div class="loading">Loading paintings...</div>
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
    } else {
      // Public mode: show active exhibition only
      await renderExhibitionView(app);
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
        <p>Storage: ${paintings.length} paintings total</p>
      </div>

      <div class="gallery-grid" id="gallery-grid">
        ${paintings.map(painting => renderPaintingCard(painting, true)).join('')}
      </div>
    </div>
  `;

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
    router.navigate(buildGalleryUrl({}));
  });

  // Add click handlers for adding paintings to exhibition
  addPaintingClickHandlers();
}

// Render the public exhibition view
async function renderExhibitionView(app) {
  // Fetch active exhibition
  const { collection, paintings } = await fetchActiveExhibition();

  if (!collection || paintings.length === 0) {
    // No active exhibition
    app.innerHTML = `
      ${renderNavigation()}
      <div class="container">
        <div class="exhibition-empty">
          <h2>Exhibition Coming Soon</h2>
          <p>We are preparing a new exhibition. Please check back soon.</p>
        </div>
      </div>
    `;
    return;
  }

  // Render exhibition
  app.innerHTML = `
    ${renderNavigation()}
    <div class="container">
      <div class="exhibition-header">
        <h2 class="exhibition-title">${collection.name}</h2>
        ${collection.description ? `<p class="exhibition-description">${collection.description}</p>` : ''}
        <p class="exhibition-count">${paintings.length} painting${paintings.length !== 1 ? 's' : ''}</p>
      </div>

      <div class="gallery-grid">
        ${paintings.map(painting => renderPaintingCard(painting, false)).join('')}
      </div>
    </div>
  `;
}

// Render a single painting card
function renderPaintingCard(painting, isAdminView) {
  const inExhibition = isAdminView && isPaintingInExhibition(painting.id);

  return `
    <div class="painting-card ${inExhibition ? 'in-exhibition' : ''}" data-id="${painting.id}">
      ${isAdminView ? `
        <button class="btn-add-to-exhibition ${inExhibition ? 'in-exhibition' : ''}"
                data-painting='${JSON.stringify(painting).replace(/'/g, "&#39;")}'
                title="${inExhibition ? 'Already in exhibition' : 'Add to exhibition'}">
          ${inExhibition ? '&#10003;' : '+'}
        </button>
      ` : ''}
      <a href="${isAdminView ? adminLink('/painting/' + painting.id) : '/painting/' + painting.id}" data-link>
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
      </a>
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
