import { fetchPainting, getJpegUrl, getImageUrl } from './api.js';
import { isAdminMode, adminLink } from './admin.js';
import { renderNavigation } from './nav.js';

export async function renderPaintingDetail(id) {
  const app = document.querySelector('#app');
  const adminMode = isAdminMode();

  // Show loading state
  app.innerHTML = `
    <div class="container">
      <div class="loading">Loading painting...</div>
    </div>
  `;

  try {
    const painting = await fetchPainting(id);
    const backLink = adminMode ? adminLink('/gallery') : '/gallery';

    app.innerHTML = `
      ${renderNavigation()}
      <div class="container">
        <div class="back-link">
          <a href="${backLink}" data-link>← Back to ${adminMode ? 'Storage' : 'Gallery'}</a>
        </div>

        <div class="painting-detail">
          <div class="painting-detail-image">
            <img
              src="${getJpegUrl(painting.catalog_number)}"
              alt="${painting.descriptive_title || painting.artists_title || 'Untitled'}"
            />
            ${painting.dropbox_link_front ? `
              <div class="download-link">
                <a href="${getImageUrl(painting.dropbox_link_front)}" target="_blank" download>
                  Download High-Res TIF →
                </a>
              </div>
            ` : ''}
          </div>

          <div class="painting-detail-info">
            <h1>${painting.descriptive_title || painting.artists_title || 'Untitled'}</h1>

            ${painting.artist_name ? `
              <p class="detail-artist">
                <strong>Artist:</strong> ${painting.artist_name}
                ${painting.name_pinyin ? `<span class="pinyin">(${painting.name_pinyin})</span>` : ''}
              </p>
            ` : ''}

            ${painting.theme ? `
              <p><strong>Theme:</strong> ${painting.theme}</p>
            ` : ''}

            ${painting.medium_detail || painting.medium_type ? `
              <p><strong>Medium:</strong> ${painting.medium_detail || painting.medium_type}</p>
            ` : ''}

            ${painting.dimensions_h && painting.dimensions_w ? `
              <p><strong>Dimensions:</strong> ${painting.dimensions_h} × ${painting.dimensions_w} cm</p>
            ` : ''}

            ${painting.signature_location ? `
              <p><strong>Signature:</strong> ${painting.signature_location}</p>
            ` : ''}

            ${painting.number_of_seals ? `
              <p><strong>Seals:</strong> ${painting.number_of_seals}</p>
            ` : ''}

            ${painting.framed !== null ? `
              <p><strong>Framed:</strong> ${painting.framed ? 'Yes' : 'No'}</p>
            ` : ''}

            ${painting.mounted !== null ? `
              <p><strong>Mounted:</strong> ${painting.mounted ? 'Yes' : 'No'}</p>
            ` : ''}

            ${painting.condition ? `
              <p><strong>Condition:</strong> ${painting.condition}</p>
            ` : ''}

            ${painting.catalog_number ? `
              <p class="catalog-number"><strong>Catalog Number:</strong> ${painting.catalog_number}</p>
            ` : ''}

            ${painting.notes ? `
              <div class="notes">
                <strong>Notes:</strong>
                <p>${painting.notes.replace(/\n/g, '<br>')}</p>
              </div>
            ` : ''}

            <div class="contact-cta">
              <h3>Interested in this painting?</h3>
              <a href="mailto:contact@example.com?subject=Inquiry about ${painting.catalog_number || 'painting'}" class="btn">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

  } catch (error) {
    console.error('Error loading painting:', error);
    const backLink = adminMode ? adminLink('/gallery') : '/gallery';
    app.innerHTML = `
      ${renderNavigation()}
      <div class="container">
        <div class="back-link">
          <a href="${backLink}" data-link>← Back to ${adminMode ? 'Storage' : 'Gallery'}</a>
        </div>
        <div class="error">
          <p>Error loading painting details.</p>
          <p class="error-detail">${error.message}</p>
        </div>
      </div>
    `;
  }
}
