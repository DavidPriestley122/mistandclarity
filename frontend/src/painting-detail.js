import { fetchPainting, getJpegUrl, getImageUrl } from './api.js';

export async function renderPaintingDetail(id) {
  const app = document.querySelector('#app');

  // Show loading state
  app.innerHTML = `
    <div class="container">
      <div class="loading">Loading painting...</div>
    </div>
  `;

  try {
    const painting = await fetchPainting(id);

    app.innerHTML = `
      <div class="container">
        <div class="back-link">
          <a href="/" data-link>← Back to Gallery</a>
        </div>

        <div class="painting-detail">
          <div class="painting-detail-image">
            <img
              src="${getJpegUrl(painting.jpeg_url_front)}"
              alt="${painting.descriptive_title || painting.artists_title || 'Untitled'}"
            />
            ${painting.jpeg_url_reverse ? `
              <div class="reverse-image-link">
                <a href="${getJpegUrl(painting.jpeg_url_reverse)}" target="_blank">
                  View reverse side →
                </a>
              </div>
            ` : ''}
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
    app.innerHTML = `
      <div class="container">
        <div class="back-link">
          <a href="/" data-link>← Back to Gallery</a>
        </div>
        <div class="error">
          <p>Error loading painting details.</p>
          <p class="error-detail">${error.message}</p>
        </div>
      </div>
    `;
  }
}
