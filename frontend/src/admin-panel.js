// Admin Panel Component for Exhibition Management
import {
  fetchActiveExhibition,
  fetchCollections,
  createCollection,
  addToExhibition,
  removeFromExhibition,
  reorderExhibition,
  activateExhibition,
  updateCollection,
  deleteCollection,
  getJpegUrl
} from './api.js';
import { adminLink } from './admin.js';

// Global state for the admin panel
let adminPanelState = {
  isOpen: true,
  currentExhibition: null,
  exhibitions: [],
  exhibitionPaintings: [],
  paintingIdsInExhibition: new Set(),
  viewMode: 'preview', // 'list' or 'preview'
  isEditingInfo: false
};

// Event callbacks for gallery integration
let onExhibitionChange = null;

export function setOnExhibitionChange(callback) {
  onExhibitionChange = callback;
}

// Initialize the admin panel
export async function initAdminPanel() {
  await loadExhibitionData();
  renderAdminPanel();
}

// Load exhibition data from API
async function loadExhibitionData() {
  try {
    const [activeResult, collections] = await Promise.all([
      fetchActiveExhibition(),
      fetchCollections()
    ]);

    adminPanelState.exhibitions = collections;
    adminPanelState.currentExhibition = activeResult.collection;
    adminPanelState.exhibitionPaintings = activeResult.paintings || [];
    adminPanelState.paintingIdsInExhibition = new Set(
      adminPanelState.exhibitionPaintings.map(p => p.id)
    );
  } catch (error) {
    console.error('Failed to load exhibition data:', error);
  }
}

// Check if a painting is in the current exhibition
export function isPaintingInExhibition(paintingId) {
  return adminPanelState.paintingIdsInExhibition.has(paintingId);
}

// Get the current exhibition ID
export function getCurrentExhibitionId() {
  return adminPanelState.currentExhibition?.id || null;
}

// Get exhibition paintings
export function getExhibitionPaintings() {
  return adminPanelState.exhibitionPaintings;
}

// Add a painting to the exhibition
export async function addPaintingToExhibition(paintingId, paintingData) {
  const collectionId = getCurrentExhibitionId();
  if (!collectionId) {
    alert('No active exhibition. Please create or activate an exhibition first.');
    return false;
  }

  try {
    await addToExhibition(collectionId, paintingId);
    adminPanelState.paintingIdsInExhibition.add(paintingId);
    adminPanelState.exhibitionPaintings.push(paintingData);
    renderExhibitionPaintingsList();
    if (onExhibitionChange) onExhibitionChange();
    return true;
  } catch (error) {
    if (error.message === 'Painting already in exhibition') {
      // Silently succeed - it's already there
      adminPanelState.paintingIdsInExhibition.add(paintingId);
      if (onExhibitionChange) onExhibitionChange();
      return true;
    } else {
      console.error('Failed to add painting:', error);
      // Show brief error but don't block - might be temporary connection issue
      const statusEl = document.querySelector('.exhibition-info strong');
      if (statusEl) {
        const originalText = statusEl.textContent;
        statusEl.textContent = 'Connection error - try again';
        statusEl.style.color = '#D32F2F';
        setTimeout(() => {
          statusEl.textContent = originalText;
          statusEl.style.color = '';
        }, 2000);
      }
    }
    return false;
  }
}

// Remove a painting from the exhibition
export async function removePaintingFromExhibition(paintingId) {
  const collectionId = getCurrentExhibitionId();
  if (!collectionId) return false;

  try {
    await removeFromExhibition(collectionId, paintingId);
    adminPanelState.paintingIdsInExhibition.delete(paintingId);
    adminPanelState.exhibitionPaintings = adminPanelState.exhibitionPaintings.filter(
      p => p.id !== paintingId
    );
    renderExhibitionPaintingsList();
    if (onExhibitionChange) onExhibitionChange();
    return true;
  } catch (error) {
    console.error('Failed to remove painting:', error);
    alert('Failed to remove painting from exhibition.');
    return false;
  }
}

