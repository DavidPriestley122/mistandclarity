import { fetchPainting, getJpegUrl, updatePainting } from './api.js';
import { isAdminMode, adminLink } from './admin.js';
import { renderNavigation } from './nav.js';
import { initLightbox, attachPaintingClickListeners } from './lightbox.js';
import { setPageMeta } from './utils.js';

// Helper function to format price display
function formatPriceDisplay(painting) {
  if (!painting.sale_status || painting.sale_status === 'available') {
    if (painting.asking_price) {
      return `<p class="price-info"><strong>Price:</strong> £${Number(painting.asking_price).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>`;
    }
    return '';
  } else if (painting.sale_status === 'sold') {
    return `<p class="price-info sold"><strong>SOLD</strong></p>`;
  } else if (painting.sale_status === 'not_for_sale') {
    return `<p class="price-info"><strong>Not for sale</strong></p>`;
  }
  return '';
}

// State for edit mode
let paintingState = {
  painting: null,
  isEditing: false
};

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
    paintingState.painting = painting;
    paintingState.isEditing = false;

    // Set page meta with painting details
    const paintingTitle = painting.descriptive_title || painting.artists_title || 'Untitled';
    setPageMeta(
      `${paintingTitle} - Vermillion Pavilion`,
      `${paintingTitle} by ${painting.artist_name || 'Unknown Artist'}. ${painting.theme ? painting.theme + '. ' : ''}View details, dimensions, and condition for this Chinese painting from the Vermillion Pavilion collection.`
    );

    renderPaintingContent(adminMode);

    // Initialize lightbox and attach click listeners
    initLightbox();
    attachPaintingClickListeners();

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

// Render the painting content (view or edit mode)
function renderPaintingContent(adminMode) {
  const app = document.querySelector('#app');
  const painting = paintingState.painting;
  const backLink = adminMode ? adminLink('/gallery') : '/gallery';

  if (paintingState.isEditing && adminMode) {
    // Edit mode
    app.innerHTML = `
      ${renderNavigation()}
      <div class="container">
        <div class="back-link">
          <a href="${backLink}" data-link>← Back to Storage</a>
        </div>

        <div class="painting-detail">
          <div class="painting-detail-image">
            <img
              src="${getJpegUrl(painting.catalog_number)}"
              alt="${painting.descriptive_title || painting.artists_title || 'Untitled'}"
            />
          </div>

          <div class="painting-detail-info painting-edit-form">
            <h2>Edit Painting</h2>

            <div class="edit-field">
              <label for="edit-descriptive-title">Descriptive Title:</label>
              <input type="text" id="edit-descriptive-title" value="${painting.descriptive_title || ''}" placeholder="Descriptive title">
            </div>

            <div class="edit-field">
              <label for="edit-artists-title">Artist's Title:</label>
              <input type="text" id="edit-artists-title" value="${painting.artists_title || ''}" placeholder="Artist's title">
            </div>

            <div class="edit-field">
              <label for="edit-theme">Theme:</label>
              <input type="text" id="edit-theme" value="${painting.theme || ''}" placeholder="Theme">
            </div>

            <div class="edit-field">
              <label for="edit-medium-type">Medium Type:</label>
              <input type="text" id="edit-medium-type" value="${painting.medium_type || ''}" placeholder="e.g., Oil on canvas">
            </div>

            <div class="edit-field">
              <label for="edit-medium-detail">Medium Detail:</label>
              <textarea id="edit-medium-detail" rows="2" placeholder="Additional medium details">${painting.medium_detail || ''}</textarea>
            </div>

            <div class="edit-field-row">
              <div class="edit-field">
                <label for="edit-dimensions-h">Height (cm):</label>
                <input type="number" step="0.1" id="edit-dimensions-h" value="${painting.dimensions_h || ''}" placeholder="Height">
              </div>
              <div class="edit-field">
                <label for="edit-dimensions-w">Width (cm):</label>
                <input type="number" step="0.1" id="edit-dimensions-w" value="${painting.dimensions_w || ''}" placeholder="Width">
              </div>
            </div>

            <div class="edit-field">
              <label for="edit-signature-location">Signature Location:</label>
              <input type="text" id="edit-signature-location" value="${painting.signature_location || ''}" placeholder="e.g., Bottom right">
            </div>

            <div class="edit-field">
              <label for="edit-number-of-seals">Number of Seals:</label>
              <input type="number" id="edit-number-of-seals" value="${painting.number_of_seals || ''}" placeholder="Number">
            </div>

            <div class="edit-field-row">
              <div class="edit-field">
                <label>
                  <input type="checkbox" id="edit-framed" ${painting.framed ? 'checked' : ''}>
                  Framed
                </label>
              </div>
              <div class="edit-field">
                <label>
                  <input type="checkbox" id="edit-mounted" ${painting.mounted ? 'checked' : ''}>
                  Mounted
                </label>
              </div>
            </div>

            <div class="edit-field">
              <label for="edit-condition">Condition:</label>
              <input type="text" id="edit-condition" value="${painting.condition || ''}" placeholder="Condition">
            </div>

            <div class="edit-field">
              <label for="edit-notes">Notes:</label>
              <textarea id="edit-notes" rows="5" placeholder="Additional notes">${painting.notes || ''}</textarea>
            </div>

            <div class="edit-field">
              <label for="edit-asking-price">Asking Price (£):</label>
              <input type="number" step="0.01" id="edit-asking-price" value="${painting.asking_price || ''}" placeholder="e.g., 5000">
            </div>

            <div class="edit-field">
              <label for="edit-sale-status">Sale Status:</label>
              <select id="edit-sale-status">
                <option value="available" ${painting.sale_status === 'available' ? 'selected' : ''}>Available</option>
                <option value="sold" ${painting.sale_status === 'sold' ? 'selected' : ''}>Sold</option>
                <option value="not_for_sale" ${painting.sale_status === 'not_for_sale' ? 'selected' : ''}>Not for sale</option>
              </select>
            </div>

            <div class="edit-actions">
              <button id="btn-save-painting" class="btn-small btn-save">Save Changes</button>
              <button id="btn-cancel-edit" class="btn-small">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add event listeners
    document.getElementById('btn-save-painting').addEventListener('click', savePaintingChanges);
    document.getElementById('btn-cancel-edit').addEventListener('click', cancelEdit);
  } else {
    // View mode
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
          </div>

          <div class="painting-detail-info">
            <div class="painting-title-row">
              <h1>${painting.descriptive_title || painting.artists_title || 'Untitled'}</h1>
              ${adminMode ? '<button id="btn-edit-painting" class="btn-edit-info" title="Edit painting">✎</button>' : ''}
            </div>

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

            ${formatPriceDisplay(painting)}

            ${painting.notes ? `
              <div class="notes">
                <strong>Notes:</strong>
                <p>${painting.notes.replace(/\n/g, '<br>')}</p>
              </div>
            ` : ''}

            ${!adminMode ? `
              <div class="contact-cta">
                <h3>Interested in this painting?</h3>
                <a href="mailto:contact@example.com?subject=Inquiry about ${painting.catalog_number || 'painting'}" class="btn">
                  Contact Us
                </a>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    // Add edit button listener if in admin mode
    if (adminMode) {
      const editBtn = document.getElementById('btn-edit-painting');
      if (editBtn) {
        editBtn.addEventListener('click', enableEditMode);
      }
    }
  }
}

