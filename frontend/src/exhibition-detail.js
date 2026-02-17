import { renderNavigation, attachLangToggle } from './nav.js';
import { fetchCollection, getJpegUrl } from './api.js';
import { initLightbox, attachPaintingClickListeners } from './lightbox.js';
import { setPageMeta } from './utils.js';
import { t, tExhibition } from './i18n.js';

export async function renderExhibitionDetail(exhibitionId) {
  const app = document.querySelector('#app');

  // Show loading state
  app.innerHTML = `
    ${renderNavigation()}
    <div class="container">
      <div class="loading">Loading...</div>
    </div>
  `;
  attachLangToggle();

  try {
    // Fetch exhibition details using API function
    const data = await fetchCollection(exhibitionId);
    const { collection, paintings } = data;

    if (!collection || paintings.length === 0) {
      setPageMeta(
        'Exhibition Not Found - Vermillion Pavilion',
        'This exhibition is not available.'
      );
      app.innerHTML = `
        ${renderNavigation()}
        <div class="container">
          <div class="back-link">
            <a href="/gallery" data-link>${t('exhibitionDetail.backToGallery')}</a>
          </div>
          <div class="exhibition-empty">
            <h2>${t('exhibitionDetail.notFoundHeading')}</h2>
            <p>${t('exhibitionDetail.notFoundText')}</p>
          </div>
        </div>
      `;
      attachLangToggle();
      return;
    }

    const displayName = tExhibition(collection, 'name');
    const displaySubtitle = tExhibition(collection, 'subtitle');
    const displayIntro = tExhibition(collection, 'introduction');

    // Set page meta with exhibition details
    setPageMeta(
      `${displayName} - Vermillion Pavilion`,
      displaySubtitle || displayIntro || `${displayName} - A curated exhibition of ${paintings.length} painting${paintings.length !== 1 ? 's' : ''} by Chang Chien-ying and Fei Cheng-wu.`
    );

    const count = paintings.length;

    // Render exhibition
    app.innerHTML = `
      ${renderNavigation()}
      <div class="container">
        <div class="back-link">
          <a href="/gallery" data-link>${t('exhibitionDetail.backToGallery')}</a>
        </div>

        <div class="exhibition-header">
          <h2 class="exhibition-title">${displayName}</h2>
          ${displaySubtitle ? `<p class="exhibition-subtitle">${displaySubtitle}</p>` : ''}
          ${displayIntro ? `<p class="exhibition-introduction">${displayIntro}</p>` : ''}
          <p class="exhibition-count">${count} ${count !== 1 ? t('exhibitionDetail.paintingsPlural') : t('exhibitionDetail.paintings')}</p>
        </div>

        <div class="gallery-grid">
          ${paintings.map(painting => renderPaintingCard(painting)).join('')}
        </div>
      </div>
    `;

    attachLangToggle();

    // Initialize lightbox and attach click listeners
    initLightbox();
    attachPaintingClickListeners();

  } catch (error) {
    console.error('Error loading exhibition:', error);
    app.innerHTML = `
      ${renderNavigation()}
      <div class="container">
        <div class="back-link">
          <a href="/gallery" data-link>${t('exhibitionDetail.backToGallery')}</a>
        </div>
        <div class="error">
          <p>${t('exhibitionDetail.errorText')}</p>
          <p class="error-detail">${error.message}</p>
        </div>
      </div>
    `;
    attachLangToggle();
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