// Move a painting up in the order
async function movePaintingUp(index) {
  if (index <= 0) return;

  const paintings = adminPanelState.exhibitionPaintings;
  [paintings[index - 1], paintings[index]] = [paintings[index], paintings[index - 1]];

  await saveExhibitionOrder();
  renderExhibitionPaintingsList();
}

// Move a painting down in the order
async function movePaintingDown(index) {
  const paintings = adminPanelState.exhibitionPaintings;
  if (index >= paintings.length - 1) return;

  [paintings[index], paintings[index + 1]] = [paintings[index + 1], paintings[index]];

  await saveExhibitionOrder();
  renderExhibitionPaintingsList();
}

// Save the current exhibition order
async function saveExhibitionOrder() {
  const collectionId = getCurrentExhibitionId();
  if (!collectionId) return;

  const paintingIds = adminPanelState.exhibitionPaintings.map(p => p.id);
  try {
    await reorderExhibition(collectionId, paintingIds);
  } catch (error) {
    console.error('Failed to save exhibition order:', error);
  }
}

// Create a new exhibition
function handleCreateExhibition() {
  showExhibitionModal();
}

// Show modal for creating new exhibition
function showExhibitionModal() {
  // Create modal HTML
  const modalHTML = `
    <div id="exhibition-modal" class="modal-overlay">
      <div class="modal-content">
        <h2>Create New Exhibition</h2>
        <form id="exhibition-form">
          <div class="form-group">
            <label for="exhibition-title">Title *</label>
            <input type="text" id="exhibition-title" required placeholder="e.g., Bird and Flower Paintings">
          </div>

          <div class="form-group">
            <label for="exhibition-subtitle">Subtitle</label>
            <input type="text" id="exhibition-subtitle" placeholder="e.g., Works from the 1950s">
          </div>

          <div class="form-group">
            <label for="exhibition-intro">Introduction</label>
            <textarea id="exhibition-intro" rows="5" placeholder="Write a short introduction to the exhibition..."></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" id="modal-cancel">Cancel</button>
            <button type="submit" class="btn-primary">Create Exhibition</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Add event listeners
  document.getElementById('modal-cancel').addEventListener('click', closeExhibitionModal);
  document.getElementById('exhibition-modal').addEventListener('click', (e) => {
    if (e.target.id === 'exhibition-modal') closeExhibitionModal();
  });
  document.getElementById('exhibition-form').addEventListener('submit', handleExhibitionSubmit);

  // Focus on first field
  document.getElementById('exhibition-title').focus();
}

// Close exhibition modal
function closeExhibitionModal() {
  const modal = document.getElementById('exhibition-modal');
  if (modal) modal.remove();
}

// Handle exhibition form submission
async function handleExhibitionSubmit(e) {
  e.preventDefault();

  const title = document.getElementById('exhibition-title').value.trim();
  const subtitle = document.getElementById('exhibition-subtitle').value.trim();
  const introduction = document.getElementById('exhibition-intro').value.trim();

  if (!title) {
    alert('Title is required');
    return;
  }

  try {
    const newCollection = await createCollection(title, '', subtitle, introduction);
    adminPanelState.exhibitions.unshift(newCollection);
    renderExhibitionSelector();
    closeExhibitionModal();
    alert(`Exhibition "${title}" created successfully!`);
  } catch (error) {
    console.error('Failed to create exhibition:', error);
    alert('Failed to create exhibition. Please try again.');
  }
}

// Delete an exhibition
async function handleDeleteExhibition() {
  const currentExhibition = getCurrentExhibition();
  if (!currentExhibition) return;

  const confirmDelete = confirm(
    `Are you sure you want to delete "${currentExhibition.name}"?\n\n` +
    `This will permanently remove the exhibition and all its paintings.\n\n` +
    `This action cannot be undone.`
  );

  if (!confirmDelete) return;

  try {
    await deleteCollection(currentExhibition.id);

    // Remove from local state
    adminPanelState.exhibitions = adminPanelState.exhibitions.filter(
      ex => ex.id !== currentExhibition.id
    );

    // Clear current exhibition
    adminPanelState.currentExhibitionId = null;
    adminPanelState.exhibitionPaintings = [];
    adminPanelState.paintingIdsInExhibition = new Set();

    // Refresh UI
    renderExhibitionSelector();
    renderExhibitionInfo();
    renderExhibitionPaintings();

    alert(`Exhibition "${currentExhibition.name}" deleted successfully.`);
  } catch (error) {
    console.error('Failed to delete exhibition:', error);
    alert('Failed to delete exhibition. Please try again.');
  }
}

// Switch to a different exhibition
async function handleExhibitionSwitch(collectionId) {
  if (!collectionId) return;

  try {
    await activateExhibition(collectionId);
    await loadExhibitionData();
    renderAdminPanel();
    if (onExhibitionChange) onExhibitionChange();
  } catch (error) {
    console.error('Failed to switch exhibition:', error);
    alert('Failed to activate exhibition.');
  }
}

// Enable editing mode for exhibition info
function enableEditingExhibitionInfo() {
  adminPanelState.isEditingInfo = true;
  renderExhibitionInfo();
}

// Cancel editing exhibition info
function cancelEditingExhibitionInfo() {
  adminPanelState.isEditingInfo = false;
  renderExhibitionInfo();
}

// Save exhibition info changes
async function saveExhibitionInfo() {
  const nameInput = document.getElementById('edit-exhibition-name');
  const subtitleInput = document.getElementById('edit-exhibition-subtitle');
  const introInput = document.getElementById('edit-exhibition-introduction');

  if (!nameInput) return;

  const newName = nameInput.value.trim();
  const newSubtitle = subtitleInput ? subtitleInput.value.trim() : '';
  const newIntroduction = introInput ? introInput.value.trim() : '';

  if (!newName) {
    alert('Exhibition name cannot be empty.');
    return;
  }

  const collectionId = getCurrentExhibitionId();
  if (!collectionId) return;

  try {
    await updateCollection(collectionId, {
      name: newName,
      subtitle: newSubtitle,
      introduction: newIntroduction
    });

    // Update local state
    adminPanelState.currentExhibition.name = newName;
    adminPanelState.currentExhibition.subtitle = newSubtitle;
    adminPanelState.currentExhibition.introduction = newIntroduction;

    // Update the exhibition in the list
    const exhibition = adminPanelState.exhibitions.find(ex => ex.id === collectionId);
    if (exhibition) {
      exhibition.name = newName;
      exhibition.subtitle = newSubtitle;
      exhibition.introduction = newIntroduction;
    }

    adminPanelState.isEditingInfo = false;
    renderExhibitionInfo();
    renderExhibitionSelector();

    if (onExhibitionChange) onExhibitionChange();
  } catch (error) {
    console.error('Failed to update exhibition info:', error);
    alert('Failed to update exhibition information.');
  }
}

// Render the exhibition info section
function renderExhibitionInfo() {
  const container = document.getElementById('exhibition-info-container');
  if (!container) return;

  const currentExhibition = adminPanelState.currentExhibition;
  const paintingCount = adminPanelState.exhibitionPaintings.length;

  if (adminPanelState.isEditingInfo && currentExhibition) {
    container.innerHTML = `
      <div class="exhibition-info-edit">
        <div class="edit-field">
          <label for="edit-exhibition-name">Title:</label>
          <input type="text"
                 id="edit-exhibition-name"
                 value="${currentExhibition.name || ''}"
                 placeholder="Exhibition title">
        </div>
        <div class="edit-field">
          <label for="edit-exhibition-subtitle">Subtitle:</label>
          <input type="text"
                 id="edit-exhibition-subtitle"
                 value="${currentExhibition.subtitle || ''}"
                 placeholder="e.g., Works from the 1950s">
        </div>
        <div class="edit-field">
          <label for="edit-exhibition-introduction">Introduction:</label>
          <textarea id="edit-exhibition-introduction"
                    rows="3"
                    placeholder="Write a short introduction to the exhibition...">${currentExhibition.introduction || ''}</textarea>
        </div>
        <div class="edit-actions">
          <button id="btn-save-info" class="btn-small btn-save">Save</button>
          <button id="btn-cancel-info" class="btn-small">Cancel</button>
        </div>
      </div>
      <div class="painting-count">${paintingCount} painting${paintingCount !== 1 ? 's' : ''}</div>
    `;

    // Add event listeners
    document.getElementById('btn-save-info').addEventListener('click', saveExhibitionInfo);
    document.getElementById('btn-cancel-info').addEventListener('click', cancelEditingExhibitionInfo);
  } else {
    container.innerHTML = `
      <div class="exhibition-info">
        <div class="exhibition-name-row">
          <strong>${currentExhibition?.name || 'No exhibition selected'}</strong>
          <div class="exhibition-actions">
            ${currentExhibition ? '<button id="btn-edit-info" class="btn-edit-info" title="Edit exhibition info">✎</button>' : ''}
            ${currentExhibition ? '<button id="btn-delete-exhibition" class="btn-delete-info" title="Delete exhibition">🗑</button>' : ''}
          </div>
        </div>
        ${currentExhibition?.subtitle ? `<p class="exhibition-subtitle">${currentExhibition.subtitle}</p>` : ''}
        <span class="painting-count">${paintingCount} painting${paintingCount !== 1 ? 's' : ''}</span>
      </div>
      ${currentExhibition?.introduction ? `<p class="exhibition-description">${currentExhibition.introduction}</p>` : ''}
    `;

    // Add event listener for edit button
    const editBtn = document.getElementById('btn-edit-info');
    if (editBtn) {
      editBtn.addEventListener('click', enableEditingExhibitionInfo);
    }

    // Add event listener for delete button
    const deleteBtn = document.getElementById('btn-delete-exhibition');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', handleDeleteExhibition);
    }
  }
}

// Toggle panel open/closed
function togglePanel() {
  adminPanelState.isOpen = !adminPanelState.isOpen;
  const panel = document.getElementById('admin-panel');
  const toggleBtn = document.getElementById('admin-panel-toggle');

  if (adminPanelState.isOpen) {
    panel.classList.remove('collapsed');
    toggleBtn.textContent = '>';
  } else {
    panel.classList.add('collapsed');
    toggleBtn.textContent = '<';
  }
}

// Render the exhibition selector dropdown
function renderExhibitionSelector() {
  const selector = document.getElementById('exhibition-selector');
  if (!selector) return;

  const currentId = getCurrentExhibitionId();

  selector.innerHTML = `
    <option value="">-- Select Exhibition --</option>
    ${adminPanelState.exhibitions.map(ex => `
      <option value="${ex.id}" ${ex.id === currentId ? 'selected' : ''}>
        ${ex.name} ${ex.is_active ? '(Active)' : ''}
      </option>
    `).join('')}
  `;
}

// Toggle between list and preview view modes
function toggleViewMode() {
  adminPanelState.viewMode = adminPanelState.viewMode === 'list' ? 'preview' : 'list';
  renderExhibitionPaintingsList();

  // Update button text
  const toggleBtn = document.getElementById('btn-toggle-view');
  if (toggleBtn) {
    toggleBtn.textContent = adminPanelState.viewMode === 'list' ? 'Grid View' : 'List View';
  }
}

// Render the list of paintings in the current exhibition
function renderExhibitionPaintingsList() {
  const container = document.getElementById('exhibition-paintings-list');
  if (!container) return;

  if (adminPanelState.exhibitionPaintings.length === 0) {
    container.innerHTML = '<p class="empty-message">No paintings in exhibition yet. Add paintings from the gallery.</p>';
    return;
  }

  if (adminPanelState.viewMode === 'preview') {
    renderPreviewMode(container);
  } else {
    renderListMode(container);
  }
}

// Render compact list mode with up/down arrows
function renderListMode(container) {
  container.className = 'exhibition-paintings-list-mode';
  container.innerHTML = adminPanelState.exhibitionPaintings.map((painting, index) => `
    <div class="exhibition-painting-item" data-id="${painting.id}">
      <div class="painting-thumb">
        <img src="${getJpegUrl(painting.catalog_number)}" alt="${painting.descriptive_title || 'Painting'}" />
      </div>
      <div class="painting-details">
        <span class="painting-title">${painting.descriptive_title || painting.artists_title || 'Untitled'}</span>
        <span class="painting-artist">${painting.artist_name || 'Unknown'}</span>
      </div>
      <div class="painting-actions">
        <button class="btn-move-up" data-index="${index}" ${index === 0 ? 'disabled' : ''} title="Move up">&#9650;</button>
        <button class="btn-move-down" data-index="${index}" ${index === adminPanelState.exhibitionPaintings.length - 1 ? 'disabled' : ''} title="Move down">&#9660;</button>
        <button class="btn-remove" data-id="${painting.id}" title="Remove from exhibition">&times;</button>
      </div>
    </div>
  `).join('');

  // Add event listeners
  container.querySelectorAll('.btn-move-up').forEach(btn => {
    btn.addEventListener('click', () => movePaintingUp(parseInt(btn.dataset.index)));
  });

  container.querySelectorAll('.btn-move-down').forEach(btn => {
    btn.addEventListener('click', () => movePaintingDown(parseInt(btn.dataset.index)));
  });

  container.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', () => removePaintingFromExhibition(parseInt(btn.dataset.id)));
  });
}

// Render visual preview mode with drag-and-drop
function renderPreviewMode(container) {
  container.className = 'exhibition-paintings-preview-mode';
  container.innerHTML = adminPanelState.exhibitionPaintings.map((painting, index) => `
    <div class="preview-painting-card"
         data-id="${painting.id}"
         data-index="${index}"
         draggable="true">
      <button class="preview-remove-btn" data-id="${painting.id}" title="Remove from exhibition">&times;</button>
      <div class="preview-painting-image">
        <img src="${getJpegUrl(painting.catalog_number)}"
             alt="${painting.descriptive_title || painting.artists_title || 'Untitled'}" />
      </div>
      <div class="preview-painting-info">
        <div class="preview-painting-title">${painting.descriptive_title || painting.artists_title || 'Untitled'}</div>
        <div class="preview-painting-artist">${painting.artist_name || 'Unknown'}</div>
      </div>
      <div class="preview-order-number">#${index + 1}</div>
    </div>
  `).join('');

  // Add drag-and-drop event listeners
  const cards = container.querySelectorAll('.preview-painting-card');
  cards.forEach(card => {
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragover', handleDragOver);
    card.addEventListener('drop', handleDrop);
    card.addEventListener('dragend', handleDragEnd);
    card.addEventListener('dragenter', handleDragEnter);
    card.addEventListener('dragleave', handleDragLeave);
  });

  // Add remove button listeners
  container.querySelectorAll('.preview-remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      removePaintingFromExhibition(parseInt(btn.dataset.id));
    });
  });
}

// Drag and drop handlers
let draggedElement = null;
let draggedIndex = null;

function handleDragStart(e) {
  draggedElement = e.currentTarget;
  draggedIndex = parseInt(draggedElement.dataset.index);
  draggedElement.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', draggedElement.innerHTML);
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';
  return false;
}

function handleDragEnter(e) {
  if (e.currentTarget !== draggedElement) {
    e.currentTarget.classList.add('drag-over');
  }
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

async function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  e.preventDefault();

  const dropTarget = e.currentTarget;
  dropTarget.classList.remove('drag-over');

  if (draggedElement !== dropTarget) {
    const dropIndex = parseInt(dropTarget.dataset.index);

    // Reorder the paintings array
    const paintings = adminPanelState.exhibitionPaintings;
    const [movedPainting] = paintings.splice(draggedIndex, 1);
    paintings.splice(dropIndex, 0, movedPainting);

    // Save the new order
    await saveExhibitionOrder();

    // Re-render
    renderExhibitionPaintingsList();
  }

  return false;
}

function handleDragEnd(e) {
  e.currentTarget.classList.remove('dragging');

  // Remove all drag-over classes
  const container = document.getElementById('exhibition-paintings-list');
  if (container) {
    container.querySelectorAll('.drag-over').forEach(el => {
      el.classList.remove('drag-over');
    });
  }

  draggedElement = null;
  draggedIndex = null;
}

// Render the full admin panel
function renderAdminPanel() {
  // Remove existing panel if present
  const existing = document.getElementById('admin-panel-container');
  if (existing) existing.remove();

  const container = document.createElement('div');
  container.id = 'admin-panel-container';

  const currentExhibition = adminPanelState.currentExhibition;
  const paintingCount = adminPanelState.exhibitionPaintings.length;

  container.innerHTML = `
    <button id="admin-panel-toggle" class="admin-panel-toggle">&gt;</button>
    <div id="admin-panel" class="admin-panel ${adminPanelState.isOpen ? '' : 'collapsed'}">
      <div class="admin-panel-header">
        <h3>Exhibition Manager</h3>
        <button id="btn-close-admin" class="btn-close-admin" title="Exit Admin Mode">&times;</button>
      </div>

      <div class="admin-panel-section">
        <label for="exhibition-selector">Current Exhibition:</label>
        <select id="exhibition-selector">
          <option value="">-- Select Exhibition --</option>
          ${adminPanelState.exhibitions.map(ex => `
            <option value="${ex.id}" ${ex.id === currentExhibition?.id ? 'selected' : ''}>
              ${ex.name} ${ex.is_active ? '(Active)' : ''}
            </option>
          `).join('')}
        </select>
        <button id="btn-create-exhibition" class="btn-small">+ New Exhibition</button>
      </div>

      <div class="admin-panel-section" id="exhibition-info-container">
        <!-- Exhibition info will be rendered here -->
      </div>

      <div class="admin-panel-section exhibition-paintings">
        <div class="exhibition-paintings-header">
          <h4>Paintings in Exhibition</h4>
          <button id="btn-toggle-view" class="btn-toggle-view">${adminPanelState.viewMode === 'list' ? 'Grid View' : 'List View'}</button>
        </div>
        <div id="exhibition-paintings-list"></div>
      </div>

      <div class="admin-panel-footer">
        <a href="${adminLink('/gallery')}" class="btn-small" data-link>View Storage</a>
        <a href="/gallery" class="btn-small btn-preview" data-link>Preview Public View</a>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  // Add event listeners
  document.getElementById('admin-panel-toggle').addEventListener('click', togglePanel);

  document.getElementById('btn-close-admin').addEventListener('click', () => {
    // Exit admin mode by navigating to gallery without admin param
    window.location.href = '/gallery';
  });

  document.getElementById('exhibition-selector').addEventListener('change', (e) => {
    if (e.target.value) {
      handleExhibitionSwitch(parseInt(e.target.value));
    }
  });

  document.getElementById('btn-create-exhibition').addEventListener('click', handleCreateExhibition);

  document.getElementById('btn-toggle-view').addEventListener('click', toggleViewMode);

  // Render the exhibition info
  renderExhibitionInfo();

  // Render the paintings list
  renderExhibitionPaintingsList();

  // Update toggle button state
  const toggleBtn = document.getElementById('admin-panel-toggle');
  toggleBtn.textContent = adminPanelState.isOpen ? '>' : '<';
}

// Remove the admin panel from the DOM
export function removeAdminPanel() {
  const container = document.getElementById('admin-panel-container');
  if (container) container.remove();
}

// Refresh the exhibition data and re-render
export async function refreshAdminPanel() {
  await loadExhibitionData();
  renderExhibitionInfo();
  renderExhibitionPaintingsList();
  renderExhibitionSelector();
}