// Enable edit mode
function enableEditMode() {
  paintingState.isEditing = true;
  renderPaintingContent(true);
}

// Cancel edit mode
function cancelEdit() {
  paintingState.isEditing = false;
  renderPaintingContent(true);
}

// Save painting changes
async function savePaintingChanges() {
  const updates = {
    descriptive_title: document.getElementById('edit-descriptive-title').value.trim() || null,
    artists_title: document.getElementById('edit-artists-title').value.trim() || null,
    theme: document.getElementById('edit-theme').value.trim() || null,
    medium_type: document.getElementById('edit-medium-type').value.trim() || null,
    medium_detail: document.getElementById('edit-medium-detail').value.trim() || null,
    dimensions_h: parseFloat(document.getElementById('edit-dimensions-h').value) || null,
    dimensions_w: parseFloat(document.getElementById('edit-dimensions-w').value) || null,
    signature_location: document.getElementById('edit-signature-location').value.trim() || null,
    number_of_seals: parseInt(document.getElementById('edit-number-of-seals').value) || null,
    framed: document.getElementById('edit-framed').checked,
    mounted: document.getElementById('edit-mounted').checked,
    condition: document.getElementById('edit-condition').value.trim() || null,
    notes: document.getElementById('edit-notes').value.trim() || null,
    asking_price: parseFloat(document.getElementById('edit-asking-price').value) || null,
    sale_status: document.getElementById('edit-sale-status').value
  };

  try {
    const updatedPainting = await updatePainting(paintingState.painting.id, updates);
    paintingState.painting = { ...paintingState.painting, ...updatedPainting };
    paintingState.isEditing = false;
    renderPaintingContent(true);
    alert('Painting updated successfully!');
  } catch (error) {
    console.error('Failed to update painting:', error);
    alert('Failed to update painting. Please try again.');
  }
}
