import { renderNavigation } from './nav.js';
import { fetchCollection, getJpegUrl } from './api.js';
import { initLightbox, attachPaintingClickListeners } from './lightbox.js';

export async function renderExhibitionDetail(exhibitionId) {
  const app = document.querySelector('#app');

  // Show loading state
  app.innerHTML = `
    ${renderNavigation()}
    <div class="container">
      <div class="loading">Loading exhibition...</div>
    </div>
  `;

  try {
    // Fetch exhibition details using API function
    const data = await fetchCollection(exhibitionId);
    const { collection, paintings } = data;

    if (!collection || paintings.length === 0) {
      app.innerHTML = `
        ${renderNavigation()}
        <div class="container">
          <div class="back-link">
            <a href="/gallery" data-link>← Back to Gallery</a>
          </div>
          <div class="exhibition-empty">
            <h2>Exhibition Not Found</h2>
            <p>This exhibition is not available.</p>
          </div>
        </div>
      `;
      return;
    }

    // Render exhibition
    app.innerHTML = `
      ${renderNavigation()}
      <div class="container">
        <div class="back-link">
          <a href="/gallery" data-link>← Back to Gallery</a>
        </div>

        <div class="exhibition-header">
          <h2 class="exhibition-title">${collection.name}</h2>
          ${collection.description ? `<p class="exhibition-description">${collection.description}</p>` : ''}
          <p class="exhibition-count">${paintings.length} painting${paintings.length !== 1 ? 's' : ''}</p>
        </div>

        <div class="gallery-grid">
          ${paintings.map(painting => renderPaintingCard(painting)).join('')}
        </div>
      </div>
    `;

    // Initialize lightbox and attach click listeners
    initLightbox();
    attachPaintingClickListeners();

  } catch (error) {
    console.error('Error loading exhibition:', error);
    app.innerHTML = `
      ${renderNavigation()}
      <div class="container">
        <div class="back-link">
          <a href="/gallery" data-link>← Back to Gallery</a>
        </div>
        <div class="error">
          <p>Error loading exhibition details.</p>
          <p class="error-detail">${error.message}</p>
        </div>
      </div>
    `;
  }
}

function renderPaintingCard(painting) {
  return `
    <div class="painting-card" data-id="${painting.id}">
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
      </a>
    </div>
  `;
}
