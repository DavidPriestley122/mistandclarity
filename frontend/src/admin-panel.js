// Admin Panel Component for Exhibition Management
import {
  fetchActiveExhibition,
  fetchCollections,
  createCollection,
  addToExhibition,
  removeFromExhibition,
  reorderExhibition,
  activateExhibition,
  getJpegUrl
} from './api.js';
import { adminLink } from './admin.js';

// Global state for the admin panel
let adminPanelState = {
  isOpen: true,
  currentExhibition: null,
  exhibitions: [],
  exhibitionPaintings: [],
  paintingIdsInExhibition: new Set()
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
      alert('This painting is already in the exhibition.');
    } else {
      console.error('Failed to add painting:', error);
      alert('Failed to add painting to exhibition.');
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
async function handleCreateExhibition() {
  const name = prompt('Enter exhibition name:');
  if (!name) return;

  const description = prompt('Enter exhibition description (optional):') || '';

  try {
    const newCollection = await createCollection(name, description);
    adminPanelState.exhibitions.unshift(newCollection);
    renderExhibitionSelector();
    alert(`Exhibition "${name}" created. Use the dropdown to activate it.`);
  } catch (error) {
    console.error('Failed to create exhibition:', error);
    alert('Failed to create exhibition.');
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

// Render the list of paintings in the current exhibition
function renderExhibitionPaintingsList() {
  const list = document.getElementById('exhibition-paintings-list');
  if (!list) return;

  if (adminPanelState.exhibitionPaintings.length === 0) {
    list.innerHTML = '<p class="empty-message">No paintings in exhibition yet. Add paintings from the gallery.</p>';
    return;
  }

  list.innerHTML = adminPanelState.exhibitionPaintings.map((painting, index) => `
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
  list.querySelectorAll('.btn-move-up').forEach(btn => {
    btn.addEventListener('click', () => movePaintingUp(parseInt(btn.dataset.index)));
  });

  list.querySelectorAll('.btn-move-down').forEach(btn => {
    btn.addEventListener('click', () => movePaintingDown(parseInt(btn.dataset.index)));
  });

  list.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', () => removePaintingFromExhibition(parseInt(btn.dataset.id)));
  });
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
        <span class="admin-badge">Admin Mode</span>
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

      <div class="admin-panel-section">
        <div class="exhibition-info">
          <strong>${currentExhibition?.name || 'No exhibition selected'}</strong>
          <span class="painting-count">${paintingCount} painting${paintingCount !== 1 ? 's' : ''}</span>
        </div>
        ${currentExhibition?.description ? `<p class="exhibition-description">${currentExhibition.description}</p>` : ''}
      </div>

      <div class="admin-panel-section exhibition-paintings">
        <h4>Paintings in Exhibition</h4>
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

  document.getElementById('exhibition-selector').addEventListener('change', (e) => {
    if (e.target.value) {
      handleExhibitionSwitch(parseInt(e.target.value));
    }
  });

  document.getElementById('btn-create-exhibition').addEventListener('click', handleCreateExhibition);

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
  renderExhibitionPaintingsList();
  renderExhibitionSelector();
}
