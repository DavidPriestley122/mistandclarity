// Admin Panel Component for Exhibition Management
import {
  fetchActiveExhibition,
  fetchCollections,
  fetchCollection,
  createCollection,
  addToExhibition,
  removeFromExhibition,
  reorderExhibition,
  activateExhibition,
  archiveExhibition,
  setExhibitionPrivate,
  deactivateAllExhibitions,
  updateCollection,
  deleteCollection,
  getJpegUrl,
  fetchSubmissions,
  fetchMailingList,
  updateSubmissionStatus,
  deleteSubmission,
  unsubscribeFromList
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
  isEditingInfo: false,
  contactsView: 'submissions', // 'submissions' or 'mailing-list'
  submissions: [],
  mailingList: []
};

// Event callbacks for gallery integration
let onExhibitionChange = null;

export function setOnExhibitionChange(callback) {
  onExhibitionChange = callback;
}

// Initialize the admin panel
export async function initAdminPanel() {
  await loadExhibitionData();
  await loadContactsData();
  renderAdminPanel();
  renderContactsContent();
}

// Load exhibition data from API
async function loadExhibitionData() {
  try {
    const [activeResult, collections] = await Promise.all([
      fetchActiveExhibition(),
      fetchCollections()
    ]);

    adminPanelState.exhibitions = collections;

    const savedId = parseInt(sessionStorage.getItem('adminSelectedExhibitionId'));
    const savedExists = savedId && collections.some(c => c.id === savedId);
    const activeId = activeResult.collection?.id;

    if (savedExists && savedId !== activeId) {
      const saved = await fetchCollection(savedId);
      adminPanelState.currentExhibition = saved.collection;
      adminPanelState.exhibitionPaintings = saved.paintings || [];
    } else {
      adminPanelState.currentExhibition = activeResult.collection;
      adminPanelState.exhibitionPaintings = activeResult.paintings || [];
      if (activeResult.collection) {
        sessionStorage.setItem('adminSelectedExhibitionId', activeResult.collection.id);
      }
    }

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

          <div class="form-group">
            <label for="exhibition-title-zh">Chinese Name (中文名稱)</label>
            <input type="text" id="exhibition-title-zh" placeholder="e.g., 花鳥畫展">
          </div>

          <div class="form-group">
            <label for="exhibition-subtitle-zh">Chinese Subtitle (中文副題)</label>
            <input type="text" id="exhibition-subtitle-zh" placeholder="e.g., 1950年代作品">
          </div>

          <div class="form-group">
            <label for="exhibition-intro-zh">Chinese Introduction (中文簡介)</label>
            <textarea id="exhibition-intro-zh" rows="5" placeholder="展覽中文簡介..."></textarea>
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
  const name_zh = document.getElementById('exhibition-title-zh').value.trim() || null;
  const subtitle_zh = document.getElementById('exhibition-subtitle-zh').value.trim() || null;
  const introduction_zh = document.getElementById('exhibition-intro-zh').value.trim() || null;

  if (!title) {
    alert('Title is required');
    return;
  }

  try {
    const newCollection = await createCollection(title, '', subtitle, introduction, name_zh, subtitle_zh, introduction_zh);
    adminPanelState.exhibitions.unshift(newCollection);
    renderExhibitionSelector();
    closeExhibitionModal();
    alert(`Exhibition "${title}" created successfully!`);
  } catch (error) {
    console.error('Failed to create exhibition:', error);
    alert('Failed to create exhibition. Please try again.');
  }
}

// Exhibition status label: 'active' (current show), 'archived' (past show), 'private' (draft)
function getExhibitionStatus(exhibition) {
  if (!exhibition) return null;
  if (exhibition.is_active) return 'active';
  if (exhibition.is_archived) return 'archived';
  return 'private';
}

// Set the current exhibition's status ('active' | 'archived' | 'private')
async function handleSetStatus(status) {
  const currentExhibition = adminPanelState.currentExhibition;
  if (!currentExhibition) return;

  try {
    let updated;
    if (status === 'active') {
      updated = await activateExhibition(currentExhibition.id);
    } else if (status === 'archived') {
      updated = await archiveExhibition(currentExhibition.id);
    } else {
      updated = await setExhibitionPrivate(currentExhibition.id);
    }

    // Update local state
    currentExhibition.is_active = updated.is_active;
    currentExhibition.is_archived = updated.is_archived;
    const ex = adminPanelState.exhibitions.find(e => e.id === currentExhibition.id);
    if (ex) {
      ex.is_active = updated.is_active;
      ex.is_archived = updated.is_archived;
    }

    renderExhibitionInfo();
    renderExhibitionSelector();
  } catch (error) {
    console.error('Failed to update exhibition status:', error);
    alert('Failed to update exhibition status.');
  }
}

// Deactivate all exhibitions
async function handleDeactivateAll() {
  const activeCount = adminPanelState.exhibitions.filter(e => e.is_active).length;
  if (activeCount === 0) {
    alert('No exhibitions are currently active.');
    return;
  }

  if (!confirm(`Deactivate all ${activeCount} active exhibition${activeCount !== 1 ? 's' : ''}?`)) return;

  try {
    await deactivateAllExhibitions();
    adminPanelState.exhibitions.forEach(e => e.is_active = false);
    if (adminPanelState.currentExhibition) adminPanelState.currentExhibition.is_active = false;
    renderExhibitionInfo();
    renderExhibitionSelector();
  } catch (error) {
    console.error('Failed to deactivate all exhibitions:', error);
    alert('Failed to deactivate exhibitions.');
  }
}

// Delete an exhibition
async function handleDeleteExhibition() {
  const currentExhibition = adminPanelState.currentExhibition;
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

// Switch to a different exhibition (view only, doesn't change active status)
async function handleExhibitionSwitch(collectionId) {
  if (!collectionId) return;

  sessionStorage.setItem('adminSelectedExhibitionId', collectionId);

  try {
    // Fetch the selected exhibition's data without activating it
    const data = await fetchCollection(collectionId);
    adminPanelState.currentExhibition = data.collection;
    adminPanelState.exhibitionPaintings = data.paintings || [];
    adminPanelState.paintingIdsInExhibition = new Set(
      adminPanelState.exhibitionPaintings.map(p => p.id)
    );

    renderExhibitionInfo();
    renderExhibitionPaintingsList();
    if (onExhibitionChange) onExhibitionChange();
  } catch (error) {
    console.error('Failed to switch exhibition:', error);
    alert('Failed to load exhibition.');
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
  const nameZhInput = document.getElementById('edit-exhibition-name-zh');
  const subtitleZhInput = document.getElementById('edit-exhibition-subtitle-zh');
  const introZhInput = document.getElementById('edit-exhibition-introduction-zh');

  if (!nameInput) return;

  const newName = nameInput.value.trim();
  const newSubtitle = subtitleInput ? subtitleInput.value.trim() : '';
  const newIntroduction = introInput ? introInput.value.trim() : '';
  const newNameZh = nameZhInput ? nameZhInput.value.trim() || null : null;
  const newSubtitleZh = subtitleZhInput ? subtitleZhInput.value.trim() || null : null;
  const newIntroductionZh = introZhInput ? introZhInput.value.trim() || null : null;

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
      introduction: newIntroduction,
      name_zh: newNameZh,
      subtitle_zh: newSubtitleZh,
      introduction_zh: newIntroductionZh
    });

    // Update local state
    adminPanelState.currentExhibition.name = newName;
    adminPanelState.currentExhibition.subtitle = newSubtitle;
    adminPanelState.currentExhibition.introduction = newIntroduction;
    adminPanelState.currentExhibition.name_zh = newNameZh;
    adminPanelState.currentExhibition.subtitle_zh = newSubtitleZh;
    adminPanelState.currentExhibition.introduction_zh = newIntroductionZh;

    // Update the exhibition in the list
    const exhibition = adminPanelState.exhibitions.find(ex => ex.id === collectionId);
    if (exhibition) {
      exhibition.name = newName;
      exhibition.subtitle = newSubtitle;
      exhibition.introduction = newIntroduction;
      exhibition.name_zh = newNameZh;
      exhibition.subtitle_zh = newSubtitleZh;
      exhibition.introduction_zh = newIntroductionZh;
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
        <div class="edit-field">
          <label for="edit-exhibition-name-zh">Chinese Name (中文名稱):</label>
          <input type="text"
                 id="edit-exhibition-name-zh"
                 value="${currentExhibition.name_zh || ''}"
                 placeholder="e.g., 花鳥畫展">
        </div>
        <div class="edit-field">
          <label for="edit-exhibition-subtitle-zh">Chinese Subtitle (中文副題):</label>
          <input type="text"
                 id="edit-exhibition-subtitle-zh"
                 value="${currentExhibition.subtitle_zh || ''}"
                 placeholder="e.g., 1950年代作品">
        </div>
        <div class="edit-field">
          <label for="edit-exhibition-introduction-zh">Chinese Introduction (中文簡介):</label>
          <textarea id="edit-exhibition-introduction-zh"
                    rows="3"
                    placeholder="展覽中文簡介...">${currentExhibition.introduction_zh || ''}</textarea>
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
    const status = getExhibitionStatus(currentExhibition);
    const statusLabels = { active: 'Active', archived: 'Archived', private: 'Private' };

    container.innerHTML = `
      <div class="exhibition-info">
        <div class="exhibition-name-row">
          <strong>${currentExhibition?.name || 'No exhibition selected'}</strong>
          <div class="exhibition-actions">
            ${currentExhibition ? '<button id="btn-edit-info" class="btn-edit-info" title="Edit exhibition info">✎</button>' : ''}
            ${currentExhibition ? '<button id="btn-delete-exhibition" class="btn-delete-info" title="Delete exhibition">🗑</button>' : ''}
          </div>
        </div>
        ${currentExhibition ? `
          <div class="exhibition-status-row">
            <span class="exhibition-status-label status-${status}">${statusLabels[status]}</span>
            ${status !== 'active' ? '<button id="btn-status-active" class="btn-small btn-activate">Activate</button>' : ''}
            ${status !== 'archived' ? '<button id="btn-status-archived" class="btn-small btn-archive">Archive</button>' : ''}
            ${status !== 'private' ? '<button id="btn-status-private" class="btn-small btn-deactivate">Make Private</button>' : ''}
          </div>
        ` : ''}
        ${currentExhibition?.subtitle ? `<p class="exhibition-subtitle">${currentExhibition.subtitle}</p>` : ''}
        <span class="painting-count">${paintingCount} painting${paintingCount !== 1 ? 's' : ''}</span>
      </div>
      ${currentExhibition?.introduction ? `<p class="exhibition-description">${currentExhibition.introduction}</p>` : ''}
    `;

    // Add event listeners for status buttons
    document.getElementById('btn-status-active')?.addEventListener('click', () => handleSetStatus('active'));
    document.getElementById('btn-status-archived')?.addEventListener('click', () => handleSetStatus('archived'));
    document.getElementById('btn-status-private')?.addEventListener('click', () => handleSetStatus('private'));

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
        ${ex.name} ${ex.is_active ? '(Active)' : ex.is_archived ? '(Archived)' : ''}
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
             alt="${painting.descriptive_title || painting.artists_title || 'Untitled'}"
             draggable="false" />
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
  if (!e.currentTarget.contains(e.relatedTarget)) {
    e.currentTarget.classList.remove('drag-over');
  }
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  e.preventDefault();

  const dropTarget = e.currentTarget;
  dropTarget.classList.remove('drag-over');

  if (draggedElement !== dropTarget) {
    const dropIndex = parseInt(dropTarget.dataset.index);

    const paintings = adminPanelState.exhibitionPaintings;
    const [movedPainting] = paintings.splice(draggedIndex, 1);
    paintings.splice(dropIndex, 0, movedPainting);

    renderExhibitionPaintingsList();
    saveExhibitionOrder();
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

// Contact Management Functions
async function switchContactView(view) {
  adminPanelState.contactsView = view;
  await loadContactsData();
  renderContactsContent();
}

async function loadContactsData() {
  try {
    if (adminPanelState.contactsView === 'submissions') {
      adminPanelState.submissions = await fetchSubmissions();
    } else {
      adminPanelState.mailingList = await fetchMailingList();
    }
  } catch (err) {
    console.error('Failed to load contacts data:', err);
  }
}

function renderContactsContent() {
  const container = document.getElementById('contacts-content');
  if (!container) return;

  if (adminPanelState.contactsView === 'submissions') {
    container.innerHTML = renderSubmissionsList();
  } else {
    container.innerHTML = renderMailingListView();
  }
}

function renderSubmissionsList() {
  const submissions = adminPanelState.submissions;

  if (submissions.length === 0) {
    return '<p class="empty-state">No inquiries yet</p>';
  }

  return `
    <div class="submissions-list">
      ${submissions.map(s => `
        <div class="submission-item ${s.status}">
          <div class="submission-header">
            <strong>${s.name}</strong>
            <span class="status-badge ${s.status}">${s.status}</span>
          </div>
          <div class="submission-meta">
            ${s.email} • ${new Date(s.created_at).toLocaleDateString()}
            ${s.painting_title ? `<br>Re: ${s.painting_title}` : ''}
          </div>
          <div class="submission-message">${s.message}</div>
          <div class="submission-actions">
            <select onchange="window.updateStatus(${s.id}, this.value)">
              <option value="new" ${s.status === 'new' ? 'selected' : ''}>New</option>
              <option value="read" ${s.status === 'read' ? 'selected' : ''}>Read</option>
              <option value="responded" ${s.status === 'responded' ? 'selected' : ''}>Responded</option>
            </select>
            <button class="btn-small btn-delete" onclick="window.deleteSubmissionClick(${s.id})">Delete</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderMailingListView() {
  const list = adminPanelState.mailingList;

  if (list.length === 0) {
    return '<p class="empty-state">No subscribers yet</p>';
  }

  return `
    <div class="mailing-list-actions">
      <button class="btn-primary" onclick="window.exportMailingList()">
        Export for BCC (${list.length} subscribers)
      </button>
    </div>

    <div class="mailing-list-table">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Subscribed</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${list.map(subscriber => `
            <tr>
              <td>${subscriber.name}</td>
              <td>${subscriber.email}</td>
              <td>${new Date(subscriber.created_at).toLocaleDateString()}</td>
              <td>
                <button class="btn-small btn-delete" onclick="window.unsubscribeClick(${subscriber.id})">
                  Remove
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// Action handlers
async function updateStatus(id, status) {
  try {
    await updateSubmissionStatus(id, status);
    await loadContactsData();
    renderContactsContent();
  } catch (err) {
    alert('Failed to update status');
  }
}

async function deleteSubmissionClick(id) {
  if (!confirm('Delete this inquiry?')) return;

  try {
    await deleteSubmission(id);
    await loadContactsData();
    renderContactsContent();
  } catch (err) {
    alert('Failed to delete');
  }
}

async function unsubscribeClick(id) {
  if (!confirm('Remove this subscriber?')) return;

  try {
    await unsubscribeFromList(id);
    await loadContactsData();
    renderContactsContent();
  } catch (err) {
    alert('Failed to remove subscriber');
  }
}

function exportMailingList() {
  const emails = adminPanelState.mailingList.map(s => s.email).join(', ');

  // Copy to clipboard
  navigator.clipboard.writeText(emails).then(() => {
    alert(`Copied ${adminPanelState.mailingList.length} emails to clipboard!\n\nPaste into BCC field of your email client.`);
  }).catch(() => {
    // Fallback: show in alert
    alert('Email list:\n\n' + emails + '\n\nCopy this to your email BCC field.');
  });
}

// Make contact functions globally available
window.switchContactView = switchContactView;
window.updateStatus = updateStatus;
window.deleteSubmissionClick = deleteSubmissionClick;
window.unsubscribeClick = unsubscribeClick;
window.exportMailingList = exportMailingList;

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

      <div class="admin-panel-body">

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
          <button id="btn-deactivate-all" class="btn-small btn-deactivate">Deactivate All</button>
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

        <div class="admin-panel-section">
          <h3>Contact Management</h3>

          <div class="contact-view-toggle">
            <button class="btn-small ${adminPanelState.contactsView === 'submissions' ? 'active' : ''}"
                    onclick="window.switchContactView('submissions')">
              Inquiries
            </button>
            <button class="btn-small ${adminPanelState.contactsView === 'mailing-list' ? 'active' : ''}"
                    onclick="window.switchContactView('mailing-list')">
              Mailing List
            </button>
          </div>

          <div id="contacts-content"></div>
        </div>

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
  document.getElementById('btn-deactivate-all').addEventListener('click', handleDeactivateAll);

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
