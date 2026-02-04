import './style.css'
import { router } from './router.js';
import { renderHome } from './home.js';
import { renderIntro } from './intro.js';
import { renderGallery } from './gallery.js';
import { renderPaintingDetail } from './painting-detail.js';
import { renderArtistBio } from './artist-bio.js';
import { removeAdminPanel } from './admin-panel.js';

// Clean up admin panel when navigating to non-gallery pages or non-admin mode
router.onBeforeNavigate((path, params) => {
  const isAdminMode = params.get('admin') === 'true';
  const isGalleryPage = path === '/gallery';

  // Remove admin panel if not in admin mode on gallery page
  if (!isAdminMode || !isGalleryPage) {
    removeAdminPanel();
  }
});

// Set up routes
router.addRoute('/', renderHome);
router.addRoute('/intro', renderIntro);
router.addRoute('/gallery', renderGallery);
router.addRoute('/painting/:id', renderPaintingDetail);
router.addRoute('/artist/:slug', renderArtistBio);

// Start the router
router.start();
