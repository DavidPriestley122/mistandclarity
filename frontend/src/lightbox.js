// Simple image lightbox with zoom functionality

let currentImage = null;
let scale = 1;
let panning = false;
let startX = 0;
let startY = 0;
let translateX = 0;
let translateY = 0;
let lightboxHistoryPushed = false;

export function initLightbox() {
  // Create lightbox HTML if it doesn't exist
  if (!document.getElementById('lightbox')) {
    const lightboxHTML = `
      <div id="lightbox" class="lightbox">
        <div class="lightbox-overlay"></div>
        <div class="lightbox-content">
          <button class="lightbox-close" aria-label="Close">&times;</button>
          <div class="lightbox-controls">
            <button class="lightbox-zoom-in" aria-label="Zoom in">+</button>
            <button class="lightbox-zoom-out" aria-label="Zoom out">−</button>
            <button class="lightbox-reset" aria-label="Reset zoom">Reset</button>
          </div>
          <div class="lightbox-image-container">
            <img id="lightbox-image" src="" alt="" />
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);
    attachLightboxListeners();
    attachPopstateListener();
  }
}

function attachPopstateListener() {
  // Listen for back button to close lightbox
  window.addEventListener('popstate', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (lightbox && lightbox.classList.contains('active')) {
      // Back button pressed while lightbox is open - close it
      closeLightbox(true);
    }
  });
}

function attachLightboxListeners() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const overlay = lightbox.querySelector('.lightbox-overlay');
  const zoomInBtn = lightbox.querySelector('.lightbox-zoom-in');
  const zoomOutBtn = lightbox.querySelector('.lightbox-zoom-out');
  const resetBtn = lightbox.querySelector('.lightbox-reset');

  // Close lightbox
  closeBtn.addEventListener('click', () => {
    console.log('[LIGHTBOX DEBUG] Close button clicked');
    closeLightbox();
  });
  overlay.addEventListener('click', () => {
    console.log('[LIGHTBOX DEBUG] Overlay clicked');
    closeLightbox();
  });

  // ESC key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });

  // Zoom controls
  zoomInBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    console.log('[LIGHTBOX DEBUG] Zoom IN clicked, scale before:', scale);
    zoomImage(0.2);
    console.log('[LIGHTBOX DEBUG] Scale after zoom in:', scale);
  });
  zoomOutBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    console.log('[LIGHTBOX DEBUG] Zoom OUT clicked, scale before:', scale);
    zoomImage(-0.2);
    console.log('[LIGHTBOX DEBUG] Scale after zoom out:', scale);
  });
  resetBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    console.log('[LIGHTBOX DEBUG] Reset clicked');
    resetZoom();
  });

  // Mouse wheel zoom
  lightboxImage.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    zoomImage(delta);
  });

  // Pan functionality
  lightboxImage.addEventListener('mousedown', startPan);
  document.addEventListener('mousemove', pan);
  document.addEventListener('mouseup', endPan);

  // Debug: log ALL clicks when lightbox is active
  document.addEventListener('click', (e) => {
    if (lightbox.classList.contains('active')) {
      console.log('[LIGHTBOX DEBUG] Click detected on:', e.target.tagName, e.target.className, 'id:', e.target.id);
    }
  }, true); // capture phase to see it first

  // Touch support
  lightboxImage.addEventListener('touchstart', handleTouchStart);
  lightboxImage.addEventListener('touchmove', handleTouchMove);
}

function zoomImage(delta) {
  scale += delta;
  scale = Math.max(1, Math.min(scale, 4)); // Limit between 1x and 4x
  updateImageTransform();
}

function resetZoom() {
  scale = 1;
  translateX = 0;
  translateY = 0;
  updateImageTransform();
}

function updateImageTransform() {
  const lightboxImage = document.getElementById('lightbox-image');
  lightboxImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  lightboxImage.style.cursor = scale > 1 ? 'grab' : 'default';
}

function startPan(e) {
  if (scale > 1) {
    panning = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    document.getElementById('lightbox-image').style.cursor = 'grabbing';
  }
}

function pan(e) {
  if (panning) {
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    updateImageTransform();
  }
}

function endPan() {
  panning = false;
  if (scale > 1) {
    document.getElementById('lightbox-image').style.cursor = 'grab';
  }
}

let touchStartDistance = 0;
let touchStartScale = 1;

function handleTouchStart(e) {
  if (e.touches.length === 2) {
    // Pinch zoom
    touchStartDistance = getTouchDistance(e.touches);
    touchStartScale = scale;
  } else if (e.touches.length === 1 && scale > 1) {
    // Pan
    startX = e.touches[0].clientX - translateX;
    startY = e.touches[0].clientY - translateY;
    panning = true;
  }
}

function handleTouchMove(e) {
  e.preventDefault();

  if (e.touches.length === 2) {
    // Pinch zoom
    const currentDistance = getTouchDistance(e.touches);
    const scaleChange = currentDistance / touchStartDistance;
    scale = touchStartScale * scaleChange;
    scale = Math.max(1, Math.min(scale, 4));
    updateImageTransform();
  } else if (e.touches.length === 1 && panning) {
    // Pan
    translateX = e.touches[0].clientX - startX;
    translateY = e.touches[0].clientY - startY;
    updateImageTransform();
  }
}

function getTouchDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

export function openLightbox(imageSrc, imageAlt) {
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');

  currentImage = imageSrc;
  lightboxImage.src = imageSrc;
  lightboxImage.alt = imageAlt;

  // Reset zoom and pan
  scale = 1;
  translateX = 0;
  translateY = 0;
  updateImageTransform();

  // Push state to history so back button can close lightbox
  history.pushState({ lightboxOpen: true }, '');
  lightboxHistoryPushed = true;

  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

export function closeLightbox(fromPopstate = false) {
  const lightbox = document.getElementById('lightbox');

  // Check if already closed
  if (!lightbox || !lightbox.classList.contains('active')) {
    return;
  }

  lightbox.classList.remove('active');
  document.body.style.overflow = '';

  // If closing from X button or overlay (not from back button), remove the history entry
  if (lightboxHistoryPushed && !fromPopstate) {
    lightboxHistoryPushed = false;
    history.back();
  } else if (fromPopstate) {
    lightboxHistoryPushed = false;
  }
}

// Attach click listeners to painting images
export function attachPaintingClickListeners() {
  document.querySelectorAll('.painting-image img, .painting-detail-image img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.setAttribute('data-lightbox-trigger', 'true');

    img.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openLightbox(img.src, img.alt);
    }, true);
  });
}
